'use client';

import { useState, useEffect, useCallback } from 'react';
import ThreatOverview from '@/components/dashboard/ThreatOverview';
import ActiveAttacks from '@/components/dashboard/ActiveAttacks';
import AttackTimeline from '@/components/dashboard/AttackTimeline';
import AttackerProfile from '@/components/dashboard/AttackerProfile';
import DeceptionState from '@/components/dashboard/DeceptionState';
import DeceptionGraph from '@/components/dashboard/DeceptionGraph';
import CanaryMonitor from '@/components/dashboard/CanaryMonitor';
import AIMonitor from '@/components/dashboard/AIMonitor';
import DeceptionDecision from '@/components/dashboard/DeceptionDecision';
import ThreatIntelligence from '@/components/dashboard/ThreatIntelligence';
import BenchmarkPanel from '@/components/dashboard/BenchmarkPanel';
import SystemHealthPanel from '@/components/dashboard/SystemHealth';
import DemoButton from '@/components/dashboard/DemoButton';
import LoadingState from '@/components/LoadingState';

import { api } from '@/lib/api';
import { useSSE } from '@/lib/hooks/useSSE';
import type { AttackSession } from '@/lib/types';

// Extend components to accept props where mock data was previously hardcoded
export default function DashboardPage() {
  const [sessions, setSessions] = useState<AttackSession[]>([]);
  const [primarySession, setPrimarySession] = useState<AttackSession | null>(null);

  // SSE integration for real-time updates
  const { data: sseEvent, connected } = useSSE('/api/events/stream');

  const loadData = useCallback(async () => {
    try {
      const liveSessions = await api.getSessions();
      setSessions(liveSessions);

      // Pick the most critical or recent session
      if (liveSessions.length > 0) {
        const topSession = liveSessions.sort((a, b) => b.threatScore - a.threatScore)[0];
        const fullSession = await api.getSession(topSession.sessionId);
        if (fullSession) {
          setPrimarySession(fullSession);
        }
      } else {
        setPrimarySession(null);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData, sseEvent]);

  if (!primarySession && sessions.length > 0) {
    return <div className="flex h-64 items-center justify-center text-soc-text-muted">Loading primary session...</div>;
  }

  return (
    <div className="space-y-5">
      {/* Header + Demo */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-semibold text-soc-text flex items-center gap-3">
            Security Operations Center
            {connected && (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-soc-success/10 border border-soc-success/20">
                <span className="w-1.5 h-1.5 rounded-full bg-soc-success" style={{ animation: 'pulse-live 2s ease-in-out infinite' }} />
                <span className="text-[9px] font-medium text-soc-success uppercase tracking-wider">Live</span>
              </span>
            )}
          </h1>
          <p className="text-xs text-soc-text-muted">Real-time adaptive cyber deception monitoring</p>
        </div>
        <DemoButton onEvent={loadData} />
      </div>

      <ThreatOverview />

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 space-y-5">
          <section id="attacks">
            {/* ActiveAttacks would ideally take sessions prop. Passing it implicitly relies on global, so we need to update ActiveAttacks too if it uses mock data internally */}
            <ActiveAttacks sessions={sessions} />
          </section>

          {primarySession ? (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <AttackTimeline events={primarySession.timeline} compact />
                <AttackerProfile
                  sessionId={primarySession.sessionId}
                  profile={primarySession.attackerProfile}
                  requestCount={primarySession.requestCount}
                  uniqueEndpoints={primarySession.uniqueEndpoints}
                  duration={primarySession.duration}
                  severity={primarySession.severity}
                  threatScore={primarySession.threatScore}
                />
              </div>
              <section id="deception">
                <DeceptionGraph graph={primarySession.deceptionGraph} />
              </section>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 border border-dashed border-soc-border rounded-lg text-soc-text-muted bg-soc-panel">
              <p className="text-sm">No active attacks detected.</p>
              <p className="text-xs mt-1">Waiting for attacker probes...</p>
            </div>
          )}

          <section id="benchmark">
            <BenchmarkPanel />
          </section>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {primarySession && (
            <>
              <DeceptionState state={primarySession.deceptionState} />
              <CanaryMonitor canaries={primarySession.canaries} />
              <section id="intelligence">
                <DeceptionDecision decision={primarySession.aiDecisions[0] || null} />
              </section>
              <ThreatIntelligence intel={primarySession.threatIntelligence} />
            </>
          )}
          <AIMonitor />
          <SystemHealthPanel />
        </div>
      </div>
    </div>
  );
}
