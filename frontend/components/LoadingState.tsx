import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = "Connecting to SOC API..." }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 h-full w-full bg-[var(--color-soc-surface)]/50 rounded-xl border border-[var(--color-soc-border-light)] border-dashed min-h-[300px]">
      <Loader2 className="w-8 h-8 text-[var(--color-soc-primary)] animate-spin mb-4" />
      <p className="text-[var(--color-soc-text-secondary)] font-mono text-sm tracking-wide">{message}</p>
    </div>
  );
}
