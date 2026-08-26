'use client';

import { Bug, AlertTriangle, Clock } from 'lucide-react';
import type { CanaryCredential } from '@/lib/types';

interface Props {
  canaries: CanaryCredential[];
}

export default function CanaryMonitor({ canaries }: Props) {
  const exposed = canaries.length;
  const triggered = canaries.filter(c => c.triggered).length;
  const recentTriggers = canaries.filter(c => c.triggered).slice(-3);

  return (
    <div className="bg-soc-panel border border-soc-border rounded-lg">
      <div className="px-4 py-3 border-b border-soc-border">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-soc-text-secondary">
          Canary Monitor
        </h2>
      </div>
      <div className="p-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-2xl font-mono font-bold text-soc-warning">{exposed}</p>
            <p className="text-[9px] text-soc-text-muted uppercase">Exposed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-mono font-bold text-soc-critical">{triggered}</p>
            <p className="text-[9px] text-soc-text-muted uppercase">Triggered</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-mono font-bold text-soc-critical">{recentTriggers.length}</p>
            <p className="text-[9px] text-soc-text-muted uppercase">Recent</p>
          </div>
        </div>

        {/* Recent triggers */}
        {recentTriggers.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] text-soc-text-muted uppercase tracking-wider">Recent Triggers</p>
            {recentTriggers.map(c => (
              <div key={c.canaryId} className="bg-soc-surface border border-soc-critical/20 rounded-md p-2.5">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-3 h-3 text-soc-critical shrink-0" />
                  <span className="text-[11px] font-mono text-soc-critical font-medium">{c.canaryId}</span>
                </div>
                <div className="flex items-center gap-2 mt-1.5 text-[10px] text-soc-text-muted">
                  <Bug className="w-3 h-3 shrink-0" />
                  <span>Triggered at <span className="text-soc-text-secondary font-mono">{c.triggerEndpoint}</span></span>
                </div>
                {c.triggeredAt && (
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-soc-text-muted">
                    <Clock className="w-3 h-3 shrink-0" />
                    <span>{new Date(c.triggeredAt).toLocaleTimeString('en-US', { hour12: false })}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* All canaries list */}
        <div className="space-y-1">
          <p className="text-[10px] text-soc-text-muted uppercase tracking-wider">All Credentials</p>
          {canaries.map(c => (
            <div key={c.canaryId} className="flex items-center justify-between text-[10px] py-1">
              <span className="font-mono text-soc-text-secondary">{c.canaryId}</span>
              <span className={`uppercase font-medium ${c.triggered ? 'text-soc-critical' : 'text-soc-text-muted'}`}>
                {c.triggered ? 'TRIGGERED' : 'EXPOSED'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
