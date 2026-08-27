// ============================================================================
// Project Labyrinth — Attacker Intent Detection Engine
// ============================================================================
// Deterministic, rule-based classifier that categorises attacker behaviour
// from request metadata. Designed to run synchronously in the hot path
// (no external API calls). Gemini can optionally refine classification
// later in the async worker.
//
// Architecture: Each rule has a match function, intent label, confidence,
// and human-readable reasons. First matching rule wins (rules are ordered
// by specificity, most specific first).
// ============================================================================

const { createLogger } = require('../utils/logger');

const log = createLogger('IntentDetector');

// ── Intent Categories ───────────────────────────────────────────────────────

const INTENTS = {
    RECONNAISSANCE:          'reconnaissance',
    ENDPOINT_ENUMERATION:    'endpoint_enumeration',
    CREDENTIAL_DISCOVERY:    'credential_discovery',
    CONFIG_DISCOVERY:        'config_discovery',
    DATABASE_DISCOVERY:      'database_discovery',
    PRIVILEGE_ESCALATION:    'privilege_escalation',
    API_EXPLOITATION:        'api_exploitation',
    SENSITIVE_DATA_DISCOVERY:'sensitive_data_discovery',
    PERSISTENCE_ATTEMPT:     'persistence_attempt',
    CANARY_REUSE:            'canary_reuse',
    UNKNOWN:                 'unknown'
};

// ── Detection Rules (ordered by specificity) ────────────────────────────────

