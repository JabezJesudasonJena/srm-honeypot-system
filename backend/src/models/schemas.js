// ============================================================================
// Project Labyrinth — Data Models / Schemas
// ============================================================================
// Plain-JS classes representing the core domain objects. These are serialised
// to/from Redis as JSON. Using classes (rather than raw objects) gives us
// default values, factory methods, and a clear contract across services.
// ============================================================================

const crypto = require('crypto');

// ---------- helpers ----------
function generateId() {
    return crypto.randomUUID();          // Node 19+ built-in; no uuid dep needed
}

// ==========================================================================
// AttackSession — tracks one attacker's entire journey through the honeypot
// ==========================================================================
class AttackSession {
    constructor({ sourceIP, userAgent, fingerprint, headers = {} }) {
        this.sessionId         = generateId();
        this.sourceIP          = sourceIP;
        this.userAgent         = userAgent || 'unknown';
        this.fingerprint       = fingerprint;
        this.headers           = headers;
        this.firstSeen         = new Date().toISOString();
        this.lastSeen          = new Date().toISOString();
        this.requestCount      = 0;
        this.endpointsVisited  = [];
        this.httpMethods       = [];          // stored as array, deduplicated on update
        this.payloadPatterns   = [];
        this.discoveredAssets  = [];
        this.generatedCredentials = [];
        this.canaryCredentials = [];
        this.detectedIntents   = [];
        this.threatScore       = 0;
        this.threatSeverity    = 'LOW';
        this.threatReasons     = [];
        this.classification    = 'unknown';
        this.attackerProfile   = {
            behavior: {
                reconnaissance: 0.0,
                enumeration: 0.0,
                credential_hunting: 0.0,
                exploitation: 0.0,
                data_discovery: 0.0,
                privilege_escalation: 0.0
            },
            automationProbability: 0.0,
            attackerType: 'unknown',
            confidence: 0.0
        };
        this.deceptionDepth    = 0;
        this.deceptionState    = {};
        this.attackStage       = 'initial';
        this.timeline          = [];
        this.replayEvents      = [];
        this.scoreHistory      = [];
        this.active            = true;
    }

    addMethod(method) {
        if (!this.httpMethods.includes(method)) this.httpMethods.push(method);
    }

    addEndpoint(path) {
        if (!this.endpointsVisited.includes(path)) this.endpointsVisited.push(path);
    }

    toJSON() { return { ...this }; }

    static fromJSON(data) {
        const session = Object.assign(
            new AttackSession({
                sourceIP: data.sourceIP,
                userAgent: data.userAgent,
                fingerprint: data.fingerprint
            }),
            data
        );
        return session;
    }
}

// ==========================================================================
// AttackEvent — a single request within a session
// ==========================================================================
class AttackEvent {
    constructor({ sessionId, method, path, headers, body, query, ip }) {
        this.eventId            = generateId();
        this.sessionId          = sessionId;
        this.timestamp          = new Date().toISOString();
        this.method             = method;
        this.path               = path;
        this.headers            = headers || {};
        this.body               = body || {};
        this.query              = query || {};
        this.ip                 = ip;
        this.intent             = null;
        this.intentConfidence   = 0;
        this.intentReasons      = [];
        this.threatScoreDelta   = 0;
        this.deceptionResponse  = null;
        this.canaryEvents       = [];
        this.processingLatencyMs = 0;
        this.aiGenerated        = false;
    }
}

// ==========================================================================
// TimelineEntry — lightweight event for the attack timeline view
// ==========================================================================
class TimelineEntry {
    constructor(eventType, details, metadata = {}) {
        this.timestamp = new Date().toISOString();
        this.eventType = eventType;
        this.details   = details;
        this.metadata  = metadata;
    }
}

// ==========================================================================
// Alert — generated on high-severity events (e.g., canary trigger)
// ==========================================================================
class Alert {
    constructor(sessionId, alertType, severity, details, metadata = {}) {
        this.alertId      = generateId();
        this.sessionId    = sessionId;
        this.alertType    = alertType;
        this.severity     = severity;
        this.details      = details;
        this.metadata     = metadata;
        this.timestamp    = new Date().toISOString();
        this.acknowledged = false;
    }
}

module.exports = { AttackSession, AttackEvent, TimelineEntry, Alert, generateId };
