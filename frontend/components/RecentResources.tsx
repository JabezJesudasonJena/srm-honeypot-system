"use client";

import { Clock, CheckCircle2, AlertTriangle, ArrowRight, Shield, Cpu, BookOpen, Layers } from "lucide-react";

interface RecentResourcesProps {
  onAskAI: (prompt: string) => void;
}

const RECENT_UPDATES = [
  {
    title: "Postgres 16 Replication Upgrade Completed",
    category: "Infrastructure",
    time: "2 hours ago",
    author: "DBA Team",
    prompt: "Tell me about the Postgres 16 replication upgrade and current cluster state."
  },
  {
    title: "Updated Teleport Bastion SSH Protocol (v4.1)",
    category: "Security",
    time: "5 hours ago",
    author: "SecOps",
    prompt: "What are the updated Teleport Bastion SSH protocols?"
  },
  {
    title: "New Staging Microservice Helm Values Published",
    category: "DevOps",
    time: "Yesterday",
    author: "Platform Eng",
    prompt: "Where are the staging microservice Helm values?"
  },
  {
    title: "Core Service Auth Key Rotation Policy 2026",
    category: "Compliance",
    time: "3 days ago",
    author: "IAM Admin",
    prompt: "What is the 2026 Core Service Auth Key Rotation Policy?"
  }
];

const SYSTEM_STATUS = [
  { name: "Kubernetes Prod Cluster (us-east)", status: "Operational", healthy: true },
  { name: "PostgreSQL Primary Pool", status: "Operational", healthy: true },
  { name: "Internal RAG Vector Index", status: "Active (BullMQ Ingest)", healthy: true },
  { name: "Canary Sentinel Monitor", status: "Armed & Active", healthy: true },
];

export default function RecentResources({ onAskAI }: RecentResourcesProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
      
      {/* Recent Document Updates */}
      <div className="lg:col-span-2 p-5 rounded-xl bg-[#0b1424]/90 border border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-blue-400" />
            <h3 className="text-sm font-bold text-slate-100">
              Recent Intranet Updates & Changelogs
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Real-time Feed</span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {RECENT_UPDATES.map((item, idx) => (
            <div
              key={idx}
              className="py-3 flex items-center justify-between gap-4 group hover:bg-slate-900/40 px-2 rounded-lg transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-blue-300 transition-colors">
                    {item.title}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                    {item.category}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Updated {item.time} by <span className="text-slate-400">{item.author}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => onAskAI(item.prompt)}
                className="shrink-0 p-1.5 rounded-md text-slate-500 hover:text-cyan-300 hover:bg-blue-950/60 transition-all cursor-pointer"
                title="Query AI about this update"
              >
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Corporate Systems Status Widget */}
      <div className="p-5 rounded-xl bg-[#0b1424]/90 border border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Layers className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-100">
                System Health & Endpoints
              </h3>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          </div>

          <div className="space-y-2.5">
            {SYSTEM_STATUS.map((sys, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 flex items-center justify-between text-xs"
              >
                <span className="text-slate-300 font-medium truncate pr-2">
                  {sys.name}
                </span>
                <span className="shrink-0 flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-900/40">
                  <CheckCircle2 className="h-3 w-3" />
                  {sys.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Corporate Notice */}
        <div className="mt-4 p-3 rounded-lg bg-blue-950/40 border border-blue-800/30 text-[11px] text-blue-300 leading-snug">
          <p className="font-semibold text-blue-200 mb-1 flex items-center gap-1.5">
            <Shield className="h-3 w-3 text-cyan-400" />
            Security Notice
          </p>
          Internal documentation contains proprietary ACME Corp infrastructure data. Access is logged and monitored for anomaly detection.
        </div>

      </div>

    </div>
  );
}
