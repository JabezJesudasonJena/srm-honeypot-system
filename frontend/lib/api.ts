const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Mock Data Fallbacks
const MOCK_STATS = {
  totalRequests: 1247,
  suspiciousQueries: 86,
  canaryTriggers: 3,
  threatLevel: "HIGH"
};

const MOCK_LOGS = [
  { time: "10:32:14", ip: "192.168.1.44", request: "production db password", attackType: "Credential Search", risk: "HIGH", status: "MONITORED" },
  { time: "10:31:52", ip: "10.0.0.27", request: "/api/admin", attackType: "Endpoint Probe", risk: "MEDIUM", status: "MONITORED" },
  { time: "10:30:11", ip: "172.16.4.92", request: "CANARY_KEY_LOGIN", attackType: "Canary Attempt", risk: "CRITICAL", status: "BREACH" }
];

const MOCK_ALERTS = [
  {
    active: true,
    credential: "CANARY_KEY_********",
    ip: "192.168.1.44",
    action: "Threat intelligence collection initiated."
  }
];

const MOCK_THREAT_REPORT = [
  "The attacker performed reconnaissance targeting database credentials.",
  "Multiple sensitive administrative endpoints were probed.",
  "Canary credentials were retrieved and later used, confirming malicious intent."
];

// Helper to handle fetch with fallback
async function fetchWithFallback<T>(url: string, options: RequestInit, fallbackData: T): Promise<T> {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      console.warn(`API call failed for ${url}, using fallback.`);
      return fallbackData;
    }
    return await response.json() as T;
  } catch (error) {
    console.warn(`API call failed for ${url}, using fallback. Error:`, error);
    return fallbackData;
  }
}

export interface WikiSearchResult {
  classification: "INTERNAL" | "RESTRICTED" | "CONFIDENTIAL" | "ERROR";
  response: string;
  sources?: string[];
}

