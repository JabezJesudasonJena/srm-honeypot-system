// ============================================================================
// Project Labyrinth — Session Tracker Middleware
// ============================================================================
// Express middleware that resolves (or creates) an attack session for every
// incoming request and attaches it to `req.attackSession`.
//
// This runs synchronously in the hot path so it must be fast: the heavy
// session work is a single Redis GET/SET, no AI or DB calls here.
// ============================================================================

const sessionManager = require('../services/sessionManager');
const { createLogger } = require('../utils/logger');

const log = createLogger('SessionTracker');

function parseCookies(cookieHeader) {
    const cookies = {};
    if (!cookieHeader) return cookies;
    cookieHeader.split(';').forEach(pair => {
        const [key, ...vals] = pair.trim().split('=');
        if (key) cookies[key] = vals.join('=');
    });
    return cookies;
}

function sessionTracker() {
    return async (req, res, next) => {
        try {
            // Parse cookies manually (avoids adding cookie-parser dependency)
            req.cookies = parseCookies(req.headers.cookie);

            const { session, isNew } = await sessionManager.getOrCreateSession(req);
            req.attackSession = session;

            // Set a session cookie so the attacker's browser/tool correlates
            // future requests. Many scanners and browsers honour Set-Cookie.
            res.cookie('labyrinth-sid', session.sessionId, {
                httpOnly: true,
                maxAge: parseInt(process.env.SESSION_TIMEOUT_MS) || 1800000,
                sameSite: 'lax'
            });

            if (isNew) {

                await sessionManager.addTimelineEntry(
                    session.sessionId,
                    'SESSION_CREATED',
                    `New attack session from ${session.sourceIP}`,
                    { userAgent: session.userAgent, fingerprint: session.fingerprint }
                );
            }
        } catch (err) {
            log.error('Session tracking failed — continuing without session', { error: err.message });
        }
        next(); // Never block the honeypot
    };
}

module.exports = sessionTracker;
