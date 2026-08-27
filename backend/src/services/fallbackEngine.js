// ============================================================================
// Project Labyrinth — Fallback Deception Engine
// ============================================================================
// Deterministic response templates that run when Gemini is unavailable,
// rate-limited, or fails validation. This ensures the honeypot NEVER
// goes silent — it always returns a deceptive response.
//
// Templates are keyed by path pattern and intent. Variables like
// {company}, {database}, etc. are substituted from the deception state
// to maintain consistency with prior reveals.
// ============================================================================

const { createLogger } = require('../utils/logger');
const enterprise       = require('../data/syntheticEnterprise');

const log = createLogger('FallbackEngine');

// ── Template Variable Substitution ──────────────────────────────────────────

function substitute(template, state) {
    const vars = {
        '{company}':     state.company || enterprise.COMPANY.name,
        '{environment}': state.environment || 'production',
        '{database}':    state.revealedDatabases?.[0]?.name || enterprise.DATABASES[0].name,
        '{dbHost}':      state.revealedDatabases?.[0]?.host || enterprise.DATABASES[0].host,
        '{dbPort}':      state.revealedDatabases?.[0]?.port || enterprise.DATABASES[0].port,
        '{service}':     state.revealedServices?.[0]?.name || enterprise.SERVICES[0].name,
        '{employee}':    state.revealedEmployees?.[0]?.name || enterprise.EMPLOYEES[0].name,
        '{email}':       state.revealedEmployees?.[0]?.email || enterprise.EMPLOYEES[0].email,
        '{subnet}':      state.revealedNetwork?.subnet || enterprise.NETWORK.internalSubnet,
        '{version}':     enterprise.COMPANY.version,
        '{buildId}':     enterprise.COMPANY.buildId,
    };

    let result = typeof template === 'string' ? template : JSON.stringify(template);
    for (const [key, val] of Object.entries(vars)) {
        result = result.split(key).join(String(val));
    }
    return JSON.parse(result);
}

// ── Response Templates ──────────────────────────────────────────────────────

const TEMPLATES = {
    // ---- Config / .env ----
    config: {
        statusCode: 500,
        body: {
            error: 'Internal Server Error',
            message: 'Configuration service temporarily unavailable.',
            debug: {
                database: '{database}',
                host: '{dbHost}',
                environment: '{environment}',
                service: '{service}',
                build: '{buildId}',
                note: 'Contact {email} for access issues'
            },
            code: 'ERR_CONFIG_500'
        }
    },

    // ---- Users / Employees ----
    users: {
        statusCode: 200,
        body: {
            status: 'success',
            data: {
                users: [
                    { id: 'USR-1001', name: '{employee}', email: '{email}', role: 'admin', lastLogin: '2026-08-25T14:32:00Z' },
                    { id: 'USR-1002', name: 'System Service Account', email: 'svc@nexusfintech.internal', role: 'service', lastLogin: '2026-08-26T08:00:00Z' }
                ],
                total: 847,
                page: 1,
                perPage: 25
            },
            _meta: { environment: '{environment}', company: '{company}' }
        }
    },

    // ---- Auth / Login ----
    auth: {
        statusCode: 401,
        body: {
            error: 'Unauthorized',
            message: 'Invalid credentials. Account lockout will occur after 5 failed attempts.',
            _debug: {
                authService: 'auth-service.nexusfintech.internal:8003',
                lockoutPolicy: '5 attempts / 15 min',
                mfaRequired: true,
                support: '{email}'
            },
            code: 'ERR_AUTH_401'
        }
    },

    // ---- Admin ----
    admin: {
        statusCode: 403,
        body: {
            error: 'Forbidden',
            message: 'Administrative access requires VPN connection and MFA token.',
            _debug: {
                requiredRole: 'admin',
                vpnEndpoint: 'vpn.nexusfintech.internal',
                adminService: 'admin-service.nexusfintech.internal:8004',
                contactAdmin: '{email}'
            },
            code: 'ERR_ADMIN_403'
        }
    },

    // ---- Database ----
    database: {
        statusCode: 200,
        body: {
            status: 'active',
            database: '{database}',
            host: '{dbHost}',
            port: '{dbPort}',
            type: 'PostgreSQL',
            version: '15.4',
            connections: { active: 12, idle: 13, max: 25 },
            uptime: '47 days, 3 hours',
            lastBackup: '2026-08-26T03:00:00Z',
            replication: { status: 'streaming', lag: '0.2s' }
        }
    },

    // ---- Payments ----
    payments: {
        statusCode: 200,
        body: {
            status: 'success',
            service: 'payment-service',
            version: '3.0.5',
            recentTransactions: [
                { id: 'TXN-88291', amount: 4250.00, currency: 'USD', status: 'completed', timestamp: '2026-08-26T13:45:00Z' },
                { id: 'TXN-88290', amount: 12750.50, currency: 'USD', status: 'pending', timestamp: '2026-08-26T13:42:00Z' }
            ],
            dailyVolume: '$2.4M',
            _meta: { environment: '{environment}' }
        }
    },

    // ---- Health / Status ----
    health: {
        statusCode: 200,
        body: {
            status: 'healthy',
            uptime: '47 days, 3 hours',
            version: '{version}',
            build: '{buildId}',
            services: {
                database: 'connected',
                cache: 'connected',
                queue: 'connected',
                auth: 'connected'
            },
            environment: '{environment}'
        }
    },

    // ---- API docs ----
    docs: {
        statusCode: 200,
        body: {
            openapi: '3.0.0',
            info: { title: '{company} API', version: 'v2', description: 'Internal API documentation' },
            servers: [{ url: 'https://api.nexusfintech.internal/v2' }],
            paths: {
                '/users': { get: { summary: 'List users', security: [{ bearerAuth: [] }] } },
                '/auth/login': { post: { summary: 'Authenticate' } },
                '/payments': { get: { summary: 'List payments', security: [{ bearerAuth: [] }] } },
                '/admin/config': { get: { summary: 'System config', security: [{ adminAuth: [] }] } }
            }
        }
    },

    // ---- Cloud / AWS metadata ----
    cloud: {
        statusCode: 200,
        body: {
            provider: 'AWS',
            region: 'us-east-1',
            instanceId: 'i-0a1b2c3d4e5f6g7h8',
            instanceType: 'm5.xlarge',
            accountId: '123456789012',
            vpc: 'vpc-nexus-prod',
            subnet: '{subnet}',
            securityGroups: ['sg-api-prod', 'sg-internal'],
            iamRole: 'nexus-api-prod-role'
        }
    },

    // ---- Network ----
    network: {
        statusCode: 200,
        body: {
            internalNetwork: '{subnet}',
            services: [
                { name: 'user-service', host: '10.20.4.11:8001' },
                { name: 'payment-service', host: '10.20.4.12:8002' },
                { name: 'auth-service', host: '10.20.4.13:8003' },
                { name: 'admin-service', host: '10.20.4.14:8004' }
            ],
            dns: ['10.20.4.2', '10.20.4.3'],
            gateway: '10.20.4.1'
        }
    },

    // ---- Generic error (default) ----
    generic: {
        statusCode: 500,
        body: {
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while processing the request.',
            trace: 'at APIHandler.processRequest (/app/src/handlers/api.js:142:15)',
            environment: '{environment}',
            build: '{buildId}',
            code: 'ERR_INTERNAL_500'
        }
    }
};

