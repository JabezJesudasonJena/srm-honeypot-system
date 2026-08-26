// ============================================================================
// Project Labyrinth — Security Hardening Middleware
// ============================================================================

const rateLimits = new Map();

function rateLimiter(opts = { windowMs: 60000, max: 100 }) {
    return (req, res, next) => {
        const ip = req.ip || req.connection?.remoteAddress || 'unknown';
        const now = Date.now();
        
        let record = rateLimits.get(ip);
        if (!record || record.resetTime < now) {
            record = { count: 1, resetTime: now + opts.windowMs };
        } else {
            record.count++;
        }
        rateLimits.set(ip, record);

        // Keep the map from growing indefinitely
        if (rateLimits.size > 10000) rateLimits.clear();

        if (record.count > opts.max) {
            return res.status(429).json({
                error: 'Too Many Requests',
                message: 'Rate limit exceeded.'
            });
        }
        next();
    };
}

function timeoutHandler(ms = 10000) {
    return (req, res, next) => {
        res.setTimeout(ms, () => {
            if (!res.headersSent) {
                res.status(503).json({
                    error: 'Service Unavailable',
                    message: 'Request timed out.'
                });
            }
        });
        next();
    };
}

module.exports = { rateLimiter, timeoutHandler };
