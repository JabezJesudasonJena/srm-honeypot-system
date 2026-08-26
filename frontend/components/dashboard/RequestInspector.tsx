'use client';

import type { RequestEvent } from '@/lib/types';

interface Props {
  event: RequestEvent | null;
  onClose: () => void;
}

export default function RequestInspector({ event, onClose }: Props) {
  if (!event) return null;

  return (
    <div className="bg-soc-panel border border-soc-border rounded-lg">
      <div className="px-4 py-3 border-b border-soc-border flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-soc-text-secondary">
          Request Inspector
        </h2>
        <button onClick={onClose} className="text-soc-text-muted hover:text-soc-text text-xs">✕</button>
      </div>
      <div className="p-4 space-y-3">
        {/* Request */}
        <div>
          <p className="text-[10px] text-soc-text-muted uppercase">Request</p>
          <p className="text-sm font-mono mt-0.5">
            <span className={`font-semibold ${event.method === 'POST' ? 'text-soc-warning' : event.method === 'PUT' ? 'text-soc-accent' : 'text-soc-primary'}`}>
              {event.method}
            </span>{' '}
            <span className="text-soc-text">{event.path}</span>
          </p>
        </div>

        {/* Payload */}
        {event.payload && (
          <div>
            <p className="text-[10px] text-soc-text-muted uppercase">Payload</p>
            <pre className="mt-1 text-[10px] font-mono text-soc-text-secondary bg-soc-surface border border-soc-border rounded-md p-2.5 overflow-x-auto">
              {JSON.stringify(event.payload, null, 2)}
            </pre>
          </div>
        )}

        {/* Intent */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] text-soc-text-muted uppercase">Intent</p>
            <p className="text-[11px] text-soc-warning font-medium mt-0.5">{event.intent}</p>
          </div>
          <div>
            <p className="text-[10px] text-soc-text-muted uppercase">Status Code</p>
            <p className={`text-[11px] font-mono font-semibold mt-0.5 ${event.statusCode >= 400 ? 'text-soc-critical' : 'text-soc-success'}`}>
              {event.statusCode}
            </p>
          </div>
        </div>

        {/* Score + Strategy */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] text-soc-text-muted uppercase">Threat Score</p>
            <p className="text-sm font-mono font-semibold text-soc-critical mt-0.5">+{event.threatScoreDelta}</p>
          </div>
          <div>
            <p className="text-[10px] text-soc-text-muted uppercase">Strategy</p>
            <p className="text-[10px] font-mono text-soc-accent mt-0.5">{event.responseStrategy}</p>
          </div>
        </div>

        {/* Canary */}
        {event.canaryId && (
          <div className="pt-2 border-t border-soc-border">
            <p className="text-[10px] text-soc-text-muted uppercase">Canary</p>
            <p className="text-[11px] font-mono text-soc-critical font-semibold mt-0.5">{event.canaryId}</p>
          </div>
        )}

        {/* Time */}
        <div className="pt-2 border-t border-soc-border">
          <p className="text-[10px] text-soc-text-muted uppercase">Timestamp</p>
          <p className="text-[10px] font-mono text-soc-text-secondary mt-0.5">
            {new Date(event.timestamp).toLocaleString('en-US', { hour12: false })}
          </p>
        </div>
      </div>
    </div>
  );
}
