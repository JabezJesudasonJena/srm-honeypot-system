'use client';

import { FileText } from 'lucide-react';
import type { ThreatIntelligence as TIType, ThreatSeverity } from '@/lib/types';

interface Props {
  intel: TIType;
}

export default function ThreatIntelligence({ intel }: Props) {
  const sevColor: Record<ThreatSeverity, string> = {
    CRITICAL: 'text-soc-critical bg-soc-critical/10 border-soc-critical/30',
    HIGH: 'text-soc-warning bg-soc-warning/10 border-soc-warning/30',
    MEDIUM: 'text-soc-primary bg-soc-primary/10 border-soc-primary/30',
    LOW: 'text-soc-success bg-soc-success/10 border-soc-success/30',
    INFO: 'text-soc-text-muted bg-soc-surface border-soc-border',
  };

  return (
    <div className="bg-soc-panel border border-soc-border rounded-lg">
      <div className="px-4 py-3 border-b border-soc-border">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-soc-text-secondary">
          Threat Intelligence
        </h2>
      </div>
      <div className="p-4 space-y-3">
        <div>
          <p className="text-[10px] text-soc-text-muted uppercase">Attacker Objective</p>
          <p className="text-sm text-soc-text mt-0.5">{intel.attackerObjective}</p>
        </div>

        <div>
          <p className="text-[10px] text-soc-text-muted uppercase">Threat Level</p>
          <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded border mt-1 ${sevColor[intel.threatLevel]}`}>
            {intel.threatLevel}
          </span>
        </div>

        <div>
          <p className="text-[10px] text-soc-text-muted uppercase">Likely Attack Type</p>
          <p className="text-[11px] text-soc-text-secondary mt-0.5">{intel.likelyAttackType}</p>
        </div>

        <div>
          <p className="text-[10px] text-soc-text-muted uppercase mb-1">Observed Techniques</p>
          <div className="flex flex-wrap gap-1.5">
            {intel.observedTechniques.map((t, i) => (
              <span key={i} className="text-[9px] px-2 py-0.5 rounded bg-soc-surface border border-soc-border text-soc-text-secondary">
                {t}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] text-soc-text-muted uppercase">Confidence</p>
          <p className="text-sm font-mono text-soc-text mt-0.5">{intel.confidence}%</p>
        </div>

        {intel.executiveSummary && (
          <div className="pt-2 border-t border-soc-border">
            <p className="text-[10px] text-soc-text-muted uppercase mb-1">Executive Summary</p>
            <p className="text-[11px] text-soc-text-secondary leading-relaxed">{intel.executiveSummary}</p>
          </div>
        )}

        <button className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-soc-surface border border-soc-border text-soc-text-secondary text-xs hover:bg-soc-panel hover:text-soc-text transition-colors">
          <FileText className="w-3.5 h-3.5" />
          Generate Full Report
        </button>
      </div>
    </div>
  );
}
