// ============================================================================
// Project Labyrinth — Synthetic Enterprise Data
// ============================================================================
// ALL DATA IN THIS FILE IS PURELY FICTIONAL.
// It represents a synthetic enterprise environment used exclusively for
// cyber deception. No real companies, employees, systems, credentials,
// IP addresses, or cloud resources are referenced.
// ============================================================================

const COMPANY = {
    name:        process.env.DECEPTION_COMPANY_NAME || 'Nexus Financial Technologies',
    domain:      'nexusfintech.internal',
    founded:     '2019',
    industry:    'Financial Technology',
    environment: 'production',
    version:     '3.4.2',
    buildId:     'nft-prod-20260815-a4f2c',
    region:      'us-east-1'
};

const SERVICES = [
    { name: 'user-service',          port: 8001, status: 'running',  version: '2.1.0', host: '10.20.4.11' },
    { name: 'payment-service',       port: 8002, status: 'running',  version: '3.0.5', host: '10.20.4.12' },
    { name: 'auth-service',          port: 8003, status: 'running',  version: '1.8.3', host: '10.20.4.13' },
    { name: 'admin-service',         port: 8004, status: 'running',  version: '2.4.1', host: '10.20.4.14' },
    { name: 'report-service',        port: 8005, status: 'running',  version: '1.2.0', host: '10.20.4.15' },
    { name: 'notification-service',  port: 8006, status: 'degraded', version: '1.5.2', host: '10.20.4.16' },
    { name: 'database-proxy',        port: 5432, status: 'running',  version: '1.0.0', host: '10.20.4.20' }
];

const DATABASES = [
    { name: 'postgres-prod-02', type: 'PostgreSQL', version: '15.4', host: '10.20.4.20', port: 5432, status: 'active', tables: 147 },
    { name: 'redis-cache-01',   type: 'Redis',      version: '7.2',  host: '10.20.4.21', port: 6379, status: 'active' },
    { name: 'mongo-logs-01',    type: 'MongoDB',     version: '7.0',  host: '10.20.4.22', port: 27017, status: 'active' }
];

const EMPLOYEES = [
    { id: 'EMP-001', name: 'Sarah Chen',        email: 'schen@nexusfintech.internal',       role: 'CTO',                      department: 'Engineering' },
    { id: 'EMP-002', name: 'Marcus Thompson',    email: 'mthompson@nexusfintech.internal',   role: 'Lead DevOps',              department: 'Infrastructure' },
    { id: 'EMP-003', name: 'Priya Sharma',       email: 'psharma@nexusfintech.internal',     role: 'Senior Backend Engineer',  department: 'Engineering' },
    { id: 'EMP-004', name: 'David Kim',          email: 'dkim@nexusfintech.internal',        role: 'Security Engineer',        department: 'Security' },
    { id: 'EMP-005', name: 'Lisa Rodriguez',     email: 'lrodriguez@nexusfintech.internal',  role: 'Database Administrator',   department: 'Infrastructure' },
    { id: 'EMP-006', name: 'James O\'Brien',     email: 'jobrien@nexusfintech.internal',     role: 'VP Engineering',           department: 'Engineering' },
    { id: 'EMP-007', name: 'Aisha Patel',        email: 'apatel@nexusfintech.internal',      role: 'Frontend Lead',            department: 'Engineering' },
    { id: 'EMP-008', name: 'Robert Chang',       email: 'rchang@nexusfintech.internal',      role: 'System Administrator',     department: 'IT' }
];

const CLOUD_RESOURCES = [
    { provider: 'AWS', service: 'EC2',          region: 'us-east-1', instanceId: 'i-0a1b2c3d4e5f6g7h8',   name: 'prod-api-01' },
    { provider: 'AWS', service: 'RDS',          region: 'us-east-1', instanceId: 'db-nexus-prod-02',      name: 'postgres-prod' },
    { provider: 'AWS', service: 'S3',           region: 'us-east-1', instanceId: 'nexus-prod-backups',    name: 'backup-store' },
    { provider: 'AWS', service: 'ElastiCache',  region: 'us-east-1', instanceId: 'nexus-redis-prod',     name: 'cache-cluster' },
    { provider: 'AWS', service: 'Lambda',       region: 'us-east-1', instanceId: 'nexus-payment-proc',   name: 'payment-fn' }
];

const NETWORK = {
    internalSubnet: '10.20.4.0/24',
    gateway:        '10.20.4.1',
    dns:            ['10.20.4.2', '10.20.4.3'],
    vpnEndpoint:    'vpn.nexusfintech.internal',
    loadBalancer:   '10.20.4.5'
};

