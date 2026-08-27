'use client';

import { useState, useEffect } from 'react';
import { Server, Database, Layers, Activity, Cpu } from 'lucide-react';
import { api } from '@/lib/api';
import type { SystemHealth } from '@/lib/types';

function StatusItem({ label, status, icon: Icon }: { label: string; status: string; icon: React.ElementType }) {
  const color = status === 'operational' || status === 'healthy' || status === 'running'
    ? 'text-soc-success' : status === 'degraded' ? 'text-soc-warning' : 'text-soc-critical';
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-soc-text-muted" />
        <span className="text-[11px] text-soc-text-secondary">{label}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className={`w-1.5 h-1.5 rounded-full ${color.replace('text-', 'bg-')}`} />
        <span className={`text-[10px] font-medium capitalize ${color}`}>{status}</span>
      </div>
    </div>
  );
}

export default function SystemHealthPanel() {
  const [h, setH] = useState<SystemHealth | null>(null);

  useEffect(() => {
    api.getSystemHealth().then(setH).catch(console.error);
    const interval = setInterval(() => api.getSystemHealth().then(setH).catch(console.error), 5000);
    return () => clearInterval(interval);
  }, []);

  if (!h) return <div className="h-48 bg-soc-panel rounded-lg animate-pulse" />;

  return (
    <div className="bg-soc-panel border border-soc-border rounded-lg">
      <div className="px-4 py-3 border-b border-soc-border">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-soc-text-secondary">
          System Health
        </h2>
      </div>
      <div className="p-4 space-y-3">
        <div className="space-y-0.5">
          <StatusItem label="Gateway" status={h.gateway} icon={Server} />
          <StatusItem label="Queue" status={h.queue} icon={Layers} />
          <StatusItem label="Database" status={h.database} icon={Database} />
          <StatusItem label="Worker" status={h.worker} icon={Cpu} />
          <StatusItem label="AI Engine" status={h.ai} icon={Activity} />
        </div>
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-soc-border">
          <div className="text-center">
            <p className="text-lg font-mono font-semibold text-soc-text">{h.queueDepth}</p>
            <p className="text-[9px] text-soc-text-muted uppercase">Queue Depth</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-mono font-semibold text-soc-text">{h.requestsPerSec}</p>
            <p className="text-[9px] text-soc-text-muted uppercase">Req/sec</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-mono font-semibold text-soc-text">{h.workerLatencyMs}ms</p>
            <p className="text-[9px] text-soc-text-muted uppercase">Latency</p>
          </div>
        </div>
      </div>
    </div>
  );
}
