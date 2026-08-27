"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Alert } from "@/lib/types";
import { useRealtimeEvents } from "@/hooks/useRealtimeEvents";
import ThreatBadge from "@/components/ThreatBadge";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import { AlertTriangle, Server, Search } from "lucide-react";
import Link from "next/link";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useRealtimeEvents(() => {
    fetchAlerts();
  });

  const fetchAlerts = async () => {
    try {
      const data = await api.getAlerts();
      setAlerts(data || []);
      setError(false);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  const filteredAlerts = alerts.filter(a => 
    a.attackType.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.sessionId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <LoadingState message="Loading alerts data..." />;
  if (error && alerts.length === 0) return <ErrorState onRetry={fetchAlerts} />;

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-soc-text)]">System Alerts</h1>
          <p className="text-[var(--color-soc-text-muted)] text-sm">Monitor security events and system notifications</p>
        </div>
        
        <div className="relative w-full md:w-64">
          <input 
            type="text" 
            placeholder="Search alerts..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--color-soc-surface)] border border-[var(--color-soc-border-light)] rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-[var(--color-soc-primary)] focus:ring-1 focus:ring-[var(--color-soc-primary)] text-[var(--color-soc-text)] placeholder-[var(--color-soc-text-muted)]"
          />
          <Search className="w-4 h-4 text-[var(--color-soc-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-[var(--color-soc-panel)] border border-[var(--color-soc-border)] rounded-xl">
        {filteredAlerts.length > 0 ? (
          <div className="divide-y divide-[var(--color-soc-border-light)]">
            {filteredAlerts.map((alert) => (
              <div key={alert.id} className="p-4 hover:bg-[var(--color-soc-surface)] transition-colors flex flex-col md:flex-row md:items-center gap-4">
                <div className="shrink-0">
                  <ThreatBadge severity={alert.severity} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-sm text-[var(--color-soc-text)]">{alert.attackType}</h3>
                    <span className="text-xs text-[var(--color-soc-text-muted)] flex items-center gap-1">
                      <Server className="w-3 h-3" /> System
                    </span>
                  </div>
                  <p className="text-sm text-[var(--color-soc-text-secondary)]">{alert.description}</p>
                  <div className="mt-2 text-xs font-mono flex items-center gap-2">
                    <span className="text-[var(--color-soc-text-muted)]">Session:</span>
                    <Link href={`/attacks/${alert.sessionId}`} className="text-[var(--color-soc-primary)] hover:underline">
                      {alert.sessionId}
                    </Link>
                  </div>
                </div>
                <div className="text-xs font-mono text-[var(--color-soc-text-muted)] whitespace-nowrap">
                  {new Date(alert.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 h-full">
            <AlertTriangle className="w-10 h-10 text-[var(--color-soc-text-muted)] mb-4 opacity-50" />
            <p className="text-[var(--color-soc-text-secondary)]">No alerts matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
