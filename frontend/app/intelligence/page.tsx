"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { ThreatIntelligence } from "@/lib/types";
import ThreatBadge from "@/components/ThreatBadge";
import LoadingState from "@/components/LoadingState";
import { Database, Search, ChevronRight, ShieldAlert, FileText, CheckCircle } from "lucide-react";

export default function IntelligencePage() {
  const [sessionId, setSessionId] = useState("");
  const [report, setReport] = useState<ThreatIntelligence | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId.trim()) return;

    setLoading(true);
    setError(false);
    try {
      const data = await api.getThreatIntelligence(sessionId);
      setReport(data);
    } catch (err) {
      console.error(err);
      setError(true);
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-full max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-soc-text)]">Threat Intelligence</h1>
          <p className="text-[var(--color-soc-text-muted)] text-sm">Async AI-enriched analysis of attack sessions</p>
        </div>
      </div>

      <div className="bg-[var(--color-soc-panel)] border border-[var(--color-soc-border)] rounded-xl p-5">
        <form onSubmit={fetchReport} className="flex gap-4 items-end">
          <div className="flex-1 space-y-2">
            <label htmlFor="sessionId" className="text-sm font-medium text-[var(--color-soc-text-secondary)]">Search Session ID</label>
            <div className="relative">
              <input 
                id="sessionId"
                type="text" 
                placeholder="Enter Session ID..." 
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                className="w-full bg-[var(--color-soc-surface)] border border-[var(--color-soc-border-light)] rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-[var(--color-soc-primary)] focus:ring-1 focus:ring-[var(--color-soc-primary)] text-[var(--color-soc-text)] placeholder-[var(--color-soc-text-muted)]"
              />
              <Search className="w-4 h-4 text-[var(--color-soc-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>
          <button 
            type="submit"
            disabled={loading || !sessionId.trim()}
            className="h-[38px] px-6 bg-[var(--color-soc-primary)]/20 hover:bg-[var(--color-soc-primary)]/30 text-[var(--color-soc-primary)] border border-[var(--color-soc-primary)]/50 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "ANALYZING..." : "GENERATE REPORT"}
            {!loading && <ChevronRight className="w-4 h-4" />}
          </button>
        </form>
      </div>

      {loading && <LoadingState message="Querying RAG & Gemini AI..." />}
      
      {error && !loading && (
        <div className="flex flex-col items-center justify-center p-12 bg-red-900/10 rounded-xl border border-red-500/20">
          <ShieldAlert className="w-10 h-10 text-red-500 mb-4" />
          <p className="text-red-400 font-medium mb-2">Analysis Failed</p>
          <p className="text-[var(--color-soc-text-secondary)] text-sm">Could not retrieve or generate intelligence for session: {sessionId}</p>
        </div>
      )}

      {report && !loading && !error && (
        <div className="flex-1 overflow-auto bg-[var(--color-soc-panel)] border border-[var(--color-soc-border)] rounded-xl p-6">
          <div className="flex items-start justify-between mb-8 border-b border-[var(--color-soc-border-light)] pb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-5 h-5 text-purple-400" />
                <h2 className="text-xl font-bold text-purple-100">AI ENRICHMENT REPORT</h2>
              </div>
              <p className="text-[var(--color-soc-text-secondary)] font-mono text-sm">Session: {report.sessionId}</p>
            </div>
            <ThreatBadge severity={report.threatSeverity} className="text-sm px-4 py-2" />
          </div>

          <div className="space-y-8">
            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-soc-text-muted)] mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Executive Summary
              </h3>
              <p className="text-[var(--color-soc-text)] bg-[var(--color-soc-surface)] p-4 rounded-lg border border-[var(--color-soc-border-light)] leading-relaxed">
                {report.executiveSummary}
              </p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-soc-text-muted)] mb-3">Attack Techniques</h3>
                <ul className="space-y-2">
                  {report.attackTechniques.map((tech, i) => (
                    <li key={i} className="flex items-start gap-2 bg-[var(--color-soc-surface)] p-2 rounded border border-[var(--color-soc-border-light)] text-sm">
                      <ShieldAlert className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                      <span>{tech}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-soc-text-muted)] mb-3">Indicators of Compromise (IoC)</h3>
                <ul className="space-y-2">
                  {report.indicators.map((ioc, i) => (
                    <li key={i} className="flex items-start gap-2 bg-[var(--color-soc-surface)] p-2 rounded border border-[var(--color-soc-border-light)] text-sm font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1.5" />
                      <span>{ioc}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-soc-text-muted)] mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Defensive Recommendations
              </h3>
              <ul className="space-y-3">
                {report.defensiveRecommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-3 bg-[var(--color-soc-surface)] p-3 rounded-lg border border-[var(--color-soc-border-light)] text-sm">
                    <span className="flex items-center justify-center w-6 h-6 rounded bg-green-500/20 text-green-400 font-bold shrink-0">{i + 1}</span>
                    <span className="pt-0.5">{rec}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
