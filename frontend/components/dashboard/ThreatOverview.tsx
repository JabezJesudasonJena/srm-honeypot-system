'use client';

import { Swords, AlertTriangle, Bug, Clock, Server, Users, Layers, Timer } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import type { DashboardOverview } from '@/lib/types';

interface KPICardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color?: string;
  subtext?: string;
}

function KPICard({ label, value, icon: Icon, color = 'text-soc-primary', subtext }: KPICardProps) {
  return (
    <div className="bg-soc-panel border border-soc-border rounded-lg p-4 flex items-start gap-3">
      <div className={`p-2 rounded-md bg-soc-surface ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-soc-text-muted">{label}</p>
        <p className={`text-xl font-semibold font-mono ${color} leading-tight mt-0.5`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {subtext && <p className="text-[10px] text-soc-text-muted mt-0.5">{subtext}</p>}
      </div>
    </div>
  );
}

export default function ThreatOverview() {
  const [d, setD] = useState<DashboardOverview | null>(null);

  useEffect(() => {
    api.getOverview().then(setD).catch(console.error);
    const interval = setInterval(() => api.getOverview().then(setD).catch(console.error), 5000);
    return () => clearInterval(interval);
  }, []);

  if (!d) return <div className="h-24 bg-soc-panel rounded-lg animate-pulse" />;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <KPICard label="Active Attacks" value={d.activeAttacks} icon={Swords} color="text-soc-critical" />
      <KPICard label="Critical Threats" value={d.criticalThreats} icon={AlertTriangle} color="text-soc-critical" />
      <KPICard label="Canary Triggers" value={d.canaryTriggers} icon={Bug} color="text-soc-warning" />
      <KPICard label="Avg Detection Time" value={d.avgDetectionTime} icon={Clock} color="text-soc-success" />
      <KPICard label="Requests Processed" value={d.requestsProcessed} icon={Server} color="text-soc-text-secondary" />
      <KPICard label="Active Sessions" value={d.activeSessions} icon={Users} color="text-soc-info" />
      <KPICard label="Deception Depth" value={`${d.deceptionDepth} / 5`} icon={Layers} color="text-soc-accent" />
      <KPICard label="Avg Engagement" value={d.avgEngagement} icon={Timer} color="text-soc-primary" />
    </div>
  );
}
