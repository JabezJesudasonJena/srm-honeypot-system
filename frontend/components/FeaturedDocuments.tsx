"use client";

import {
  FileText,
  Server,
  Database,
  Lock,
  Terminal,
  ShieldAlert,
  Users,
  ExternalLink,
  Bot,
  Eye
} from "lucide-react";

export interface DocItem {
  id: string;
  title: string;
  category: "Engineering" | "DevOps" | "Database" | "Infrastructure" | "Security" | "HR & Policies";
  clearance: "INTERNAL" | "RESTRICTED" | "CONFIDENTIAL";
  lastUpdated: string;
  readTime: string;
  views: number;
  icon: React.ComponentType<{ className?: string }>;
  summary: string;
  contentSnippet: string;
  aiPrompt: string;
}

export const FEATURED_DOCS: DocItem[] = [
  {
    id: "doc-eng-onboard",
    title: "Engineering Onboarding Guide",
    category: "Engineering",
    clearance: "INTERNAL",
    lastUpdated: "2 days ago",
    readTime: "8 min read",
    views: 1420,
    icon: Terminal,
    summary: "Complete setup instructions for engineering workstations, GitHub enterprise tokens, and staging clusters.",
    contentSnippet: `# Engineering Onboarding & Setup Runbook\n\n## 1. Initial Environment Setup\nClone the monorepo from: git.internal.acme.corp/core/monorepo\n\n## 2. Authentication Tokens\nRun \`acme-cli login\` to configure your internal VPN session.\n\n## 3. Staging Access\nStaging instances are provisioned at https://staging-k8s.internal.acme.corp.`,
    aiPrompt: "How do I setup my environment using the Engineering Onboarding Guide?"
  },
  {
    id: "doc-prod-deploy",
    title: "Production Deployment Guide",
    category: "DevOps",
    clearance: "CONFIDENTIAL",
    lastUpdated: "Yesterday",
    readTime: "12 min read",
    views: 2890,
    icon: Server,
    summary: "Canary release pipelines, Kubernetes ArgoCD workflows, rollback procedures, and helm values.",
    contentSnippet: `# Production Deployment Guide (K8s & ArgoCD)\n\n## Release Pipeline Architecture\nAll microservices are deployed via ArgoCD at argocd.infra.internal.acme.corp.\n\n## Canary Deployment Verification\nCanary deployments route 5% of traffic initially before full promotion.`,
    aiPrompt: "Show me the production deployment guide and configuration."
  },
  {
    id: "doc-db-sched",
    title: "Database Maintenance Schedule",
    category: "Database",
    clearance: "RESTRICTED",
    lastUpdated: "4 hours ago",
    readTime: "6 min read",
    views: 3105,
    icon: Database,
    summary: "PostgreSQL master-replica failover schedule, connection string templates, and automated backups.",
    contentSnippet: `# Database Maintenance & Failover Runbook\n\n## Cluster Hostnames\nPrimary: db-primary.prod.internal.acme.corp:5432\nReplica Pool: db-replica-ro.prod.internal.acme.corp:5432\n\n## Staged Canary Access Keys\nService Account: svc_labyrinth_reader\nVault Secret Path: vault.internal.acme.corp/v1/secrets/databases/prod-core`,
    aiPrompt: "Where is the production database documentation and connection string?"
  },
  {
    id: "doc-api-docs",
    title: "Internal API Documentation",
    category: "Engineering",
    clearance: "INTERNAL",
    lastUpdated: "3 days ago",
    readTime: "15 min read",
    views: 4520,
    icon: FileText,
    summary: "REST & gRPC service catalog, API gateway routing rules, rate limits, and service-to-service auth.",
    contentSnippet: `# Internal Service Mesh & API Catalog\n\n## API Gateway Endpoint\nhttps://gateway.internal.acme.corp/v1\n\n## Authentication Header\nAuthorization: Bearer <ACME_JWT_SERVICE_TOKEN>`,
    aiPrompt: "What is the internal API documentation and gateway endpoint?"
  },
  {
    id: "doc-infra-policy",
    title: "Infrastructure Access Policy",
    category: "Infrastructure",
    clearance: "RESTRICTED",
    lastUpdated: "1 week ago",
    readTime: "10 min read",
    views: 1890,
    icon: Lock,
    summary: "SSH key rotation, Zero-Trust bastion gateway requirements, Teleport certificates, and break-glass procedures.",
    contentSnippet: `# Infrastructure Access & Bastion Policy (SEC-POL-441)\n\n## Bastion Hosts\n* US-East: bastion-us-east.corp.acme.corp:2222\n* EU-Central: bastion-eu-central.corp.acme.corp:2222\n\n## Emergency Access\nBreak-glass elevated credentials require lead approval.`,
    aiPrompt: "What are the infrastructure access policies and bastion hosts?"
  },
  {
    id: "doc-sec-ops",
    title: "Security Operations Guide",
    category: "Security",
    clearance: "RESTRICTED",
    lastUpdated: "5 days ago",
    readTime: "14 min read",
    views: 2140,
    icon: ShieldAlert,
    summary: "Threat classification matrix, canary token detection, incident response escalation paths, and SOC triage.",
    contentSnippet: `# Security Operations & Incident Response Manual\n\n## SOC Triage Protocol\nLevel 1: Suspicious Reconnaissance\nLevel 2: Sensitive Endpoint Probing\nLevel 3: Canary Credential Trigger & Immediate Lockdown`,
    aiPrompt: "Show me the Security Operations Guide and incident response triage."
  },
  {
    id: "doc-emp-res",
    title: "Employee Resources & Directory",
    category: "HR & Policies",
    clearance: "INTERNAL",
    lastUpdated: "2 weeks ago",
    readTime: "5 min read",
    views: 950,
    icon: Users,
    summary: "Corporate VPN client configuration, IT helpdesk SLAs, employee handbook, and equipment provisioning.",
    contentSnippet: `# Employee Handbook & IT Support\n\n## VPN Connectivity\nDownload the Acme WireGuard Profile from vpn.internal.acme.corp.\n\n## Helpdesk\nSubmit tickets to it-support@internal.acme.corp.`,
    aiPrompt: "How do I access employee resources and corporate VPN?"
  }
];

