"use client";

import { useEffect, useState } from "react";
import { fetchBenchmark } from "@/lib/api";
import { BarChart2, Zap, Clock } from "lucide-react";

export default function BenchmarkPage() {
  const [benchmark, setBenchmark] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchBenchmark();
        setBenchmark(data);
      } catch (err: any) {
        setError(err.message || "Failed to load benchmark data.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="p-8 text-gray-400">Loading benchmark...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col gap-6">
      <header className="border-b border-gray-800 pb-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart2 className="text-pink-500" /> System Benchmark
        </h2>
        <p className="text-sm text-gray-400 mt-1">Performance and pipeline statistics.</p>
      </header>

      {error && <div className="bg-red-900/30 text-red-400 p-4 rounded border border-red-800/50">Error: {error}</div>}

      {benchmark && benchmark.metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
            <h3 className="text-white font-medium flex items-center gap-2 mb-4 border-b border-gray-800 pb-2">
              <Zap className="text-yellow-400" size={18} /> Processing Performance
            </h3>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Avg Processing Latency</span>
                <span className="text-white font-mono">{benchmark.metrics.avgProcessingLatencyMs} ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Avg AI Latency</span>
                <span className="text-white font-mono">{benchmark.metrics.avgAiLatencyMs} ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Avg Time to Detection</span>
                <span className="text-white font-mono">{benchmark.metrics.avgTimeToDetectionMs} ms</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
            <h3 className="text-white font-medium flex items-center gap-2 mb-4 border-b border-gray-800 pb-2">
              <Clock className="text-blue-400" size={18} /> Workload Statistics
            </h3>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Requests Processed</span>
                <span className="text-white font-mono">{benchmark.metrics.requestsProcessed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Total Attacks</span>
                <span className="text-white font-mono">{benchmark.metrics.totalAttacks}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Canaries Triggered / Generated</span>
                <span className="text-white font-mono">{benchmark.metrics.canariesTriggered} / {benchmark.metrics.canariesGenerated}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 md:col-span-2">
            <h3 className="text-white font-medium mb-4 border-b border-gray-800 pb-2">
              AI Provider Usage
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black/40 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="p-3 font-medium">Metric</th>
                    <th className="p-3 font-medium">Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  <tr className="hover:bg-gray-800/30">
                    <td className="p-3 text-gray-300 text-sm">Orchestrator Requests</td>
                    <td className="p-3 text-white text-sm font-mono">{benchmark.metrics.orchestratorRequests}</td>
                  </tr>
                  <tr className="hover:bg-gray-800/30">
                    <td className="p-3 text-gray-300 text-sm">HuggingFace Calls</td>
                    <td className="p-3 text-white text-sm font-mono">{benchmark.metrics.hfCalls}</td>
                  </tr>
                  <tr className="hover:bg-gray-800/30">
                    <td className="p-3 text-gray-300 text-sm">Fallback Activations</td>
                    <td className="p-3 text-white text-sm font-mono">{benchmark.metrics.fallbackActivations}</td>
                  </tr>
                  <tr className="hover:bg-gray-800/30">
                    <td className="p-3 text-gray-300 text-sm">AI Failures</td>
                    <td className="p-3 text-white text-sm font-mono">{benchmark.metrics.aiFailures}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
