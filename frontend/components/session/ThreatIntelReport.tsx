"use client";

import { useState } from "react";
import { fetchThreatIntel } from "@/lib/api";

export default function ThreatIntelReport({ sessionId }: { sessionId: string }) {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchThreatIntel(sessionId);
      setReport(data);
    } catch (err: any) {
      setError("Failed to generate report. The Gemini API might be rate-limited or unavailable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0c1219] border border-[#1c2a38] rounded-md overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-[#1c2a38] bg-[#111a24] flex justify-between items-center">
        <h3 className="font-bold text-white">AI Threat Intelligence</h3>
        {!report && (
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm transition-colors disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        )}
      </div>
      <div className="p-4 flex-1 overflow-y-auto">
        {error && (
          <div className="p-4 bg-red-900/20 border border-red-900/50 text-red-400 rounded text-sm mb-4">
            {error}
            <button onClick={handleGenerate} className="ml-4 underline">Retry</button>
          </div>
        )}
        
        {!report && !error && !loading && (
          <div className="text-gray-500 text-sm italic">
            Click 'Generate Report' to synthesize a comprehensive threat analysis using the Gemini API.
          </div>
        )}

        {loading && (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-[#1c2a38] rounded w-3/4"></div>
            <div className="h-4 bg-[#1c2a38] rounded w-1/2"></div>
            <div className="h-4 bg-[#1c2a38] rounded w-full"></div>
            <div className="h-4 bg-[#1c2a38] rounded w-5/6"></div>
          </div>
        )}

        {report && !loading && (
          <div className="space-y-6 text-sm text-gray-300">
            <div>
              <h4 className="text-blue-400 font-bold mb-2">Executive Summary</h4>
              <p className="leading-relaxed">{report.summary || report.executiveSummary || 'No summary available.'}</p>
            </div>
            
            {report.analysis && (
              <div>
                <h4 className="text-blue-400 font-bold mb-2">Behavioral Analysis</h4>
                <p className="leading-relaxed whitespace-pre-wrap">{report.analysis}</p>
              </div>
            )}
            
            {report.indicators && report.indicators.length > 0 && (
              <div>
                <h4 className="text-blue-400 font-bold mb-2">Indicators of Compromise</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {report.indicators.map((ioc: string, i: number) => (
                    <li key={i} className="font-mono text-xs">{ioc}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
