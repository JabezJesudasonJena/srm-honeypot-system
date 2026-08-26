// ============================================================================
// Project Labyrinth — Metrics Collector
// ============================================================================
// In-memory counters for system-wide metrics. These power the dashboard
// health/metrics endpoints and the benchmark mode.
// ============================================================================

const { createLogger } = require('../utils/logger');

const log = createLogger('Metrics');

const metrics = {
    totalAttacks:        0,
    activeAttacks:       0,
    requestsProcessed:   0,
    totalProcessingMs:   0,
    totalAiMs:           0,
    aiCalls:             0,
    queueDepth:          0,
    canariesGenerated:   0,
    canariesTriggered:   0,
    criticalAlerts:      0,
    aiFailures:          0,
    fallbackActivations: 0,
    startedAt:           new Date().toISOString()
};

function increment(name, amount = 1) {
    if (metrics[name] !== undefined) {
        metrics[name] += amount;
    }
}

function set(name, value) {
    if (metrics[name] !== undefined) {
        metrics[name] = value;
    }
}

function getMetrics() {
    const uptime = Math.floor((Date.now() - new Date(metrics.startedAt).getTime()) / 1000);
    return {
        ...metrics,
        avgProcessingLatencyMs: metrics.requestsProcessed > 0
            ? Math.round(metrics.totalProcessingMs / metrics.requestsProcessed)
            : 0,
        avgAiLatencyMs: metrics.aiCalls > 0
            ? Math.round(metrics.totalAiMs / metrics.aiCalls)
            : 0,
        uptimeSeconds: uptime
    };
}

function resetMetrics() {
    Object.keys(metrics).forEach(k => {
        if (k === 'startedAt') return;
        metrics[k] = 0;
    });
}

module.exports = { increment, set, getMetrics, resetMetrics };
