"use client";

import { useRealtimeEvents } from "@/hooks/useRealtimeEvents";
import { Activity, ShieldCheck, Wifi, WifiOff } from "lucide-react";

export default function Header() {
  const { isConnected } = useRealtimeEvents();

  return (
    <header className="h-16 bg-[var(--color-soc-surface)] border-b border-[var(--color-soc-border)] flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-mono bg-green-500/10 text-green-400 px-3 py-1.5 rounded-full border border-green-500/20">
          <ShieldCheck className="w-4 h-4" />
          <span>SYSTEM OPERATIONAL</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className={`flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-full border ${
          isConnected 
            ? "bg-[var(--color-soc-accent)]/10 text-[var(--color-soc-accent)] border-[var(--color-soc-accent)]/20" 
            : "bg-red-500/10 text-red-400 border-red-500/20"
        }`}>
          {isConnected ? (
            <>
              <Wifi className="w-4 h-4 animate-pulse" />
              <span>LIVE SSE CONNECTED</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4" />
              <span>SSE DISCONNECTED</span>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
