// ============================================================================
// Project Labyrinth — Attacker Profiler
// ============================================================================
// Maintains a persistent behavioral profile per attack session.
// Uses cumulative intent evidence to assign probabilities and classify the
// attacker. Also calculates automation probability based on request rate.
// ============================================================================

const { createLogger } = require('../utils/logger');
const log = createLogger('AttackerProfiler');

// Maps detected intents to behavior categories
const INTENT_TO_BEHAVIOR = {
    'reconnaissance': 'reconnaissance',
    'endpoint_enumeration': 'enumeration',
    'parameter_fuzzing': 'exploitation',
    'sql_injection': 'exploitation',
    'path_traversal': 'exploitation',
    'xss_attempt': 'exploitation',
    'command_injection': 'exploitation',
    'credential_discovery': 'credential_hunting',
    'config_discovery': 'reconnaissance',
    'database_discovery': 'data_discovery',
    'privilege_escalation': 'privilege_escalation',
    'api_exploitation': 'exploitation',
    'sensitive_data_discovery': 'data_discovery',
    'persistence_attempt': 'privilege_escalation',
    'canary_reuse': 'credential_hunting',
    'unknown': 'reconnaissance'
};

class AttackerProfiler {
    
    /**
     * Updates the attacker profile based on a new detected intent and request history.
     * @param {object} session - The AttackSession object
     * @param {string} newIntent - The detected intent (from IntentDetector)
     */
    updateProfile(session, newIntent) {
        if (!session.attackerProfile) {
            session.attackerProfile = {
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
        }

        const profile = session.attackerProfile;
        const behaviorCategory = INTENT_TO_BEHAVIOR[newIntent] || 'reconnaissance';

        // 1. Update behavior probabilities (Exponential Moving Average / Cumulative Evidence)
        // We increase the observed category and slightly decay the others.
        for (const cat in profile.behavior) {
            if (cat === behaviorCategory) {
                // Boost the observed behavior
                profile.behavior[cat] = Math.min(1.0, profile.behavior[cat] + 0.15);
            } else {
                // Minor decay for unobserved behaviors to keep the profile dynamic
                profile.behavior[cat] = Math.max(0.0, profile.behavior[cat] - 0.02);
            }
        }

        // 2. Determine Primary Attacker Type
        let maxScore = -1;
        let primaryType = 'unknown';
        for (const [cat, score] of Object.entries(profile.behavior)) {
            if (score > maxScore) {
                maxScore = score;
                primaryType = cat;
            }
        }
        profile.attackerType = primaryType;
        profile.confidence = Math.min(1.0, maxScore * 1.2); // Give a bit of confidence boost

        // 3. Automation Probability (Heuristics)
        // High request count in short time = highly automated
        const firstSeenTime = new Date(session.firstSeen).getTime();
        const now = Date.now();
        const durationSec = Math.max(1, (now - firstSeenTime) / 1000);
        const reqPerSec = session.requestCount / durationSec;
        
        // If they are making > 2 req/sec over time, very likely automated
        let autoScore = profile.automationProbability;
        if (reqPerSec > 5) autoScore = Math.min(1.0, autoScore + 0.1);
        else if (reqPerSec > 2) autoScore = Math.min(0.8, autoScore + 0.05);
        else autoScore = Math.max(0.0, autoScore - 0.05); // Human-like speed
        
        profile.automationProbability = Number(autoScore.toFixed(2));
        
        log.debug('Profile updated', { 
            sessionId: session.sessionId, 
            type: profile.attackerType,
            confidence: profile.confidence
        });

        return profile;
    }
}

module.exports = new AttackerProfiler();
