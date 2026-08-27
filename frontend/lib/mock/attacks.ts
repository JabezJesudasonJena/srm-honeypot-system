// ============================================================================
// Mock Data — Attack Sessions
// ============================================================================
import type { AttackSession, DeceptionGraphNode, DeceptionGraphEdge } from '../types';

function makeGraph(discovered: string[]): { nodes: DeceptionGraphNode[]; edges: DeceptionGraphEdge[] } {
  const allNodes: DeceptionGraphNode[] = [
    { id: 'root', label: 'NexusFintech Corp', group: 'company', discovered: true, x: 300, y: 30 },
    { id: 'admin', label: 'Admin User', group: 'employee', discovered: discovered.includes('admin'), x: 140, y: 130 },
    { id: 'aws', label: 'AWS Cloud', group: 'cloud', discovered: discovered.includes('aws'), x: 460, y: 130 },
    { id: 'portal', label: 'Admin Portal', group: 'service', discovered: discovered.includes('portal'), x: 80, y: 230 },
    { id: 'auth', label: 'Auth Service', group: 'service', discovered: discovered.includes('auth'), x: 200, y: 230 },
    { id: 'ec2', label: 'EC2 Instance', group: 'cloud', discovered: discovered.includes('ec2'), x: 400, y: 230 },
    { id: 's3', label: 'S3 Bucket', group: 'cloud', discovered: discovered.includes('s3'), x: 520, y: 230 },
    { id: 'postgres', label: 'PostgreSQL', group: 'database', discovered: discovered.includes('postgres'), x: 400, y: 330 },
    { id: 'canary1', label: 'CANARY-91KX', group: 'canary', discovered: discovered.includes('canary1'), x: 400, y: 420 },
  ];
  const edges: DeceptionGraphEdge[] = [
    { from: 'root', to: 'admin' }, { from: 'root', to: 'aws' },
    { from: 'admin', to: 'portal' }, { from: 'admin', to: 'auth' },
    { from: 'aws', to: 'ec2' }, { from: 'aws', to: 's3' },
    { from: 'ec2', to: 'postgres' }, { from: 'postgres', to: 'canary1' },
  ];
  return { nodes: allNodes, edges };
}

