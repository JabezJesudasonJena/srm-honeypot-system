import { ShieldAlert } from 'lucide-react';

interface AlertData {
  active: boolean;
  credential: string;
  ip: string;
  action: string;
}

interface CanaryAlertProps {
  alert: AlertData | null;
}

export default function CanaryAlert({ alert }: CanaryAlertProps) {
  if (!alert || !alert.active) return null;

  return (
    <div className="w-full bg-[#1a0505] border-2 border-[var(--color-cyber-alert)] rounded-lg p-6 mb-8 alert-glow relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-cyber-alert)] opacity-10 rounded-full blur-3xl"></div>
      
      <div className="flex items-start space-x-4 relative z-10">
        <div className="bg-[#ff2a2a]/20 p-3 rounded-full">
          <ShieldAlert className="h-8 w-8 text-[var(--color-cyber-alert)] animate-pulse" />
        </div>
        
        <div className="flex-1">
          <h2 className="text-2xl font-mono font-bold text-[var(--color-cyber-alert)] mb-2 flex items-center">
            🚨 BREACH DETECTED
          </h2>
          <h3 className="text-xl font-mono text-white mb-4">CANARY CREDENTIAL ACTIVATED</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-sm bg-black/50 p-4 rounded-lg border border-[#ff2a2a]/30">
            <div>
              <div className="text-[var(--color-cyber-muted)] mb-1">Attacker attempted to use:</div>
              <div className="text-[#ffb300] font-bold">{alert.credential}</div>
            </div>
            <div>
              <div className="text-[var(--color-cyber-muted)] mb-1">Source IP:</div>
              <div className="text-[var(--color-cyber-accent)] font-bold">{alert.ip}</div>
            </div>
            <div>
              <div className="text-[var(--color-cyber-muted)] mb-1">Action:</div>
              <div className="text-white">{alert.action}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
