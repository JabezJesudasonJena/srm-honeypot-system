interface LogEntry {
  time: string;
  ip: string;
  request: string;
  attackType: string;
  risk: string;
  status: string;
}

interface AttackTableProps {
  logs: LogEntry[];
}

export default function AttackTable({ logs }: AttackTableProps) {
  const getRiskColor = (risk: string) => {
    switch (risk.toUpperCase()) {
      case 'CRITICAL': return 'bg-[#ff2a2a]/20 text-[#ff2a2a] border-[#ff2a2a]/50';
      case 'HIGH': return 'bg-[#ffb300]/20 text-[#ffb300] border-[#ffb300]/50';
      case 'MEDIUM': return 'bg-[#00b8ff]/20 text-[#00b8ff] border-[#00b8ff]/50';
      default: return 'bg-[#64748b]/20 text-[#64748b] border-[#64748b]/50';
    }
  };

  const getStatusColor = (status: string) => {
    if (status.toUpperCase() === 'BREACH') return 'text-[var(--color-cyber-alert)] font-bold';
    return 'text-[var(--color-cyber-primary)]';
  };

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-[var(--color-cyber-border)] glass-panel">
      <table className="w-full text-left font-mono text-sm">
        <thead className="bg-[#1a2735] text-[var(--color-cyber-muted)] border-b border-[var(--color-cyber-border)]">
          <tr>
            <th className="px-6 py-4 font-normal">Time</th>
            <th className="px-6 py-4 font-normal">IP Address</th>
            <th className="px-6 py-4 font-normal">Request</th>
            <th className="px-6 py-4 font-normal">Attack Type</th>
            <th className="px-6 py-4 font-normal">Risk</th>
            <th className="px-6 py-4 font-normal">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-cyber-border)] text-gray-300">
          {logs.map((log, i) => (
            <tr key={i} className="hover:bg-[#1a2735]/50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-[var(--color-cyber-muted)]">{log.time}</td>
              <td className="px-6 py-4 whitespace-nowrap font-bold text-[var(--color-cyber-accent)]">{log.ip}</td>
              <td className="px-6 py-4 truncate max-w-xs" title={log.request}>{log.request}</td>
              <td className="px-6 py-4 whitespace-nowrap">{log.attackType}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs rounded border ${getRiskColor(log.risk)}`}>
                  {log.risk}
                </span>
              </td>
              <td className={`px-6 py-4 whitespace-nowrap ${getStatusColor(log.status)}`}>
                {log.status}
              </td>
            </tr>
          ))}
          {logs.length === 0 && (
            <tr>
              <td colSpan={6} className="px-6 py-8 text-center text-[var(--color-cyber-muted)]">
                No active threats detected.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
