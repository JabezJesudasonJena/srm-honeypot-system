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

export async function searchWiki(query: string) {
  return fetchWithFallback(
    `${API_BASE_URL}/api/wiki/search`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    },
    {
      classification: "INTERNAL",
      response: "This is a simulated internal document regarding your query: '" + query + "'.\n\nDatabase configurations can be found at internal.acme.corp/db-config.\n\nWarning: Ensure you have appropriate clearance before accessing."
    }
  );
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
