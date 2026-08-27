"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { SystemHealth, SystemMetrics } from "@/lib/types";
import { useRealtimeEvents } from "@/hooks/useRealtimeEvents";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import { Activity, Server, Database, Bot, RefreshCw, AlertTriangle, HardDrive, Cpu } from "lucide-react";

export default function SystemPage() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useRealtimeEvents(() => {
    fetchSystemData();
  });

  const fetchSystemData = async () => {
    try {
      const [healthData, metricsData] = await Promise.all([
        api.getSystemHealth(),
        api.getSystemMetrics()
      ]);
      setHealth(healthData);
      setMetrics(metricsData);
      setError(false);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemData();
    const interval = setInterval(fetchSystemData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleReset = async () => {
    setResetting(true);
    try {
      await api.resetSystem();
      await fetchSystemData();
      setShowConfirm(false);
    } catch (err) {
      console.error("Reset failed", err);
    } finally {
      setResetting(false);
    }
  };

  if (loading) return <LoadingState message="Loading system diagnostics..." />;
  if (error && !health) return <ErrorState onRetry={fetchSystemData} />;

  const getStatusColor = (status?: string) => {
    if (status === "OPERATIONAL" || status === "UP") return "text-green-400 bg-green-500/10 border-green-500/20";
    if (status === "DEGRADED") return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
    return "text-red-400 bg-red-500/10 border-red-500/20";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-soc-text)]">System Diagnostics</h1>
          <p className="text-[var(--color-soc-text-muted)] text-sm">Backend health, metrics, and demo controls</p>
        </div>
        
        <button 
          onClick={() => setShowConfirm(true)}
          className="flex items-center gap-2 bg-red-500/10 text-red-400 border border-red-500/30 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          RESET DEMO
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--color-soc-panel)] border border-[var(--color-soc-border)] rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4 text-red-400">
              <AlertTriangle className="w-8 h-8" />
              <h2 className="text-xl font-bold">Reset Demo Environment</h2>
            </div>
            <p className="text-[var(--color-soc-text-secondary)] mb-6 text-sm">
              This will clear all active sessions, alerts, and threat intelligence reports from the database. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-lg text-sm bg-[var(--color-soc-surface)] border border-[var(--color-soc-border-light)] hover:bg-[var(--color-soc-border-light)] transition-colors"
              >
                CANCEL
              </button>
              <button 
                onClick={handleReset}
                disabled={resetting}
                className="px-4 py-2 rounded-lg text-sm bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center gap-2"
              >
                {resetting ? <RefreshCw className="w-4 h-4 animate-spin" /> : "CONFIRM RESET"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Resource Metrics */}
        <div className="bg-[var(--color-soc-panel)] border border-[var(--color-soc-border)] rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-[var(--color-soc-text-muted)] mb-4">
            <Cpu className="w-5 h-5" />
            <h3 className="text-sm font-medium">CPU Usage</h3>
          </div>
          <p className="text-3xl font-bold text-[var(--color-soc-text)] font-mono">{metrics?.cpuUsage || 0}%</p>
        </div>
        
        <div className="bg-[var(--color-soc-panel)] border border-[var(--color-soc-border)] rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-[var(--color-soc-text-muted)] mb-4">
            <HardDrive className="w-5 h-5" />
            <h3 className="text-sm font-medium">Memory Usage</h3>
          </div>
          <p className="text-3xl font-bold text-[var(--color-soc-text)] font-mono">{metrics?.memoryUsage || 0}%</p>
        </div>

        <div className="bg-[var(--color-soc-panel)] border border-[var(--color-soc-border)] rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-[var(--color-soc-text-muted)] mb-4">
            <Activity className="w-5 h-5" />
            <h3 className="text-sm font-medium">Requests/Sec</h3>
          </div>
          <p className="text-3xl font-bold text-[var(--color-soc-text)] font-mono">{metrics?.requestsPerSecond || 0}</p>
        </div>

        <div className="bg-[var(--color-soc-panel)] border border-[var(--color-soc-border)] rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-[var(--color-soc-text-muted)] mb-4">
            <Bot className="w-5 h-5" />
            <h3 className="text-sm font-medium">AI Queue</h3>
          </div>
          <p className="text-3xl font-bold text-[var(--color-soc-text)] font-mono">{metrics?.aiQueueLength || 0}</p>
        </div>
      </div>

      <div className="bg-[var(--color-soc-panel)] border border-[var(--color-soc-border)] rounded-xl p-6">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-[var(--color-soc-text)]">
          <Server className="w-5 h-5 text-[var(--color-soc-primary)]" />
          Component Health
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-[var(--color-soc-surface)] border border-[var(--color-soc-border-light)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Server className="w-5 h-5 text-[var(--color-soc-text-muted)]" />
              <div>
                <h4 className="font-medium text-sm">Express Gateway</h4>
                <p className="text-xs text-[var(--color-soc-text-muted)]">Main API entrypoint</p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded text-xs font-mono font-bold border ${getStatusColor(health?.status)}`}>
              {health?.status || "UNKNOWN"}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-[var(--color-soc-surface)] border border-[var(--color-soc-border-light)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-[var(--color-soc-text-muted)]" />
              <div>
                <h4 className="font-medium text-sm">Redis Queue (BullMQ)</h4>
                <p className="text-xs text-[var(--color-soc-text-muted)]">Async task management</p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded text-xs font-mono font-bold border ${getStatusColor(health?.components.queue)}`}>
              {health?.components.queue || "UNKNOWN"}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-[var(--color-soc-surface)] border border-[var(--color-soc-border-light)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bot className="w-5 h-5 text-[var(--color-soc-text-muted)]" />
              <div>
                <h4 className="font-medium text-sm">AI Worker Pipeline</h4>
                <p className="text-xs text-[var(--color-soc-text-muted)]">Gemini async enrichment</p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded text-xs font-mono font-bold border ${getStatusColor(health?.components.aiWorker)}`}>
              {health?.components.aiWorker || "UNKNOWN"}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-[var(--color-soc-surface)] border border-[var(--color-soc-border-light)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-[var(--color-soc-text-muted)]" />
              <div>
                <h4 className="font-medium text-sm">RAG Database</h4>
                <p className="text-xs text-[var(--color-soc-text-muted)]">Supabase + pgvector</p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded text-xs font-mono font-bold border ${getStatusColor(health?.components.rag)}`}>
              {health?.components.rag || "UNKNOWN"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
