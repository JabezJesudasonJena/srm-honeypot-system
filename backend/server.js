// ============================================================================
// Project Labyrinth — Main Server Entry Point
// ============================================================================
// Sets up Express with:
//   1. Standard middleware (CORS, JSON, Morgan)
//   2. Session tracking middleware (assigns attack sessions)
//   3. Dashboard API routes (mounted BEFORE the trap to avoid being caught)
//   4. Catch-all trap route (the honeypot sinkhole)
//   5. Global error handling (the honeypot must never crash)
//   6. Worker initialization (BullMQ RAG worker)
// ============================================================================

require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');

const { createLogger } = require('./src/utils/logger');
const sessionTracker   = require('./src/middleware/sessionTracker');
const dashboardRoutes  = require('./routes/dashboard');
const trapRoute        = require('./routes/trap');

// Initialize the BullMQ worker (starts processing jobs immediately)
require('./workers/ragWorker');

const log = require('./src/utils/logger').createLogger('Server');
const app = express();
const PORT = process.env.PORT || 5000;

// ── Standard Middleware ─────────────────────────────────────────────────────

const { rateLimiter, timeoutHandler } = require('./src/middleware/security');

// Parse JSON payloads (attackers send all sorts of things)
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Global security middleware
app.use(timeoutHandler(15000));
app.use(rateLimiter({ windowMs: 60000, max: 200 })); // 200 reqs/min

// Enable CORS (honeypots should accept probes from anywhere)
app.use(cors());

// HTTP request logging
app.use(morgan('combined'));

// ── Dashboard API Routes ────────────────────────────────────────────────────
// Mounted BEFORE the session tracker and trap route so dashboard requests
// are not captured as attacker probes.

app.use('/labyrinth-api', dashboardRoutes);

// ── Session Tracking Middleware ─────────────────────────────────────────────
// Every request after this point gets an attack session assigned.
// Dashboard routes above are excluded.

app.use(sessionTracker());

// ── Catch-All Trap Route ────────────────────────────────────────────────────
// The honeypot sinkhole — captures every request and returns adaptive
// deceptive responses. This MUST be last.

app.use('*', trapRoute);

// ── Global Error Handler ────────────────────────────────────────────────────
// The honeypot must NEVER crash, even under malformed payloads, huge
// bodies, or deliberate DoS attempts.

app.use((err, req, res, next) => {
    log.error('Unhandled error', { error: err.message, path: req.originalUrl });
    res.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred while processing the request.',
        code: 'ERR_INTERNAL_500'
    });
});

// ── Start Server ────────────────────────────────────────────────────────────

app.listen(PORT, () => {
    const aiMode = (process.env.AI_ENABLED || 'true') === 'true' && process.env.GEMINI_API_KEY
        ? 'AI (Gemini)'
        : 'FALLBACK (Deterministic)';

    log.info(`🛡️  Project Labyrinth is ACTIVE on port ${PORT}`);
    log.info(`   Deception Mode: ${aiMode}`);
    log.info(`   Dashboard API:  http://localhost:${PORT}/labyrinth-api/overview`);
    log.info(`   SSE Stream:     http://localhost:${PORT}/labyrinth-api/events/stream`);
    console.log('');
    console.log('🏴‍☠️  Waiting for attacker probes...');
    console.log('');
});

// Handle uncaught errors gracefully — a honeypot must stay alive
process.on('uncaughtException', (err) => {
    log.critical('Uncaught exception — honeypot remains active', { error: err.message });
});

process.on('unhandledRejection', (reason) => {
    log.critical('Unhandled rejection — honeypot remains active', { reason: String(reason) });
});

module.exports = app;
