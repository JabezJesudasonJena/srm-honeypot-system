"use client";

import { useEffect, useState } from "react";
import { fetchTimeline } from "@/lib/api";

export default function Timeline({ sessionId }: { sessionId: string }) {
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimeline(sessionId)
      .then(data => setTimeline(data.timeline || []))
      .catch(err => console.error("Failed to fetch timeline", err))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) return <div className="p-4 bg-[#0c1219] border border-[#1c2a38] rounded animate-pulse">Loading timeline...</div>;

  return (
    <div className="bg-[#0c1219] border border-[#1c2a38] rounded-md overflow-hidden">
      <div className="p-4 border-b border-[#1c2a38] bg-[#111a24]">
        <h3 className="font-bold text-white">Event Timeline</h3>
      </div>
      <div className="max-h-[400px] overflow-y-auto p-4 space-y-4">
        {timeline.length === 0 ? (
          <p className="text-gray-500">No events found.</p>
        ) : (
          timeline.map((event, idx) => (
            <div key={idx} className="flex gap-4 items-start relative pb-4">
              {idx !== timeline.length - 1 && <div className="absolute left-[7px] top-6 bottom-0 w-px bg-[#1c2a38]"></div>}
              <div className="w-4 h-4 rounded-full bg-blue-500/20 border border-blue-500 mt-1 flex-shrink-0 z-10"></div>
              <div className="flex-1 bg-[#111a24] p-3 rounded border border-[#1c2a38]">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-mono text-sm text-blue-400">{event.eventType}</span>
                  <span className="text-xs text-gray-500">{new Date(event.timestamp).toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-300 font-mono break-all">{event.details}</p>
                {event.metadata?.canaryTriggered && (
                  <div className="mt-2 text-xs bg-red-900/30 text-red-400 p-2 rounded border border-red-900/50">
                    ⚠️ Canary Triggered: {event.metadata.canaryId}
                  </div>
                )}
                {event.metadata?.intent && (
                  <div className="mt-2 text-xs text-gray-400">
                    Intent: <span className="text-gray-300">{event.metadata.intent}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