export const mockSessions: AttackSession[] = [
  {
    sessionId: 'a81f3e02',
    sourceIP: '10.0.42.17',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AttackSim/2.1',
    startedAt: '2026-08-26T21:14:00Z',
    lastSeen: '2026-08-26T21:21:31Z',
    status: 'ACTIVE',
    requestCount: 438,
    uniqueEndpoints: 37,
    threatScore: 96,
    severity: 'CRITICAL',
    currentStrategy: 'CLOUD_CREDENTIAL_DECEPTION',
    duration: '7m 31s',
    attackerProfile: {
      attackerType: 'Credential Hunter',
      confidence: 91,
      automationProbability: 94,
      behaviors: {
        reconnaissance: 91, enumeration: 82, credentialHunting: 87,
        exploitation: 42, privilegeEscalation: 31, cloudDiscovery: 68, databaseDiscovery: 23,
      },
    },
    deceptionState: {
      company: 'NexusFintech Corp', environment: 'Production', region: 'us-east-1',
      deceptionDepth: 4, maxDepth: 5,
      revealedServices: [
        { id: 'svc1', name: 'auth-service', type: 'service', details: 'auth-service.nexusfintech.internal:8003', discovered: true },
        { id: 'svc2', name: 'payment-api', type: 'service', details: 'payment-api.nexusfintech.internal:8080', discovered: true },
      ],
      revealedDatabases: [
        { id: 'db1', name: 'postgres-prod-02', type: 'database', details: 'PostgreSQL 15.4 | 10.20.4.20:5432', discovered: true },
      ],
      revealedEmployees: [
        { id: 'USR-1001', name: 'Sarah Chen', email: 'schen@nexusfintech.internal', role: 'admin' },
        { id: 'USR-1002', name: 'System Service', email: 'devops@nexusfintech.internal', role: 'devops' },
      ],
      revealedCloudResources: [
        { id: 'cl1', name: 'AWS us-east-1', type: 'cloud', details: 'EC2 i-0a1b2c3d4e5f', discovered: true },
      ],
      revealedCredentials: [
        { username: 'admin@nexusfintech.internal', type: 'API Key' },
        { username: 'devops@nexusfintech.internal', type: 'SSH Key' },
      ],
    },
    deceptionGraph: makeGraph(['admin', 'aws', 'portal', 'auth', 'ec2', 's3', 'postgres', 'canary1']),
    timeline: [
      { id: 't1', timestamp: '2026-08-26T21:14:03Z', eventType: 'SESSION_CREATED', details: 'New attack session from 10.0.42.17' },
      { id: 't2', timestamp: '2026-08-26T21:14:03Z', eventType: 'RECON', details: 'Reconnaissance: GET /robots.txt' },
      { id: 't3', timestamp: '2026-08-26T21:14:07Z', eventType: 'ENUMERATION', details: 'Endpoint enumeration: GET /api/v1' },
      { id: 't4', timestamp: '2026-08-26T21:14:15Z', eventType: 'CREDENTIAL_DISCOVERY', details: 'Credential probing: GET /.env' },
      { id: 't5', timestamp: '2026-08-26T21:14:21Z', eventType: 'CLOUD_DISCOVERY', details: 'Cloud config probing: GET /api/aws' },
      { id: 't6', timestamp: '2026-08-26T21:14:38Z', eventType: 'CANARY_EXPOSURE', details: 'Canary LAB-A81F-CAN-91KX exposed at /api/admin/config' },
      { id: 't7', timestamp: '2026-08-26T21:14:42Z', eventType: 'CANARY_REUSE', details: 'Canary LAB-A81F-CAN-91KX reused at /api/auth/login' },
      { id: 't8', timestamp: '2026-08-26T21:14:43Z', eventType: 'ALERT', details: 'CRITICAL: Canary credential reuse detected' },
    ],
    canaries: [
      { canaryId: 'LAB-A81F-CAN-91KX', sessionId: 'a81f3e02', credentialType: 'AWS Access Key', exposureEndpoint: '/api/admin/config', exposedAt: '2026-08-26T21:14:38Z', triggered: true, triggeredAt: '2026-08-26T21:14:42Z', triggerEndpoint: '/api/auth/login' },
      { canaryId: 'LAB-A81F-CAN-72BD', sessionId: 'a81f3e02', credentialType: 'API Token', exposureEndpoint: '/api/users', exposedAt: '2026-08-26T21:15:02Z', triggered: true, triggeredAt: '2026-08-26T21:16:10Z', triggerEndpoint: '/api/admin/dashboard' },
      { canaryId: 'LAB-A81F-CAN-A3F0', sessionId: 'a81f3e02', credentialType: 'Database Password', exposureEndpoint: '/api/database/status', exposedAt: '2026-08-26T21:16:44Z', triggered: false },
    ],
    aiDecisions: [
      { intent: 'CREDENTIAL_HUNTING', confidence: 91, evidence: ['Requested /.env', 'Enumerated auth endpoints', 'Requested /api/credentials'], retrievedContext: 'Q3 Infrastructure Documentation', selectedStrategy: 'CLOUD_CREDENTIAL_DECEPTION', canaryId: 'LAB-A81F-CAN-91KX', provider: 'Gemini', timestamp: '2026-08-26T21:14:35Z' },
    ],
    requestHistory: [
      { id: 'r1', timestamp: '2026-08-26T21:14:03Z', method: 'GET', path: '/robots.txt', intent: 'Reconnaissance', threatScoreDelta: 3, responseStrategy: 'RECON_DECEPTION', statusCode: 200 },
      { id: 'r2', timestamp: '2026-08-26T21:14:07Z', method: 'GET', path: '/api/v1', intent: 'Enumeration', threatScoreDelta: 5, responseStrategy: 'RECON_DECEPTION', statusCode: 200 },
      { id: 'r3', timestamp: '2026-08-26T21:14:15Z', method: 'GET', path: '/.env', intent: 'Credential Hunting', threatScoreDelta: 12, responseStrategy: 'CREDENTIAL_DECEPTION', statusCode: 500 },
      { id: 'r4', timestamp: '2026-08-26T21:14:21Z', method: 'GET', path: '/api/aws', intent: 'Cloud Discovery', threatScoreDelta: 8, responseStrategy: 'CLOUD_CREDENTIAL_DECEPTION', statusCode: 200 },
      { id: 'r5', timestamp: '2026-08-26T21:14:38Z', method: 'GET', path: '/api/admin/config', intent: 'Credential Hunting', threatScoreDelta: 14, responseStrategy: 'CREDENTIAL_DECEPTION', canaryId: 'LAB-A81F-CAN-91KX', statusCode: 500 },
      { id: 'r6', timestamp: '2026-08-26T21:14:42Z', method: 'POST', path: '/api/auth/login', payload: { username: 'admin', password: 'LAB-A81F-CAN-91KX' }, intent: 'Credential Reuse', threatScoreDelta: 40, responseStrategy: 'CREDENTIAL_DECEPTION', canaryId: 'LAB-A81F-CAN-91KX', statusCode: 401 },
      { id: 'r7', timestamp: '2026-08-26T21:15:02Z', method: 'GET', path: '/api/database/status', payload: undefined, intent: 'Database Discovery', threatScoreDelta: 6, responseStrategy: 'DATABASE_DECEPTION', statusCode: 200 },
    ],
    threatIntelligence: {
      attackerObjective: 'Credential harvesting and lateral movement',
      threatLevel: 'CRITICAL',
      likelyAttackType: 'Automated credential discovery with manual exploitation',
      observedTechniques: ['Reconnaissance', 'Credential Discovery', 'Cloud Discovery', 'Credential Reuse', 'Privilege Escalation Attempt'],
      confidence: 89,
      executiveSummary: 'Attack session a81f3e02 originated from 10.0.42.17 and lasted 7 minutes. The attacker made 438 requests across 37 unique endpoints. Classification: credential hunter. Threat severity: CRITICAL (96/100). CRITICAL: 2 canary credential(s) were triggered, indicating active credential reuse.',
    },
  },
  {
    sessionId: '92kd7f01',
    sourceIP: '10.0.18.93',
    userAgent: 'Nikto/2.1.6',
    startedAt: '2026-08-26T21:18:00Z',
    lastSeen: '2026-08-26T21:22:14Z',
    status: 'ACTIVE',
    requestCount: 312,
    uniqueEndpoints: 58,
    threatScore: 81,
    severity: 'HIGH',
    currentStrategy: 'RECON_DECEPTION',
    duration: '4m 14s',
    attackerProfile: {
      attackerType: 'Automated Scanner',
      confidence: 96,
      automationProbability: 99,
      behaviors: {
        reconnaissance: 95, enumeration: 89, credentialHunting: 34,
        exploitation: 12, privilegeEscalation: 5, cloudDiscovery: 18, databaseDiscovery: 22,
      },
    },
    deceptionState: {
      company: 'NexusFintech Corp', environment: 'Production', region: 'us-east-1',
      deceptionDepth: 2, maxDepth: 5,
      revealedServices: [{ id: 'svc1', name: 'auth-service', type: 'service', details: 'auth-service.nexusfintech.internal:8003', discovered: true }],
      revealedDatabases: [],
      revealedEmployees: [],
      revealedCloudResources: [],
      revealedCredentials: [],
    },
    deceptionGraph: makeGraph(['admin', 'auth']),
    timeline: [
      { id: 't1', timestamp: '2026-08-26T21:18:00Z', eventType: 'SESSION_CREATED', details: 'New session from Nikto scanner' },
      { id: 't2', timestamp: '2026-08-26T21:18:01Z', eventType: 'RECON', details: 'Rapid endpoint scanning detected' },
      { id: 't3', timestamp: '2026-08-26T21:18:03Z', eventType: 'ENUMERATION', details: 'High-speed enumeration: 50+ paths in 2s' },
    ],
    canaries: [
      { canaryId: 'LAB-92KD-CAN-44AF', sessionId: '92kd7f01', credentialType: 'API Token', exposureEndpoint: '/api/admin/users', exposedAt: '2026-08-26T21:19:30Z', triggered: false },
    ],
    aiDecisions: [],
    requestHistory: [
      { id: 'r1', timestamp: '2026-08-26T21:18:01Z', method: 'GET', path: '/', intent: 'Reconnaissance', threatScoreDelta: 2, responseStrategy: 'RECON_DECEPTION', statusCode: 200 },
      { id: 'r2', timestamp: '2026-08-26T21:18:01Z', method: 'GET', path: '/robots.txt', intent: 'Reconnaissance', threatScoreDelta: 2, responseStrategy: 'RECON_DECEPTION', statusCode: 200 },
    ],
    threatIntelligence: {
      attackerObjective: 'Automated vulnerability scanning',
      threatLevel: 'HIGH',
      likelyAttackType: 'Automated scanner (Nikto)',
      observedTechniques: ['Reconnaissance', 'Enumeration'],
      confidence: 96,
      executiveSummary: 'Automated scanner session with Nikto user agent. High request rate indicates scripted scanning. 312 requests across 58 endpoints.',
    },
  },
  {
    sessionId: '18xf9c03',
    sourceIP: '10.0.77.215',
    userAgent: 'python-requests/2.31.0',
    startedAt: '2026-08-26T21:20:00Z',
    lastSeen: '2026-08-26T21:23:48Z',
    status: 'ACTIVE',
    requestCount: 89,
    uniqueEndpoints: 12,
    threatScore: 74,
    severity: 'HIGH',
    currentStrategy: 'CLOUD_CREDENTIAL_DECEPTION',
    duration: '3m 48s',
    attackerProfile: {
      attackerType: 'Cloud Attacker',
      confidence: 78,
      automationProbability: 82,
      behaviors: {
        reconnaissance: 45, enumeration: 38, credentialHunting: 61,
        exploitation: 28, privilegeEscalation: 15, cloudDiscovery: 88, databaseDiscovery: 12,
      },
    },
    deceptionState: {
      company: 'NexusFintech Corp', environment: 'Production', region: 'us-east-1',
      deceptionDepth: 3, maxDepth: 5,
      revealedServices: [],
      revealedDatabases: [],
      revealedEmployees: [],
      revealedCloudResources: [
        { id: 'cl1', name: 'AWS us-east-1', type: 'cloud', details: 'EC2 i-0a1b2c3d4e5f', discovered: true },
        { id: 'cl2', name: 'S3 nexus-backups', type: 'cloud', details: 's3://nexus-backups-prod', discovered: true },
      ],
      revealedCredentials: [{ username: 'AKIA-FAKE-KEY', type: 'AWS Access Key' }],
    },
    deceptionGraph: makeGraph(['aws', 'ec2', 's3']),
    timeline: [
      { id: 't1', timestamp: '2026-08-26T21:20:00Z', eventType: 'SESSION_CREATED', details: 'New session from python-requests' },
      { id: 't2', timestamp: '2026-08-26T21:20:05Z', eventType: 'CLOUD_DISCOVERY', details: 'Cloud metadata probing: GET /latest/meta-data/' },
      { id: 't3', timestamp: '2026-08-26T21:20:12Z', eventType: 'CLOUD_DISCOVERY', details: 'S3 bucket enumeration: GET /api/s3/buckets' },
      { id: 't4', timestamp: '2026-08-26T21:21:00Z', eventType: 'CANARY_EXPOSURE', details: 'Canary AWS key exposed at /api/cloud/config' },
    ],
    canaries: [
      { canaryId: 'LAB-18XF-CAN-CC01', sessionId: '18xf9c03', credentialType: 'AWS Access Key', exposureEndpoint: '/api/cloud/config', exposedAt: '2026-08-26T21:21:00Z', triggered: false },
    ],
    aiDecisions: [],
    requestHistory: [],
    threatIntelligence: {
      attackerObjective: 'Cloud infrastructure discovery',
      threatLevel: 'HIGH',
      likelyAttackType: 'Cloud-focused automated reconnaissance',
      observedTechniques: ['Cloud Discovery', 'Credential Discovery'],
      confidence: 78,
      executiveSummary: 'Cloud-focused attacker using python-requests. Targeting AWS metadata and S3 endpoints.',
    },
  },
  {
    sessionId: '73lp2a04',
    sourceIP: '10.0.55.102',
    userAgent: 'sqlmap/1.7',
    startedAt: '2026-08-26T21:22:00Z',
    lastSeen: '2026-08-26T21:24:30Z',
    status: 'ACTIVE',
    requestCount: 156,
    uniqueEndpoints: 8,
    threatScore: 58,
    severity: 'MEDIUM',
    currentStrategy: 'DATABASE_DECEPTION',
    duration: '2m 30s',
    attackerProfile: {
      attackerType: 'Database Attacker',
      confidence: 85,
      automationProbability: 97,
      behaviors: {
        reconnaissance: 25, enumeration: 30, credentialHunting: 22,
        exploitation: 65, privilegeEscalation: 18, cloudDiscovery: 5, databaseDiscovery: 92,
      },
    },
    deceptionState: {
      company: 'NexusFintech Corp', environment: 'Production', region: 'us-east-1',
      deceptionDepth: 2, maxDepth: 5,
      revealedServices: [],
      revealedDatabases: [
        { id: 'db1', name: 'postgres-prod-02', type: 'database', details: 'PostgreSQL 15.4 | 10.20.4.20:5432', discovered: true },
      ],
      revealedEmployees: [],
      revealedCloudResources: [],
      revealedCredentials: [],
    },
    deceptionGraph: makeGraph(['postgres']),
    timeline: [
      { id: 't1', timestamp: '2026-08-26T21:22:00Z', eventType: 'SESSION_CREATED', details: 'New session from sqlmap' },
      { id: 't2', timestamp: '2026-08-26T21:22:02Z', eventType: 'DATABASE_DISCOVERY', details: 'SQL injection attempt: POST /api/query' },
      { id: 't3', timestamp: '2026-08-26T21:22:10Z', eventType: 'DATABASE_DISCOVERY', details: 'Database enumeration: GET /api/database/status' },
    ],
    canaries: [],
    aiDecisions: [],
    requestHistory: [],
    threatIntelligence: {
      attackerObjective: 'Database exploitation',
      threatLevel: 'MEDIUM',
      likelyAttackType: 'Automated SQL injection (sqlmap)',
      observedTechniques: ['Database Discovery', 'SQL Injection'],
      confidence: 85,
      executiveSummary: 'Database-focused attacker using sqlmap. Attempting SQL injection against multiple endpoints.',
    },
  },
];

export function getSessionById(id: string): AttackSession | undefined {
  return mockSessions.find(s => s.sessionId === id);
}
