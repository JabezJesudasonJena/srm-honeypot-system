"use client";

import { useEffect, useState } from "react";
import { fetchDecision } from "@/lib/api";

export default function AIDecisionPanel({ sessionId }: { sessionId: string }) {
  const [decision, setDecision] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDecision(sessionId)
      .then(res => setDecision(res.decision))
      .catch(err => console.error("Failed to fetch AI decision", err))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) return <div className="p-4 bg-[#0c1219] border border-[#1c2a38] rounded animate-pulse">Loading enrichment status...</div>;
  if (!decision) return <div className="p-4 bg-[#0c1219] border border-[#1c2a38] rounded text-gray-500">No deception decision recorded yet.</div>;

  return (
    <div className="bg-[#0c1219] border border-[#1c2a38] rounded-md overflow-hidden">
      <div className="p-4 border-b border-[#1c2a38] bg-[#111a24]">
        <h3 className="font-bold text-white">Async Enrichment Status</h3>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500 block mb-1">Intent Classified</span>
            <span className="text-gray-200 font-mono">{decision.intent}</span>
          </div>
          <div>
            <span className="text-gray-500 block mb-1">Provider</span>
            <span className="text-blue-400 font-mono">{decision.provider || 'FALLBACK'}</span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-500 block mb-1">Selected Strategy</span>
            <span className="text-gray-300">{decision.strategy || 'Static Deterministic Mode'}</span>
          </div>
          <div>
            <span className="text-gray-500 block mb-1">Deception Depth</span>
            <span className="text-gray-200">{decision.depth || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
