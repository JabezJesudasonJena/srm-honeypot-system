"use client";

import { useState } from "react";
import { MessageSquare, Bot, X } from "lucide-react";
import CorporatePortal from "@/components/CorporatePortal";
import AIChatbot from "@/components/AIChatbot";

export default function UserPage() {
  const [activePrompt, setActivePrompt] = useState<string>("");
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

  const handleAskAI = (prompt: string) => {
    setActivePrompt(prompt);
    // On mobile screens, open the chat panel automatically if closed
    setIsMobileChatOpen(true);
  };

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-[calc(100vh-4rem)] bg-[#050912] overflow-x-hidden">
      
      {/* Left/Main Side: Corporate Internal Portal (~70% width on Desktop) */}
      <main className="w-full lg:w-[70%] min-h-screen border-b lg:border-b-0 lg:border-r border-slate-800/80 bg-[#080e1a]">
        <CorporatePortal onAskAI={handleAskAI} />
      </main>

      {/* Right Side: Fixed AI Chatbot (~30% width on Desktop) */}
      <div className="hidden lg:flex lg:w-[30%] lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] flex-col shadow-2xl z-20">
        <AIChatbot initialPrompt={activePrompt} />
      </div>

      {/* Mobile Floating Action Button to open Labyrinth AI */}
      <div className="lg:hidden fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => setIsMobileChatOpen(true)}
          className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-full shadow-lg shadow-blue-900/50 transition-transform active:scale-95 cursor-pointer font-medium text-xs border border-cyan-400/40"
        >
          <Bot className="h-5 w-5 animate-pulse" />
          <span>Ask Labyrinth AI</span>
        </button>
      </div>

      {/* Mobile Slide-over Drawer for AI Chatbot */}
      {isMobileChatOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="w-full sm:w-[420px] h-full bg-[#070d18] flex flex-col shadow-2xl">
            <AIChatbot
              initialPrompt={activePrompt}
              onClose={() => setIsMobileChatOpen(false)}
              isMobileDrawer={true}
            />
          </div>
        </div>
      )}

    </div>
  );
}