// ── Template Selection ──────────────────────────────────────────────────────

function selectTemplate(path, method) {
    const p = (path || '').toLowerCase();

    if (p.includes('.env') || p.includes('/config') || p.includes('/settings') || p.includes('.yml') || p.includes('.yaml'))
        return 'config';
    if (p.includes('/users') || p.includes('/employees') || p.includes('/staff'))
        return 'users';
    if (p.includes('/auth') || p.includes('/login') || p.includes('/signin') || p.includes('/token'))
        return 'auth';
    if (p.includes('/admin') || p.includes('/management') || p.includes('/console'))
        return 'admin';
    if (p.includes('/database') || p.includes('/db') || p.includes('/sql') || p.includes('/pg'))
        return 'database';
    if (p.includes('/payment') || p.includes('/transaction') || p.includes('/billing'))
        return 'payments';
    if (p.includes('/health') || p.includes('/status') || p.includes('/ping'))
        return 'health';
    if (p.includes('/docs') || p.includes('/swagger') || p.includes('/openapi') || p.includes('/api-docs'))
        return 'docs';
    if (p.includes('/cloud') || p.includes('/aws') || p.includes('/metadata') || p.includes('/instance'))
        return 'cloud';
    if (p.includes('/network') || p.includes('/subnet') || p.includes('/internal'))
        return 'network';

    return 'generic';
}

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Generate a deterministic deceptive response.
 *
 * @param {string} path            – Request path
 * @param {string} method          – HTTP method
 * @param {object} deceptionState  – Current session deception state
 * @returns {{ statusCode, body, templateUsed }}
 */
function generateFallbackResponse(path, method, deceptionState = {}) {
    const templateKey = selectTemplate(path, method);

    // Check for ML-generated cached content (populated async by ragWorker)
    if (deceptionState.contentCache && deceptionState.contentCache[templateKey]) {
        const cached = deceptionState.contentCache[templateKey];
        if (cached.statusCode && cached.body) {
            log.info('Using cached ML-generated content', { templateKey });
            return {
                statusCode:   cached.statusCode,
                body:         cached.body,
                templateUsed: templateKey,
                aiGenerated:  false,
                mlCached:     true
            };
        }
    }

    // Fall through to static deterministic templates
    const template    = TEMPLATES[templateKey] || TEMPLATES.generic;

    const response = substitute(template, deceptionState);
    return {
        statusCode:   response.statusCode,
        body:         response.body,
        templateUsed: templateKey,
        aiGenerated:  false
    };
}

module.exports = { generateFallbackResponse, selectTemplate, TEMPLATES };
