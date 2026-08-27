export interface SessionInfo {
  id: string;
  ip: string;
  userAgent: string;
  threatScore: number;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  currentIntent: string;
  requestCount: number;
  attackerProfile: string | null;
  lastActivity: string;
  status: "ACTIVE" | "BLOCKED" | "DISCONNECTED";
}

export interface AttackTimelineEvent {
  id: string;
  timestamp: string;
  type: string;
  description: string;
  details?: Record<string, any>;
}

export interface CanaryInfo {
  id: string;
  type: string;
  issuedAt: string;
  triggeredAt: string | null;
  reused: boolean;
  endpoint: string;
}

export interface OverviewMetrics {
  activeAttacks: number;
  criticalSessions: number;
  totalSessions: number;
  activeAlerts: number;
}

export interface SystemHealth {
  status: "OPERATIONAL" | "DEGRADED" | "DOWN";
  components: {
    redis: "UP" | "DOWN";
    queue: "UP" | "DOWN";
    aiWorker: "UP" | "DOWN";
    rag: "UP" | "DOWN";
  };
}

export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  requestsPerSecond: number;
  aiQueueLength: number;
}

export interface Alert {
  id: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  sessionId: string;
  attackType: string;
  description: string;
  timestamp: string;
}

export interface ThreatIntelligence {
  sessionId: string;
  executiveSummary: string;
  attackTechniques: string[];
  attackTimeline: string[];
  threatSeverity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  indicators: string[];
  canaryActivity: string[];
  defensiveRecommendations: string[];
}
