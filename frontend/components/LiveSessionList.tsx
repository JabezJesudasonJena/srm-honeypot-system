"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchAttacks, API_BASE_URL } from "@/lib/api";

type Session = {
  sessionId: string;
  sourceIP: string;
  firstSeen: string;
  lastSeen: string;
  requestCount: number;
  threatScore: number;
  threatSeverity: string;
  classification: string;
  active: boolean;
};

export default function LiveSessionList() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Initial fetch
    fetchAttacks().then(data => setSessions(data.attacks || [])).catch(() => setError(true));

    // SSE Subscription
    const eventSource = new EventSource(`${API_BASE_URL}/events/stream`);
    
    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        // On relevant updates, just re-fetch the list to ensure consistency
        if (["THREAT_SCORE_CHANGED", "AI_GENERATION_FAILED", "ASSET_DISCOVERED", "ML_CLASSIFICATION"].includes(payload.type)) {
          fetchAttacks().then(data => setSessions(data.attacks || []));
        }
      } catch (err) {
        console.error("SSE parse error", err);
      }
    };

    eventSource.onerror = () => {
      console.error("SSE connection error");
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'CRITICAL': return 'bg-red-500 text-white';
      case 'HIGH': return 'bg-orange-500 text-white';
      case 'MEDIUM': return 'bg-yellow-500 text-black';
      case 'LOW': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (error) return <div className="text-red-400 p-4 border border-red-900 bg-red-950/20 rounded">Error loading sessions. Backend might be unreachable.</div>;

  return (
    <div className="bg-[#0c1219] border border-[#1c2a38] rounded-md overflow-hidden">
      <div className="p-4 border-b border-[#1c2a38] bg-[#111a24] flex justify-between items-center">
        <h3 className="font-bold text-white">Live Attack Sessions</h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          <span className="text-xs text-gray-400 uppercase tracking-widest font-mono">Live</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-300">
          <thead className="text-xs uppercase bg-[#070b10] text-gray-400 font-mono border-b border-[#1c2a38]">
            <tr>
              <th className="px-4 py-3">Session ID</th>
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Class</th>
              <th className="px-4 py-3">Requests</th>
              <th className="px-4 py-3">Last Seen</th>
            </tr>
          </thead>
          <tbody>
            {sessions.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No active sessions</td></tr>
            ) : (
              sessions.map(s => (
                <tr key={s.sessionId} className="border-b border-[#1c2a38] hover:bg-[#111a24] transition-colors group">
                  <td className="px-4 py-3 font-mono">
                    <Link href={`/attacks/${s.sessionId}`} className="text-blue-400 hover:text-blue-300 group-hover:underline">
                      {s.sessionId.substring(0, 8)}
                    </Link>
                    {!s.active && <span className="ml-2 text-xs text-gray-500">(Ended)</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-bold rounded ${getSeverityColor(s.threatSeverity)}`}>
                      {s.threatSeverity}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-white">{s.threatScore}</td>
                  <td className="px-4 py-3 text-gray-400">{s.classification}</td>
                  <td className="px-4 py-3 font-mono">{s.requestCount}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(s.lastSeen).toLocaleTimeString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
