'use client';

import { useState, useEffect } from 'react';
import { Activity, Wifi } from 'lucide-react';
import { api } from '@/lib/api';
import type { SystemHealth } from '@/lib/types';

function StatusDot({ status }: { status: string }) {
  const color =
    status === 'operational' || status === 'healthy' || status === 'running'
      ? 'bg-soc-success'
      : status === 'degraded'
      ? 'bg-soc-warning'
      : 'bg-soc-critical';
  return <span className={`inline-block w-1.5 h-1.5 rounded-full ${color}`} />;
}

const services: { label: string; key: keyof SystemHealth }[] = [
  { label: 'Gateway', key: 'gateway' },
  { label: 'Database', key: 'database' },
  { label: 'Redis', key: 'queue' },
  { label: 'AI Engine', key: 'ai' },
  { label: 'Worker', key: 'worker' },
];

export default function Topbar() {
  const [h, setH] = useState<SystemHealth | null>(null);

  useEffect(() => {
    api.getSystemHealth().then(setH).catch(console.error);
    const interval = setInterval(() => api.getSystemHealth().then(setH).catch(console.error), 10000);
    return () => clearInterval(interval);
  }, []);

  if (!h) return <header className="h-14 border-b border-soc-border bg-soc-surface shrink-0" />;


  return (
    <header className="h-14 border-b border-soc-border bg-soc-surface flex items-center justify-between px-5 shrink-0">
      {/* Left */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-sm font-semibold text-soc-text tracking-wide leading-none">
            PROJECT LABYRINTH
          </h1>
          <p className="text-[10px] text-soc-text-muted leading-none mt-0.5">
            Adaptive Cyber Deception
          </p>
        </div>
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-soc-success/10 border border-soc-success/20">
          <span className="w-1.5 h-1.5 rounded-full bg-soc-success" style={{ animation: 'pulse-live 2s ease-in-out infinite' }} />
          <span className="text-[10px] font-medium text-soc-success uppercase tracking-wider">Live</span>
        </div>
      </div>

      {/* Center — System Status */}
      <div className="hidden lg:flex items-center gap-4">
        <span className="text-[10px] text-soc-text-muted uppercase tracking-wider mr-1">
          System Status
        </span>
        {services.map(({ label, key }) => (
          <div key={key} className="flex items-center gap-1.5">
            <StatusDot status={String(h[key])} />
            <span className="text-[11px] text-soc-text-secondary">{label}</span>
          </div>
        ))}
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 text-soc-text-muted">
          <Activity className="w-3.5 h-3.5" />
          <span className="text-[11px] font-mono">42 req/s</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-soc-text-muted">
          <Wifi className="w-3.5 h-3.5" />
          <span className="text-[11px] font-mono">83ms</span>
        </div>
      </div>
    </header>
  );
}
