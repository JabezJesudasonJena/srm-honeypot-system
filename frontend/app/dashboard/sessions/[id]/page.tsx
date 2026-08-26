'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import AttackerProfile from '@/components/dashboard/AttackerProfile';
import AttackTimeline from '@/components/dashboard/AttackTimeline';
import DeceptionState from '@/components/dashboard/DeceptionState';
import DeceptionGraph from '@/components/dashboard/DeceptionGraph';
import CanaryMonitor from '@/components/dashboard/CanaryMonitor';
import DeceptionDecision from '@/components/dashboard/DeceptionDecision';
import ThreatIntelligence from '@/components/dashboard/ThreatIntelligence';
import RequestInspector from '@/components/dashboard/RequestInspector';
import type { RequestEvent, ThreatSeverity, AttackSession } from '@/lib/types';

function SeverityBadge({ severity }: { severity: ThreatSeverity }) {
  const styles: Record<ThreatSeverity, string> = {
    CRITICAL: 'bg-soc-critical/15 text-soc-critical border-soc-critical/30',
    HIGH: 'bg-soc-warning/15 text-soc-warning border-soc-warning/30',
    MEDIUM: 'bg-soc-primary/15 text-soc-primary border-soc-primary/30',
    LOW: 'bg-soc-success/15 text-soc-success border-soc-success/30',
    INFO: 'bg-soc-text-muted/15 text-soc-text-muted border-soc-text-muted/30',
  };
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${styles[severity] || styles.INFO}`}>
      {severity}
    </span>
  );
}

export default function SessionDetailPage() {
  const params = useParams();
  const sessionId = params.id as string;
  const [session, setSession] = useState<AttackSession | null | undefined>(undefined);
  const [selectedRequest, setSelectedRequest] = useState<RequestEvent | null>(null);

  useEffect(() => {
    api.getSession(sessionId).then(setSession).catch((err) => {
      console.error(err);
      setSession(null);
    });
    
    // Refresh interval
    const interval = setInterval(() => {
      api.getSession(sessionId).then(setSession).catch(console.error);
    }, 5000);
    return () => clearInterval(interval);
  }, [sessionId]);

  if (session === undefined) {
    return <div className="flex h-96 items-center justify-center text-soc-text-muted">Loading session data...</div>;
  }

  if (session === null) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <p className="text-lg text-soc-text-muted mb-3">Session not found</p>
        <Link href="/dashboard" className="text-soc-primary text-xs hover:underline flex items-center gap-1">
          <ArrowLeft className="w-3 h-3" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4 flex-wrap">
        <Link href="/dashboard" className="text-soc-text-muted hover:text-soc-text transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-soc-text">
            Session <span className="font-mono text-soc-accent">#{session.sessionId.substring(0, 8)}</span>
          </h1>
          <SeverityBadge severity={session.severity} />
        </div>
        <div className="ml-auto flex items-center gap-4 text-[11px] text-soc-text-muted">
          <span>IP: <span className="font-mono text-soc-text-secondary">{session.sourceIP}</span></span>
          <span>UA: <span className="font-mono text-soc-text-secondary truncate max-w-48 inline-block align-bottom">{session.userAgent}</span></span>
        </div>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-soc-panel border border-soc-border rounded-lg p-3 text-center">
          <p className="text-2xl font-mono font-bold text-soc-critical">{session.threatScore}</p>
          <p className="text-[9px] text-soc-text-muted uppercase">Threat Score</p>
        </div>
        <div className="bg-soc-panel border border-soc-border rounded-lg p-3 text-center">
          <p className="text-2xl font-mono font-bold text-soc-text">{session.requestCount}</p>
          <p className="text-[9px] text-soc-text-muted uppercase">Requests</p>
        </div>
        <div className="bg-soc-panel border border-soc-border rounded-lg p-3 text-center">
          <p className="text-2xl font-mono font-bold text-soc-text">{session.uniqueEndpoints}</p>
          <p className="text-[9px] text-soc-text-muted uppercase">Endpoints</p>
        </div>
        <div className="bg-soc-panel border border-soc-border rounded-lg p-3 text-center">
          <p className="text-2xl font-mono font-bold text-soc-accent">{session.duration}</p>
          <p className="text-[9px] text-soc-text-muted uppercase">Duration</p>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Left — 2/3 */}
        <div className="xl:col-span-2 space-y-5">
          {/* Profile + Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <AttackerProfile
              sessionId={session.sessionId}
              profile={session.attackerProfile}
              requestCount={session.requestCount}
              uniqueEndpoints={session.uniqueEndpoints}
              duration={session.duration}
              severity={session.severity}
              threatScore={session.threatScore}
            />
            <AttackTimeline events={session.timeline} />
          </div>

          {/* Graph */}
          <DeceptionGraph graph={session.deceptionGraph} />

          {/* Request History */}
          {session.requestHistory.length > 0 && (
            <div className="bg-soc-panel border border-soc-border rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-soc-border">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-soc-text-secondary">
                  Request History
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-[10px] uppercase tracking-wider text-soc-text-muted border-b border-soc-border">
                      <th className="px-4 py-2 font-medium">Time</th>
                      <th className="px-4 py-2 font-medium">Method</th>
                      <th className="px-4 py-2 font-medium">Path</th>
                      <th className="px-4 py-2 font-medium">Intent</th>
                      <th className="px-4 py-2 font-medium">Score</th>
                      <th className="px-4 py-2 font-medium hidden md:table-cell">Strategy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {session.requestHistory.map(req => (
                      <tr
                        key={req.id}
                        onClick={() => setSelectedRequest(req)}
                        className={`border-b border-soc-border/50 cursor-pointer transition-colors ${
                          selectedRequest?.id === req.id ? 'bg-soc-primary/5' : 'hover:bg-soc-surface/80'
                        }`}
                      >
                        <td className="px-4 py-2.5 font-mono text-soc-text-muted text-[10px]">
                          {new Date(req.timestamp).toLocaleTimeString('en-US', { hour12: false })}
                        </td>
                        <td className={`px-4 py-2.5 font-mono font-semibold ${req.method === 'POST' ? 'text-soc-warning' : 'text-soc-primary'}`}>
                          {req.method}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-soc-text">{req.path}</td>
                        <td className="px-4 py-2.5 text-soc-text-secondary">{req.intent}</td>
                        <td className="px-4 py-2.5 font-mono text-soc-critical">+{req.threatScoreDelta}</td>
                        <td className="px-4 py-2.5 text-[10px] font-mono text-soc-text-muted hidden md:table-cell">
                          {req.responseStrategy}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right — 1/3 */}
        <div className="space-y-5">
          {selectedRequest && (
            <RequestInspector event={selectedRequest} onClose={() => setSelectedRequest(null)} />
          )}
          <DeceptionState state={session.deceptionState} />
          <CanaryMonitor canaries={session.canaries} />
          <DeceptionDecision decision={session.aiDecisions[0] || null} />
          <ThreatIntelligence intel={session.threatIntelligence} />
        </div>
      </div>
    </div>
  );
}
