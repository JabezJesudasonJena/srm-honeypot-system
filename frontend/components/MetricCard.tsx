import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  colorClass?: string;
}

export default function MetricCard({ title, value, icon: Icon, trend, trendUp, colorClass = "text-[var(--color-soc-primary)]" }: MetricCardProps) {
  return (
    <div className="bg-[var(--color-soc-panel)] border border-[var(--color-soc-border)] rounded-xl p-5 flex flex-col hover:border-[var(--color-soc-border-light)] transition-colors">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-[var(--color-soc-text-muted)] text-sm font-medium">{title}</h3>
        <div className={`p-2 rounded-lg bg-[var(--color-soc-surface)] border border-[var(--color-soc-border-light)] ${colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      <div className="mt-auto">
        <p className="text-3xl font-bold text-[var(--color-soc-text)]">{value}</p>
        {trend && (
          <p className={`text-xs mt-2 font-medium ${trendUp ? "text-[var(--color-soc-success)]" : "text-[var(--color-soc-critical)]"}`}>
            {trendUp ? "↑" : "↓"} {trend}
          </p>
        )}
      </div>
    </div>
  );
}
