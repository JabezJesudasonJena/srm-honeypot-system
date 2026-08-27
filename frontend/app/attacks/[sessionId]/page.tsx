"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchSession, fetchTimeline, fetchCanaries, fetchDecision, fetchThreatIntel } from "@/lib/api";
import { ArrowLeft, Clock, ShieldAlert, Cpu, FileText } from "lucide-react";
import AttackerReplay from "@/components/dashboard/AttackerReplay";

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<any>(null);
  const [timeline, setTimeline] = useState<any>(null);
  const [canaries, setCanaries] = useState<any>(null);
  const [decision, setDecision] = useState<any>(null);
  const [threatIntel, setThreatIntel] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [intelLoading, setIntelLoading] = useState(false);
  const [intelError, setIntelError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [sessData, timeData, canData, decData] = await Promise.all([
          fetchSession(sessionId),
          fetchTimeline(sessionId),
          fetchCanaries(sessionId),
          fetchDecision(sessionId)
        ]);
        setSession(sessData);
        setTimeline(timeData);
        setCanaries(canData);
        setDecision(decData);
        setError("");
      } catch (err: any) {
        setError(err.message || "Failed to load session details.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [sessionId]);

  const handleGenerateReport = async () => {
    setIntelLoading(true);
    setIntelError("");
    try {
      const data = await fetchThreatIntel(sessionId);
      setThreatIntel(data);
    } catch (err: any) {
      setIntelError("Could not generate report. Fallback to basic view.");
    } finally {
      setIntelLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-gray-400">Loading session...</div>;
  if (error) return <div className="p-8 text-red-400">Error: {error}</div>;

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <header className="flex items-center gap-4 border-b border-gray-800 pb-4">
        <button onClick={() => router.push('/')} className="p-2 bg-gray-900 rounded hover:bg-gray-800 transition-colors">
          <ArrowLeft size={20} className="text-gray-400" />
        </button>
        <div>
          <h2 className="text-2xl font-bold font-mono text-white flex items-center gap-2">
            Session: <span className="text-indigo-400">{sessionId}</span>
          </h2>
          <p className="text-sm text-gray-400 mt-1">Source IP: {session?.sourceIP} | Score: <span className="text-white font-medium">{session?.threatScore}</span></p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Decision / AI Status */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
          <h3 className="text-white font-medium flex items-center gap-2 mb-4 border-b border-gray-800 pb-2">
            <Cpu className="text-purple-400" size={18}/> Latest AI Decision
          </h3>
          {!decision?.decision ? (
            <p className="text-gray-500 text-sm">No AI decision data available for this session.</p>
          ) : (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Provider:</span>
                <span className="text-white bg-purple-500/20 px-2 py-0.5 rounded text-xs border border-purple-500/30 font-mono">
                  {decision.decision.provider || "Unknown"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Intent:</span>
                <span className="text-gray-300">{decision.decision.intent || "Unknown"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Strategy:</span>
                <span className="text-gray-300">{decision.decision.strategy || "Unknown"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Timestamp:</span>
                <span className="text-gray-400 text-xs">{new Date(decision.decision.timestamp).toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Canaries */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
          <h3 className="text-white font-medium flex items-center gap-2 mb-4 border-b border-gray-800 pb-2">
            <ShieldAlert className="text-orange-400" size={18}/> Deployed Canaries
          </h3>
          {!canaries?.canaries || canaries.canaries.length === 0 ? (
            <p className="text-gray-500 text-sm">No canaries generated for this session.</p>
          ) : (
            <ul className="space-y-2">
              {canaries.canaries.map((c: any, idx: number) => (
                <li key={idx} className="flex justify-between items-center bg-black/40 rounded p-2 text-sm border border-gray-800/50">
                  <span className="font-mono text-gray-300">{c.canaryId}</span>
                  <span className={`text-xs px-2 py-1 rounded ${c.status === 'triggered' ? 'bg-red-500/20 text-red-400' : 'bg-gray-800 text-gray-400'}`}>
                    {c.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>

      {/* Threat Intel Report */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-2">
          <h3 className="text-white font-medium flex items-center gap-2">
            <FileText className="text-green-400" size={18}/> Threat Intel Report
          </h3>
          {!threatIntel && (
            <button 
              onClick={handleGenerateReport}
              disabled={intelLoading}
              className="bg-gray-800 hover:bg-gray-700 text-white text-xs px-3 py-1.5 rounded transition-colors disabled:opacity-50"
            >
              {intelLoading ? "Generating..." : "Generate Report"}
            </button>
          )}
        </div>
        {intelError && <p className="text-orange-400 text-sm mb-4 bg-orange-900/20 p-2 rounded">{intelError}</p>}
        {threatIntel ? (
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="text-gray-500 mb-1">Executive Summary</h4>
              <p className="text-gray-300 leading-relaxed bg-black/30 p-3 rounded">{threatIntel.executiveSummary || "N/A"}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-gray-500 mb-1">Attacker Profile</h4>
                <p className="text-gray-300">{threatIntel.attackerProfile || "N/A"}</p>
              </div>
              <div>
                <h4 className="text-gray-500 mb-1">Risk Assessment</h4>
                <p className="text-gray-300 font-medium">{threatIntel.riskAssessment || "N/A"}</p>
              </div>
            </div>
            <div>
              <h4 className="text-gray-500 mb-1">Recommended Actions</h4>
              <ul className="list-disc list-inside text-gray-300 space-y-1">
                {(threatIntel.recommendedActions || []).map((act: string, i: number) => <li key={i}>{act}</li>)}
              </ul>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Report not generated yet.</p>
        )}
      </div>

      {/* Replay and Timeline Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Attacker View Replay */}
        <AttackerReplay timeline={timeline?.timeline || []} canaries={canaries?.canaries || []} />

        {/* Timeline */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden h-[600px] flex flex-col">
          <div className="p-4 border-b border-gray-800 bg-black/20 flex items-center gap-2 shrink-0">
            <Clock className="text-blue-400" size={18} />
            <h3 className="text-white font-medium">Event Timeline ({timeline?.total || 0})</h3>
          </div>
          <div className="p-0 overflow-y-auto flex-1">
            {!timeline?.timeline || timeline.timeline.length === 0 ? (
              <p className="p-4 text-gray-500 text-sm">No events in timeline.</p>
            ) : (
              <div className="divide-y divide-gray-800">
                {timeline.timeline.map((event: any, idx: number) => (
                  <div key={idx} className="p-4 flex items-start gap-4 hover:bg-gray-800/30 transition-colors">
                    <div className="text-gray-500 text-xs w-24 pt-1 flex-shrink-0">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-mono px-1.5 py-0.5 rounded bg-gray-800 ${event.method === 'GET' ? 'text-blue-400' : 'text-green-400'}`}>
                          {event.method || (event.details && event.details.match(/\[(.*?)\]/)?.[1]) || 'UNK'}
                        </span>
                        <span className="text-gray-300 font-mono text-sm break-all">
                          {event.path || (event.details && event.details.match(/\[.*?\] (.*?) (?:→|->| )/)?.[1]) || event.details}
                        </span>
                        {event.canaryEvents && event.canaryEvents.length > 0 && (
                          <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] uppercase px-1.5 py-0.5 rounded ml-2 flex items-center gap-1">
                            <ShieldAlert size={10} /> Canary Active
                          </span>
                        )}
                      </div>
                      {event.intent && (
                        <p className="text-xs text-gray-500">
                          Intent: <span className="text-gray-400 capitalize">{event.intent.replace('_', ' ')}</span>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
