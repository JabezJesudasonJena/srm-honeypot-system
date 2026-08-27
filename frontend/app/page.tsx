"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { OverviewMetrics, SystemHealth, Alert } from "@/lib/types";
import { useRealtimeEvents } from "@/hooks/useRealtimeEvents";
import MetricCard from "@/components/MetricCard";
import ThreatBadge from "@/components/ThreatBadge";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import { Activity, ShieldAlert, Server, Radar } from "lucide-react";

export default function Overview() {
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Hook into SSE
  useRealtimeEvents((event) => {
    // When a new event comes in, refresh the data
    fetchData();
  });

  const fetchData = async () => {
    try {
      const [metricsData, healthData, alertsData] = await Promise.all([
        api.getOverview().catch(() => null),
        api.getSystemHealth().catch(() => null),
        api.getAlerts().catch(() => [])
      ]);

      if (metricsData) setMetrics(metricsData);
      if (healthData) setHealth(healthData);
      setAlerts(alertsData);
      setError(false);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Polling fallback
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <LoadingState message="Loading SOC Overview..." />;
  if (error && !metrics) return <ErrorState onRetry={fetchData} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-soc-text)]">SOC Overview</h1>
          <p className="text-[var(--color-soc-text-muted)] text-sm">Real-time threat monitoring and system status</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Active Attacks" 
          value={metrics?.activeAttacks || 0} 
          icon={ShieldAlert}
          colorClass="text-red-400" 
        />
        <MetricCard 
          title="Critical Sessions" 
          value={metrics?.criticalSessions || 0} 
          icon={Radar}
          colorClass="text-orange-400" 
        />
        <MetricCard 
          title="Total Sessions" 
          value={metrics?.totalSessions || 0} 
          icon={Activity}
          colorClass="text-[var(--color-soc-primary)]" 
        />
        <MetricCard 
          title="Active Alerts" 
          value={metrics?.activeAlerts || 0} 
          icon={Server}
          colorClass="text-yellow-400" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[var(--color-soc-panel)] border border-[var(--color-soc-border)] rounded-xl p-5">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-[var(--color-soc-primary)]" />
            Recent Alerts
          </h2>
          {alerts.length > 0 ? (
            <div className="space-y-3">
              {alerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="p-3 bg-[var(--color-soc-surface)] border border-[var(--color-soc-border-light)] rounded-lg flex items-start gap-4">
                  <ThreatBadge severity={alert.severity} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{alert.attackType}</p>
                    <p className="text-xs text-[var(--color-soc-text-muted)]">{alert.description}</p>
                  </div>
                  <div className="text-xs text-[var(--color-soc-text-muted)] font-mono">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 text-[var(--color-soc-text-muted)] text-sm border border-dashed border-[var(--color-soc-border-light)] rounded-lg">
              No active alerts at this time.
            </div>
          )}
        </div>

        <div className="bg-[var(--color-soc-panel)] border border-[var(--color-soc-border)] rounded-xl p-5">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Server className="w-5 h-5 text-green-400" />
            System Health
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-[var(--color-soc-surface)] rounded border border-[var(--color-soc-border-light)]">
              <span className="text-sm font-medium">Backend API</span>
              <span className={`text-xs font-mono px-2 py-1 rounded ${health?.status === "OPERATIONAL" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                {health?.status || "UNKNOWN"}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-[var(--color-soc-surface)] rounded border border-[var(--color-soc-border-light)]">
              <span className="text-sm font-medium">AI Worker</span>
              <span className={`text-xs font-mono px-2 py-1 rounded ${health?.components.aiWorker === "UP" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                {health?.components.aiWorker || "UNKNOWN"}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-[var(--color-soc-surface)] rounded border border-[var(--color-soc-border-light)]">
              <span className="text-sm font-medium">Redis Queue</span>
              <span className={`text-xs font-mono px-2 py-1 rounded ${health?.components.queue === "UP" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                {health?.components.queue || "UNKNOWN"}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-[var(--color-soc-surface)] rounded border border-[var(--color-soc-border-light)]">
              <span className="text-sm font-medium">RAG DB</span>
              <span className={`text-xs font-mono px-2 py-1 rounded ${health?.components.rag === "UP" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                {health?.components.rag || "UNKNOWN"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
