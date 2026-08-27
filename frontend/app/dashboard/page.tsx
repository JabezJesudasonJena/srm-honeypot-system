"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Activity, ShieldAlert, Target, Zap, ExternalLink, Globe } from 'lucide-react';
import StatsCard from '@/components/StatsCard';
import AttackTable from '@/components/AttackTable';
import CanaryAlert from '@/components/CanaryAlert';
import ThreatReport from '@/components/ThreatReport';
import SystemFlow from '@/components/SystemFlow';
import { getStats, getLogs, getAlerts, getThreatReport } from '@/lib/api';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [threatReport, setThreatReport] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsData, logsData, alertsData, reportData] = await Promise.all([
          getStats(),
          getLogs(),
          getAlerts(),
          getThreatReport()
        ]);
        
        setStats(statsData);
        setLogs(logsData);
        setAlerts(alertsData);
        setThreatReport(reportData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
    
    // Simulate real-time updates
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const activeAlert = alerts.find(a => a.active) || null;

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-mono font-bold text-white mb-2">LABYRINTH SECURITY OPERATIONS CENTER</h1>
          <p className="text-[var(--color-cyber-primary)] font-mono">Live Honeypot Monitoring & Threat Intelligence</p>
        </div>

        <Link
          href="/user"
          className="self-start sm:self-auto px-4 py-2 bg-blue-950/80 hover:bg-blue-900 border border-blue-600/60 hover:border-blue-500 rounded-md font-mono text-xs text-blue-300 hover:text-white transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(37,99,235,0.2)] group"
        >
          <Globe className="h-4 w-4 text-blue-400 group-hover:rotate-45 transition-transform" />
          <span>Open User Portal (Honeypot Ingress)</span>
          <ExternalLink className="h-3.5 w-3.5 text-blue-400" />
        </Link>
      </div>

      <CanaryAlert alert={activeAlert} />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard 
          title="Total Requests" 
          value={stats?.totalRequests || "0"} 
          subtitle="+12% today" 
          icon={<Activity className="h-6 w-6" />} 
        />
        <StatsCard 
          title="Suspicious Queries" 
          value={stats?.suspiciousQueries || "0"} 
          subtitle="Active Reconnaissance" 
          icon={<Target className="h-6 w-6" />} 
        />
        <StatsCard 
          title="Canary Triggers" 
          value={stats?.canaryTriggers || "0"} 
          subtitle="BREACH ATTEMPTS" 
          icon={<ShieldAlert className="h-6 w-6" />} 
          alert={stats?.canaryTriggers > 0}
        />
        <StatsCard 
          title="Threat Level" 
          value={stats?.threatLevel || "LOW"} 
          icon={<Zap className="h-6 w-6" />} 
          alert={stats?.threatLevel === "HIGH" || stats?.threatLevel === "CRITICAL"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-lg border border-[var(--color-cyber-border)]">
            <h2 className="text-xl font-mono font-bold text-white mb-6 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-[var(--color-cyber-primary)]" />
              Live Attack Activity
            </h2>
            <AttackTable logs={logs} />
          </div>
          
          <div className="h-[400px]">
            <ThreatReport report={threatReport} isLoading={isLoading} />
          </div>
        </div>

        <div className="lg:col-span-1">
          <SystemFlow />
        </div>

      </div>
    </div>
  );
}
