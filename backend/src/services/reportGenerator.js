// ============================================================================
// Project Labyrinth — Threat Intelligence Report Generator
// ============================================================================
// Produces structured threat intelligence reports from attack session data.
// Uses factual session data for all metrics; optionally uses Gemini for
// an executive summary (never allowing AI to invent events).
// ============================================================================

const sessionManager = require('./sessionManager');
const aiService      = require('./aiService');
const { createLogger } = require('../utils/logger');

const log = createLogger('ReportGenerator');

/**
 * Generate a threat intelligence report for a completed attack session.
 *
 * @param {string} sessionId
 * @returns {object} – Complete threat report
 */
async function generateReport(sessionId) {
    const session = await sessionManager.getSession(sessionId);
    if (!session) return null;

    const events  = await sessionManager.getEvents(sessionId);
    const firstTs = new Date(session.firstSeen);
    const lastTs  = new Date(session.lastSeen);
    const durationMs = lastTs - firstTs;
    const durationMin = Math.round(durationMs / 60000);

    // Build factual report
    const report = {
        reportId:      `RPT-${sessionId.substring(0, 8)}`,
        generatedAt:   new Date().toISOString(),
        sessionId:     session.sessionId,

        // Duration & volume
        attackDuration:     `${durationMin} minutes`,
        attackDurationMs:   durationMs,
        firstSeen:          session.firstSeen,
        lastSeen:           session.lastSeen,
        requestCount:       session.requestCount,

        // Attacker profile
        sourceIP:           session.sourceIP,
        userAgent:          session.userAgent,
        classification:     session.classification,
        attackStage:        session.attackStage,

        // Threat assessment
        threatScore:        session.threatScore,
        threatSeverity:     session.threatSeverity,
        threatReasons:      session.threatReasons,

        // Intent analysis
        intentsDetected:    [...new Set(session.detectedIntents)],
        intentFrequency:    countFrequency(session.detectedIntents),

        // Assets & endpoints
        endpointsAccessed:  session.endpointsVisited,
        httpMethodsUsed:    session.httpMethods,
        discoveredAssets:   session.discoveredAssets,

        // Canary analysis
        canaryCredentials:  session.canaryCredentials,
        canaryTriggered:    session.canaryCredentials.filter(c => c.status === 'triggered').length > 0,
        canaryTriggerCount: session.canaryCredentials.filter(c => c.status === 'triggered').length,

        // Timeline summary
        timelineLength:     session.timeline.length,
        keyTimelineEvents:  session.timeline
            .filter(e => ['CANARY_TRIGGERED', 'CRITICAL_ALERT', 'STAGE_PROGRESSION', 'CREDENTIAL_DISCOVERED'].includes(e.eventType))
            .slice(-20),

        // AI executive summary (populated below if available)
        executiveSummary:   null,
        tacticsObserved:    [],
        recommendedActions: [],
        riskAssessment:     session.threatSeverity
    };

    // Attempt AI-generated executive summary
    if (aiService.isAvailable()) {
        try {
            const aiReport = await aiService.generateThreatReport(report);
            if (aiReport) {
                report.executiveSummary   = aiReport.executiveSummary || null;
                report.tacticsObserved    = aiReport.tacticsObserved || [];
                report.recommendedActions = aiReport.recommendedActions || [];
                report.riskAssessment     = aiReport.riskAssessment || report.riskAssessment;
            }
        } catch (err) {
            log.warn('AI report enhancement failed — using factual-only report', { error: err.message });
        }
    }

    // Generate factual summary as fallback
    if (!report.executiveSummary) {
        report.executiveSummary = generateFactualSummary(report);
    }

    log.info('Threat report generated', { sessionId, score: report.threatScore });
    return report;
}

function generateFactualSummary(report) {
    const parts = [
        `Attack session ${report.sessionId.substring(0, 8)} originated from ${report.sourceIP} and lasted ${report.attackDuration}.`,
        `The attacker made ${report.requestCount} requests across ${report.endpointsAccessed.length} unique endpoints.`,
        `Classification: ${report.classification}. Threat severity: ${report.threatSeverity} (${report.threatScore}/100).`,
    ];

    if (report.canaryTriggered) {
        parts.push(`CRITICAL: ${report.canaryTriggerCount} canary credential(s) were triggered, indicating active credential reuse.`);
    }

    if (report.discoveredAssets.length > 0) {
        parts.push(`The attacker discovered ${report.discoveredAssets.length} synthetic asset(s) during the session.`);
    }

    return parts.join(' ');
}

function countFrequency(arr) {
    const freq = {};
    arr.forEach(item => { freq[item] = (freq[item] || 0) + 1; });
    return freq;
}

module.exports = { generateReport };
