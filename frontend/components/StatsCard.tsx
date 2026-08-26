import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  alert?: boolean;
}

export default function StatsCard({ title, value, subtitle, icon, alert = false }: StatsCardProps) {
  return (
    <div className={`glass-panel p-6 rounded-lg border flex items-start justify-between transition-all ${
      alert ? 'border-[var(--color-cyber-alert)] shadow-[0_0_15px_rgba(255,42,42,0.2)]' : 'border-[var(--color-cyber-border)] hover:border-[var(--color-cyber-primary)]'
    }`}>
      <div>
        <h3 className="font-mono text-sm text-[var(--color-cyber-muted)] uppercase tracking-wider mb-2">
          {title}
        </h3>
        <div className={`text-3xl font-bold font-mono ${alert ? 'text-[var(--color-cyber-alert)] text-glow' : 'text-white'}`}>
          {value}
        </div>
        {subtitle && (
          <div className={`mt-2 text-xs font-mono font-bold ${
            alert ? 'text-[var(--color-cyber-alert)]' : 'text-[var(--color-cyber-primary)]'
          }`}>
            {subtitle}
          </div>
        )}
      </div>
      <div className={`p-3 rounded-lg ${
        alert ? 'bg-[#ff2a2a]/20 text-[var(--color-cyber-alert)]' : 'bg-black/50 text-[var(--color-cyber-muted)]'
      }`}>
        {icon}
      </div>
    </div>
  );
}
