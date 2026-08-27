// ============================================================================
// Project Labyrinth — Threat Scoring Engine
// ============================================================================
// Configurable, cumulative scoring system that assigns a numerical threat
// score (0–100) to each attack session. The score is additive: each new
// event contributes a delta based on the detected intent. Once the score
// reaches certain thresholds, the severity classification changes.
//
// All scoring weights are configurable via the WEIGHTS object.
// The score is explainable: every delta comes with a reason string.
// ============================================================================

const { createLogger } = require('../utils/logger');
const { INTENTS }      = require('./intentDetector');
const sessionManager   = require('./sessionManager');
const { Alert }        = require('../models/schemas');

const log = createLogger('ThreatScorer');

// ── Configurable Weights ────────────────────────────────────────────────────

const WEIGHTS = {
    [INTENTS.RECONNAISSANCE]:           10,
    [INTENTS.ENDPOINT_ENUMERATION]:     10,
    [INTENTS.CONFIG_DISCOVERY]:         20,
    [INTENTS.DATABASE_DISCOVERY]:       20,
    [INTENTS.CREDENTIAL_DISCOVERY]:     25,
    [INTENTS.SENSITIVE_DATA_DISCOVERY]: 20,
    [INTENTS.PRIVILEGE_ESCALATION]:     25,
    [INTENTS.API_EXPLOITATION]:         25,
    [INTENTS.PERSISTENCE_ATTEMPT]:      30,
    [INTENTS.CANARY_REUSE]:             40,
    'UNAUTHORIZED_TRANSACTION_ACCESS':  25,
    [INTENTS.UNKNOWN]:                  5,

    // Bonus modifiers
    REPEATED_ADMIN_PROBING:             15,
    HIGH_REQUEST_VELOCITY:              10,
    MULTIPLE_METHODS:                   5,
    ML_AUTOMATED_SIGNAL:                10,
};

// ── Severity Thresholds ─────────────────────────────────────────────────────

function getSeverity(score) {
    if (score >= 76) return 'CRITICAL';
    if (score >= 51) return 'HIGH';
    if (score >= 21) return 'MEDIUM';
    return 'LOW';
}

// ── Scorer ──────────────────────────────────────────────────────────────────

/**
 * Calculate the threat score delta for a new event and update the session.
 *
 * @param {string} sessionId
 * @param {object} intentResult – { intent, confidence, reasons }
 * @returns {{ score, severity, reasons, delta, previousScore }}
 */
