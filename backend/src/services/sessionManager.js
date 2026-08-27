// ============================================================================
// Project Labyrinth — Session Manager
// ============================================================================
// Maintains persistent attacker sessions in Redis. Each attacker is identified
// by a composite fingerprint (IP + User-Agent + Accept headers) and optionally
// by a session cookie. This ensures session continuity even if the attacker
// doesn't return cookies.
//
// Architecture:
//   Redis keys:
//     labyrinth:session:{sessionId}       → JSON session data
//     labyrinth:fp:{fingerprint}          → sessionId (fingerprint lookup)
//     labyrinth:events:{sessionId}        → list of AttackEvent JSON
//     labyrinth:alerts                    → list of Alert JSON
// ============================================================================

const crypto = require('crypto');
const { AttackSession, AttackEvent, TimelineEntry, Alert } = require('../models/schemas');
const { createLogger } = require('../utils/logger');
const redisConnection = require('../../config/redis');

const log = createLogger('SessionManager');

const SESSION_TIMEOUT_MS  = parseInt(process.env.SESSION_TIMEOUT_MS) || 30 * 60 * 1000;
const SESSION_TTL_SECONDS = Math.ceil(SESSION_TIMEOUT_MS / 1000) * 2; // 2× timeout for TTL headroom

const KEY = {
    session:     (id)  => `labyrinth:session:${id}`,
    fingerprint: (fp)  => `labyrinth:fp:${fp}`,
    events:      (id)  => `labyrinth:events:${id}`,
    alerts:      ()    => 'labyrinth:alerts',
};

// ── Fingerprinting ──────────────────────────────────────────────────────────

function generateFingerprint(req) {
    const parts = [
        req.ip || req.connection?.remoteAddress || 'unknown',
        req.headers['user-agent'] || '',
        req.headers['accept-language'] || '',
        req.headers['accept-encoding'] || '',
        req.headers['accept'] || ''
    ];
    return crypto.createHash('sha256').update(parts.join('|')).digest('hex').substring(0, 16);
}

// ── Session CRUD ────────────────────────────────────────────────────────────

async function saveSession(session) {
    const data = JSON.stringify(session.toJSON());
    await redisConnection.set(KEY.session(session.sessionId), data, 'EX', SESSION_TTL_SECONDS);
}

async function getSession(sessionId) {
    if (!sessionId) return null;
    const raw = await redisConnection.get(KEY.session(sessionId));
    if (!raw) return null;
    try { return AttackSession.fromJSON(JSON.parse(raw)); }
    catch { return null; }
}

async function updateSession(sessionId, updates) {
    const session = await getSession(sessionId);
    if (!session) return null;
    Object.assign(session, updates);
    session.lastSeen = new Date().toISOString();
    await saveSession(session);
    return session;
}

/**
 * Core session resolution: find an existing session or create a new one.
 * Lookup order: cookie → fingerprint → create new.
 */
async function getOrCreateSession(req) {
    try {
        // 1. Try session cookie
        const cookieSid = req.cookies?.['labyrinth-sid'];
        if (cookieSid) {
            const session = await getSession(cookieSid);
            if (session) {
                session.lastSeen = new Date().toISOString();
                session.requestCount++;
                session.addMethod(req.method);
                session.addEndpoint(req.originalUrl);
                await saveSession(session);
                return { session, isNew: false };
            }
        }

        // 2. Try fingerprint
        const fingerprint = generateFingerprint(req);
        const existingId = await redisConnection.get(KEY.fingerprint(fingerprint));
        if (existingId) {
            const session = await getSession(existingId);
            if (session) {
                session.lastSeen = new Date().toISOString();
                session.requestCount++;
                session.addMethod(req.method);
                session.addEndpoint(req.originalUrl);
                await saveSession(session);
                return { session, isNew: false };
            }
        }

        // 3. Create new session
        const session = new AttackSession({
            sourceIP:    req.ip || req.connection?.remoteAddress || 'unknown',
            userAgent:   req.headers['user-agent'] || 'unknown',
            fingerprint,
            headers: {
                accept:         req.headers['accept'],
                acceptLanguage: req.headers['accept-language'],
                acceptEncoding: req.headers['accept-encoding'],
                connection:     req.headers['connection']
            }
        });

        session.requestCount = 1;
        session.addMethod(req.method);
        session.addEndpoint(req.originalUrl);

        await saveSession(session);
        await redisConnection.set(KEY.fingerprint(fingerprint), session.sessionId, 'EX', SESSION_TTL_SECONDS);

        log.info('New attack session created', { sessionId: session.sessionId, ip: session.sourceIP });
        return { session, isNew: true };

    } catch (err) {
        log.error('Session resolution failed — using transient fallback', { error: err.message });
        const fallback = new AttackSession({
            sourceIP:    req.ip || 'unknown',
            userAgent:   req.headers?.['user-agent'] || 'unknown',
            fingerprint: 'fallback-' + Date.now()
        });
        return { session: fallback, isNew: true };
    }
}

