"use client";

import { Bot, Sparkles, AlertCircle, Clock, ShieldAlert } from "lucide-react";

export default function Chatbot() {
  const quickActions = [
    { text: "Explain this attack", icon: ShieldAlert },
    { text: "Why is this threat critical?", icon: AlertCircle },
    { text: "What triggered the canary?", icon: Sparkles },
    { text: "Explain the timeline", icon: Clock },
    { text: "How does the AI pipeline work?", icon: Bot },
  ];

  return (
    <aside className="w-80 bg-[var(--color-soc-panel)] border-l border-[var(--color-soc-border)] hidden xl:flex flex-col h-screen shrink-0">
      <div className="p-4 border-b border-[var(--color-soc-border)] flex items-center gap-3">
        <div className="bg-purple-500/20 p-2 rounded-lg border border-purple-500/30">
          <Bot className="text-purple-400 w-5 h-5" />
        </div>
        <div>
          <h2 className="font-bold text-sm tracking-wide text-[var(--color-soc-text)]">LABYRINTH AI ASSISTANT</h2>
          <p className="text-xs text-[var(--color-soc-text-muted)]">SOC Analysis Assistant</p>
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
        <div className="bg-[var(--color-soc-surface)] p-3 rounded-lg border border-[var(--color-soc-border-light)] text-sm text-[var(--color-soc-text-secondary)]">
          <p className="mb-2"><span className="text-[var(--color-soc-primary)] font-medium">System:</span> Hello, Analyst. I can help explain ongoing attacks, analyze intent, and summarize threat intelligence.</p>
          <div className="bg-yellow-500/10 border border-yellow-500/20 p-2 rounded mt-2 text-xs text-yellow-500 flex gap-2 items-start">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p><strong>Note:</strong> Attacker-facing responses are deterministic. AI enrichment runs asynchronously to provide this context.</p>
          </div>
        </div>
        
        <div className="mt-auto">
          <p className="text-xs text-[var(--color-soc-text-muted)] mb-2 font-medium uppercase tracking-wider">Quick Actions</p>
          <div className="flex flex-col gap-2">
            {quickActions.map((action, i) => (
              <button 
                key={i}
                className="flex items-center gap-2 text-left text-sm p-2 rounded bg-[var(--color-soc-surface)] border border-[var(--color-soc-border-light)] hover:border-purple-500/50 hover:bg-purple-500/10 transition-colors text-[var(--color-soc-text-secondary)] hover:text-purple-300"
              >
                <action.icon className="w-4 h-4" />
                <span>{action.text}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-[var(--color-soc-border)]">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Ask Labyrinth AI..." 
            className="w-full bg-[var(--color-soc-surface)] border border-[var(--color-soc-border-light)] rounded-lg py-2 pl-3 pr-10 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 text-[var(--color-soc-text)] placeholder-[var(--color-soc-text-muted)]"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[var(--color-soc-text-muted)] hover:text-purple-400">
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
