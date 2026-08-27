'use client';

import { Database, Cloud, Users, Key, Server } from 'lucide-react';
import type { DeceptionState as DSType } from '@/lib/types';

interface Props {
  state: DSType;
}

export default function DeceptionState({ state }: Props) {
  return (
    <div className="bg-soc-panel border border-soc-border rounded-lg">
      <div className="px-4 py-3 border-b border-soc-border">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-soc-text-secondary">
          Deception State
        </h2>
      </div>
      <div className="p-4 space-y-4">
        {/* Company info */}
        <div>
          <p className="text-sm font-semibold text-soc-accent">{state.company}</p>
          <div className="flex gap-4 mt-1">
            <span className="text-[10px] text-soc-text-muted">{state.environment}</span>
            <span className="text-[10px] text-soc-text-muted">{state.region}</span>
          </div>
        </div>

        {/* Depth */}
        <div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-soc-text-muted uppercase tracking-wider">Deception Depth</span>
            <span className="text-xs font-mono text-soc-text">{state.deceptionDepth} / {state.maxDepth}</span>
          </div>
          <div className="mt-1.5 h-1.5 bg-soc-surface rounded-full overflow-hidden">
            <div
              className="h-full bg-soc-accent rounded-full transition-all duration-500"
              style={{ width: `${(state.deceptionDepth / state.maxDepth) * 100}%` }}
            />
          </div>
        </div>

        {/* Discovered Assets */}
        <div className="space-y-2">
          <p className="text-[10px] text-soc-text-muted uppercase tracking-wider">Discovered Assets</p>
          {state.revealedServices.map(s => (
            <div key={s.id} className="flex items-center gap-2 text-[11px]">
              <Server className="w-3 h-3 text-soc-primary shrink-0" />
              <span className="text-soc-text">{s.name}</span>
              <span className="text-soc-text-muted font-mono ml-auto text-[10px] truncate max-w-32">{s.details}</span>
            </div>
          ))}
          {state.revealedDatabases.map(d => (
            <div key={d.id} className="flex items-center gap-2 text-[11px]">
              <Database className="w-3 h-3 text-soc-info shrink-0" />
              <span className="text-soc-text">{d.name}</span>
              <span className="text-soc-text-muted font-mono ml-auto text-[10px] truncate max-w-32">{d.details}</span>
            </div>
          ))}
          {state.revealedCloudResources.map(c => (
            <div key={c.id} className="flex items-center gap-2 text-[11px]">
              <Cloud className="w-3 h-3 text-soc-accent shrink-0" />
              <span className="text-soc-text">{c.name}</span>
            </div>
          ))}
        </div>

        {/* Employees */}
        {state.revealedEmployees.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] text-soc-text-muted uppercase tracking-wider">Exposed Identities</p>
            {state.revealedEmployees.map(e => (
              <div key={e.id} className="flex items-center gap-2 text-[11px]">
                <Users className="w-3 h-3 text-soc-warning shrink-0" />
                <span className="text-soc-text font-mono">{e.email}</span>
                <span className="text-soc-text-muted text-[10px]">({e.role})</span>
              </div>
            ))}
          </div>
        )}

        {/* Credentials */}
        {state.revealedCredentials.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] text-soc-text-muted uppercase tracking-wider">Canary Credentials</p>
            {state.revealedCredentials.map((c, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px]">
                <Key className="w-3 h-3 text-soc-critical shrink-0" />
                <span className="text-soc-text font-mono">{c.username}</span>
                <span className="text-soc-text-muted text-[10px]">({c.type})</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
