export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/labyrinth-api';

export async function fetchOverview() {
  const res = await fetch(`${API_BASE_URL}/overview`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch overview');
  return res.json();
}

export async function fetchAttacks() {
  const res = await fetch(`${API_BASE_URL}/attacks`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch attacks');
  return res.json();
}

export async function fetchSession(sessionId: string) {
  const res = await fetch(`${API_BASE_URL}/attacks/${sessionId}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch session');
  return res.json();
}

export async function fetchTimeline(sessionId: string) {
  const res = await fetch(`${API_BASE_URL}/attacks/${sessionId}/timeline`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch timeline');
  return res.json();
}

export async function fetchReplay(sessionId: string) {
  const res = await fetch(`${API_BASE_URL}/attacks/${sessionId}/replay`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch replay');
  return res.json();
}

export async function fetchAssets(sessionId: string) {
  const res = await fetch(`${API_BASE_URL}/attacks/${sessionId}/assets`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch assets');
  return res.json();
}

export async function fetchCanaries(sessionId: string) {
  const res = await fetch(`${API_BASE_URL}/attacks/${sessionId}/canaries`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch canaries');
  return res.json();
}

export async function fetchDecision(sessionId: string) {
  const res = await fetch(`${API_BASE_URL}/attacks/${sessionId}/decision`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch decision');
  return res.json();
}

export async function fetchGraph(sessionId: string) {
  const res = await fetch(`${API_BASE_URL}/attacks/${sessionId}/graph`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch graph');
  return res.json();
}

export async function fetchAlerts() {
  const res = await fetch(`${API_BASE_URL}/alerts`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch alerts');
  return res.json();
}

export async function fetchThreatIntel(sessionId: string) {
  const res = await fetch(`${API_BASE_URL}/threat-intelligence/${sessionId}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch threat intel');
  return res.json();
}

export async function fetchSystemHealth() {
  const res = await fetch(`${API_BASE_URL}/system/health`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch system health');
  return res.json();
}

export async function fetchSystemMetrics() {
  const res = await fetch(`${API_BASE_URL}/system/metrics`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch system metrics');
  return res.json();
}

export async function fetchBenchmark() {
  const res = await fetch(`${API_BASE_URL}/benchmark`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch benchmark');
  return res.json();
}

export async function resetSystem() {
  const res = await fetch(`${API_BASE_URL}/system/reset`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset system');
  return res.json();
}

export async function simulateAttack(scenario: string) {
  const res = await fetch(`${API_BASE_URL}/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenario }),
  });
  if (!res.ok) throw new Error('Failed to simulate attack');
  return res.json();
}
