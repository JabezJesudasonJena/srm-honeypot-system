"use client";

import { useEffect, useState, useRef } from "react";
import { fetchAttacks } from "@/lib/api";
import { PieChart, Activity, Shield, Send, Terminal, AlertTriangle, Crosshair } from "lucide-react";

export default function AnalyticsPage() {
  const [attacks, setAttacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<{ sender: "user" | "bot"; text: string }[]>([
    { sender: "bot", text: "I can help you analyze attack patterns, severity trends, and canary triggers. How can I assist you today?" },
  ]);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchAttacks();
        const validAttacks = Array.isArray(data.attacks) ? data.attacks : [];
        setAttacks(validAttacks.sort((a: any, b: any) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime()));
      } catch (err: any) {
        setError(err.message || "Failed to load attacks");
      } finally {
        setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    setChatHistory((prev) => [...prev, { sender: "user", text: userMsg }]);
    setChatInput("");

    // Simple mocked NLP based on real data
    setTimeout(() => {
      let botResponse = "I can help you analyze attack patterns, severity trends, and canary triggers — try asking about a specific attack type or session.";
      const lower = userMsg.toLowerCase();

      if (lower.includes("most") && (lower.includes("attacks") || lower.includes("common"))) {
        const counts = attacks.reduce((acc: any, cur: any) => {
          const type = cur.classification || "unknown";
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {});
        let max = 0;
        let top = "none";
        for (const [k, v] of Object.entries(counts)) {
          if ((v as number) > max) { max = v as number; top = k; }
        }
        botResponse = `Based on currently loaded data, the most common attack classification is **${top}** with ${max} occurrences.`;
      } else if (lower.includes("severity") || lower.includes("critical")) {
        const criticalCount = attacks.filter((a) => a.threatSeverity === "CRITICAL").length;
        botResponse = `There are currently ${criticalCount} sessions classified as CRITICAL severity out of ${attacks.length} total sessions.`;
      } else if (lower.includes("sql") || lower.includes("injection")) {
        botResponse = `SQL injection attempts are typically caught by our regex-based intent classification. To see exact payloads, please inspect the timeline of CRITICAL sessions.`;
      } else if (lower.includes("recommend") || lower.includes("remediate")) {
        botResponse = `For high severity sessions, I recommend reviewing the triggered canaries and isolating the source IP. Consider blocking IPs with sustained request volumes over 100 requests.`;
      } else if (lower.includes("canary")) {
        botResponse = `Canaries are dynamically generated credentials injected into deceptive responses. If an attacker attempts to reuse them, a high-severity alert is immediately triggered. Check the Alerts page for recent triggers.`;
      } else if (lower.includes("total")) {
        botResponse = `We have tracked a total of ${attacks.length} distinct attacker sessions in the current dataset.`;
      }

      setChatHistory((prev) => [...prev, { sender: "bot", text: botResponse }]);
    }, 600);
  };

  // Compute stats for charts
  const classificationCounts = attacks.reduce((acc: any, cur: any) => {
    const key = cur.classification || "unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const severityCounts = attacks.reduce((acc: any, cur: any) => {
    const key = cur.threatSeverity || "UNKNOWN";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const getSeverityColor = (sev: string) => {
    if (sev === "CRITICAL") return "bg-red-500 text-red-500";
    if (sev === "HIGH") return "bg-orange-500 text-orange-500";
    if (sev === "MEDIUM") return "bg-yellow-500 text-yellow-500";
    return "bg-green-500 text-green-500";
  };

  if (loading && attacks.length === 0) {
    return <div className="p-8 text-gray-400">Loading analytics...</div>;
  }

  return (
    <div className="flex h-[calc(100vh-48px)] gap-6 -mt-6">
      
      {/* Main Analytics Content */}
      <div className="flex-1 overflow-auto py-6 pr-2 flex flex-col gap-6">
        <header className="border-b border-gray-800 pb-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <PieChart className="text-blue-500" /> Threat Analytics
          </h2>
          <p className="text-sm text-gray-400 mt-1">Real-time analysis of attack patterns and actor behavior.</p>
        </header>

        {error && <div className="bg-red-900/30 text-red-400 p-4 rounded border border-red-800/50">Error: {error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Classification Distribution */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 flex flex-col">
            <h3 className="text-white font-medium flex items-center gap-2 mb-4">
              <Crosshair className="text-purple-400" size={18} /> Attack Classification
            </h3>
            <div className="flex-1 flex flex-col justify-center gap-4">
              {Object.keys(classificationCounts).length === 0 ? (
                <p className="text-sm text-gray-500 italic">Sample data — awaiting live attacks</p>
              ) : (
                Object.entries(classificationCounts).map(([key, count]) => {
                  const percentage = ((count as number) / attacks.length) * 100;
                  return (
                    <div key={key}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300 font-mono">{key}</span>
                        <span className="text-gray-400">{count} ({percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="h-2 w-full bg-gray-800 rounded overflow-hidden">
                        <div className="h-full bg-purple-500 rounded" style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Chart 2: Severity Distribution */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 flex flex-col">
            <h3 className="text-white font-medium flex items-center gap-2 mb-4">
              <AlertTriangle className="text-orange-400" size={18} /> Threat Severity
            </h3>
            <div className="flex-1 flex flex-col justify-center gap-4">
              {Object.keys(severityCounts).length === 0 ? (
                <p className="text-sm text-gray-500 italic">Sample data — awaiting live attacks</p>
              ) : (
                Object.entries(severityCounts).map(([key, count]) => {
                  const percentage = ((count as number) / attacks.length) * 100;
                  const colorClass = getSeverityColor(key).split(' ')[0];
                  return (
                    <div key={key}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300 font-mono">{key}</span>
                        <span className="text-gray-400">{count} ({percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="h-2 w-full bg-gray-800 rounded overflow-hidden">
                        <div className={`h-full ${colorClass} rounded`} style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Attack Breakdown Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-white font-medium flex items-center gap-2">
              <Activity className="text-green-400" size={18} /> Detailed Attack Breakdown
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/40 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-3 font-medium">Session ID</th>
                  <th className="p-3 font-medium">Severity</th>
                  <th className="p-3 font-medium">Classification</th>
                  <th className="p-3 font-medium">Stage</th>
                  <th className="p-3 font-medium">Requests</th>
                  <th className="p-3 font-medium">Last Seen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {attacks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-gray-500 text-sm">No sessions recorded.</td>
                  </tr>
                ) : (
                  attacks.map((attack: any) => (
                    <tr key={attack.sessionId} className="hover:bg-gray-800/30">
                      <td className="p-3 text-white text-sm font-mono truncate max-w-[120px]" title={attack.sessionId}>
                        {attack.sessionId}
                      </td>
                      <td className="p-3">
                        <span className={`text-xs px-2 py-0.5 rounded font-bold bg-opacity-20 ${getSeverityColor(attack.threatSeverity)}`}>
                          {attack.threatSeverity}
                        </span>
                      </td>
                      <td className="p-3 text-gray-300 text-sm font-mono">{attack.classification}</td>
                      <td className="p-3 text-gray-300 text-sm font-mono">{attack.attackStage}</td>
                      <td className="p-3 text-gray-400 text-sm">{attack.requestCount}</td>
                      <td className="p-3 text-gray-400 text-sm font-mono">{new Date(attack.lastSeen).toLocaleTimeString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Sidebar Chatbot */}
      <div className="w-80 border-l border-gray-800 bg-gray-900/50 flex flex-col mt-6 rounded-tl-lg overflow-hidden shrink-0">
        <div className="p-4 border-b border-gray-800 bg-gray-900 flex items-center gap-2">
          <Terminal size={18} className="text-blue-400" />
          <h3 className="text-white font-medium">Analysis Assistant</h3>
        </div>
        <div className="flex-1 overflow-auto p-4 flex flex-col gap-4">
          <p className="text-xs text-gray-500 text-center mb-2">Automated pattern analysis.</p>
          {chatHistory.map((msg, i) => (
            <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3 rounded-lg text-sm ${
                msg.sender === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={chatBottomRef} />
        </div>
        <div className="p-3 border-t border-gray-800 bg-gray-900">
          <form onSubmit={handleChat} className="flex gap-2">
            <input 
              type="text" 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask about threats..." 
              className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button 
              type="submit" 
              disabled={!chatInput.trim()}
              className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
      
    </div>
  );
}
