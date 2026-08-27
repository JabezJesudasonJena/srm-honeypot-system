"use client";

import { useEffect, useState } from "react";
import { fetchAlerts } from "@/lib/api";
import { Bell, AlertCircle, ShieldAlert } from "lucide-react";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchAlerts();
        const alertsArray = Array.isArray(data?.alerts) ? data.alerts : Array.isArray(data) ? data : [];
        const sorted = alertsArray.sort((a: any, b: any) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setAlerts(sorted);
      } catch (err: any) {
        setError(err.message || "Failed to load alerts.");
      } finally {
        setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading && alerts.length === 0) {
    return <div className="p-8 text-gray-400">Loading alerts...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col gap-6">
      <header className="border-b border-gray-800 pb-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Bell className="text-yellow-500" /> System Alerts
        </h2>
        <p className="text-sm text-gray-400 mt-1">Real-time security alerts and system events.</p>
      </header>

      {error && <div className="bg-red-900/30 text-red-400 p-4 rounded border border-red-800/50">Error: {error}</div>}

      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        {alerts.length === 0 ? (
          <div className="p-8 text-center text-gray-500 flex flex-col items-center gap-2">
            <ShieldAlert size={32} className="text-gray-700" />
            <p>No alerts recorded.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-800">
            {alerts.map((alert: any, i: number) => (
              <li key={i} className="p-4 hover:bg-gray-800/30 transition-colors flex gap-4">
                <div className="mt-1 flex-shrink-0">
                  <AlertCircle className={alert.severity === 'CRITICAL' ? 'text-red-500' : alert.severity === 'HIGH' ? 'text-orange-500' : 'text-yellow-500'} size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-white font-medium">{alert.type || alert.message}</h4>
                    <span className="text-xs text-gray-500 font-mono">
                      {new Date(alert.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {alert.type && <p className="text-gray-300 text-sm">{alert.message}</p>}
                  {alert.sessionId && (
                    <p className="text-xs text-gray-500 mt-2 font-mono">
                      Session: <span className="text-indigo-400">{alert.sessionId}</span>
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
