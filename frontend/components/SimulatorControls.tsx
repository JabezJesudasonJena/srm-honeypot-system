"use client";

import { useState } from "react";
import { simulateAttack } from "@/lib/api";

const SCENARIOS = [
  "recon",
  "enumeration",
  "credential-harvest",
  "canary-reuse",
  "privilege-escalation",
  "full-adaptive-attack",
  "automated-scanner",
  "credential-hunter",
  "database-attacker",
  "cloud-attacker",
  "static-honeypot"
];

export default function SimulatorControls() {
  const [scenario, setScenario] = useState(SCENARIOS[5]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);

  const handleSimulate = async () => {
    setLoading(true);
    setMessage(null);
    try {
      await simulateAttack(scenario);
      setMessage({ text: "Simulation started successfully.", type: 'success' });
    } catch (err: any) {
      // Expecting a 404 since the backend route is missing as flagged
      setMessage({ text: "Simulation API failed (expected: missing route).", type: 'error' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  return (
    <div className="p-4 bg-[#0c1219] border border-[#1c2a38] rounded-md flex flex-col gap-3">
      <h3 className="font-bold text-white">Attack Simulator</h3>
      <div className="flex gap-2 items-center">
        <select 
          className="bg-[#111a24] border border-[#1c2a38] text-gray-300 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none flex-1 font-mono"
          value={scenario}
          onChange={(e) => setScenario(e.target.value)}
          disabled={loading}
        >
          {SCENARIOS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button
          onClick={handleSimulate}
          disabled={loading}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-sm transition-colors flex-shrink-0 disabled:opacity-50"
        >
          {loading ? 'Starting...' : 'Launch Simulation'}
        </button>
      </div>
      {message && (
        <div className={`text-xs p-2 rounded ${message.type === 'error' ? 'bg-red-900/50 text-red-400' : 'bg-green-900/50 text-green-400'}`}>
          {message.text}
        </div>
      )}
    </div>
  );
}
