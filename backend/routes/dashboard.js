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

module.exports = router;
module.exports.broadcastEvent = broadcastEvent;
