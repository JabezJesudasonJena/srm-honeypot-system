'use client';

import Link from 'next/link';
import type { ThreatSeverity, AttackSession } from '@/lib/types';

function SeverityBadge({ severity }: { severity: ThreatSeverity }) {
  const styles: Record<ThreatSeverity, string> = {
    CRITICAL: 'bg-soc-critical/15 text-soc-critical border-soc-critical/30',
    HIGH: 'bg-soc-warning/15 text-soc-warning border-soc-warning/30',
    MEDIUM: 'bg-soc-primary/15 text-soc-primary border-soc-primary/30',
    LOW: 'bg-soc-success/15 text-soc-success border-soc-success/30',
    INFO: 'bg-soc-text-muted/15 text-soc-text-muted border-soc-text-muted/30',
  };
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${styles[severity] || styles.INFO}`}>
      {severity}
    </span>
  );
}

export default function ActiveAttacks({ sessions = [] }: { sessions?: AttackSession[] }) {
  return (
    <div className="bg-soc-panel border border-soc-border rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-soc-border flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-soc-text-secondary">
          Active Attacks
        </h2>
        <span className="text-[10px] text-soc-text-muted">{sessions.length} sessions</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-soc-text-muted border-b border-soc-border">
              <th className="px-4 py-2.5 font-medium">Session</th>
              <th className="px-4 py-2.5 font-medium">Attacker Type</th>
              <th className="px-4 py-2.5 font-medium">Threat</th>
              <th className="px-4 py-2.5 font-medium">Score</th>
              <th className="px-4 py-2.5 font-medium hidden md:table-cell">Requests</th>
              <th className="px-4 py-2.5 font-medium hidden lg:table-cell">Duration</th>
              <th className="px-4 py-2.5 font-medium hidden lg:table-cell">Strategy</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <Link
                key={s.sessionId}
                href={`/dashboard/sessions/${s.sessionId}`}
                className="contents"
              >
                <tr className="border-b border-soc-border/50 hover:bg-soc-surface/80 cursor-pointer transition-colors">
                  <td className="px-4 py-3 font-mono text-soc-accent">
                    #{s.sessionId.substring(0, 4).toUpperCase()}
                  </td>
                  <td className="px-4 py-3 text-soc-text">{s.attackerProfile.attackerType}</td>
                  <td className="px-4 py-3"><SeverityBadge severity={s.severity} /></td>
                  <td className="px-4 py-3 font-mono font-semibold text-soc-text">{s.threatScore}</td>
                  <td className="px-4 py-3 text-soc-text-secondary font-mono hidden md:table-cell">
                    {s.requestCount}
                  </td>
                  <td className="px-4 py-3 text-soc-text-secondary hidden lg:table-cell">{s.duration}</td>
                  <td className="px-4 py-3 text-soc-text-muted text-[10px] font-mono hidden lg:table-cell">
                    {s.currentStrategy}
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-soc-success" style={{ animation: 'pulse-live 2s ease-in-out infinite' }} />
                      <span className="text-soc-success text-[10px] uppercase font-medium">{s.status}</span>
                    </span>
                  </td>
                </tr>
              </Link>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
