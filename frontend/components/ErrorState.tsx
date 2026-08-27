import { AlertTriangle } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({ 
  title = "System Error", 
  message = "Failed to communicate with Labyrinth API.", 
  onRetry 
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 h-full w-full bg-red-900/10 rounded-xl border border-red-500/20 min-h-[300px]">
      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-red-400 font-bold mb-2 font-mono tracking-wide">{title}</h3>
      <p className="text-[var(--color-soc-text-secondary)] text-sm mb-6 text-center max-w-md">{message}</p>
      
      {onRetry && (
        <button 
          onClick={onRetry}
          className="px-4 py-2 bg-[var(--color-soc-surface)] border border-[var(--color-soc-border)] hover:border-red-500/50 rounded text-sm text-[var(--color-soc-text)] transition-colors"
        >
          RETRY CONNECTION
        </button>
      )}
    </div>
  );
}
