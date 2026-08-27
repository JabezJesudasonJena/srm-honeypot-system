"use client";

import { useState } from "react";
import {
  Layers,
  Search,
  Filter,
  AlertCircle,
  X,
  Copy,
  Check,
  Bot,
  FileCode,
  ShieldCheck,
  Building,
  Lock
} from "lucide-react";
import PortalNavbar from "./PortalNavbar";
import FeaturedDocuments, { DocItem, FEATURED_DOCS } from "./FeaturedDocuments";
import RecentResources from "./RecentResources";

interface CorporatePortalProps {
  onAskAI: (prompt: string) => void;
}

const CATEGORIES = [
  "All",
  "Engineering",
  "DevOps",
  "Database",
  "Infrastructure",
  "Security",
  "HR & Policies"
];

export default function CorporatePortal({ onAskAI }: CorporatePortalProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<DocItem | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const handleCopySnippet = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSnippet(true);
      setTimeout(() => setCopiedSnippet(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="w-full flex flex-col bg-[#080e1a] text-slate-100 min-h-screen">
      
      {/* Top Navbar */}
      <PortalNavbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={() => {}}
      />

      {/* Main Content Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Intranet Announcement Banner */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/70 via-indigo-950/60 to-slate-900 border border-blue-800/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-900/60 text-cyan-300 border border-blue-700/50 shrink-0 mt-0.5 sm:mt-0">
              <AlertCircle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white tracking-wide">
                ACME Internal Announcement: Q3 Infrastructure Migration in Progress
              </p>
              <p className="text-[11px] text-slate-300">
                All production database clusters and telemetry pipelines have been migrated to the new VPC. Please verify connection strings in the Database section.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onAskAI("What is the Q3 infrastructure migration schedule and new VPC endpoints?")}
            className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shrink-0 shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Bot className="h-3.5 w-3.5" />
            <span>Ask AI About Migration</span>
          </button>
        </div>

        {/* Categories Bar & Search Filter (for Mobile/Tablet) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
          
          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-900/40"
                    : "bg-slate-900/90 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Mobile Search Input */}
          <div className="sm:hidden relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search internal resources..."
              className="w-full pl-9 pr-4 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

        </div>

        {/* Featured Corporate Documents Grid */}
        <FeaturedDocuments
          filterCategory={selectedCategory}
          searchQuery={searchQuery}
          onSelectDoc={(doc) => setSelectedDoc(doc)}
          onAskAI={onAskAI}
        />

        {/* Recent Intranet Updates & Infrastructure Health */}
        <RecentResources onAskAI={onAskAI} />

      </div>

      {/* Interactive Document Preview Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0b1424] border border-slate-700 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                    {selectedDoc.category}
                  </span>
                  {selectedDoc.clearance === "RESTRICTED" ? (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 flex items-center gap-1">
                      <Lock className="h-2.5 w-2.5" />
                      TIER 1 RESTRICTED
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      INTERNAL DOCUMENT
                    </span>
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                  {selectedDoc.title}
                </h3>
              </div>

              <button
                onClick={() => setSelectedDoc(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-300">
              <p className="text-slate-300 leading-relaxed font-medium">
                {selectedDoc.summary}
              </p>

              {/* Code Snippet Box */}
              <div className="relative p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs overflow-x-auto space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5 text-cyan-400">
                    <FileCode className="h-3.5 w-3.5" />
                    Internal Manifest / Configuration Runbook
                  </span>
                  <button
                    onClick={() => handleCopySnippet(selectedDoc.contentSnippet)}
                    className="hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedSnippet ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {selectedDoc.contentSnippet}
                </pre>
              </div>

              <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/40 text-amber-200 text-xs flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-amber-400 shrink-0" />
                <span>
                  All queries to this resource are registered with the ACME Security Operations Center for audit integrity.
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500 font-mono">
                Doc ID: {selectedDoc.id} • Last verified {selectedDoc.lastUpdated}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const prompt = selectedDoc.aiPrompt;
                    setSelectedDoc(null);
                    onAskAI(prompt);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Bot className="h-3.5 w-3.5" />
                  <span>Ask AI About This</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDoc(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
