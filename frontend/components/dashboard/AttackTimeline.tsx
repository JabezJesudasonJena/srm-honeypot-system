'use client';

import type { TimelineEvent } from '@/lib/types';

const eventColors: Record<string, string> = {
  SESSION_CREATED: 'border-soc-text-muted bg-soc-text-muted',
  RECON: 'border-soc-primary bg-soc-primary',
  ENUMERATION: 'border-soc-info bg-soc-info',
  CREDENTIAL_DISCOVERY: 'border-soc-warning bg-soc-warning',
  CLOUD_DISCOVERY: 'border-soc-accent bg-soc-accent',
  DATABASE_DISCOVERY: 'border-soc-info bg-soc-info',
  ADMIN_DISCOVERY: 'border-soc-warning bg-soc-warning',
  CANARY_EXPOSURE: 'border-soc-warning bg-soc-warning',
  CANARY_REUSE: 'border-soc-critical bg-soc-critical',
  PRIVILEGE_ESCALATION: 'border-soc-critical bg-soc-critical',
  ALERT: 'border-soc-critical bg-soc-critical',
  REQUEST_PROCESSED: 'border-soc-text-muted bg-soc-text-muted',
  THREAT_SCORE_CHANGED: 'border-soc-warning bg-soc-warning',
};

const eventLabels: Record<string, string> = {
  SESSION_CREATED: 'SESSION',
  RECON: 'RECON',
  ENUMERATION: 'ENUM',
  CREDENTIAL_DISCOVERY: 'CRED DISCOVERY',
  CLOUD_DISCOVERY: 'CLOUD',
  DATABASE_DISCOVERY: 'DATABASE',
  ADMIN_DISCOVERY: 'ADMIN',
  CANARY_EXPOSURE: 'CANARY EXPOSED',
  CANARY_REUSE: 'CANARY REUSED',
  PRIVILEGE_ESCALATION: 'PRIV ESC',
  ALERT: 'ALERT',
  REQUEST_PROCESSED: 'REQUEST',
  THREAT_SCORE_CHANGED: 'SCORE Δ',
};

interface Props {
  events: TimelineEvent[];
  compact?: boolean;
}

export default function AttackTimeline({ events, compact = false }: Props) {
  const displayed = compact ? events.slice(-8) : events;

  return (
    <div className="bg-soc-panel border border-soc-border rounded-lg">
      <div className="px-4 py-3 border-b border-soc-border">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-soc-text-secondary">
          Attack Timeline
        </h2>
      </div>
      <div className={`px-4 py-3 space-y-0 ${compact ? 'max-h-80 overflow-y-auto' : ''}`}>
        {displayed.map((event, i) => {
          const color = eventColors[event.eventType] || 'border-soc-text-muted bg-soc-text-muted';
          const dotColor = color.split(' ')[1] || 'bg-soc-text-muted';
          const isLast = i === displayed.length - 1;
          const time = new Date(event.timestamp).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

          return (
            <div key={event.id} className="flex gap-3">
              {/* Timeline bar */}
              <div className="flex flex-col items-center w-6 shrink-0">
                <div className={`w-2.5 h-2.5 rounded-full ${dotColor} shrink-0 mt-1 ring-2 ring-soc-bg`} />
                {!isLast && <div className="w-px flex-1 bg-soc-border min-h-[20px]" />}
              </div>
              {/* Content */}
              <div className="pb-4 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono text-soc-text-muted">{time}</span>
                  <span className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${color.split(' ')[0]} border bg-opacity-15`} style={{ backgroundColor: 'transparent', borderColor: 'currentColor', opacity: 0.9 }}>
                    {eventLabels[event.eventType] || event.eventType}
                  </span>
                </div>
                <p className="text-[11px] text-soc-text-secondary mt-0.5 truncate">{event.details}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
