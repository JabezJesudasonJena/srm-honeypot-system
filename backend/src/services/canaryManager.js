// ============================================================================
// Project Labyrinth — Canary Credential Manager
// ============================================================================
// Generates unique, session-specific canary credentials that are "leaked" to
// attackers. When an attacker reuses a canary credential against another
// endpoint, we detect it, correlate the session, and escalate the threat.
//
// Canary format:  LAB-{shortSessionId}-CAN-{random}
// This looks plausible as an internal API key or service token.
// ============================================================================

const crypto = require('crypto');
const { Alert, TimelineEntry } = require('../models/schemas');
const { createLogger }   = require('../utils/logger');
const sessionManager     = require('./sessionManager');
const redisConnection    = require('../../config/redis');
const metricsCollector   = require('./metricsCollector');

const log = createLogger('CanaryManager');

const CANARY_PREFIX = 'labyrinth:canary:';
const CANARY_TTL    = 86400 * 2;  // 48 hours

// ── Generation ──────────────────────────────────────────────────────────────

/**
 * Generate a unique canary credential for a session.
 * @param {string} sessionId
 * @param {string} exposureEndpoint – the path where this canary is being revealed
 * @returns {object} canary record
 */
async function generateCanary(sessionId, exposureEndpoint) {
    const shortSession = sessionId.substring(0, 8);
    const randomSuffix = crypto.randomBytes(4).toString('hex').toUpperCase();
    const canaryId = `LAB-${shortSession}-CAN-${randomSuffix}`;

    const canary = {
        canaryId,
        sessionId,
        createdAt:         new Date().toISOString(),
        exposureEndpoint,
        status:            'active',      // active | triggered
        triggerTimestamp:   null,
        triggerEndpoint:   null,
        type:              'api_key'       // api_key | password | token
    };

    // Store canary in Redis keyed by canaryId for fast lookup
    await redisConnection.set(CANARY_PREFIX + canaryId, JSON.stringify(canary), 'EX', CANARY_TTL);

    // Also update the session
    const session = await sessionManager.getSession(sessionId);
    if (session) {
        session.canaryCredentials.push({
            canaryId,
            createdAt: canary.createdAt,
            exposureEndpoint,
            status: 'active'
        });
        await sessionManager.saveSession(session);
    }

    await sessionManager.addTimelineEntry(
        sessionId, 'CREDENTIAL_DISCOVERED',
        `Canary credential exposed: ${canaryId}`,
        { canaryId, endpoint: exposureEndpoint }
    );

    log.info('Canary generated', { sessionId, canaryId, endpoint: exposureEndpoint });
    return canary;
}

// ── Detection ───────────────────────────────────────────────────────────────

/**
 * Scan incoming request data for known canary credentials.
 * Checks: Authorization header, body fields, query params, URL path, cookies.
 *
 * @returns {object|null} – triggered canary info, or null if no match
 */
async function checkForCanary(req) {
    const searchTargets = [];

    // Collect all string values from the request
    const authHeader = req.headers?.['authorization'] || '';
    if (authHeader) searchTargets.push(authHeader);

    // Body fields (flattened)
    if (req.body && typeof req.body === 'object') {
        const bodyStr = JSON.stringify(req.body);
        searchTargets.push(bodyStr);
    }

    // Query params
    if (req.query && typeof req.query === 'object') {
        const queryStr = JSON.stringify(req.query);
        searchTargets.push(queryStr);
    }

    // URL path itself
    searchTargets.push(req.originalUrl || req.path || '');

    // Cookie values
    if (req.cookies && typeof req.cookies === 'object') {
        searchTargets.push(Object.values(req.cookies).join(' '));
    }

    // Search for canary pattern: LAB-XXXXXXXX-CAN-XXXXXXXX
    const combined = searchTargets.join(' ');
    const canaryPattern = /LAB-[a-f0-9]{8}-CAN-[A-F0-9]{8}/g;
    const matches = combined.match(canaryPattern);

    if (!matches || matches.length === 0) return null;

    // Verify each match against Redis
    for (const canaryId of matches) {
        const raw = await redisConnection.get(CANARY_PREFIX + canaryId);
        if (raw) {
            const canary = JSON.parse(raw);
            // Only trigger if the canary is being used at a DIFFERENT endpoint
            const currentPath = req.originalUrl || req.path || '';
            if (currentPath !== canary.exposureEndpoint) {
                return await triggerCanary(canaryId, currentPath);
            }
        }
    }

    return null;
}

/**
 * Trigger a canary — the attacker reused a leaked credential.
 */
async function triggerCanary(canaryId, triggeringEndpoint) {
    const raw = await redisConnection.get(CANARY_PREFIX + canaryId);
    if (!raw) return null;

    const canary = JSON.parse(raw);
    canary.status           = 'triggered';
    canary.triggerTimestamp  = new Date().toISOString();
    canary.triggerEndpoint  = triggeringEndpoint;

    await redisConnection.set(CANARY_PREFIX + canaryId, JSON.stringify(canary), 'EX', CANARY_TTL);

    // Update session
    const session = await sessionManager.getSession(canary.sessionId);
    if (session) {
        const idx = session.canaryCredentials.findIndex(c => c.canaryId === canaryId);
        if (idx >= 0) {
            session.canaryCredentials[idx].status = 'triggered';
            session.canaryCredentials[idx].triggerTimestamp = canary.triggerTimestamp;
            session.canaryCredentials[idx].triggerEndpoint  = triggeringEndpoint;
        }
        await sessionManager.saveSession(session);
    }

    // Create alert
    const alert = new Alert(
        canary.sessionId,
        'CANARY_TRIGGERED',
        'CRITICAL',
        `Canary credential ${canaryId} was reused at ${triggeringEndpoint}`,
        { canaryId, originalEndpoint: canary.exposureEndpoint, triggeringEndpoint }
    );
    await sessionManager.addAlert(alert);

    await sessionManager.addTimelineEntry(
        canary.sessionId, 'CANARY_TRIGGERED',
        `🚨 Canary ${canaryId} TRIGGERED at ${triggeringEndpoint}`,
        { canaryId, triggeringEndpoint, severity: 'CRITICAL' }
    );

    log.critical('CANARY TRIGGERED', {
        sessionId: canary.sessionId,
        canaryId,
        original: canary.exposureEndpoint,
        triggeredAt: triggeringEndpoint
    });

    if (session) {
        const detectionTimeMs = new Date(canary.triggerTimestamp).getTime() - new Date(session.firstSeen).getTime();
        metricsCollector.increment('totalDetectionTimeMs', detectionTimeMs);
    }

    return {
        triggered: true,
        canary,
        alert
    };
}

// ── Query ───────────────────────────────────────────────────────────────────

async function getCanariesForSession(sessionId) {
    const session = await sessionManager.getSession(sessionId);
    return session ? session.canaryCredentials : [];
}

module.exports = {
    generateCanary,
    checkForCanary,
    triggerCanary,
    getCanariesForSession
};
