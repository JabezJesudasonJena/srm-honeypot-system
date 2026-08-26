import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = "Processing request..." }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative">
        <Loader2 className="h-10 w-10 text-[var(--color-cyber-primary)] animate-spin" />
        <div className="absolute inset-0 h-10 w-10 border-2 border-[var(--color-cyber-primary)] rounded-full border-t-transparent animate-[spin_2s_linear_infinite] opacity-30"></div>
      </div>
      <p className="font-mono text-sm text-[var(--color-cyber-primary)] animate-pulse">
        {message}
      </p>
    </div>
  );
}
