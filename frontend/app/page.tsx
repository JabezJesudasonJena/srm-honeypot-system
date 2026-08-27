"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchSystemHealth, fetchAttacks, simulateAttack } from "@/lib/api";
import { Activity, Server, AlertTriangle, Shield, Play } from "lucide-react";

export default function DashboardPage() {
  const [health, setHealth] = useState<any>(null);
  const [attacks, setAttacks] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [scenario, setScenario] = useState("recon");
  const [simulating, setSimulating] = useState(false);
  const [simError, setSimError] = useState("");

  const scenarios = [
    "recon",
    "enumeration",
    "credential-harvest",
    "privilege-escalation",
    "full-adaptive-attack",
    "automated-scanner",
    "credential-hunter",
    "database-attacker",
    "cloud-attacker",
    "static-honeypot"
  ];

  const loadData = async () => {
    try {
      const [healthData, attacksData] = await Promise.all([
        fetchSystemHealth(),
        fetchAttacks(),
      ]);
      setHealth(healthData);
      setAttacks(attacksData);
      setError("");
    } catch (err: any) {
      setError(err.message || "Couldn't load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSimulate = async () => {
    setSimulating(true);
    setSimError("");
    try {
      await simulateAttack(scenario);
      // Wait a moment then refresh
      setTimeout(loadData, 1000);
    } catch (err: any) {
      setSimError("Failed to launch simulation");
    } finally {
      setSimulating(false);
    }
  };

  const getSeverityColor = (sev: string) => {
    switch (sev?.toUpperCase()) {
      case "CRITICAL": return "text-red-500 bg-red-500/10";
      case "HIGH": return "text-orange-500 bg-orange-500/10";
      case "MEDIUM": return "text-yellow-500 bg-yellow-500/10";
      case "LOW": return "text-blue-500 bg-blue-500/10";
      default: return "text-gray-400 bg-gray-500/10";
    }
  };

  if (loading && !health) {
    return <div className="text-gray-400 p-8">Loading dashboard...</div>;
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto p-6">
      <header className="flex justify-between items-end border-b border-gray-800 pb-4">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-2">
            <Shield className="text-indigo-500" /> SOC Dashboard
          </h2>
          <p className="text-gray-400 text-sm mt-1">Real-time monitoring of Labyrinth honeypot</p>
        </div>
      </header>

      {error && <div className="bg-red-900/30 text-red-400 p-4 rounded-md border border-red-800/50">Error: {error}</div>}

      {/* System Health Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex items-center gap-4">
          <Server className="text-blue-400" />
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wider">System Status</p>
            <p className="text-white font-medium">{health?.status || "Unknown"}</p>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex items-center gap-4">
          <Activity className="text-purple-400" />
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wider">AI Mode</p>
            <p className="text-white font-medium">{health?.deceptionEngine || "Unknown"}</p>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex items-center gap-4">
          <AlertTriangle className="text-orange-400" />
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wider">Active Attacks</p>
            <p className="text-white font-medium">{attacks?.attacks?.filter((a:any) => a.active).length || 0}</p>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex items-center gap-4">
          <Shield className="text-green-400" />
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wider">Total Handled</p>
            <p className="text-white font-medium">{attacks?.total || 0}</p>
          </div>
        </div>
      </div>

      {/* Simulator Controls */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1">
          <h3 className="text-white font-medium">Attack Simulator</h3>
          <p className="text-gray-400 text-sm">Launch a local synthetic attack against the honeypot.</p>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            className="bg-black border border-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
          >
            {scenarios.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button 
            onClick={handleSimulate}
            disabled={simulating}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Play size={16} /> {simulating ? "Launching..." : "Launch Attack"}
          </button>
        </div>
        {simError && <p className="text-red-400 text-sm">{simError}</p>}
      </div>

      {/* Session List */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-800 bg-black/20">
          <h3 className="text-white font-medium">Recent Attack Sessions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/40 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-800">
                <th className="p-4 font-medium">Session ID</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Severity</th>
                <th className="p-4 font-medium">Score</th>
                <th className="p-4 font-medium">Stage</th>
                <th className="p-4 font-medium">Requests</th>
                <th className="p-4 font-medium">Last Seen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {!attacks?.attacks || attacks.attacks.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">No attacks recorded yet.</td></tr>
              ) : (
                attacks.attacks.map((attack: any) => (
                  <tr key={attack.sessionId} className="hover:bg-gray-800/50 transition-colors group">
                    <td className="p-4">
                      <Link href={`/attacks/${attack.sessionId}`} className="text-indigo-400 hover:text-indigo-300 font-mono text-sm">
                        {attack.sessionId.substring(0, 8)}
                      </Link>
                    </td>
                    <td className="p-4">
                      {attack.active ? 
                        <span className="flex items-center gap-1.5 text-xs text-green-400"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Active</span> : 
                        <span className="text-xs text-gray-500">Ended</span>}
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded font-medium ${getSeverityColor(attack.threatSeverity)}`}>
                        {attack.threatSeverity || "UNKNOWN"}
                      </span>
                    </td>
                    <td className="p-4 text-white text-sm">{attack.threatScore}</td>
                    <td className="p-4 text-gray-400 text-sm capitalize">{attack.attackStage?.replace('_', ' ')}</td>
                    <td className="p-4 text-gray-400 text-sm">{attack.requestCount}</td>
                    <td className="p-4 text-gray-500 text-xs">{new Date(attack.lastSeen).toLocaleTimeString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