// ── Event Storage ───────────────────────────────────────────────────────────

async function addEvent(event) {
    try {
        await redisConnection.rpush(KEY.events(event.sessionId), JSON.stringify(event));
        await redisConnection.expire(KEY.events(event.sessionId), SESSION_TTL_SECONDS);
    } catch (err) {
        log.error('Failed to store event', { error: err.message, sessionId: event.sessionId });
    }
}

async function getEvents(sessionId) {
    try {
        const raw = await redisConnection.lrange(KEY.events(sessionId), 0, -1);
        return raw.map(r => JSON.parse(r));
    } catch { return []; }
}

// ── Timeline ────────────────────────────────────────────────────────────────

async function addTimelineEntry(sessionId, eventType, details, metadata = {}) {
    const session = await getSession(sessionId);
    if (!session) return null;
    const entry = new TimelineEntry(eventType, details, metadata);

    // Enhanced tracking: capture full request details for flagged attackers
    if (session.enhancedTrackingEnabled && metadata) {
        // Compute timing delta from previous timeline entry
        if (session.timeline.length > 0) {
            const prevEntry = session.timeline[session.timeline.length - 1];
            const prevTime = new Date(prevEntry.timestamp).getTime();
            const currTime = new Date(entry.timestamp).getTime();
            entry.metadata.timingDeltaMs = currTime - prevTime;
        }
        // Preserve raw headers if passed in metadata (caller provides them)
        if (metadata.rawHeaders) {
            entry.metadata.rawHeaders = metadata.rawHeaders;
        }
        // Preserve full body if passed in metadata
        if (metadata.rawBody !== undefined) {
            entry.metadata.rawBody = metadata.rawBody;
        }
    }

    session.timeline.push(entry);
    // Bound timeline at 500 entries to prevent unbounded growth
    if (session.timeline.length > 500) session.timeline = session.timeline.slice(-500);
    await saveSession(session);
    return entry;
}

async function getTimeline(sessionId) {
    const session = await getSession(sessionId);
    return session ? session.timeline : [];
}

// ── Alerts ──────────────────────────────────────────────────────────────────

async function addAlert(alert) {
    try {
        await redisConnection.rpush(KEY.alerts(), JSON.stringify(alert));
        // Keep max 1000 alerts
        await redisConnection.ltrim(KEY.alerts(), -1000, -1);
    } catch (err) {
        log.error('Failed to store alert', { error: err.message });
    }
}

async function getAlerts() {
    try {
        const raw = await redisConnection.lrange(KEY.alerts(), 0, -1);
        return raw.map(r => JSON.parse(r));
    } catch { return []; }
}

// ── Bulk Queries ────────────────────────────────────────────────────────────

async function getAllSessions() {
    const sessions = [];
    let cursor = '0';
    try {
        do {
            const [next, keys] = await redisConnection.scan(cursor, 'MATCH', 'labyrinth:session:*', 'COUNT', 100);
            cursor = next;
            for (const key of keys) {
                const raw = await redisConnection.get(key);
                if (raw) {
                    try { sessions.push(AttackSession.fromJSON(JSON.parse(raw))); }
                    catch { /* skip malformed */ }
                }
            }
        } while (cursor !== '0');
    } catch (err) {
        log.error('Failed to scan sessions', { error: err.message });
    }
    return sessions;
}

module.exports = {
    generateFingerprint,
    getOrCreateSession,
    saveSession,
    getSession,
    updateSession,
    addEvent,
    getEvents,
    addTimelineEntry,
    getTimeline,
    addAlert,
    getAlerts,
    getAllSessions
};
