import { AttackTimelineEvent } from "@/lib/types";
import { Circle, Target, Activity, ShieldAlert, Key, AlertTriangle, GitCommit } from "lucide-react";

interface TimelineProps {
  events: AttackTimelineEvent[];
}

export default function Timeline({ events }: TimelineProps) {
  if (!events || events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 h-full w-full bg-[var(--color-soc-surface)] rounded-xl border border-[var(--color-soc-border-light)] border-dashed">
        <Activity className="w-8 h-8 text-[var(--color-soc-text-muted)] mb-4 opacity-50" />
        <p className="text-[var(--color-soc-text-secondary)] text-sm">No timeline events recorded yet.</p>
      </div>
    );
  }

  const getEventIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'RECONNAISSANCE': return <Target className="w-5 h-5 text-blue-400" />;
      case 'ENUMERATION': return <Activity className="w-5 h-5 text-yellow-400" />;
      case 'CREDENTIAL_DISCOVERY': return <Key className="w-5 h-5 text-orange-400" />;
      case 'CANARY_ISSUED': return <GitCommit className="w-5 h-5 text-purple-400" />;
      case 'CANARY_REUSE': return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'PRIVILEGE_ESCALATION': return <ShieldAlert className="w-5 h-5 text-red-500" />;
      default: return <Circle className="w-5 h-5 text-[var(--color-soc-text-muted)]" />;
    }
  };

  return (
    <div className="relative pl-6 py-6 border-l-2 border-[var(--color-soc-border-light)] ml-6 space-y-8">
      {events.map((event, index) => (
        <div key={event.id || index} className="relative">
          <div className="absolute -left-[35px] bg-[var(--color-soc-panel)] p-1 rounded-full border-2 border-[var(--color-soc-border)]">
            {getEventIcon(event.type)}
          </div>
          <div className="bg-[var(--color-soc-surface)] border border-[var(--color-soc-border-light)] rounded-lg p-4 ml-4">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-[var(--color-soc-text)] uppercase tracking-wide text-sm">{event.type.replace(/_/g, ' ')}</h4>
              <span className="text-xs font-mono text-[var(--color-soc-text-muted)]">
                {new Date(event.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <p className="text-sm text-[var(--color-soc-text-secondary)]">{event.description}</p>
            {event.details && Object.keys(event.details).length > 0 && (
              <div className="mt-3 bg-[var(--color-soc-panel)] p-2 rounded border border-[var(--color-soc-border-light)]">
                <pre className="text-xs font-mono text-[var(--color-soc-primary)] overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(event.details, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
