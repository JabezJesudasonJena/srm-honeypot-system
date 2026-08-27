"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { SessionInfo, AttackTimelineEvent, CanaryInfo } from "@/lib/types";
import { useRealtimeEvents } from "@/hooks/useRealtimeEvents";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import ThreatBadge from "@/components/ThreatBadge";
import Timeline from "@/components/Timeline";
import { Activity, GitCommit, List, Play, FileJson, Network, BrainCircuit, ActivitySquare } from "lucide-react";

export default function AttackDetailsPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<SessionInfo | null>(null);
  const [timeline, setTimeline] = useState<AttackTimelineEvent[]>([]);
  const [canaries, setCanaries] = useState<CanaryInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const fetchData = async () => {
    try {
      const [sessionData, timelineData, canariesData] = await Promise.all([
        api.getAttack(sessionId).catch(() => null),
        api.getAttackTimeline(sessionId).catch(() => []),
        api.getAttackCanaries(sessionId).catch(() => [])
      ]);

      if (sessionData) setSession(sessionData);
      setTimeline(timelineData || []);
      setCanaries(canariesData || []);
      setError(false);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useRealtimeEvents(() => {
    fetchData();
  });

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [sessionId]);

  if (loading) return <LoadingState message="Loading threat profile..." />;
  if (error && !session) return <ErrorState onRetry={fetchData} />;
  if (!session) return <ErrorState title="Not Found" message={`Session ${sessionId} not found.`} onRetry={fetchData} />;

  const tabs = [
    { id: "overview", name: "Overview", icon: ActivitySquare },
    { id: "timeline", name: "Timeline", icon: List },
    { id: "canaries", name: "Canaries", icon: GitCommit },
    { id: "replay", name: "Replay", icon: Play },
    { id: "assets", name: "Assets", icon: FileJson },
    { id: "graph", name: "Deception Graph", icon: Network },
    { id: "decision", name: "Decision", icon: BrainCircuit },
  ];

  return (
    <div className="space-y-6 flex flex-col h-full max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-soc-text)] font-mono">{session.id}</h1>
            <ThreatBadge severity={session.severity} />
          </div>
          <p className="text-[var(--color-soc-text-muted)] text-sm">Target IP: {session.ip} • Profile: {session.attackerProfile || "Unknown"}</p>
        </div>
        
        <div className="bg-[var(--color-soc-panel)] border border-[var(--color-soc-border)] rounded-lg p-3 flex gap-6 text-sm">
          <div>
            <p className="text-[var(--color-soc-text-muted)] text-xs uppercase tracking-wider mb-1">Threat Score</p>
            <p className="font-mono text-xl font-bold text-[var(--color-soc-text)]">{session.threatScore.toFixed(1)}</p>
          </div>
          <div>
            <p className="text-[var(--color-soc-text-muted)] text-xs uppercase tracking-wider mb-1">Requests</p>
            <p className="font-mono text-xl font-bold text-[var(--color-soc-text)]">{session.requestCount}</p>
          </div>
          <div>
            <p className="text-[var(--color-soc-text-muted)] text-xs uppercase tracking-wider mb-1">Intent</p>
            <p className="font-medium text-[var(--color-soc-text)]">{session.currentIntent}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-[var(--color-soc-border-light)] shrink-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                isActive 
                  ? "text-[var(--color-soc-primary)] border-[var(--color-soc-primary)] bg-[var(--color-soc-primary)]/5" 
                  : "text-[var(--color-soc-text-secondary)] border-transparent hover:text-[var(--color-soc-text)] hover:bg-[var(--color-soc-surface)]"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.name}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-auto bg-[var(--color-soc-panel)] border border-[var(--color-soc-border)] rounded-xl p-6">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <section>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-soc-text-muted)] mb-3">Attacker Context</h3>
                <div className="bg-[var(--color-soc-surface)] border border-[var(--color-soc-border-light)] rounded-lg p-4 font-mono text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[var(--color-soc-text-muted)]">IP Address</span>
                    <span className="text-[var(--color-soc-text)]">{session.ip}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-soc-text-muted)]">User Agent</span>
                    <span className="text-[var(--color-soc-text)] text-right max-w-[60%] truncate" title={session.userAgent}>{session.userAgent}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-soc-text-muted)]">First Seen</span>
                    <span className="text-[var(--color-soc-text)]">
                      {timeline[0] ? new Date(timeline[0].timestamp).toLocaleString() : "Unknown"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-soc-text-muted)]">Last Activity</span>
                    <span className="text-[var(--color-soc-text)]">{new Date(session.lastActivity).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-soc-text-muted)]">Status</span>
                    <span className={`font-bold ${session.status === 'ACTIVE' ? 'text-green-400' : 'text-red-400'}`}>{session.status}</span>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-soc-text-muted)] mb-3">Live Intent Analysis</h3>
                <div className="bg-[var(--color-soc-surface)] border border-[var(--color-soc-border-light)] rounded-lg p-6 flex flex-col items-center justify-center text-center">
                  <Activity className="w-10 h-10 text-[var(--color-soc-primary)] mb-4" />
                  <p className="text-[var(--color-soc-text-secondary)] text-sm mb-2">The deterministic fallback pipeline identifies the current intent as:</p>
                  <p className="text-xl font-bold text-[var(--color-soc-text)] tracking-wide">{session.currentIntent}</p>
                </div>
              </section>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-soc-text-muted)] mb-3">Recent Activity</h3>
              <div className="bg-[var(--color-soc-surface)] border border-[var(--color-soc-border-light)] rounded-lg p-4">
                {timeline.length > 0 ? (
                  <div className="space-y-4">
                    {timeline.slice(-5).reverse().map((event, i) => (
                      <div key={i} className="flex gap-3 text-sm">
                        <span className="text-[var(--color-soc-text-muted)] font-mono whitespace-nowrap mt-0.5">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </span>
                        <div>
                          <p className="font-medium text-[var(--color-soc-text)]">{event.type.replace(/_/g, ' ')}</p>
                          <p className="text-xs text-[var(--color-soc-text-secondary)]">{event.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[var(--color-soc-text-muted)] text-sm">No activity recorded.</p>
                )}
                <button 
                  onClick={() => setActiveTab('timeline')}
                  className="mt-4 text-[var(--color-soc-primary)] text-sm hover:underline w-full text-center"
                >
                  View Full Timeline
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "timeline" && (
          <div className="max-w-3xl mx-auto">
            <h3 className="text-lg font-bold mb-6">Attack Progression</h3>
            <Timeline events={timeline} />
          </div>
        )}

        {activeTab === "canaries" && (
          <div>
            <h3 className="text-lg font-bold mb-6">Canary Credentials & Honeytokens</h3>
            {canaries.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {canaries.map(canary => (
                  <div key={canary.id} className={`p-4 rounded-xl border ${canary.reused ? 'bg-red-500/10 border-red-500/30' : 'bg-[var(--color-soc-surface)] border-[var(--color-soc-border-light)]'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <GitCommit className={`w-5 h-5 ${canary.reused ? 'text-red-400' : 'text-purple-400'}`} />
                        <h4 className="font-bold text-sm">{canary.type}</h4>
                      </div>
                      {canary.reused && (
                        <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded font-bold animate-pulse">REUSED</span>
                      )}
                    </div>
                    <div className="space-y-2 text-sm font-mono text-[var(--color-soc-text-secondary)]">
                      <div className="flex justify-between">
                        <span>ID:</span>
                        <span className="text-[var(--color-soc-text)]">{canary.id.substring(0,8)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Endpoint:</span>
                        <span className="text-[var(--color-soc-text)]">{canary.endpoint}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Issued:</span>
                        <span className="text-[var(--color-soc-text)]">{new Date(canary.issuedAt).toLocaleString()}</span>
                      </div>
                      {canary.triggeredAt && (
                        <div className="flex justify-between">
                          <span>Triggered:</span>
                          <span className={`${canary.reused ? 'text-red-400 font-bold' : 'text-[var(--color-soc-text)]'}`}>
                            {new Date(canary.triggeredAt).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-12 text-[var(--color-soc-text-muted)] border border-dashed border-[var(--color-soc-border-light)] rounded-lg">
                No canaries have been issued for this session.
              </div>
            )}
          </div>
        )}

        {(activeTab === "replay" || activeTab === "assets" || activeTab === "graph" || activeTab === "decision") && (
          <div className="flex flex-col items-center justify-center p-12 h-64 text-center">
            <Activity className="w-12 h-12 text-[var(--color-soc-text-muted)] opacity-50 mb-4" />
            <h3 className="text-lg font-bold text-[var(--color-soc-text)] mb-2">Advanced Analysis Component</h3>
            <p className="text-[var(--color-soc-text-secondary)] max-w-md">
              Detailed {activeTab} view is available in the full Labyrinth platform. This demo focuses on realtime intent and async intelligence.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
