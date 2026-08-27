'use client';

import { useState, useEffect } from 'react';
import { Brain, Cpu, Sparkles, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api';
import type { AIMetrics } from '@/lib/types';

function StatusDot({ status }: { status: string }) {
  const color = status === 'operational' || status === 'ready' ? 'bg-soc-success' : status === 'degraded' ? 'bg-soc-warning' : 'bg-soc-critical';
  return <span className={`inline-block w-1.5 h-1.5 rounded-full ${color}`} />;
}

export default function AIMonitor() {
  const [m, setM] = useState<AIMetrics | null>(null);

  useEffect(() => {
    api.getAIMetrics().then(setM).catch(console.error);
    const interval = setInterval(() => api.getAIMetrics().then(setM).catch(console.error), 10000);
    return () => clearInterval(interval);
  }, []);

  if (!m) return <div className="h-48 bg-soc-panel rounded-lg animate-pulse" />;

  const total = m.deterministic + m.huggingFace + m.gemini + m.fallback;

  const bars = [
    { label: 'Deterministic', value: m.deterministic, color: 'bg-soc-primary', icon: Cpu },
    { label: 'Hugging Face', value: m.huggingFace, color: 'bg-soc-info', icon: Brain },
    { label: 'Gemini', value: m.gemini, color: 'bg-soc-accent', icon: Sparkles },
    { label: 'Fallback', value: m.fallback, color: 'bg-soc-warning', icon: ShieldCheck },
  ];

  return (
    <div className="bg-soc-panel border border-soc-border rounded-lg">
      <div className="px-4 py-3 border-b border-soc-border">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-soc-text-secondary">
          AI Decision Engine
        </h2>
      </div>
      <div className="p-4 space-y-4">
        {/* Routing bars */}
        <div className="space-y-2.5">
          <p className="text-[10px] text-soc-text-muted uppercase tracking-wider">Requests Routed</p>
          {bars.map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Icon className="w-3 h-3 text-soc-text-muted" />
                  <span className="text-[11px] text-soc-text-secondary">{label}</span>
                </div>
                <span className="text-[11px] font-mono text-soc-text">{value.toLocaleString()}</span>
              </div>
              <div className="h-1 bg-soc-surface rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full`} style={{ width: `${(value / total) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Health */}
        <div className="space-y-2 pt-2 border-t border-soc-border">
          <p className="text-[10px] text-soc-text-muted uppercase tracking-wider">AI Health</p>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-soc-text-secondary">Gemini</span>
            <div className="flex items-center gap-1.5">
              <StatusDot status={m.geminiStatus} />
              <span className="text-soc-text capitalize">{m.geminiStatus}</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-soc-text-secondary">Hugging Face</span>
            <div className="flex items-center gap-1.5">
              <StatusDot status={m.huggingFaceStatus} />
              <span className="text-soc-text capitalize">{m.huggingFaceStatus}</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-soc-text-secondary">Fallback Engine</span>
            <div className="flex items-center gap-1.5">
              <StatusDot status={m.fallbackStatus} />
              <span className="text-soc-text capitalize">{m.fallbackStatus}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
