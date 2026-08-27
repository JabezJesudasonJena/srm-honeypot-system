"use client";

import { useEffect, useState } from "react";
import { fetchTimeline } from "@/lib/api";

export default function ThreatChart({ sessionId }: { sessionId: string }) {
  const [data, setData] = useState<{ time: number, score: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimeline(sessionId)
      .then(res => {
        const timeline = res.timeline || [];
        const scores = timeline
          .filter((e: any) => e.metadata?.newScore !== undefined)
          .map((e: any) => ({
            time: new Date(e.timestamp).getTime(),
            score: e.metadata.newScore
          }));
        setData(scores);
      })
      .catch(err => console.error("Failed to fetch threat chart data", err))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) return <div className="p-4 bg-[#0c1219] border border-[#1c2a38] rounded animate-pulse">Loading chart...</div>;
  if (data.length === 0) return <div className="p-4 bg-[#0c1219] border border-[#1c2a38] rounded text-gray-500">No threat score data available.</div>;

  // Extremely basic CSS bar chart representation
  const maxScore = 100;
  
  return (
    <div className="bg-[#0c1219] border border-[#1c2a38] rounded-md overflow-hidden p-4">
      <h3 className="font-bold text-white mb-4">Threat Score Progression</h3>
      <div className="h-40 flex items-end gap-1 relative border-l border-b border-[#1c2a38] pb-1 pl-1">
        {/* Y Axis Guide */}
        <div className="absolute left-0 top-0 text-[10px] text-gray-600 -translate-x-full pr-1">100</div>
        <div className="absolute left-0 top-1/2 text-[10px] text-gray-600 -translate-x-full pr-1 -translate-y-1/2">50</div>
        <div className="absolute left-0 bottom-0 text-[10px] text-gray-600 -translate-x-full pr-1">0</div>
        
        {data.map((d, i) => {
          const height = `${(d.score / maxScore) * 100}%`;
          let color = 'bg-blue-500';
          if (d.score > 80) color = 'bg-red-500';
          else if (d.score > 50) color = 'bg-orange-500';
          else if (d.score > 20) color = 'bg-yellow-500';

          return (
            <div 
              key={i} 
              title={`Score: ${d.score}`}
              className={`flex-1 min-w-[10px] rounded-t-sm transition-all duration-500 ${color}`} 
              style={{ height }}
            ></div>
          );
        })}
      </div>
    </div>
  );
}
