// ============================================================================
// Project Labyrinth — Dashboard API Routes
// ============================================================================
// REST endpoints for the SOC dashboard (future Next.js frontend).
// These routes are mounted BEFORE the catch-all trap so they don't get
// swallowed by the honeypot. Protected by rate limiting.
//
// All endpoints under /labyrinth-api/ — this path is unlikely to be
// probed by attackers, and even if it is, it returns structured data
// that doesn't reveal the honeypot's nature.
// ============================================================================

const express   = require('express');
const router    = express.Router();

const sessionManager   = require('../src/services/sessionManager');
const deceptionEngine  = require('../src/services/deceptionEngine');
const canaryManager    = require('../src/services/canaryManager');
const threatScorer     = require('../src/services/threatScorer');
const metricsCollector = require('../src/services/metricsCollector');
const reportGenerator  = require('../src/services/reportGenerator');
const aiService        = require('../src/services/aiService');
const { dashboardRateLimiter } = require('../src/middleware/rateLimiter');

// Apply rate limiting to all dashboard routes
router.use(dashboardRateLimiter());

// ── SSE Clients ─────────────────────────────────────────────────────────────

const sseClients = new Set();

function broadcastEvent(eventType, data) {
    const payload = JSON.stringify({ type: eventType, data, timestamp: new Date().toISOString() });
    for (const client of sseClients) {
        try { client.write(`data: ${payload}\n\n`); }
        catch { sseClients.delete(client); }
    }
}

// ── GET /overview ───────────────────────────────────────────────────────────

