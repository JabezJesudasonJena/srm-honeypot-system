"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Minimize2, Maximize2, Trash2, Sparkles, RefreshCw, X } from "lucide-react";
import ChatMessage, { MessageItem } from "./ChatMessage";
import ChatInput from "./ChatInput";
import SuggestedQuestions from "./SuggestedQuestions";
import { searchWiki } from "@/lib/api";

interface AIChatbotProps {
  initialPrompt?: string;
  onClose?: () => void;
  isMobileDrawer?: boolean;
}

export default function AIChatbot({
  initialPrompt,
  onClose,
  isMobileDrawer = false
}: AIChatbotProps) {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle external prompt injection (e.g. from portal cards)
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim().length > 0) {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessageId = `user-${Date.now()}`;
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newUserMessage: MessageItem = {
      id: userMessageId,
      sender: "user",
      text: text.trim(),
      timestamp: currentTime
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      // Call backend honeypot endpoint or fallback
      const searchResult = await searchWiki(text.trim());
      
      const aiMessageId = `ai-${Date.now()}`;
      const aiResponseTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const newAiMessage: MessageItem = {
        id: aiMessageId,
        sender: "ai",
        text: searchResult.response,
        timestamp: aiResponseTime,
        classification: searchResult.classification,
        sources: searchResult.sources
      };

      setMessages((prev) => [...prev, newAiMessage]);
    } catch (error) {
      console.error("Failed to query Labyrinth AI:", error);
      const errorMessage: MessageItem = {
        id: `ai-err-${Date.now()}`,
        sender: "ai",
        text: "I encountered a transient error querying the internal vector store. Please re-authenticate your internal session token or retry your request.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        classification: "ERROR"
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  return (
    <aside
      className={`flex flex-col bg-[#070d18] border-l border-slate-800 h-full w-full relative transition-all duration-300 ${
        isMinimized && !isMobileDrawer ? "h-14 overflow-hidden" : ""
      }`}
    >
      {/* Chatbot Header */}
      <div className="px-4 py-3 bg-[#0c1524] border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-sm shadow-cyan-900/40 relative">
            <Bot className="h-4 w-4" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#0c1524] rounded-full animate-pulse"></span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-mono font-bold text-xs text-white tracking-wide">
                LABYRINTH AI
              </h3>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 text-[9px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 rounded">
                ● Online
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-sans">
              Internal Corporate Assistant
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-1">
          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
              title="Reset conversation"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          )}

          {!isMobileDrawer && (
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
              title={isMinimized ? "Expand Chat" : "Minimize Chat"}
            >
              {isMinimized ? (
                <Maximize2 className="h-3.5 w-3.5" />
              ) : (
                <Minimize2 className="h-3.5 w-3.5" />
              )}
            </button>
          )}

          {isMobileDrawer && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
              title="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Body */}
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 bg-[#070d18]/90">
            {messages.length === 0 ? (
              /* Empty State */
              <div className="h-full flex flex-col justify-between py-2 space-y-6">
                <div className="space-y-3 text-left pt-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-800/40 text-cyan-400 flex items-center justify-center mb-3 shadow-inner">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h2 className="text-base font-bold text-white tracking-tight">
                    Hi, what can I help you with?
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Ask me about internal documentation, engineering resources,
                    infrastructure, deployment, databases, or company policies.
                  </p>
                </div>

                {/* Suggested Question Chips */}
                <div className="pt-2">
                  <SuggestedQuestions
                    onSelectQuestion={handleSendMessage}
                    disabled={isLoading}
                  />
                </div>
              </div>
            ) : (
              /* Message Thread */
              <div className="space-y-4">
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} />
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex gap-3 items-start animate-fadeIn">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shrink-0 mt-0.5 border border-cyan-400/30">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-bl-xs p-3.5 shadow-sm text-xs text-slate-300">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce"></div>
                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]"></div>
                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]"></div>
                        <span className="text-[11px] text-slate-400 font-mono pl-1">
                          Querying vector index & knowledge store...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Bottom Chat Input */}
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        </>
      )}
    </aside>
  );
}
