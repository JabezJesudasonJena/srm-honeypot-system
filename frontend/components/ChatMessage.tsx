"use client";

import { useState } from "react";
import { Bot, User, Copy, Check, ShieldAlert, FileText, Lock } from "lucide-react";

export interface MessageItem {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  classification?: "INTERNAL" | "RESTRICTED" | "CONFIDENTIAL" | "ERROR";
  sources?: string[];
}

interface ChatMessageProps {
  message: MessageItem;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.sender === "user";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  // Helper to render markdown-like sections (code blocks, bullet points, headers)
  const renderFormattedContent = (content: string) => {
    const lines = content.split("\n");
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];

    lines.forEach((line, index) => {
      if (line.startsWith("```")) {
        if (inCodeBlock) {
          elements.push(
            <div key={`code-${index}`} className="my-2 p-2.5 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto">
              <pre>{codeBlockContent.join("\n")}</pre>
            </div>
          );
          codeBlockContent = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        return;
      }

      if (line.startsWith("### ")) {
        elements.push(
          <h4 key={index} className="text-xs font-bold text-slate-100 mt-2 mb-1">
            {line.replace("### ", "")}
          </h4>
        );
      } else if (line.startsWith("> ")) {
        elements.push(
          <div key={index} className="my-1.5 p-2 rounded bg-amber-950/40 border-l-2 border-amber-500 text-[11px] text-amber-200">
            {line.replace("> ", "")}
          </div>
        );
      } else if (line.startsWith("* ") || line.startsWith("- ")) {
        elements.push(
          <li key={index} className="ml-4 text-xs text-slate-300 list-disc my-0.5">
            {line.substring(2)}
          </li>
        );
      } else if (line.trim() === "") {
        elements.push(<div key={index} className="h-1.5" />);
      } else {
        elements.push(
          <p key={index} className="text-xs text-slate-300 leading-relaxed">
            {line}
          </p>
        );
      }
    });

    if (inCodeBlock && codeBlockContent.length > 0) {
      elements.push(
        <div key="remaining-code" className="my-2 p-2.5 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto">
          <pre>{codeBlockContent.join("\n")}</pre>
        </div>
      );
    }

    return elements;
  };

  return (
    <div className={`flex gap-3 w-full ${isUser ? "justify-end" : "justify-start"} group`}>
      {/* Bot Avatar (Left) */}
      {!isUser && (
        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm mt-0.5 border border-cyan-400/30">
          <Bot className="h-4 w-4" />
        </div>
      )}

      {/* Message Bubble Container */}
      <div className={`max-w-[85%] flex flex-col ${isUser ? "items-end" : "items-start"}`}>
        
        {/* Classification Badge for AI messages */}
        {!isUser && message.classification && (
          <div className="flex items-center gap-1.5 mb-1 text-[10px] font-mono">
            {message.classification === "RESTRICTED" ? (
              <span className="px-1.5 py-0.5 rounded bg-red-950/70 text-red-300 border border-red-800/60 flex items-center gap-1 font-semibold">
                <Lock className="h-2.5 w-2.5" />
                TIER-1 RESTRICTED
              </span>
            ) : message.classification === "CONFIDENTIAL" ? (
              <span className="px-1.5 py-0.5 rounded bg-amber-950/70 text-amber-300 border border-amber-800/60 flex items-center gap-1 font-semibold">
                <ShieldAlert className="h-2.5 w-2.5" />
                CONFIDENTIAL
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded bg-blue-950/70 text-blue-300 border border-blue-800/60 flex items-center gap-1">
                INTERNAL CLEARANCE
              </span>
            )}
            <span className="text-slate-500">{message.timestamp}</span>
          </div>
        )}

        {/* Bubble */}
        <div
          className={`p-3.5 rounded-2xl shadow-sm text-xs ${
            isUser
              ? "bg-blue-600 text-white rounded-br-xs font-medium"
              : "bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-xs w-full"
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
          ) : (
            <div className="space-y-1">
              {renderFormattedContent(message.text)}

              {/* Document Sources Cited */}
              {message.sources && message.sources.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-800/80 flex flex-wrap gap-1.5 items-center">
                  <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                    <FileText className="h-2.5 w-2.5" /> Sources:
                  </span>
                  {message.sources.map((src, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800"
                    >
                      {src}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer controls: copy & time */}
        <div className={`flex items-center gap-2 mt-1 px-1 text-[10px] text-slate-500 ${isUser ? "justify-end" : "justify-start"}`}>
          {isUser && <span>{message.timestamp}</span>}
          {!isUser && (
            <button
              onClick={handleCopy}
              className="hover:text-slate-300 transition-colors flex items-center gap-1 cursor-pointer opacity-0 group-hover:opacity-100"
              title="Copy message"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>

      {/* User Avatar (Right) */}
      {isUser && (
        <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-0.5 shadow-sm">
          <User className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}