interface FeaturedDocumentsProps {
  filterCategory?: string;
  searchQuery?: string;
  onSelectDoc: (doc: DocItem) => void;
  onAskAI: (prompt: string) => void;
}

export default function FeaturedDocuments({
  filterCategory = "All",
  searchQuery = "",
  onSelectDoc,
  onAskAI
}: FeaturedDocumentsProps) {
  const filtered = FEATURED_DOCS.filter((doc) => {
    const matchesCategory =
      filterCategory === "All" || doc.category === filterCategory;
    const matchesSearch =
      searchQuery === "" ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span>Featured Documentation</span>
            <span className="text-xs font-normal text-slate-400 font-mono">
              ({filtered.length} resources)
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Core architecture specs, operational runbooks, and verified corporate standards.
          </p>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-8 rounded-xl bg-slate-900/50 border border-slate-800 text-center space-y-2">
          <p className="text-sm text-slate-300">No documents found matching "{searchQuery}"</p>
          <p className="text-xs text-slate-500">Try searching for "database", "kubernetes", "security", or "deployment".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((doc) => {
            const Icon = doc.icon;
            return (
              <div
                key={doc.id}
                className="group relative p-4 rounded-xl bg-[#0d1726]/80 hover:bg-[#111e33] border border-slate-800/90 hover:border-blue-500/50 transition-all duration-200 shadow-sm flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Category & Clearance Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800/40">
                      {doc.category}
                    </span>

                    {doc.clearance === "RESTRICTED" ? (
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-red-950/70 text-red-300 border border-red-800/50 flex items-center gap-1">
                        <Lock className="h-2.5 w-2.5" />
                        TIER 1 RESTRICTED
                      </span>
                    ) : doc.clearance === "CONFIDENTIAL" ? (
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-950/70 text-amber-300 border border-amber-800/50 flex items-center gap-1">
                        CONFIDENTIAL
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        INTERNAL
                      </span>
                    )}
                  </div>

                  {/* Title & Icon */}
                  <div className="flex items-start gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-blue-400 group-hover:text-cyan-300 group-hover:border-blue-500/40 transition-colors shrink-0 mt-0.5">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-100 group-hover:text-white transition-colors leading-snug">
                        {doc.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                        {doc.summary}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Metadata & Actions */}
                <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-3">
                    <span>{doc.readTime}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3 text-slate-500" />
                      {doc.views}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Ask AI button */}
                    <button
                      type="button"
                      onClick={() => onAskAI(doc.aiPrompt)}
                      className="px-2 py-1 rounded bg-blue-950/80 hover:bg-blue-900 border border-blue-800/60 text-cyan-300 text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                      title="Query Labyrinth AI on this document"
                    >
                      <Bot className="h-3 w-3" />
                      <span>Ask AI</span>
                    </button>

                    {/* View Details */}
                    <button
                      type="button"
                      onClick={() => onSelectDoc(doc)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <span>Read</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
