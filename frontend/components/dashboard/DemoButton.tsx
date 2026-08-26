'use client';

import { useState, useCallback } from 'react';
import { Play, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface Props {
  onEvent?: () => void;
}

export default function DemoButton({ onEvent }: Props) {
  const [running, setRunning] = useState(false);

  const runDemo = useCallback(async () => {
    if (running) return;
    setRunning(true);
    
    try {
      await api.resetSystem();
      if (onEvent) onEvent();
    } catch (err) {
      console.error('Failed to reset system', err);
    }

    // Brief delay for UX
    setTimeout(() => setRunning(false), 800);
  }, [running, onEvent]);

  return (
    <div className="space-y-2">
      <button
        onClick={runDemo}
        disabled={running}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium transition-all ${
          running
            ? 'bg-soc-critical/20 text-soc-critical border border-soc-critical/30 cursor-not-allowed'
            : 'bg-soc-primary/10 text-soc-primary border border-soc-primary/30 hover:bg-soc-primary/20'
        }`}
      >
        {running ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Resetting Environment...
          </>
        ) : (
          <>
            <Play className="w-3.5 h-3.5" />
            Start Demo Attack
          </>
        )}
      </button>
    </div>
  );
}
