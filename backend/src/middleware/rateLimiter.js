// ============================================================================
// Project Labyrinth — Rate Limiter Middleware
// ============================================================================
// Protects the honeypot from being overwhelmed by automated scanners.
// Uses a simple in-memory sliding window counter per IP.
// Dashboard APIs get stricter limits than the trap (since attackers hitting
// the trap IS the desired behaviour).
// ============================================================================

const { createLogger } = require('../utils/logger');

const log = createLogger('RateLimiter');

const windowMs   = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000;
const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100;

const counters = new Map(); // IP → { count, resetAt }

// Cleanup stale entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of counters) {
        if (now > data.resetAt) counters.delete(ip);
    }
}, 300000);

/**
 * Rate limiter for dashboard/admin APIs.
 * The trap route intentionally does NOT rate-limit (we WANT attackers to send requests).
 */
function dashboardRateLimiter() {
    return (req, res, next) => {
        const ip = req.ip || req.connection?.remoteAddress || 'unknown';
        const now = Date.now();

        if (!counters.has(ip) || now > counters.get(ip).resetAt) {
            counters.set(ip, { count: 1, resetAt: now + windowMs });
            return next();
        }

        const entry = counters.get(ip);
        entry.count++;

        if (entry.count > maxRequests) {
            log.warn('Rate limit exceeded', { ip, count: entry.count });
            return res.status(429).json({
                error: 'Too Many Requests',
                message: 'Rate limit exceeded. Try again later.',
                retryAfter: Math.ceil((entry.resetAt - now) / 1000)
            });
        }

        next();
    };
}

module.exports = { dashboardRateLimiter };