async function calculateScore(sessionId, intentResult) {
    const session = await sessionManager.getSession(sessionId);
    if (!session) {
        return { score: 0, severity: 'LOW', reasons: [], delta: 0, previousScore: 0 };
    }

    const previousScore = session.threatScore;
    const reasons = [];
    let delta = 0;
    
    session.scoreHistory = session.scoreHistory || [];
    const newHistory = [];

    // Base score from intent
    const baseWeight = WEIGHTS[intentResult.intent] || 5;
    delta += baseWeight;
    reasons.push(...intentResult.reasons);
    newHistory.push({ reason: `Intent detected: ${intentResult.intent}`, delta: baseWeight, timestamp: Date.now() });

    // Bonus: repeated admin probing (3+ admin endpoint visits)
    const adminVisits = session.endpointsVisited.filter(e =>
        /\/(admin|management|console|sudo)/i.test(e)
    ).length;
    if (adminVisits >= 3) {
        delta += WEIGHTS.REPEATED_ADMIN_PROBING;
        reasons.push('Repeated administrative endpoint probing');
        newHistory.push({ reason: 'Repeated administrative endpoint probing', delta: WEIGHTS.REPEATED_ADMIN_PROBING, timestamp: Date.now() });
    }

    // Bonus: high request velocity (more than 20 requests)
    if (session.requestCount > 20) {
        delta += WEIGHTS.HIGH_REQUEST_VELOCITY;
        reasons.push('High request velocity detected');
        newHistory.push({ reason: 'High request velocity detected', delta: WEIGHTS.HIGH_REQUEST_VELOCITY, timestamp: Date.now() });
    }

    // Bonus: using multiple HTTP methods (suggests manual exploration)
    if (session.httpMethods.length >= 3) {
        delta += WEIGHTS.MULTIPLE_METHODS;
        reasons.push('Multiple HTTP methods used (manual exploration likely)');
        newHistory.push({ reason: 'Multiple HTTP methods used (manual exploration likely)', delta: WEIGHTS.MULTIPLE_METHODS, timestamp: Date.now() });
    }

    // Apply diminishing returns for repeated same-intent events
    const sameIntentCount = session.detectedIntents.filter(i => i === intentResult.intent).length;
    if (sameIntentCount > 2) {
        const oldDelta = delta;
        delta = Math.max(1, Math.floor(delta * 0.3)); // Diminish after 2+ same intent
        if (oldDelta !== delta) {
            newHistory.push({ reason: 'Diminishing returns adjustment for repeated behavior', delta: delta - oldDelta, timestamp: Date.now() });
        }
    }
    
    session.scoreHistory.push(...newHistory);

    // Update session
    session.threatScore = Math.min(100, session.threatScore + delta);
    session.threatSeverity = getSeverity(session.threatScore);
    session.detectedIntents.push(intentResult.intent);

    // Check for enhanced tracking on severity transition above LOW
    checkEnhancedTracking(sessionId, session);

    // Deduplicate reasons
    const uniqueReasons = [...new Set([...session.threatReasons, ...reasons])];
    session.threatReasons = uniqueReasons;

    // Classify attacker based on dominant intents
    session.classification = classifyAttacker(session);

    await sessionManager.saveSession(session);

    // Generate alert on severity transitions
    const previousSeverity = getSeverity(previousScore);
    if (session.threatSeverity !== previousSeverity && session.threatSeverity === 'CRITICAL') {
        const alert = new Alert(
            sessionId,
            'CRITICAL_THREAT',
            'CRITICAL',
            `Threat score reached CRITICAL (${session.threatScore}/100)`,
            { score: session.threatScore, reasons: uniqueReasons }
        );
        await sessionManager.addAlert(alert);
        await sessionManager.addTimelineEntry(
            sessionId, 'CRITICAL_ALERT',
            `🚨 Threat score CRITICAL: ${session.threatScore}/100`,
            { score: session.threatScore }
        );
    }

    await sessionManager.addTimelineEntry(
        sessionId, 'THREAT_SCORE_CHANGED',
        `Threat score: ${previousScore} → ${session.threatScore} (+${delta})`,
        { delta, intent: intentResult.intent }
    );

    log.info('Threat score updated', {
        sessionId,
        score: session.threatScore,
        severity: session.threatSeverity,
        delta
    });

    return {
        score:         session.threatScore,
        severity:      session.threatSeverity,
        reasons:       uniqueReasons,
        delta,
        previousScore
    };
}

// ── Attacker Classification ─────────────────────────────────────────────────

function classifyAttacker(session) {
    const intents = session.detectedIntents;
    if (intents.length === 0) return 'unknown';

    // Count intent frequencies
    const freq = {};
    intents.forEach(i => { freq[i] = (freq[i] || 0) + 1; });

    const dominant = Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];

    const classificationMap = {
        [INTENTS.RECONNAISSANCE]:           'scanner',
        [INTENTS.ENDPOINT_ENUMERATION]:     'enumerator',
        [INTENTS.CONFIG_DISCOVERY]:         'config_hunter',
        [INTENTS.CREDENTIAL_DISCOVERY]:     'credential_harvester',
        [INTENTS.DATABASE_DISCOVERY]:       'data_exfiltrator',
        [INTENTS.PRIVILEGE_ESCALATION]:     'privilege_escalator',
        [INTENTS.API_EXPLOITATION]:         'exploit_operator',
        [INTENTS.SENSITIVE_DATA_DISCOVERY]: 'data_exfiltrator',
        [INTENTS.PERSISTENCE_ATTEMPT]:      'persistent_threat',
        [INTENTS.CANARY_REUSE]:             'credential_reuser',
    };

    return classificationMap[dominant] || 'unknown';
}

