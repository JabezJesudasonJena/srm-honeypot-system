// ============================================================================
// Project Labyrinth — RAG Worker (Full Deception Pipeline)
// ============================================================================
// BullMQ worker that processes attacker probes asynchronously. This is where
// the heavy lifting happens — the main request path stays fast while this
// worker enriches the deception state for future interactions.
//
// Pipeline:
//   1. Extract probe data
//   2. Detect intent (already done in trap, but used here for scoring)
//   3. Calculate threat score
//   4. Progress attack stage
//   5. Reveal appropriate assets in deception state
//   6. Retrieve RAG context (semantic search)
//   7. Generate AI deception (if available)
//   8. Store event
//   9. Update metrics
// ============================================================================

const { Worker } = require('bullmq');
const redisConnection  = require('../config/redis');
const { createLogger } = require('../src/utils/logger');

const sessionManager   = require('../src/services/sessionManager');
const deceptionEngine  = require('../src/services/deceptionEngine');
const intentDetector   = require('../src/services/intentDetector');
const threatScorer     = require('../src/services/threatScorer');
const canaryManager    = require('../src/services/canaryManager');
const ragService       = require('../src/services/ragService');
const aiService        = require('../src/services/aiService');
const fallbackEngine   = require('../src/services/fallbackEngine');
const metricsCollector = require('../src/services/metricsCollector');
const { AttackEvent }  = require('../src/models/schemas');

const log = createLogger('RAGWorker');

// ── SSE broadcast (lazy-loaded) ──
let broadcastEvent = null;
function getBroadcast() {
    if (!broadcastEvent) {
        try { broadcastEvent = require('../routes/dashboard').broadcastEvent; } catch {}
    }
    return broadcastEvent;
}

// ── Worker ──────────────────────────────────────────────────────────────────

const worker = new Worker('attacker-probes', async (job) => {
    const probeData = job.data;
    const startTime = Date.now();

    log.info(`Processing probe`, {
        jobId: job.id,
        sessionId: probeData.sessionId?.substring(0, 8),
        path: probeData.path
    });

    try {
        const sessionId = probeData.sessionId;
        if (!sessionId || sessionId === 'unknown') {
            log.warn('Probe without session — limited processing');
            return;
        }

        // ── 1. Intent (passed from trap route) ──
        const intent = probeData.intent || intentDetector.detectIntent(probeData);

        // ── 2. Threat Scoring ──
        const scoreResult = await threatScorer.calculateScore(sessionId, intent);
        log.info('Threat score calculated', {
            sessionId: sessionId.substring(0, 8),
            score: scoreResult.score,
            severity: scoreResult.severity,
            delta: scoreResult.delta
        });

        // Broadcast score changes
        const bc = getBroadcast();
        if (bc && scoreResult.delta > 0) {
            bc('THREAT_SCORE_CHANGED', {
                sessionId,
                score: scoreResult.score,
                severity: scoreResult.severity,
                delta: scoreResult.delta
            });
        }

        // ── 3. Progress Attack Stage ──
        const stage = intentDetector.intentToStage(intent.intent);
        await deceptionEngine.progressStage(sessionId, stage);

        // ── 4. Reveal Assets Based on Path ──
        const assetSelection = deceptionEngine.selectAssetsForPath(probeData.path, probeData.method);
        if (assetSelection.type && assetSelection.data) {
            await deceptionEngine.revealAsset(sessionId, assetSelection.type, assetSelection.data);

            // Reveal extra related assets
            if (assetSelection.extras) {
                for (const extra of assetSelection.extras) {
                    await deceptionEngine.revealAsset(sessionId, extra.type, extra.data);
                }
            }

            const bc2 = getBroadcast();
            if (bc2) bc2('ASSET_DISCOVERED', { sessionId, assetType: assetSelection.type });
        }

        // ── 5. RAG Context Retrieval ──
        let ragContext = [];
        try {
            const query = `${probeData.method} ${probeData.path} ${intent.intent}`;
            ragContext = await ragService.searchContext(query, 3);
            if (ragContext.length > 0) {
                log.debug('RAG context retrieved', { matches: ragContext.length });
            }
        } catch (err) {
            log.warn('RAG retrieval failed', { error: err.message });
        }

        // ── 6. AI Deception Generation (optional, async) ──
        let aiResponse = null;
        if (aiService.isAvailable() && shouldUseAI(intent, scoreResult)) {
            try {
                const deceptionState = await deceptionEngine.getDeceptionState(sessionId);
                const aiStartTime = Date.now();

                aiResponse = await aiService.generateDeception({
                    request: { method: probeData.method, path: probeData.path },
                    intent: intent.intent,
                    deceptionState: deceptionEngine.getConsistentContext(deceptionState),
                    ragContext,
                    objective: getDeceptionObjective(intent.intent)
                });

                const aiLatency = Date.now() - aiStartTime;
                metricsCollector.increment('aiCalls');
                metricsCollector.increment('totalAiMs', aiLatency);

                if (aiResponse) {
                    log.info('AI deception generated', { latency: `${aiLatency}ms` });

                    // Process new assets from AI response
                    if (aiResponse.newAssets && Array.isArray(aiResponse.newAssets)) {
                        for (const asset of aiResponse.newAssets) {
                            if (asset.type && asset.data) {
                                await deceptionEngine.revealAsset(sessionId, asset.type, asset.data);
                            }
                        }
                    }
                } else {
                    metricsCollector.increment('aiFailures');
                    metricsCollector.increment('fallbackActivations');
                    const bc3 = getBroadcast();
                    if (bc3) bc3('AI_GENERATION_FAILED', { sessionId, intent: intent.intent });
                }

            } catch (err) {
                log.error('AI generation failed', { error: err.message });
                metricsCollector.increment('aiFailures');
                metricsCollector.increment('fallbackActivations');
            }
        }

        // ── 7. Store Event ──
        const event = new AttackEvent({
            sessionId,
            method: probeData.method,
            path: probeData.path,
            headers: probeData.headers,
            body: probeData.body,
            query: probeData.query,
            ip: probeData.ip
        });
        event.intent           = intent.intent;
        event.intentConfidence = intent.confidence;
        event.intentReasons    = intent.reasons;
        event.threatScoreDelta = scoreResult.delta;
        event.deceptionResponse = aiResponse || probeData.deceptionResponse;
        event.aiGenerated      = !!aiResponse;
        event.processingLatencyMs = Date.now() - startTime;

        if (probeData.canaryTriggered) {
            event.canaryEvents.push({ type: 'triggered', canaryId: probeData.canaryTriggered });
        }
        if (probeData.canaryGenerated) {
            event.canaryEvents.push({ type: 'generated', canaryId: probeData.canaryGenerated });
        }

        await sessionManager.addEvent(event);

        // ── 8. Update Metrics ──
        metricsCollector.increment('totalProcessingMs', event.processingLatencyMs);

        // Update active attack count
        const allSessions = await sessionManager.getAllSessions();
        metricsCollector.set('totalAttacks', allSessions.length);
        metricsCollector.set('activeAttacks', allSessions.filter(s => s.active).length);

        log.info(`✅ Probe processed`, {
            jobId: job.id,
            sessionId: sessionId.substring(0, 8),
            intent: intent.intent,
            score: scoreResult.score,
            aiUsed: !!aiResponse,
            latency: `${event.processingLatencyMs}ms`
        });

    } catch (err) {
        log.error(`Probe processing failed`, { jobId: job.id, error: err.message });
        throw err;  // Let BullMQ handle retry
    }

}, {
    connection: redisConnection,
    concurrency: 5,         // Process up to 5 jobs concurrently
    limiter: {              // Rate limit to prevent Gemini API overload
        max: 10,
        duration: 1000
    }
});

