// ============================================================================
// Project Labyrinth — Catch-All Trap Route (Adaptive)
// ============================================================================
// The universal sinkhole that intercepts every attacker request. Now enhanced:
//   1. Uses session tracking (req.attackSession from middleware)
//   2. Detects attacker intent in the hot path (deterministic, fast)
//   3. Checks for canary credential reuse
//   4. Returns contextual deceptive responses using the fallback engine
//   5. Queues the probe for async AI processing in the worker
//   6. Injects canary credentials at strategic moments
//
// Architecture: The hot path stays fast (no AI calls). The async worker
// enriches the deception state for future requests.
// ============================================================================

const express = require('express');
const router  = express.Router();
const { Queue } = require('bullmq');

const redisConnection  = require('../config/redis');
const { createLogger } = require('../src/utils/logger');
const intentDetector   = require('../src/services/intentDetector');
const canaryManager    = require('../src/services/canaryManager');
const fallbackEngine   = require('../src/services/fallbackEngine');
const deceptionEngine  = require('../src/services/deceptionEngine');
const sessionManager   = require('../src/services/sessionManager');
const metricsCollector = require('../src/services/metricsCollector');
const { AttackEvent }  = require('../src/models/schemas');

const log = createLogger('TrapRoute');

// Initialize the BullMQ queue
const probeQueue = new Queue('attacker-probes', { connection: redisConnection });

// SSE broadcast (lazy-loaded to avoid circular deps)
let broadcastEvent = null;
function getBroadcast() {
    if (!broadcastEvent) {
        try { broadcastEvent = require('./dashboard').broadcastEvent; } catch { /* not loaded yet */ }
    }
    return broadcastEvent;
}

// ── Catch-All Trap ──────────────────────────────────────────────────────────

router.all('*', async (req, res) => {
    const startTime = Date.now();
    const session   = req.attackSession;  // Attached by sessionTracker middleware
    const sessionId = session?.sessionId || 'unknown';

    // Build probe data
    const probeData = {
        method:    req.method,
        path:      req.originalUrl,
        headers:   req.headers,
        query:     req.query,
        body:      req.body,
        ip:        req.ip || req.connection?.remoteAddress,
        timestamp: new Date().toISOString(),
        sessionId
    };

    log.info(`🚨 PROBE DETECTED: [${probeData.method}] ${probeData.path}`, {
        ip: probeData.ip,
        sessionId: sessionId.substring(0, 8)
    });

    // ── Step 1: Check for canary credential reuse (high priority) ──
    let canaryResult = null;
    try {
        canaryResult = await canaryManager.checkForCanary(req);
        if (canaryResult?.triggered) {
            probeData._canaryTriggered = true;
            metricsCollector.increment('canariesTriggered');
            const bc = getBroadcast();
            if (bc) bc('CANARY_TRIGGERED', { sessionId, canaryId: canaryResult.canary.canaryId });
        }
    } catch (err) {
        log.error('Canary check failed', { error: err.message });
    }

    // ── Step 2: Detect intent (deterministic, fast) ──
    const intentResult = intentDetector.detectIntent({
        ...probeData,
        _canaryTriggered: !!canaryResult?.triggered
    });

    // ── Step 3: Get deception state for consistent responses ──
    let deceptionState = {};
    try {
        deceptionState = await deceptionEngine.getDeceptionState(sessionId);
    } catch (err) {
        log.error('Failed to get deception state', { error: err.message });
    }

    // ── Step 4: Generate deceptive response (deterministic fallback) ──
    let response = fallbackEngine.generateFallbackResponse(
        probeData.path, probeData.method, deceptionState
    );

    // ── Step 5: Inject canary credential at strategic points ──
    let newCanary = null;
    const shouldInjectCanary = (
        intentResult.intent === 'credential_discovery' ||
        intentResult.intent === 'config_discovery' ||
        probeData.path.toLowerCase().includes('/config') ||
        probeData.path.toLowerCase().includes('/admin') ||
        probeData.path.toLowerCase().includes('.env')
    );

    if (shouldInjectCanary && session) {
        try {
            newCanary = await canaryManager.generateCanary(sessionId, probeData.path);
            // Inject the canary into the response body
            if (response.body && typeof response.body === 'object') {
                response.body._internal = response.body._internal || {};
                response.body._internal.apiKey = newCanary.canaryId;
                response.body._internal.serviceToken = `svc-${newCanary.canaryId}`;
            }
            metricsCollector.increment('canariesGenerated');
        } catch (err) {
            log.error('Canary injection failed', { error: err.message });
        }
    }

    // ── Step 6: Record the event in the session timeline ──
    if (session) {
        try {
            await sessionManager.addTimelineEntry(
                sessionId,
                'REQUEST_PROCESSED',
                `[${probeData.method}] ${probeData.path} → ${response.statusCode}`,
                {
                    intent: intentResult.intent,
                    confidence: intentResult.confidence,
                    canaryInjected: !!newCanary,
                    canaryTriggered: !!canaryResult?.triggered
                }
            );
        } catch { /* non-critical */ }
    }

    // ── Step 7: Queue for async processing (AI, RAG, scoring) ──
    try {
        await probeQueue.add('probe-event', {
            ...probeData,
            intent: intentResult,
            deceptionResponse: response,
            canaryGenerated: newCanary?.canaryId || null,
            canaryTriggered: canaryResult?.triggered ? canaryResult.canary.canaryId : null,
        });
    } catch (err) {
        log.error('Failed to enqueue probe', { error: err.message });
    }

    // ── Step 8: Send deceptive response ──
    const latency = Date.now() - startTime;
    metricsCollector.increment('requestsProcessed');
    metricsCollector.increment('totalProcessingMs', latency);

    // Broadcast to SSE clients
    const bc = getBroadcast();
    if (bc) bc('REQUEST_PROCESSED', { sessionId, path: probeData.path, intent: intentResult.intent });

    res.status(response.statusCode).json(response.body);
});

module.exports = router;
