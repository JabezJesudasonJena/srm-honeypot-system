import { SessionInfo } from "@/lib/types";
import ThreatBadge from "./ThreatBadge";
import Link from "next/link";
import { ChevronRight, ShieldAlert, Clock, Activity, Target } from "lucide-react";

interface AttackTableProps {
  attacks: SessionInfo[];
}

export default function AttackTable({ attacks }: AttackTableProps) {
  if (attacks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-[var(--color-soc-surface)] rounded-xl border border-[var(--color-soc-border-light)] border-dashed">
        <ShieldAlert className="w-10 h-10 text-[var(--color-soc-text-muted)] mb-4 opacity-50" />
        <p className="text-[var(--color-soc-text-secondary)]">No active threats detected.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto bg-[var(--color-soc-panel)] border border-[var(--color-soc-border)] rounded-xl">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-[var(--color-soc-text-muted)] uppercase bg-[var(--color-soc-surface)] border-b border-[var(--color-soc-border)]">
          <tr>
            <th scope="col" className="px-6 py-4">Session ID</th>
            <th scope="col" className="px-6 py-4">Severity</th>
            <th scope="col" className="px-6 py-4">Intent</th>
            <th scope="col" className="px-6 py-4 hidden md:table-cell">Score</th>
            <th scope="col" className="px-6 py-4 hidden lg:table-cell">Requests</th>
            <th scope="col" className="px-6 py-4 hidden md:table-cell">Last Activity</th>
            <th scope="col" className="px-6 py-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-soc-border-light)]">
          {attacks.map((attack) => (
            <tr key={attack.id} className="hover:bg-[var(--color-soc-surface)] transition-colors group">
              <td className="px-6 py-4 font-mono font-medium text-[var(--color-soc-text)]">
                {attack.id.substring(0, 8)}...
              </td>
              <td className="px-6 py-4">
                <ThreatBadge severity={attack.severity} />
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-[var(--color-soc-text-muted)]" />
                  <span>{attack.currentIntent || "Unknown"}</span>
                </div>
              </td>
              <td className="px-6 py-4 hidden md:table-cell font-mono">
                {attack.threatScore.toFixed(1)}
              </td>
              <td className="px-6 py-4 hidden lg:table-cell">
                <div className="flex items-center gap-2 text-[var(--color-soc-text-secondary)]">
                  <Activity className="w-4 h-4" />
                  {attack.requestCount}
                </div>
              </td>
              <td className="px-6 py-4 hidden md:table-cell text-[var(--color-soc-text-secondary)]">
                <div className="flex items-center gap-2 text-xs">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(attack.lastActivity).toLocaleTimeString()}
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <Link 
                  href={`/attacks/${attack.id}`}
                  className="inline-flex items-center justify-center p-2 rounded-lg bg-[var(--color-soc-primary)]/10 text-[var(--color-soc-primary)] hover:bg-[var(--color-soc-primary)]/20 transition-colors border border-[var(--color-soc-primary)]/20 group-hover:border-[var(--color-soc-primary)]/50"
                >
                  <span className="sr-only">View Details</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
