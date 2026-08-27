'use client';

import type { DeceptionGraph as GraphType } from '@/lib/types';

const groupColors: Record<string, { fill: string; stroke: string; text: string }> = {
  company:    { fill: '#1e293b', stroke: '#3b82f6', text: '#e2e8f0' },
  service:    { fill: '#0c1219', stroke: '#6366f1', text: '#a5b4fc' },
  database:   { fill: '#0c1219', stroke: '#22d3ee', text: '#67e8f9' },
  cloud:      { fill: '#0c1219', stroke: '#f59e0b', text: '#fcd34d' },
  employee:   { fill: '#0c1219', stroke: '#22c55e', text: '#86efac' },
  credential: { fill: '#0c1219', stroke: '#ef4444', text: '#fca5a5' },
  canary:     { fill: '#1a0505', stroke: '#ef4444', text: '#ef4444' },
};

interface Props {
  graph: GraphType;
}

export default function DeceptionGraph({ graph }: Props) {
  return (
    <div className="bg-soc-panel border border-soc-border rounded-lg">
      <div className="px-4 py-3 border-b border-soc-border">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-soc-text-secondary">
          Deception Graph
        </h2>
      </div>
      <div className="p-2">
        <svg viewBox="0 0 600 460" className="w-full h-auto" style={{ maxHeight: '360px' }}>
          {/* Edges */}
          {graph.edges.map((edge, i) => {
            const from = graph.nodes.find(n => n.id === edge.from);
            const to = graph.nodes.find(n => n.id === edge.to);
            if (!from || !to) return null;
            const bothDiscovered = from.discovered && to.discovered;
            return (
              <line
                key={i}
                x1={from.x}
                y1={from.y + 16}
                x2={to.x}
                y2={to.y - 10}
                stroke={bothDiscovered ? '#3b82f6' : '#1c2a38'}
                strokeWidth={bothDiscovered ? 1.5 : 1}
                strokeDasharray={bothDiscovered ? undefined : '4 4'}
                opacity={bothDiscovered ? 0.6 : 0.3}
              />
            );
          })}
          {/* Nodes */}
          {graph.nodes.map((node) => {
            const colors = groupColors[node.group] || groupColors.service;
            const opacity = node.discovered ? 1 : 0.25;
            return (
              <g key={node.id} opacity={opacity}>
                <rect
                  x={node.x - 50}
                  y={node.y - 12}
                  width={100}
                  height={28}
                  rx={4}
                  fill={colors.fill}
                  stroke={colors.stroke}
                  strokeWidth={node.discovered ? 1.5 : 0.5}
                />
                <text
                  x={node.x}
                  y={node.y + 4}
                  textAnchor="middle"
                  fill={colors.text}
                  fontSize={9}
                  fontFamily="var(--font-mono)"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="px-4 pb-3 flex flex-wrap gap-3">
        {['company', 'service', 'database', 'cloud', 'canary'].map(group => (
          <div key={group} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: groupColors[group]?.stroke }} />
            <span className="text-[9px] text-soc-text-muted uppercase">{group}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