const RULES = [
    // ---- Canary reuse (highest priority) ----
    {
        intent: INTENTS.CANARY_REUSE,
        confidence: 0.99,
        reasons: ['Request contains a known canary credential being reused'],
        match: (req) => req._canaryTriggered === true
    },

    // ---- SQL Injection / API exploitation ----
    {
        intent: INTENTS.API_EXPLOITATION,
        confidence: 0.95,
        reasons: ['SQL injection pattern detected in request'],
        match: (req) => {
            const combined = JSON.stringify(req.body || {}) + (req.originalUrl || '') + JSON.stringify(req.query || {});
            return /('|"|;|\b(OR|AND|UNION|SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|EXEC)\b)/i.test(combined);
        }
    },
    {
        intent: INTENTS.API_EXPLOITATION,
        confidence: 0.9,
        reasons: ['Path traversal or command injection pattern detected'],
        match: (req) => {
            const path = req.originalUrl || '';
            return /(\.\.|%2e%2e|\/etc\/|\/proc\/|;|\||`|\$\()/i.test(path);
        }
    },

    // ---- Credential discovery ----
    {
        intent: INTENTS.CREDENTIAL_DISCOVERY,
        confidence: 0.95,
        reasons: ['Attempted to access credential/secret storage'],
        match: (req) => /\/(credentials|secrets|keys|tokens|passwords|vault|\.ssh|\.gnupg|id_rsa)/i.test(req.originalUrl || '')
    },
    {
        intent: INTENTS.CREDENTIAL_DISCOVERY,
        confidence: 0.85,
        reasons: ['Login/authentication attempt with potential brute-force'],
        match: (req) => {
            const p = (req.originalUrl || '').toLowerCase();
            return req.method === 'POST' && (p.includes('/login') || p.includes('/auth') || p.includes('/signin'));
        }
    },

    // ---- Privilege escalation ----
    {
        intent: INTENTS.PRIVILEGE_ESCALATION,
        confidence: 0.9,
        reasons: ['Attempted to access administrative endpoints'],
        match: (req) => /\/(admin|sudo|root|superuser|management|console|dashboard)/i.test(req.originalUrl || '')
    },

    // ---- Config discovery ----
    {
        intent: INTENTS.CONFIG_DISCOVERY,
        confidence: 0.95,
        reasons: ['Attempted to access environment or configuration file'],
        match: (req) => /\.(env|config|cfg|ini|yml|yaml|toml|properties|xml|json|htaccess|htpasswd)$/i.test(req.originalUrl || '')
    },
    {
        intent: INTENTS.CONFIG_DISCOVERY,
        confidence: 0.9,
        reasons: ['Accessed configuration endpoint'],
        match: (req) => /\/(config|configuration|settings|setup|env|environment)\/?$/i.test(req.originalUrl || '')
    },
    {
        intent: INTENTS.CONFIG_DISCOVERY,
        confidence: 0.85,
        reasons: ['Probing for exposed source code or version control'],
        match: (req) => /\/(\.git|\.svn|\.hg|\.DS_Store|wp-config|web\.config|phpinfo)/i.test(req.originalUrl || '')
    },

    // ---- Database discovery ----
    {
        intent: INTENTS.DATABASE_DISCOVERY,
        confidence: 0.9,
        reasons: ['Attempted to access database endpoints or interfaces'],
        match: (req) => /\/(database|db|sql|phpmyadmin|adminer|pgadmin|redis|mongo|mysql)/i.test(req.originalUrl || '')
    },

    // ---- Sensitive data discovery ----
    {
        intent: INTENTS.SENSITIVE_DATA_DISCOVERY,
        confidence: 0.85,
        reasons: ['Attempted to access sensitive data endpoints'],
        match: (req) => /\/(backup|dump|export|download|report|logs?|audit|archive)/i.test(req.originalUrl || '')
    },

    // ---- Persistence ----
    {
        intent: INTENTS.PERSISTENCE_ATTEMPT,
        confidence: 0.85,
        reasons: ['Attempted file upload or write operation indicative of persistence'],
        match: (req) => {
            const p = (req.originalUrl || '').toLowerCase();
            return (req.method === 'POST' || req.method === 'PUT') &&
                   (p.includes('/upload') || p.includes('/shell') || p.includes('/webshell') ||
                    p.includes('/cron') || p.includes('/schedule') || p.includes('/webhook'));
        }
    },

    // ---- Endpoint enumeration ----
    {
        intent: INTENTS.ENDPOINT_ENUMERATION,
        confidence: 0.8,
        reasons: ['Probing API structure or documentation'],
        match: (req) => /\/(api|swagger|openapi|graphql|docs|api-docs|v[0-9]|endpoints)/i.test(req.originalUrl || '')
    },

    // ---- Cloud / infrastructure reconnaissance ----
    {
        intent: INTENTS.RECONNAISSANCE,
        confidence: 0.85,
        reasons: ['Probing cloud metadata or infrastructure endpoints'],
        match: (req) => /\/(metadata|169\.254\.|cloud|aws|gcp|azure|instance|latest\/meta-data)/i.test(req.originalUrl || '')
    },

    // ---- General reconnaissance (catch-most) ----
    {
        intent: INTENTS.RECONNAISSANCE,
        confidence: 0.7,
        reasons: ['General probe of server structure'],
        match: (req) => /\/(robots\.txt|sitemap|\.well-known|favicon|health|ping|status|version|info)/i.test(req.originalUrl || '')
    },

    // ---- Generic endpoint probing ----
    {
        intent: INTENTS.ENDPOINT_ENUMERATION,
        confidence: 0.6,
        reasons: ['HTTP request to non-standard endpoint'],
        match: (req) => req.method === 'GET'
    }
];

// ── Classifier ──────────────────────────────────────────────────────────────

/**
 * Classify the intent of an incoming request using deterministic rules.
 *
 * @param {object} req – Express request (or shaped probe data object)
 * @returns {{ intent: string, confidence: number, reasons: string[] }}
 */
function detectIntent(req) {
    for (const rule of RULES) {
        try {
            if (rule.match(req)) {
                return {
                    intent:     rule.intent,
                    confidence: rule.confidence,
                    reasons:    [...rule.reasons]
                };
            }
        } catch {
            // A malformed request should never crash the classifier
            continue;
        }
    }
    return { intent: INTENTS.UNKNOWN, confidence: 0.1, reasons: ['Unclassified request pattern'] };
}

/**
 * Map an intent to the appropriate deception attack stage.
 */
function intentToStage(intent) {
    const mapping = {
        [INTENTS.RECONNAISSANCE]:           'reconnaissance',
        [INTENTS.ENDPOINT_ENUMERATION]:     'enumeration',
        [INTENTS.CONFIG_DISCOVERY]:         'enumeration',
        [INTENTS.CREDENTIAL_DISCOVERY]:     'discovery',
        [INTENTS.DATABASE_DISCOVERY]:       'enumeration',
        [INTENTS.SENSITIVE_DATA_DISCOVERY]: 'discovery',
        [INTENTS.PRIVILEGE_ESCALATION]:     'exploitation',
        [INTENTS.API_EXPLOITATION]:         'exploitation',
        [INTENTS.PERSISTENCE_ATTEMPT]:      'persistence',
        [INTENTS.CANARY_REUSE]:             'exploitation'
    };
    return mapping[intent] || 'reconnaissance';
}

module.exports = { INTENTS, detectIntent, intentToStage };
