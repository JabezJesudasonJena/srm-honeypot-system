'use client';

import type { AIDecision } from '@/lib/types';

interface Props {
  decision: AIDecision | null;
}

export default function DeceptionDecision({ decision }: Props) {
  if (!decision) {
    return (
      <div className="bg-soc-panel border border-soc-border rounded-lg">
        <div className="px-4 py-3 border-b border-soc-border">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-soc-text-secondary">
            Deception Decision
          </h2>
        </div>
        <div className="p-4 text-center text-[11px] text-soc-text-muted py-8">
          No AI decisions recorded for this session
        </div>
      </div>
    );
  }

  return (
    <div className="bg-soc-panel border border-soc-border rounded-lg">
      <div className="px-4 py-3 border-b border-soc-border">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-soc-text-secondary">
          Deception Decision
        </h2>
      </div>
      <div className="p-4 space-y-3">
        {/* Intent */}
        <div>
          <p className="text-[10px] text-soc-text-muted uppercase">Detected Intent</p>
          <p className="text-sm font-semibold text-soc-warning mt-0.5">{decision.intent}</p>
        </div>

        {/* Confidence */}
        <div>
          <p className="text-[10px] text-soc-text-muted uppercase">Confidence</p>
          <p className="text-sm font-mono text-soc-text mt-0.5">{decision.confidence}%</p>
        </div>

        {/* Evidence */}
        <div>
          <p className="text-[10px] text-soc-text-muted uppercase mb-1">Evidence</p>
          <ul className="space-y-1">
            {decision.evidence.map((e, i) => (
              <li key={i} className="text-[11px] text-soc-text-secondary flex items-start gap-1.5">
                <span className="text-soc-text-muted mt-0.5">•</span>
                <span>{e}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Context */}
        <div>
          <p className="text-[10px] text-soc-text-muted uppercase">Retrieved Context</p>
          <p className="text-[11px] text-soc-text-secondary mt-0.5 font-mono">{decision.retrievedContext}</p>
        </div>

        {/* Strategy */}
        <div className="pt-2 border-t border-soc-border">
          <p className="text-[10px] text-soc-text-muted uppercase">Selected Strategy</p>
          <p className="text-sm font-mono font-semibold text-soc-accent mt-0.5">{decision.selectedStrategy}</p>
        </div>

        {/* Canary + Provider */}
        <div className="flex gap-4">
          {decision.canaryId && (
            <div>
              <p className="text-[10px] text-soc-text-muted uppercase">Canary</p>
              <p className="text-[11px] font-mono text-soc-critical mt-0.5">{decision.canaryId}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] text-soc-text-muted uppercase">Provider</p>
            <p className="text-[11px] font-mono text-soc-text-secondary mt-0.5">{decision.provider}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
