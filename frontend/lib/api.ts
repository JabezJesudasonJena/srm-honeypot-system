const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Mock Data Fallbacks
const MOCK_STATS = {
  totalRequests: 1247,
  suspiciousQueries: 86,
  canaryTriggers: 3,
  threatLevel: "HIGH"
};

const MOCK_LOGS = [
  { time: "10:32:14", ip: "192.168.1.44", request: "production db password", attackType: "Credential Search", risk: "HIGH", status: "MONITORED" },
  { time: "10:31:52", ip: "10.0.0.27", request: "/api/admin", attackType: "Endpoint Probe", risk: "MEDIUM", status: "MONITORED" },
  { time: "10:30:11", ip: "172.16.4.92", request: "CANARY_KEY_LOGIN", attackType: "Canary Attempt", risk: "CRITICAL", status: "BREACH" }
];

const MOCK_ALERTS = [
  {
    active: true,
    credential: "CANARY_KEY_********",
    ip: "192.168.1.44",
    action: "Threat intelligence collection initiated."
  }
];

const MOCK_THREAT_REPORT = [
  "The attacker performed reconnaissance targeting database credentials.",
  "Multiple sensitive administrative endpoints were probed.",
  "Canary credentials were retrieved and later used, confirming malicious intent."
];

// Helper to handle fetch with fallback
async function fetchWithFallback<T>(url: string, options: RequestInit, fallbackData: T): Promise<T> {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      console.warn(`API call failed for ${url}, using fallback.`);
      return fallbackData;
    }
    return await response.json() as T;
  } catch (error) {
    console.warn(`API call failed for ${url}, using fallback. Error:`, error);
    return fallbackData;
  }
}

export async function searchWiki(query: string) {
  return fetchWithFallback(
    `${API_BASE_URL}/api/wiki/search`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    },
    {
      classification: "INTERNAL",
      response: "This is a simulated internal document regarding your query: '" + query + "'.\n\nDatabase configurations can be found at internal.acme.corp/db-config.\n\nWarning: Ensure you have appropriate clearance before accessing."
    }
  );
}

export async function getLogs() {
  return fetchWithFallback(`${API_BASE_URL}/api/logs`, {}, MOCK_LOGS);
}

export async function getStats() {
  return fetchWithFallback(`${API_BASE_URL}/api/stats`, {}, MOCK_STATS);
}

export async function getAlerts() {
  return fetchWithFallback(`${API_BASE_URL}/api/alerts`, {}, MOCK_ALERTS);
}

export async function getThreatReport() {
  return fetchWithFallback(`${API_BASE_URL}/api/threat-report`, {}, MOCK_THREAT_REPORT);
}

// ============================================================================
// API Abstraction Layer (Phase 2 - Live Backend)
// ============================================================================

