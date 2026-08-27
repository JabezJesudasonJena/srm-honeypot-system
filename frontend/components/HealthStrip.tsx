"use client";

import { useEffect, useState } from "react";
import { fetchSystemHealth, fetchSystemMetrics } from "@/lib/api";

export default function HealthStrip() {
  const [health, setHealth] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [h, m] = await Promise.all([fetchSystemHealth(), fetchSystemMetrics()]);
        setHealth(h);
        setMetrics(m);
      } catch (err) {
        console.error("Failed to load health/metrics", err);
      }
    };
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!health || !metrics) return <div className="h-16 flex items-center p-4 bg-[#0c1219] border border-[#1c2a38] rounded-md animate-pulse">Loading system health...</div>;

  return (
    <div className="flex flex-wrap gap-4 p-4 bg-[#0c1219] border border-[#1c2a38] rounded-md items-center text-sm font-mono text-gray-300">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${health.status === 'operational' ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span>API Status: {health.status.toUpperCase()}</span>
      </div>
      <div className="flex items-center gap-2 border-l border-[#1c2a38] pl-4">
        <span>Engine: <span className={health.deceptionEngine === 'AI' ? 'text-blue-400 font-bold' : 'text-yellow-500 font-bold'}>{health.deceptionEngine}</span></span>
      </div>
      <div className="flex items-center gap-2 border-l border-[#1c2a38] pl-4">
        <span>Active Attacks: <span className="text-white font-bold">{metrics.activeAttacks}</span></span>
      </div>
      <div className="flex items-center gap-2 border-l border-[#1c2a38] pl-4">
        <span>Total Req: <span className="text-white font-bold">{metrics.requestsProcessed}</span></span>
      </div>
    </div>
  );
}
