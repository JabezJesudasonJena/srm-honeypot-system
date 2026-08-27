// ============================================================================
// Project Labyrinth — Structured Logging Utility
// ============================================================================
// Provides consistent, structured log output with severity levels, component
// tags, and optional metadata. Replaces scattered console.log calls with a
// unified logging interface that can be extended to external sinks later.
// ============================================================================

const LOG_LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, CRITICAL: 4 };

const LOG_ICONS = {
    DEBUG: '🔍',
    INFO: 'ℹ️ ',
    WARN: '⚠️ ',
    ERROR: '❌',
    CRITICAL: '🚨'
};

const currentLevel = LOG_LEVELS[process.env.LOG_LEVEL || 'INFO'] ?? LOG_LEVELS.INFO;

function formatMessage(level, component, message, meta) {
    const ts = new Date().toISOString();
    const icon = LOG_ICONS[level] || '';
    const metaStr = meta && Object.keys(meta).length > 0
        ? ` | ${JSON.stringify(meta)}`
        : '';
    return `${icon} [${ts}] [${level}] [${component}] ${message}${metaStr}`;
}

/**
 * Create a scoped logger for a specific component.
 * Usage:  const log = createLogger('SessionManager');
 *         log.info('Session created', { sessionId: '...' });
 */
function createLogger(component) {
    return {
        debug(msg, meta) {
            if (LOG_LEVELS.DEBUG >= currentLevel)
                console.log(formatMessage('DEBUG', component, msg, meta));
        },
        info(msg, meta) {
            if (LOG_LEVELS.INFO >= currentLevel)
                console.log(formatMessage('INFO', component, msg, meta));
        },
        warn(msg, meta) {
            if (LOG_LEVELS.WARN >= currentLevel)
                console.warn(formatMessage('WARN', component, msg, meta));
        },
        error(msg, meta) {
            if (LOG_LEVELS.ERROR >= currentLevel)
                console.error(formatMessage('ERROR', component, msg, meta));
        },
        critical(msg, meta) {
            // Critical always logs regardless of level
            console.error(formatMessage('CRITICAL', component, msg, meta));
        }
    };
}

module.exports = { createLogger, LOG_LEVELS };
