import { Shield, AlertTriangle, Info, Zap } from "lucide-react";

type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

interface ThreatBadgeProps {
  severity: Severity;
  className?: string;
}

export default function ThreatBadge({ severity, className = "" }: ThreatBadgeProps) {
  const config = {
    LOW: { color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", icon: Info },
    MEDIUM: { color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", icon: Shield },
    HIGH: { color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", icon: Zap },
    CRITICAL: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30", icon: AlertTriangle, glow: "alert-glow" },
  };

  const { color, bg, border, icon: Icon, glow } = config[severity];

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold font-mono tracking-wide ${bg} ${color} border ${border} ${glow || ""} ${className}`}>
      <Icon className="w-3.5 h-3.5" />
      {severity}
    </div>
  );
}