// ── AI Decision Logic ───────────────────────────────────────────────────────

/**
 * Decide whether to invoke AI for this probe.
 * Low-value repeated scans get deterministic responses; high-value events get AI.
 */
function shouldUseAI(intent, scoreResult) {
    // Always use AI for high-threat events
    if (scoreResult.score >= 50) return true;
    // Use AI for credential-related intents
    if (['credential_discovery', 'privilege_escalation', 'canary_reuse'].includes(intent.intent)) return true;
    // Use AI for significant score jumps
    if (scoreResult.delta >= 20) return true;
    // Skip AI for low-value reconnaissance
    if (intent.intent === 'reconnaissance' && scoreResult.score < 20) return false;
    // Default: use AI for ~30% of requests (based on confidence)
    return intent.confidence > 0.85;
}

function getDeceptionObjective(intent) {
    const objectives = {
        'reconnaissance':           'Reveal enough server information to seem like a real production system. Include version numbers and service names.',
        'endpoint_enumeration':     'Show a realistic API structure with multiple services. Include some endpoints that require authentication.',
        'credential_discovery':     'Leak a fictional API key or service credential that looks real. The attacker should feel they found something valuable.',
        'config_discovery':         'Reveal database connection details, internal service URLs, and deployment configuration. All must be fictional.',
        'database_discovery':       'Show realistic database schema information, table names, and connection pool statistics.',
        'privilege_escalation':     'Return a 403 Forbidden with hints about admin access requirements (VPN, MFA, specific roles).',
        'api_exploitation':         'Return a detailed error message that reveals stack trace information and internal service architecture.',
        'sensitive_data_discovery': 'Show redacted but realistic-looking data with hints about where unredacted data might be found.',
        'persistence_attempt':      'Return a partial success message suggesting the upload was quarantined but logged.',
        'canary_reuse':             'Return an authentication error but reveal additional internal infrastructure details.',
    };
    return objectives[intent] || 'Keep the attacker engaged with realistic-looking responses.';
}

// ── Error Handling ──────────────────────────────────────────────────────────

worker.on('failed', (job, err) => {
    log.error(`Job failed`, { jobId: job?.id, error: err.message, attempts: job?.attemptsMade });
});

worker.on('error', (err) => {
    log.error('Worker error', { error: err.message });
});

module.exports = worker;