router.get('/overview', async (req, res) => {
    try {
        const sessions = await sessionManager.getAllSessions();
        const alerts   = await sessionManager.getAlerts();
        const metrics  = metricsCollector.getMetrics();

        res.json({
            totalSessions:    sessions.length,
            activeSessions:   sessions.filter(s => s.active).length,
            criticalSessions: sessions.filter(s => s.threatSeverity === 'CRITICAL').length,
            totalAlerts:      alerts.length,
            unresolvedAlerts: alerts.filter(a => !a.acknowledged).length,
            recentAlerts:     alerts.slice(-5),
            metrics,
            deceptionEngine:  aiService.isAvailable() ? 'AI' : 'FALLBACK',
            systemStatus:     'operational'
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to load overview', message: err.message });
    }
});

// ── GET /attacks ────────────────────────────────────────────────────────────

router.get('/attacks', async (req, res) => {
    try {
        const sessions = await sessionManager.getAllSessions();
        const summary = sessions.map(s => ({
            sessionId:      s.sessionId,
            sourceIP:       s.sourceIP,
            firstSeen:      s.firstSeen,
            lastSeen:       s.lastSeen,
            requestCount:   s.requestCount,
            threatScore:    s.threatScore,
            threatSeverity: s.threatSeverity,
            classification: s.classification,
            attackStage:    s.attackStage,
            active:         s.active
        }));
        res.json({ attacks: summary, total: summary.length });
    } catch (err) {
        res.status(500).json({ error: 'Failed to load attacks', message: err.message });
    }
});

// ── GET /attacks/:sessionId ─────────────────────────────────────────────────

router.get('/attacks/:sessionId', async (req, res) => {
    try {
        const session = await sessionManager.getSession(req.params.sessionId);
        if (!session) return res.status(404).json({ error: 'Session not found' });
        res.json(session.toJSON());
    } catch (err) {
        res.status(500).json({ error: 'Failed to load session', message: err.message });
    }
});

// ── GET /attacks/:sessionId/timeline ────────────────────────────────────────

router.get('/attacks/:sessionId/timeline', async (req, res) => {
    try {
        const timeline = await sessionManager.getTimeline(req.params.sessionId);
        res.json({ sessionId: req.params.sessionId, timeline, total: timeline.length });
    } catch (err) {
        res.status(500).json({ error: 'Failed to load timeline', message: err.message });
    }
});

// ── GET /attacks/:sessionId/replay ──────────────────────────────────────────

router.get('/attacks/:sessionId/replay', async (req, res) => {
    try {
        const session = await sessionManager.getSession(req.params.sessionId);
        if (!session) return res.status(404).json({ error: 'Session not found' });
        res.json({ sessionId: req.params.sessionId, replayEvents: session.replayEvents || [], total: (session.replayEvents || []).length });
    } catch (err) {
        res.status(500).json({ error: 'Failed to load replay', message: err.message });
    }
});

// ── GET /attacks/:sessionId/assets ──────────────────────────────────────────

router.get('/attacks/:sessionId/assets', async (req, res) => {
    try {
        const session = await sessionManager.getSession(req.params.sessionId);
        if (!session) return res.status(404).json({ error: 'Session not found' });

        res.json({
            sessionId:        session.sessionId,
            discoveredAssets: session.discoveredAssets,
            deceptionState:   session.deceptionState,
            total:            session.discoveredAssets.length
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to load assets', message: err.message });
    }
});

// ── GET /attacks/:sessionId/canaries ────────────────────────────────────────

router.get('/attacks/:sessionId/canaries', async (req, res) => {
    try {
        const canaries = await canaryManager.getCanariesForSession(req.params.sessionId);
        res.json({
            sessionId: req.params.sessionId,
            canaries,
            total:     canaries.length,
            triggered: canaries.filter(c => c.status === 'triggered').length
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to load canaries', message: err.message });
    }
});

// ── GET /attacks/:sessionId/decision ────────────────────────────────────────

router.get('/attacks/:sessionId/decision', async (req, res) => {
    try {
        const session = await sessionManager.getSession(req.params.sessionId);
        if (!session) return res.status(404).json({ error: 'Session not found' });
        
        // Return the latest replay event that is an AI or fallback decision
        const decisionEvents = session.replayEvents?.filter(e => e.eventType === 'AI_DECISION' || e.eventType === 'FALLBACK_DECISION') || [];
        const latest = decisionEvents[decisionEvents.length - 1];
        
        if (!latest) return res.json({ decision: null });
        
        res.json({
            decision: {
                intent: latest.details,
                strategy: latest.metadata?.strategy,
                provider: latest.metadata?.provider,
                timestamp: latest.timestamp,
                depth: latest.deceptionDepth
            }
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to load decision', message: err.message });
    }
});

// ── GET /attacks/:sessionId/graph ───────────────────────────────────────────

router.get('/attacks/:sessionId/graph', async (req, res) => {
    try {
        const session = await sessionManager.getSession(req.params.sessionId);
        if (!session) return res.status(404).json({ error: 'Session not found' });
        
        const state = session.deceptionState || deceptionEngine.createDefaultState();
        
        const graph = {
            nodes: [
                { id: 'ROOT', label: state.company || 'Enterprise', group: 'company' }
            ],
            edges: []
        };
        
        const addNodes = (items, group) => {
            if (!items) return;
            items.forEach(item => {
                const id = item.id || item.name || item.username || item.bucketName || item.instanceId || item;
                const label = item.name || item.username || item.bucketName || item.instanceId || item;
                if (!graph.nodes.find(n => n.id === id)) {
                    graph.nodes.push({ id, label, group });
                    graph.edges.push({ from: 'ROOT', to: id });
                }
            });
        };
        
        addNodes(state.revealedServices, 'service');
        addNodes(state.revealedDatabases, 'database');
        addNodes(state.revealedEmployees, 'employee');
        addNodes(state.revealedCredentials, 'credential');
        addNodes(state.revealedCloudResources, 'cloud');
        
        res.json({ graph });
    } catch (err) {
        res.status(500).json({ error: 'Failed to build graph', message: err.message });
    }
});

// ── GET /alerts ─────────────────────────────────────────────────────────────

router.get('/alerts', async (req, res) => {
    try {
        const alerts = await sessionManager.getAlerts();
        res.json({ alerts, total: alerts.length });
    } catch (err) {
        res.status(500).json({ error: 'Failed to load alerts', message: err.message });
    }
});

// ── GET /threat-intelligence/:sessionId ─────────────────────────────────────

router.get('/threat-intelligence/:sessionId', async (req, res) => {
    try {
        const report = await reportGenerator.generateReport(req.params.sessionId);
        if (!report) return res.status(404).json({ error: 'Session not found' });
        res.json(report);
    } catch (err) {
        res.status(500).json({ error: 'Failed to generate report', message: err.message });
    }
});

// ── GET /system/health ──────────────────────────────────────────────────────

router.get('/system/health', (req, res) => {
    res.json({
        status:          'operational',
        deceptionEngine: aiService.isAvailable() ? 'AI' : 'FALLBACK',
        uptime:          process.uptime(),
        memoryUsage:     process.memoryUsage(),
        nodeVersion:     process.version,
        timestamp:       new Date().toISOString()
    });
});

// ── GET /system/metrics ─────────────────────────────────────────────────────

router.get('/system/metrics', (req, res) => {
    res.json(metricsCollector.getMetrics());
});

// ── GET /benchmark ──────────────────────────────────────────────────────────

router.get('/benchmark', (req, res) => {
    const m = metricsCollector.getMetrics();
    // Simplified representation for the dashboard UI
    res.json({
        metrics: m,
        staticModeEnabled: false, // Could be toggleable in a real UI
        labyrinthAdvantage: {
            adaptiveDeception: true,
            canaryTracking: 'SESSION-BOUND',
            threatProfiling: true,
            engagementFactor: m.avgProcessingLatencyMs ? (m.avgProcessingLatencyMs / 42.0).toFixed(2) + 'x' : 'N/A' // placeholder comparison
        }
    });
});

// ── POST /system/reset (Demo Mode) ──────────────────────────────────────────

router.post('/system/reset', async (req, res) => {
    try {
        const redisConnection = require('../config/redis');
        await redisConnection.flushdb();
        metricsCollector.resetMetrics();
        res.json({ status: 'success', message: 'Environment reset for new demo.' });
    } catch (err) {
        res.status(500).json({ error: 'Reset failed', message: err.message });
    }
});

// ── GET /events/stream (Server-Sent Events) ─────────────────────────────────

router.get('/events/stream', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
    });

    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', timestamp: new Date().toISOString() })}\n\n`);
    sseClients.add(res);

    req.on('close', () => {
        sseClients.delete(res);
    });
});

// ── POST /simulate (Attack Simulation) ──────────────────────────────────────

router.post('/simulate', async (req, res) => {
    try {
        const { scenario } = req.body;
        if (!scenario) return res.status(400).json({ error: 'Scenario name is required' });
        
        // Quick and dirty spawn to unblock the demo
        const { spawn } = require('child_process');
        const path = require('path');
        const simPath = path.join(__dirname, '../simulator/attackSimulator.js');
        
        // Run in background without waiting for it to finish
        const child = spawn('node', [simPath, scenario], { detached: true, stdio: 'ignore' });
        child.unref();
        
        res.json({ status: 'success', message: `Simulator launched for scenario: ${scenario}` });
    } catch (err) {
        res.status(500).json({ error: 'Simulator launch failed', message: err.message });
    }
});

module.exports = router;
module.exports.broadcastEvent = broadcastEvent;