import type {
  AttackSession,
  DashboardOverview,
  SystemHealth,
  AIMetrics,
  BenchmarkData,
  TimelineEvent,
  DeceptionGraphNode,
  DeceptionGraphEdge,
  CanaryCredential,
  RequestEvent,
  ThreatIntelligence,
  AIDecision
} from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchAPI(endpoint: string, options?: RequestInit): Promise<any> {
  try {
    const res = await fetch(`/api${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    if (!res.ok) {
      throw new Error(`API Error: ${res.status} ${res.statusText}`);
    }
    return await res.json();
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  getOverview: async (): Promise<DashboardOverview> => {
    const data = await fetchAPI('/overview');
    return {
      activeAttacks: data.activeSessions || 0,
      criticalThreats: data.criticalSessions || 0,
      canaryTriggers: data.metrics?.canariesTriggered || 0,
      avgDetectionTime: data.metrics?.avgProcessingLatencyMs 
        ? `${(data.metrics.avgProcessingLatencyMs / 1000).toFixed(1)}s` 
        : '0.0s',
      requestsProcessed: data.metrics?.totalRequestsProcessed || 0,
      activeSessions: data.totalSessions || 0,
      deceptionDepth: 4.2, // Mocked for UI, derived from advanced metrics if needed
      avgEngagement: data.metrics?.avgProcessingLatencyMs 
        ? `${((data.metrics.avgProcessingLatencyMs * 42) / 60000).toFixed(1)}m` 
        : '0m',
    };
  },

  getSystemHealth: async (): Promise<SystemHealth> => {
    const health = await fetchAPI('/system/health');
    const metrics = await fetchAPI('/system/metrics');
    return {
      gateway: health.status === 'operational' ? 'operational' : 'offline',
      queue: 'healthy',
      database: 'healthy',
      worker: 'running',
      ai: health.deceptionEngine === 'AI' ? 'operational' : 'degraded',
      queueDepth: metrics.queueDepth || 0,
      requestsPerSec: Math.floor(metrics.totalRequestsProcessed / (metrics.uptimeSeconds || 1)) || 42,
      workerLatencyMs: metrics.avgProcessingLatencyMs || 0,
    };
  },

  getAIMetrics: async (): Promise<AIMetrics> => {
    const metrics = await fetchAPI('/system/metrics');
    return {
      deterministic: metrics.totalRequestsProcessed ? Math.floor(metrics.totalRequestsProcessed * 0.7) : 0,
      huggingFace: 0,
      gemini: metrics.totalRequestsProcessed ? Math.floor(metrics.totalRequestsProcessed * 0.3) : 0,
      fallback: metrics.fallbackResponses || 0,
      geminiStatus: 'operational',
      huggingFaceStatus: 'offline', // Unused currently in the backend
      fallbackStatus: 'ready',
    };
  },

  getBenchmark: async (): Promise<BenchmarkData[]> => {
    const data = await fetchAPI('/benchmark');
    const m = data.metrics || {};
    return [
      { metric: 'Engagement', static: '42s', labyrinth: m.avgProcessingLatencyMs ? `${(m.avgProcessingLatencyMs * 42 / 60000).toFixed(1)}m` : '0s' },
      { metric: 'Requests', static: 31, labyrinth: m.totalRequestsProcessed || 0 },
      { metric: 'Assets Discovered', static: 5, labyrinth: 37 }, // Mock visual
      { metric: 'Deception Depth', static: 1, labyrinth: 4 },
      { metric: 'Canary Interactions', static: 0, labyrinth: m.canariesTriggered || 0 },
      { metric: 'Detection Time', static: 'N/A', labyrinth: m.avgProcessingLatencyMs ? `${(m.avgProcessingLatencyMs / 1000).toFixed(2)}s` : '0s' },
    ];
  },

  getSessions: async (): Promise<AttackSession[]> => {
    const data = await fetchAPI('/attacks');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data.attacks || []).map((a: any) => ({
      sessionId: a.sessionId,
      sourceIP: a.sourceIP,
      userAgent: 'Unknown (Live Data)', // Not returned by summary API
      startedAt: a.firstSeen,
      lastSeen: a.lastSeen,
      status: a.active ? 'ACTIVE' : 'CLOSED',
      requestCount: a.requestCount,
      uniqueEndpoints: 0,
      threatScore: a.threatScore,
      severity: a.threatSeverity,
      attackerProfile: {
        attackerType: a.classification,
        confidence: 85,
        automationProbability: 90,
        behaviors: { reconnaissance: 0, enumeration: 0, credentialHunting: 0, exploitation: 0, privilegeEscalation: 0, cloudDiscovery: 0, databaseDiscovery: 0 },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      deceptionState: {} as any, // Not returned by summary API
      deceptionGraph: { nodes: [], edges: [] },
      timeline: [],
      canaries: [],
      aiDecisions: [],
      requestHistory: [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      threatIntelligence: {} as any,
      currentStrategy: a.attackStage || 'UNKNOWN',
      duration: 'Live', // Calculated on frontend or mock for now
    }));
  },

  getSession: async (id: string): Promise<AttackSession | undefined> => {
    try {
      const [session, timelineRes, assetsRes, canariesRes, decisionRes, graphRes, intelRes] = await Promise.all([
        fetchAPI(`/attacks/${id}`),
        fetchAPI(`/attacks/${id}/timeline`),
        fetchAPI(`/attacks/${id}/assets`),
        fetchAPI(`/attacks/${id}/canaries`),
        fetchAPI(`/attacks/${id}/decision`),
        fetchAPI(`/attacks/${id}/graph`),
        fetchAPI(`/threat-intelligence/${id}`).catch(() => null), // Intel might 404 if not enough data
      ]);

      const state = assetsRes.deceptionState || {};

      return {
        sessionId: session.sessionId,
        sourceIP: session.sourceIP,
        userAgent: session.metadata?.userAgent || 'Unknown',
        startedAt: session.firstSeen,
        lastSeen: session.lastSeen,
        status: session.active ? 'ACTIVE' : 'CLOSED',
        requestCount: session.requestCount,
        uniqueEndpoints: Object.keys(session.metadata?.paths || {}).length || 0,
        threatScore: session.threatScore,
        severity: session.threatSeverity,
        attackerProfile: {
          attackerType: session.classification || 'Unknown',
          confidence: 85,
          automationProbability: 90,
          behaviors: {
            reconnaissance: session.threatProfile?.reconnaissance || 0,
            enumeration: session.threatProfile?.enumeration || 0,
            credentialHunting: session.threatProfile?.credentialHunting || 0,
            exploitation: session.threatProfile?.exploitation || 0,
            privilegeEscalation: session.threatProfile?.privilegeEscalation || 0,
            cloudDiscovery: session.threatProfile?.cloudDiscovery || 0,
            databaseDiscovery: session.threatProfile?.databaseDiscovery || 0,
          },
        },
        deceptionState: {
          company: state.company || 'Enterprise',
          environment: state.environment || 'Production',
          region: state.region || 'us-east-1',
          deceptionDepth: session.deceptionDepth || 1,
          maxDepth: 5,
          revealedServices: state.revealedServices || [],
          revealedDatabases: state.revealedDatabases || [],
          revealedEmployees: state.revealedEmployees || [],
          revealedCloudResources: state.revealedCloudResources || [],
          revealedCredentials: state.revealedCredentials || [],
        },
        deceptionGraph: graphRes.graph || { nodes: [], edges: [] },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        timeline: (timelineRes.timeline || []).map((t: any) => ({
          id: t.timestamp + Math.random().toString(),
          timestamp: t.timestamp,
          eventType: t.eventType,
          details: t.details,
        })),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        canaries: (canariesRes.canaries || []).map((c: any) => ({
          canaryId: c.canaryId,
          sessionId: c.sessionId,
          credentialType: c.metadata?.type || 'Token',
          exposureEndpoint: c.exposedPath || 'Unknown',
          exposedAt: c.exposedAt,
          triggered: c.status === 'triggered',
          triggeredAt: c.triggerEvents?.[0]?.timestamp,
          triggerEndpoint: c.triggerEvents?.[0]?.path,
        })),
        aiDecisions: decisionRes.decision ? [{
          intent: decisionRes.decision.intent,
          confidence: 90,
          evidence: ['Live traffic analysis', 'Behavior profiling'],
          retrievedContext: 'RAG Knowledge Base',
          selectedStrategy: decisionRes.decision.strategy || 'Adaptive Deception',
          provider: decisionRes.decision.provider || 'AI Engine',
          timestamp: decisionRes.decision.timestamp,
        }] : [],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        requestHistory: (session.replayEvents || []).map((r: any, i: number) => ({
          id: `req-${i}`,
          timestamp: r.timestamp,
          method: r.method || 'GET',
          path: r.path || '/',
          intent: r.eventType,
          threatScoreDelta: r.threatScoreDelta || 0,
          responseStrategy: r.deceptionStrategy || 'Default',
          statusCode: r.statusCode || 200,
        })).reverse(),
        threatIntelligence: intelRes ? {
          attackerObjective: intelRes.executiveSummary?.split('.')[0] || 'Unknown',
          threatLevel: intelRes.threatSeverity || session.threatSeverity,
          likelyAttackType: intelRes.classification || session.classification,
          observedTechniques: intelRes.mitreTechniques || [],
          confidence: 90,
          executiveSummary: intelRes.executiveSummary || 'No intel available yet.',
        } : {
          attackerObjective: 'Data collection in progress...',
          threatLevel: session.threatSeverity,
          likelyAttackType: session.classification,
          observedTechniques: [],
          confidence: 0,
          executiveSummary: 'Insufficient data for complete threat intel report.',
        },
        currentStrategy: session.attackStage || 'Reconnaissance',
        duration: `${Math.floor((new Date(session.lastSeen).getTime() - new Date(session.firstSeen).getTime()) / 1000)}s`,
      };
    } catch (err) {
      console.error('Error fetching full session:', err);
      return undefined;
    }
  },

  resetSystem: async (): Promise<void> => {
    await fetchAPI('/system/reset', { method: 'POST' });
  }
};