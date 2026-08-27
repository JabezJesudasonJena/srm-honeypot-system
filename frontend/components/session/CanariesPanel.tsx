"use client";

import { useEffect, useState } from "react";
import { fetchCanaries } from "@/lib/api";

export default function CanariesPanel({ sessionId }: { sessionId: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCanaries(sessionId)
      .then(res => setData(res))
      .catch(err => console.error("Failed to fetch canaries", err))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) return <div className="p-4 bg-[#0c1219] border border-[#1c2a38] rounded animate-pulse">Loading canaries...</div>;
  if (!data || data.total === 0) return <div className="p-4 bg-[#0c1219] border border-[#1c2a38] rounded text-gray-500">No canaries issued.</div>;

  return (
    <div className="bg-[#0c1219] border border-[#1c2a38] rounded-md overflow-hidden">
      <div className="p-4 border-b border-[#1c2a38] bg-[#111a24] flex justify-between">
        <h3 className="font-bold text-white">Canaries Tracked</h3>
        <span className="text-xs px-2 py-1 bg-[#1c2a38] rounded-full text-gray-300">{data.triggered} / {data.total} Triggered</span>
      </div>
      <div className="p-4 flex flex-col gap-3">
        {data.canaries.map((c: any, i: number) => (
          <div key={i} className={`p-3 rounded border ${c.status === 'triggered' ? 'bg-red-900/20 border-red-900/50' : 'bg-[#111a24] border-[#1c2a38]'}`}>
            <div className="flex justify-between mb-2">
              <span className="font-mono text-sm text-gray-300">{c.canaryId}</span>
              <span className={`text-xs px-2 py-1 rounded uppercase font-bold ${c.status === 'triggered' ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-300'}`}>
                {c.status}
              </span>
            </div>
            <div className="text-sm text-gray-400">
              <p>Type: <span className="text-gray-300">{c.type}</span></p>
              {c.exposedAt && <p>Exposed: <span className="font-mono text-gray-300">{c.exposedEndpoint}</span></p>}
              {c.triggeredAt && <p className="text-red-400 mt-1">Reused in attack attempts.</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
