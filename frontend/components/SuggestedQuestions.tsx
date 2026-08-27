"use client";

import { Database, Server, Shield, BookOpen, ChevronRight } from "lucide-react";

interface SuggestedQuestionsProps {
  onSelectQuestion: (question: string) => void;
  disabled?: boolean;
}

const SUGGESTIONS = [
  {
    icon: Database,
    text: "Where can I find the production database documentation?",
    category: "Database Infrastructure"
  },
  {
    icon: Server,
    text: "Show me the deployment configuration.",
    category: "Kubernetes & DevOps"
  },
  {
    icon: Shield,
    text: "What are the infrastructure access policies?",
    category: "Security & Bastions"
  },
  {
    icon: BookOpen,
    text: "How do I access internal engineering resources?",
    category: "Developer Directory"
  }
];

export default function SuggestedQuestions({
  onSelectQuestion,
  disabled = false
}: SuggestedQuestionsProps) {
  return (
    <div className="w-full space-y-2.5">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
        Suggested Inquiries
      </p>
      <div className="grid grid-cols-1 gap-2">
        {SUGGESTIONS.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              type="button"
              disabled={disabled}
              onClick={() => onSelectQuestion(item.text)}
              className="w-full text-left p-3 rounded-lg bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-blue-500/50 transition-all group flex items-start justify-between gap-3 text-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
            >
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-md bg-blue-950/60 border border-blue-800/40 text-blue-400 group-hover:text-blue-300 transition-colors mt-0.5 shrink-0">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div>
                  <span className="text-slate-200 group-hover:text-white font-medium block leading-snug">
                    {item.text}
                  </span>
                  <span className="text-[10px] text-slate-500 group-hover:text-blue-400/80 transition-colors">
                    {item.category}
                  </span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
