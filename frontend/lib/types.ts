// ============================================================================
// Project Labyrinth — TypeScript Type Definitions
// ============================================================================

export type ThreatSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export type AttackerType =
  | 'Credential Hunter'
  | 'Automated Scanner'
  | 'Cloud Attacker'
  | 'Database Attacker'
  | 'Privilege Escalator'
  | 'Unknown';

export type SessionStatus = 'ACTIVE' | 'MONITORING' | 'CLOSED';

export type TimelineEventType =
  | 'SESSION_CREATED'
  | 'RECON'
  | 'ENUMERATION'
  | 'CREDENTIAL_DISCOVERY'
  | 'CLOUD_DISCOVERY'
  | 'DATABASE_DISCOVERY'
  | 'ADMIN_DISCOVERY'
  | 'CANARY_EXPOSURE'
  | 'CANARY_REUSE'
  | 'PRIVILEGE_ESCALATION'
  | 'ALERT'
  | 'REQUEST_PROCESSED'
  | 'THREAT_SCORE_CHANGED';

export interface TimelineEvent {
  id: string;
  timestamp: string;
  eventType: TimelineEventType;
  details: string;
  metadata?: Record<string, unknown>;
  threatScoreDelta?: number;
}

export interface BehaviorScores {
  reconnaissance: number;
  enumeration: number;
  credentialHunting: number;
  exploitation: number;
  privilegeEscalation: number;
  cloudDiscovery: number;
  databaseDiscovery: number;
}

export interface AttackerProfile {
  attackerType: AttackerType;
  confidence: number;
  automationProbability: number;
  behaviors: BehaviorScores;
}

export interface CanaryCredential {
  canaryId: string;
  sessionId: string;
  credentialType: string;
  exposureEndpoint: string;
  exposedAt: string;
  triggered: boolean;
  triggeredAt?: string;
  triggerEndpoint?: string;
}

export interface DeceptionAsset {
  id: string;
  name: string;
  type: 'service' | 'database' | 'cloud' | 'employee' | 'credential' | 'config';
  details: string;
  discovered: boolean;
}

export interface DeceptionState {
  company: string;
  environment: string;
  region: string;
  deceptionDepth: number;
  maxDepth: number;
  revealedServices: DeceptionAsset[];
  revealedDatabases: DeceptionAsset[];
  revealedEmployees: { id: string; name: string; email: string; role: string }[];
  revealedCloudResources: DeceptionAsset[];
  revealedCredentials: { username: string; type: string }[];
}

export interface DeceptionGraphNode {
  id: string;
  label: string;
  group: 'company' | 'service' | 'database' | 'cloud' | 'employee' | 'credential' | 'canary';
  discovered: boolean;
  x: number;
  y: number;
}

export interface DeceptionGraphEdge {
  from: string;
  to: string;
}

export interface DeceptionGraph {
  nodes: DeceptionGraphNode[];
  edges: DeceptionGraphEdge[];
}

export interface AIDecision {
  intent: string;
  confidence: number;
  evidence: string[];
  retrievedContext: string;
  selectedStrategy: string;
  canaryId?: string;
  provider: string;
  timestamp: string;
}

export interface AIMetrics {
  deterministic: number;
  huggingFace: number;
  gemini: number;
  fallback: number;
  geminiStatus: 'operational' | 'degraded' | 'offline';
  huggingFaceStatus: 'operational' | 'degraded' | 'offline';
  fallbackStatus: 'ready' | 'active';
}

export interface SystemHealth {
  gateway: 'operational' | 'degraded' | 'offline';
  queue: 'healthy' | 'degraded' | 'offline';
  database: 'healthy' | 'degraded' | 'offline';
  worker: 'running' | 'stopped' | 'error';
  ai: 'operational' | 'degraded' | 'offline';
  queueDepth: number;
  requestsPerSec: number;
  workerLatencyMs: number;
}

export interface RequestEvent {
  id: string;
  timestamp: string;
  method: string;
  path: string;
  payload?: Record<string, unknown>;
  intent: string;
  threatScoreDelta: number;
  responseStrategy: string;
  canaryId?: string;
  statusCode: number;
}

export interface ThreatIntelligence {
  attackerObjective: string;
  threatLevel: ThreatSeverity;
  likelyAttackType: string;
  observedTechniques: string[];
  confidence: number;
  executiveSummary: string;
}

export interface BenchmarkData {
  metric: string;
  static: string | number;
  labyrinth: string | number;
  unit?: string;
}

export interface AttackSession {
  sessionId: string;
  sourceIP: string;
  userAgent: string;
  startedAt: string;
  lastSeen: string;
  status: SessionStatus;
  requestCount: number;
  uniqueEndpoints: number;
  threatScore: number;
  severity: ThreatSeverity;
  attackerProfile: AttackerProfile;
  deceptionState: DeceptionState;
  deceptionGraph: DeceptionGraph;
  timeline: TimelineEvent[];
  canaries: CanaryCredential[];
  aiDecisions: AIDecision[];
  requestHistory: RequestEvent[];
  threatIntelligence: ThreatIntelligence;
  currentStrategy: string;
  duration: string;
}

export interface DashboardOverview {
  activeAttacks: number;
  criticalThreats: number;
  canaryTriggers: number;
  avgDetectionTime: string;
  requestsProcessed: number;
  activeSessions: number;
  deceptionDepth: number;
  avgEngagement: string;
}
