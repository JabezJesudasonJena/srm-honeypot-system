import { Alert, OverviewMetrics, SessionInfo, SystemHealth, SystemMetrics, ThreatIntelligence, CanaryInfo, AttackTimelineEvent } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/labyrinth-api";

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, options);
  if (!res.ok) {
    throw new Error(`API error: ${res.statusText}`);
  }
  return res.json();
}

export const api = {
  getOverview: () => fetchApi<OverviewMetrics>("/overview"),
  getAttacks: () => fetchApi<SessionInfo[]>("/attacks"),
  getAttack: (sessionId: string) => fetchApi<SessionInfo>(`/attacks/${sessionId}`),
  getAttackTimeline: (sessionId: string) => fetchApi<AttackTimelineEvent[]>(`/attacks/${sessionId}/timeline`),
  getAttackReplay: (sessionId: string) => fetchApi<any>(`/attacks/${sessionId}/replay`),
  getAttackAssets: (sessionId: string) => fetchApi<any>(`/attacks/${sessionId}/assets`),
  getAttackCanaries: (sessionId: string) => fetchApi<CanaryInfo[]>(`/attacks/${sessionId}/canaries`),
  getAttackDecision: (sessionId: string) => fetchApi<any>(`/attacks/${sessionId}/decision`),
  getAttackGraph: (sessionId: string) => fetchApi<any>(`/attacks/${sessionId}/graph`),
  
  getAlerts: () => fetchApi<Alert[]>("/alerts"),
  
  getThreatIntelligence: (sessionId: string) => fetchApi<ThreatIntelligence>(`/threat-intelligence/${sessionId}`),
  
  getSystemHealth: () => fetchApi<SystemHealth>("/system/health"),
  getSystemMetrics: () => fetchApi<SystemMetrics>("/system/metrics"),
  getBenchmark: () => fetchApi<any>("/benchmark"),
  resetSystem: () => fetchApi<{ success: boolean }>("/system/reset", { method: "POST" }),
};