// ============================================================================
// Mock Data — Dashboard Overview & Metrics
// ============================================================================
import type { DashboardOverview, SystemHealth, AIMetrics, BenchmarkData } from '../types';

export const dashboardOverview: DashboardOverview = {
  activeAttacks: 12,
  criticalThreats: 4,
  canaryTriggers: 27,
  avgDetectionTime: '18.4s',
  requestsProcessed: 14821,
  activeSessions: 31,
  deceptionDepth: 4.2,
  avgEngagement: '8m 42s',
};

export const systemHealth: SystemHealth = {
  gateway: 'operational',
  queue: 'healthy',
  database: 'healthy',
  worker: 'running',
  ai: 'operational',
  queueDepth: 17,
  requestsPerSec: 42,
  workerLatencyMs: 83,
};

export const aiMetrics: AIMetrics = {
  deterministic: 1284,
  huggingFace: 317,
  gemini: 129,
  fallback: 41,
  geminiStatus: 'operational',
  huggingFaceStatus: 'operational',
  fallbackStatus: 'ready',
};

export const benchmarkData: BenchmarkData[] = [
  { metric: 'Engagement', static: '42s', labyrinth: '7m 31s' },
  { metric: 'Requests', static: 31, labyrinth: 438 },
  { metric: 'Assets Discovered', static: 5, labyrinth: 37 },
  { metric: 'Deception Depth', static: 1, labyrinth: 4 },
  { metric: 'Canary Interactions', static: 0, labyrinth: 3 },
  { metric: 'Detection Time', static: 'N/A', labyrinth: '18.4s' },
];