// ── Enhanced Tracking ───────────────────────────────────────────────────────

/**
 * Enable enhanced tracking the first time a session's severity moves above LOW.
 * Sets session.enhancedTrackingEnabled and session.flaggedAttackerAt.
 *
 * @param {string} sessionId
 * @param {object} session – The live AttackSession object (mutated in-place)
 */
function checkEnhancedTracking(sessionId, session) {
    if (session.enhancedTrackingEnabled) return;
    if (session.threatSeverity !== 'LOW') {
        session.enhancedTrackingEnabled = true;
        session.flaggedAttackerAt = Date.now();
        log.info('Enhanced tracking enabled', {
            sessionId: typeof sessionId === 'string' ? sessionId.substring(0, 8) : sessionId,
            severity: session.threatSeverity,
            score: session.threatScore
        });
    }
}

// ── ML Signal Scoring ───────────────────────────────────────────────────────

/**
 * Apply a small threat score bump based on ML classifier output.
 * Only applied when the label indicates non-human behavior with high confidence.
 *
 * @param {string} sessionId
 * @param {{ label: string, confidence: number } | null} mlResult
 * @returns {{ applied: boolean, delta: number }}
 */
async function applyMlSignal(sessionId, mlResult) {
    if (!mlResult || mlResult.label === 'human manual exploration' || mlResult.confidence <= 0.7) {
        return { applied: false, delta: 0 };
    }

    const session = await sessionManager.getSession(sessionId);
    if (!session) return { applied: false, delta: 0 };
    
    session.scoreHistory = session.scoreHistory || [];

    // Scale the weight by confidence (e.g. 0.85 confidence → 8.5, rounded to 9)
    const delta = Math.round(WEIGHTS.ML_AUTOMATED_SIGNAL * mlResult.confidence);
    const previousScore = session.threatScore;
    
    session.scoreHistory.push({ reason: `ML automated signal: ${mlResult.label}`, delta, timestamp: Date.now() });

    session.threatScore = Math.min(100, session.threatScore + delta);
    session.threatSeverity = getSeverity(session.threatScore);
    checkEnhancedTracking(sessionId, session);

    await sessionManager.saveSession(session);

    await sessionManager.addTimelineEntry(
        sessionId, 'ML_SIGNAL',
        `ML classification: ${mlResult.label} (${(mlResult.confidence * 100).toFixed(0)}%) → +${delta}`,
        { label: mlResult.label, confidence: mlResult.confidence, delta }
    );

    log.info('ML signal applied', {
        sessionId: sessionId.substring(0, 8),
        label: mlResult.label,
        confidence: mlResult.confidence.toFixed(3),
        delta,
        newScore: session.threatScore
    });

    return { applied: true, delta };
}

/**
 * Get a snapshot of the current threat assessment for a session.
 */
async function getThreatAssessment(sessionId) {
    const session = await sessionManager.getSession(sessionId);
    if (!session) return null;

    return {
        score:          session.threatScore,
        severity:       session.threatSeverity,
        classification: session.classification,
        reasons:        session.threatReasons,
        attackStage:    session.attackStage,
        requestCount:   session.requestCount,
        intents:        session.detectedIntents,
        canaryTriggers: session.canaryCredentials.filter(c => c.status === 'triggered').length
    };
}

module.exports = { WEIGHTS, getSeverity, calculateScore, classifyAttacker, checkEnhancedTracking, applyMlSignal, getThreatAssessment };