const API_DOCS = {
    version:  'v2',
    basePath: '/api/v2',
    endpoints: [
        { path: '/users',                methods: ['GET', 'POST'],        auth: 'bearer',   description: 'User management' },
        { path: '/users/:id',            methods: ['GET', 'PUT', 'DELETE'], auth: 'bearer', description: 'User CRUD' },
        { path: '/auth/login',           methods: ['POST'],               auth: 'none',     description: 'Authentication' },
        { path: '/auth/token/refresh',   methods: ['POST'],               auth: 'bearer',   description: 'Token refresh' },
        { path: '/payments',             methods: ['GET', 'POST'],        auth: 'bearer',   description: 'Payment processing' },
        { path: '/payments/:id/status',  methods: ['GET'],                auth: 'bearer',   description: 'Payment status' },
        { path: '/admin/users',          methods: ['GET'],                auth: 'admin',    description: 'Admin user list' },
        { path: '/admin/config',         methods: ['GET', 'PUT'],         auth: 'admin',    description: 'System configuration' },
        { path: '/admin/logs',           methods: ['GET'],                auth: 'admin',    description: 'System logs' },
        { path: '/reports/generate',     methods: ['POST'],               auth: 'bearer',   description: 'Generate reports' },
        { path: '/reports/:id',          methods: ['GET'],                auth: 'bearer',   description: 'Get report' },
        { path: '/health',              methods: ['GET'],                auth: 'none',      description: 'Health check' },
        { path: '/metrics',             methods: ['GET'],                auth: 'internal',  description: 'System metrics' }
    ]
};

const CONFIG_FILES = {
    'database.yml': {
        production: {
            adapter: 'postgresql',
            host: 'postgres-prod-02.nexusfintech.internal',
            port: 5432,
            database: 'nexus_production',
            pool: 25,
            timeout: 5000,
            ssl: true
        }
    },
    'redis.yml': {
        production: {
            host: 'redis-cache-01.nexusfintech.internal',
            port: 6379,
            db: 0,
            maxRetries: 3
        }
    },
    'deploy.yml': {
        environment: 'production',
        cluster: 'nexus-prod-ecs',
        region: 'us-east-1',
        replicas: 3,
        healthCheck: '/health',
        rollbackOnFailure: true,
        lastDeploy: '2026-08-14T03:22:00Z',
        deployedBy: 'mthompson@nexusfintech.internal'
    }
};

// Synthetic RAG knowledge base documents for vector embedding
const KNOWLEDGE_BASE = [
    {
        title: 'Q3 Database Migration Notes',
        department: 'Engineering',
        service: 'database',
        content: 'Migration from postgres-prod-01 to postgres-prod-02 completed on 2026-07-15. All 147 tables migrated successfully. New connection pooling set to 25 max connections. Failover tested and verified. Contact: lrodriguez@nexusfintech.internal'
    },
    {
        title: 'Payment Service API Documentation v3.0',
        department: 'Engineering',
        service: 'payment-service',
        content: 'The payment-service v3.0.5 handles all transaction processing. Endpoints: POST /api/payments for new transactions, GET /api/payments/:id/status for status checks. Rate limit: 100 req/min per API key. Authentication via Bearer token. Internal service mesh: payment-service.nexusfintech.internal:8002'
    },
    {
        title: 'Employee Onboarding Security Policy',
        department: 'Security',
        service: 'admin-service',
        content: 'All new employees must complete security training within 30 days. Access to production systems requires approval from department head and security team. MFA is mandatory for all internal services. VPN access granted by IT team (rchang@nexusfintech.internal). Admin credentials rotate every 90 days.'
    },
    {
        title: 'AWS Infrastructure Overview',
        department: 'Infrastructure',
        service: 'cloud',
        content: 'Production runs on AWS us-east-1. EC2 instances: prod-api-01 (i-0a1b2c3d4e5f6g7h8). RDS: db-nexus-prod-02 (PostgreSQL 15.4). S3 backups: nexus-prod-backups. ElastiCache: nexus-redis-prod. Lambda: nexus-payment-processor for async payment webhooks.'
    },
    {
        title: 'Incident Report — Nov 2025 Outage',
        department: 'Engineering',
        service: 'notification-service',
        content: 'On 2025-11-22, notification-service experienced 4 hours of degraded performance due to memory leak in v1.4.0. Root cause: unclosed WebSocket connections. Fix deployed in v1.5.0. Monitoring alert added for memory threshold > 85%. Responsible: psharma@nexusfintech.internal'
    },
    {
        title: 'Internal Network Architecture',
        department: 'Infrastructure',
        service: 'network',
        content: 'Internal subnet: 10.20.4.0/24. Gateway: 10.20.4.1. DNS servers: 10.20.4.2, 10.20.4.3. Load balancer: 10.20.4.5. VPN endpoint: vpn.nexusfintech.internal. All inter-service communication uses mTLS. External traffic routed through AWS ALB.'
    },
    {
        title: 'Auth Service Configuration Guide',
        department: 'Engineering',
        service: 'auth-service',
        content: 'Auth service v1.8.3 runs on 10.20.4.13:8003. JWT tokens expire after 1 hour. Refresh tokens valid for 7 days. OAuth2 providers: Google, GitHub. Admin login endpoint: /api/auth/admin/login. Rate limiting: 5 failed attempts triggers 15-min lockout. Password policy: min 12 chars, uppercase, number, special char.'
    },
    {
        title: 'DevOps Deployment Runbook',
        department: 'Infrastructure',
        service: 'deployment',
        content: 'Deployments use ECS with rolling updates. Cluster: nexus-prod-ecs. Health check path: /health. Minimum healthy: 66%. Rollback on 3 consecutive failed health checks. Deploy command: nexus-cli deploy --env production --service <name>. Last deploy: 2026-08-14 by mthompson. Artifacts stored in S3: nexus-deploy-artifacts.'
    }
];

module.exports = {
    COMPANY,
    SERVICES,
    DATABASES,
    EMPLOYEES,
    CLOUD_RESOURCES,
    NETWORK,
    API_DOCS,
    CONFIG_FILES,
    KNOWLEDGE_BASE
};
