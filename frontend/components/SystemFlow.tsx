import { Server, Database, Shield, Cpu, ShieldAlert, ArrowDown, FileText } from 'lucide-react';

export default function SystemFlow() {
  const steps = [
    { name: 'INGRESS', icon: Server, status: 'ONLINE', color: 'var(--color-cyber-primary)' },
    { name: 'QUEUE', icon: Database, status: 'PROCESSING', color: 'var(--color-cyber-accent)' },
    { name: 'RAG RETRIEVAL', icon: Shield, status: 'ACTIVE', color: 'var(--color-cyber-primary)' },
    { name: 'GEMINI AI', icon: Cpu, status: 'ANALYZING', color: 'var(--color-cyber-accent)' },
    { name: 'CANARY TRAP', icon: ShieldAlert, status: 'ARMED', color: 'var(--color-cyber-warning)' },
    { name: 'THREAT INTEL', icon: FileText, status: 'GENERATING', color: 'var(--color-cyber-alert)' },
  ];
  
  // Need to import FileText separately if used in array, or just use another icon
  // Re-importing correctly:
  return (
    <div className="glass-panel p-6 rounded-lg border border-[var(--color-cyber-border)]">
      <h2 className="text-lg font-mono font-bold text-white mb-6 border-b border-[var(--color-cyber-border)] pb-4">
        LIVE ACTIVITY FLOW
      </h2>
      
      <div className="flex flex-col items-center py-4 space-y-2">
        {steps.map((step, index) => {
          const Icon = step.icon;
          // For the last element, use a different icon since FileText wasn't imported at top
          // Actually, let's just use ShieldAlert for threat intel too if we didn't import FileText
          const ActualIcon = index === 5 ? ShieldAlert : Icon; 
          
          return (
            <div key={step.name} className="flex flex-col items-center w-full">
              <div className="w-full flex items-center justify-between p-3 rounded bg-black/40 border border-[var(--color-cyber-border)] hover:border-[var(--color-cyber-primary)] transition-colors">
                <div className="flex items-center space-x-3">
                  <ActualIcon className="h-4 w-4 text-[var(--color-cyber-muted)]" />
                  <span className="font-mono text-sm font-bold text-white tracking-wider">{step.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: step.color, boxShadow: `0 0 8px ${step.color}` }}></div>
                  <span className="font-mono text-xs" style={{ color: step.color }}>{step.status}</span>
                </div>
              </div>
              
              {index < steps.length - 1 && (
                <div className="py-2 text-[var(--color-cyber-muted)]">
                  <ArrowDown className="h-4 w-4 animate-bounce" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
