"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Sparkles } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export default function ChatInput({
  onSendMessage,
  isLoading,
  disabled = false
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isLoading && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isLoading]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading || disabled) return;

    onSendMessage(input.trim());
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto adjust height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  return (
    <div className="p-3 bg-[#0a0f18] border-t border-slate-800">
      <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
        <div className="relative flex-1 bg-slate-900/90 border border-slate-700/80 rounded-xl focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all shadow-inner">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading || disabled}
            placeholder="Message Labyrinth AI..."
            className="w-full resize-none bg-transparent px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none max-h-32 disabled:opacity-50"
          />
          <div className="flex items-center justify-between px-3 pb-2 pt-0.5 text-[10px] text-slate-500">
            <span className="flex items-center gap-1">
              <Sparkles className="h-2.5 w-2.5 text-cyan-400" />
              <span>RAG Vector Search Active</span>
            </span>
            <span>Press Enter ↵ to send</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={!input.trim() || isLoading || disabled}
          className="h-10 w-10 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white disabled:text-slate-500 flex items-center justify-center transition-all shadow-md shadow-blue-900/30 disabled:shadow-none shrink-0 cursor-pointer disabled:cursor-not-allowed"
          title="Send message"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-blue-300" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </form>
    </div>
  );
}