function generateMockHoneypotResponse(query: string): WikiSearchResult {
  const q = query.toLowerCase();

  if (q.includes("database") || q.includes("db") || q.includes("postgres") || q.includes("sql")) {
    return {
      classification: "RESTRICTED",
      response: `### 🗄️ ACME Production Database Infrastructure

Found matched internal runbook: **DB-PROD-092 / Primary Cluster**

**Cluster Endpoints:**
\`\`\`yaml
host: "db-primary.prod.internal.acme.corp"
port: 5432
database: "acme_core_production"
replica_pool: "db-replica-ro.prod.internal.acme.corp:5432"
ssl_mode: "verify-full"
\`\`\`

**Authentication & Staged Credentials:**
* Service Account: \`svc_labyrinth_reader\`
* Staged Auth Token: \`canary_sec_token_9921_prod_db_v2\`
* Secret Vault Path: \`vault.internal.acme.corp/v1/secrets/databases/prod-core\`

> ⚠️ **CLASSIFICATION: TIER-1 RESTRICTED** — Direct direct-connect queries are monitored by Security SOC. Ensure TLS certificate is signed by Acme Internal CA.`,
      sources: ["docs.internal.acme.corp/databases/prod-overview.md", "runbooks/db-failover-sop.md"]
    };
  }

  if (q.includes("deploy") || q.includes("kubernetes") || q.includes("k8s") || q.includes("helm") || q.includes("config")) {
    return {
      classification: "INTERNAL",
      response: `### 🚀 Production Deployment & Kubernetes Cluster Config

Found matched internal guide: **ENG-K8S-DEVOPS / Release Pipeline**

**Cluster Context:**
* Kubernetes API Gateway: \`https://k8s-master.prod.acme.corp:6443\`
* Namespace: \`acme-prod-services\`
* ArgoCD Internal UI: \`https://argocd.infra.internal.acme.corp\`

**Deployment Manifest Sample:**
\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: core-api-service
  namespace: acme-prod-services
spec:
  replicas: 5
  template:
    spec:
      containers:
      - name: api
        image: registry.internal.acme.corp/core/api:v2.14.0
        envFrom:
        - secretRef:
            name: prod-api-canary-secrets
\`\`\`

> ℹ️ Deployments must pass CI/CD automated vulnerability scanning and canary deployment verification.`,
      sources: ["devops.internal.acme.corp/k8s/production-clusters.md", "ci-cd/helm-deployments.md"]
    };
  }

  if (q.includes("infrastructure") || q.includes("access") || q.includes("bastion") || q.includes("ssh") || q.includes("vpn")) {
    return {
      classification: "RESTRICTED",
      response: `### 🛡️ Infrastructure Access Policy & Bastion Gateway

Found policy document: **SEC-POL-441 / Remote Server Access Protocols**

**Bastion Hosts:**
* Primary Ingress: \`bastion-us-east.corp.acme.corp:2222\`
* European Failover: \`bastion-eu-central.corp.acme.corp:2222\`
* WireGuard VPN: \`vpn-mesh.internal.acme.corp:51820\`

**SSH Key Requirements:**
* Only ED25519 hardware-backed keys or signed Teleport certificates are accepted.
* Direct root login is strictly prohibited on all \`*.prod.acme.corp\` hosts.

**Emergency Break-Glass Procedure:**
To request elevated 2-hour root access for critical incidents, open a P0 ticket on \`jira.internal.acme.corp\` and obtain approval from the on-call SRE Lead.`,
      sources: ["security.internal.acme.corp/policies/infrastructure-access.md", "sre/bastion-routing.md"]
    };
  }

  if (q.includes("engineering") || q.includes("onboarding") || q.includes("resource") || q.includes("api") || q.includes("doc")) {
    return {
      classification: "INTERNAL",
      response: `### 📚 ACME Engineering Resource Directory

Welcome to the ACME Corp Engineering portal. Key internal systems:

* **Internal API Gateway**: \`https://gateway.internal.acme.corp/v1\`
* **Swagger / OpenAPI Documentation**: \`https://docs.internal.acme.corp/api-reference\`
* **Artifact Registry**: \`registry.internal.acme.corp\`
* **Staging Environment**: \`https://staging-cluster.internal.acme.corp\`
* **Telemetry & Grafana**: \`https://metrics.internal.acme.corp:3000\`

**Getting Started:**
1. Clone the master repository from \`git.internal.acme.corp/core/monorepo\`.
2. Configure your local developer profile with \`acme-cli auth login\`.
3. Join the \`#engineering-general\` Slack channel.`,
      sources: ["docs.internal.acme.corp/onboarding/quickstart.md", "wiki/developer-handbook.md"]
    };
  }

  return {
    classification: "INTERNAL",
    response: `### 📖 Internal Knowledge Base Result

I searched the ACME Corp internal vector index for: **"${query}"**

**Summary of Internal Documentation:**
Relevant internal resources were indexed across Engineering, Infrastructure, and DevOps knowledge bases. 

* **Document Index**: \`DOC-${Math.floor(1000 + Math.random() * 9000)}\`
* **Clearance Level**: \`INTERNAL CONFIDENTIAL\`
* **Status**: Indexed & Active

For specific architecture diagrams, configuration files, or database credentials, please specify the target service or consult the [Engineering Directory](https://docs.internal.acme.corp).`,
    sources: ["docs.internal.acme.corp/index", "runbooks/corporate-directory.md"]
  };
}

export async function searchWiki(query: string): Promise<WikiSearchResult> {
  const fallback = generateMockHoneypotResponse(query);
  try {
    const response = await fetch(`${API_BASE_URL}/api/wiki/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      console.warn(`API call failed with status ${response.status}, using honeypot fallback response.`);
      return fallback;
    }

    const data = await response.json();
    return {
      classification: data.classification || (data.threatDetected ? "RESTRICTED" : "INTERNAL"),
      response: data.response || data.result || data.message || fallback.response,
      sources: data.sources || fallback.sources
    };
  } catch (error) {
    console.warn(`API call failed for searchWiki, using honeypot fallback response.`, error);
    return fallback;
  }
}

export async function getLogs() {
  return fetchWithFallback(`${API_BASE_URL}/api/logs`, {}, MOCK_LOGS);
}

export async function getStats() {
  return fetchWithFallback(`${API_BASE_URL}/api/stats`, {}, MOCK_STATS);
}

export async function getAlerts() {
  return fetchWithFallback(`${API_BASE_URL}/api/alerts`, {}, MOCK_ALERTS);
}

export async function getThreatReport() {
  return fetchWithFallback(`${API_BASE_URL}/api/threat-report`, {}, MOCK_THREAT_REPORT);
}
