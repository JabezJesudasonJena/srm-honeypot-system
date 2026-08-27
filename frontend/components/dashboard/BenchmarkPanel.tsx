'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import type { BenchmarkData } from '@/lib/types';

export default function BenchmarkPanel() {
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkData[]>([]);

  useEffect(() => {
    api.getBenchmark().then(setBenchmarkData).catch(console.error);
    const interval = setInterval(() => api.getBenchmark().then(setBenchmarkData).catch(console.error), 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-soc-panel border border-soc-border rounded-lg">
      <div className="px-4 py-3 border-b border-soc-border">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-soc-text-secondary">
          Static Honeypot vs Cyber Deception Engine
        </h2>
      </div>
      <div className="p-4">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-soc-text-muted border-b border-soc-border">
              <th className="pb-2 font-medium">Metric</th>
              <th className="pb-2 font-medium text-right">Static</th>
              <th className="pb-2 font-medium text-right">Labyrinth</th>
            </tr>
          </thead>
          <tbody>
            {benchmarkData.map(({ metric, static: s, labyrinth: l }) => {
              const lNum = typeof l === 'number' ? l : 0;
              const sNum = typeof s === 'number' ? s : 0;
              const better = lNum > sNum || (typeof l === 'string' && typeof s === 'string' && l !== 'N/A');
              return (
                <tr key={metric} className="border-b border-soc-border/50">
                  <td className="py-2.5 text-soc-text-secondary">{metric}</td>
                  <td className="py-2.5 text-right font-mono text-soc-text-muted">{String(s)}</td>
                  <td className={`py-2.5 text-right font-mono font-semibold ${better ? 'text-soc-accent' : 'text-soc-text'}`}>
                    {String(l)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Visual bars */}
        <div className="mt-4 space-y-2">
          <p className="text-[10px] text-soc-text-muted uppercase tracking-wider">Engagement Comparison</p>
          <div className="space-y-1.5">
            <div>
              <div className="flex justify-between text-[10px] mb-0.5">
                <span className="text-soc-text-muted">Static</span>
                <span className="font-mono text-soc-text-muted">42s</span>
              </div>
              <div className="h-2 bg-soc-surface rounded-full overflow-hidden">
                <div className="h-full bg-soc-text-muted/40 rounded-full" style={{ width: '9%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] mb-0.5">
                <span className="text-soc-accent">Labyrinth</span>
                <span className="font-mono text-soc-accent">7m 31s</span>
              </div>
              <div className="h-2 bg-soc-surface rounded-full overflow-hidden">
                <div className="h-full bg-soc-accent rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
