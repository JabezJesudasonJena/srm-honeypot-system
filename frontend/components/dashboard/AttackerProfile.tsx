'use client';

import type { AttackerProfile as ProfileType, ThreatSeverity } from '@/lib/types';

interface Props {
  sessionId: string;
  profile: ProfileType;
  requestCount: number;
  uniqueEndpoints: number;
  duration: string;
  severity: ThreatSeverity;
  threatScore: number;
}

function BehaviorBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] text-soc-text-muted w-28 shrink-0 truncate">{label}</span>
      <div className="flex-1 h-1.5 bg-soc-surface rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${value}%`,
            backgroundColor: value > 80 ? 'var(--color-soc-critical)' : value > 50 ? 'var(--color-soc-warning)' : 'var(--color-soc-primary)',
          }}
        />
      </div>
      <span className="text-[10px] font-mono text-soc-text-secondary w-8 text-right">{value}%</span>
    </div>
  );
}

export default function AttackerProfile({ sessionId, profile, requestCount, uniqueEndpoints, duration, severity, threatScore }: Props) {
  const sevColor: Record<ThreatSeverity, string> = {
    CRITICAL: 'text-soc-critical', HIGH: 'text-soc-warning', MEDIUM: 'text-soc-primary',
    LOW: 'text-soc-success', INFO: 'text-soc-text-muted',
  };

  return (
    <div className="bg-soc-panel border border-soc-border rounded-lg">
      <div className="px-4 py-3 border-b border-soc-border">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-soc-text-secondary">
          Attacker Profile
        </h2>
      </div>
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] text-soc-text-muted">Session</p>
            <p className="text-sm font-mono text-soc-accent">#{sessionId.substring(0, 8)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-soc-text-muted">Threat Score</p>
            <p className={`text-2xl font-bold font-mono ${sevColor[severity]}`}>{threatScore}</p>
          </div>
        </div>

        {/* Classification */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] text-soc-text-muted uppercase">Classification</p>
            <p className="text-sm font-medium text-soc-text">{profile.attackerType}</p>
          </div>
          <div>
            <p className="text-[10px] text-soc-text-muted uppercase">Confidence</p>
            <p className="text-sm font-mono text-soc-text">{profile.confidence}%</p>
          </div>
          <div>
            <p className="text-[10px] text-soc-text-muted uppercase">Automation</p>
            <p className="text-sm font-mono text-soc-text">{profile.automationProbability}%</p>
          </div>
          <div>
            <p className="text-[10px] text-soc-text-muted uppercase">Current Threat</p>
            <p className={`text-sm font-semibold ${sevColor[severity]}`}>{severity}</p>
          </div>
        </div>

        {/* Behaviors */}
        <div className="space-y-2">
          <p className="text-[10px] text-soc-text-muted uppercase tracking-wider">Behavior Analysis</p>
          <BehaviorBar label="Reconnaissance" value={profile.behaviors.reconnaissance} />
          <BehaviorBar label="Enumeration" value={profile.behaviors.enumeration} />
          <BehaviorBar label="Credential Hunting" value={profile.behaviors.credentialHunting} />
          <BehaviorBar label="Exploitation" value={profile.behaviors.exploitation} />
          <BehaviorBar label="Privilege Escalation" value={profile.behaviors.privilegeEscalation} />
          <BehaviorBar label="Cloud Discovery" value={profile.behaviors.cloudDiscovery} />
          <BehaviorBar label="Database Discovery" value={profile.behaviors.databaseDiscovery} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 pt-2 border-t border-soc-border">
          <div className="text-center">
            <p className="text-lg font-mono font-semibold text-soc-text">{requestCount}</p>
            <p className="text-[9px] text-soc-text-muted uppercase">Requests</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-mono font-semibold text-soc-text">{uniqueEndpoints}</p>
            <p className="text-[9px] text-soc-text-muted uppercase">Endpoints</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-mono font-semibold text-soc-text">{duration}</p>
            <p className="text-[9px] text-soc-text-muted uppercase">Duration</p>
          </div>
        </div>
      </div>
    </div>
  );
}
