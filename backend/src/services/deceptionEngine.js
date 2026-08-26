// ============================================================================
// Project Labyrinth — Deception State Engine
// ============================================================================
// The HEART of the adaptive deception system. Maintains a per-session
// fictional enterprise state that evolves as the attacker probes deeper.
//
// Key principle: CONSISTENCY. If the attacker discovered "postgres-prod-02"
// in response to GET /api/config, then GET /api/database/status MUST
// reference that same database name — never invent a new one.
//
// The engine tracks what has been "revealed" per session and ensures all
// future responses are consistent with prior reveals.
// ============================================================================

const { createLogger } = require('../utils/logger');
const sessionManager   = require('./sessionManager');
const enterprise       = require('../data/syntheticEnterprise');

const log = createLogger('DeceptionEngine');

// Attack stages (ordered progression)
const ATTACK_STAGES = [
    'initial',          // First contact
    'reconnaissance',   // Probing endpoints
    'enumeration',      // Discovering services/structure
    'discovery',        // Finding credentials/configs
    'exploitation',     // Attempting to use found assets
    'persistence'       // Trying to maintain access
];

// ── Default state ───────────────────────────────────────────────────────────

function createDefaultState() {
    return {
        company:                enterprise.COMPANY.name,
        environment:            enterprise.COMPANY.environment,
        revealedServices:       [],
        revealedDatabases:      [],
        revealedEmployees:      [],
        revealedCredentials:    [],
        revealedCloudResources: [],
        revealedConfigs:        [],
        revealedEndpoints:      [],
        revealedNetwork:        {},
        customAssets:           {}
    };
}

// ── State Management ────────────────────────────────────────────────────────

async function getDeceptionState(sessionId) {
    const session = await sessionManager.getSession(sessionId);
    if (!session) return createDefaultState();
    if (!session.deceptionState || Object.keys(session.deceptionState).length === 0) {
        session.deceptionState = createDefaultState();
        await sessionManager.saveSession(session);
    }
    return session.deceptionState;
}

/**
 * Reveal a new fictional asset to the attacker and persist it in session state.
 * Deduplicates automatically so the same asset isn't revealed twice.
 */
async function revealAsset(sessionId, assetType, asset) {
    const session = await sessionManager.getSession(sessionId);
    if (!session) return;

    if (!session.deceptionState || Object.keys(session.deceptionState).length === 0) {
        session.deceptionState = createDefaultState();
    }
    const state = session.deceptionState;

    let assetName = '';
    switch (assetType) {
        case 'service':
            if (!state.revealedServices.find(s => s.name === asset.name)) {
                state.revealedServices.push(asset);
                assetName = asset.name;
            }
            break;
        case 'database':
            if (!state.revealedDatabases.find(d => d.name === asset.name)) {
                state.revealedDatabases.push(asset);
                assetName = asset.name;
            }
            break;
        case 'employee':
            if (!state.revealedEmployees.find(e => e.id === asset.id)) {
                state.revealedEmployees.push(asset);
                assetName = asset.name;
            }
            break;
        case 'credential':
            if (!state.revealedCredentials.find(c => c.username === asset.username)) {
                state.revealedCredentials.push(asset);
                assetName = asset.username;
            }
            break;
        case 'cloud':
            if (!state.revealedCloudResources.find(r => r.instanceId === asset.instanceId)) {
                state.revealedCloudResources.push(asset);
                assetName = asset.name;
            }
            break;
        case 'config':
            if (!state.revealedConfigs.includes(asset)) {
                state.revealedConfigs.push(asset);
                assetName = asset;
            }
            break;
        case 'endpoint':
            if (!state.revealedEndpoints.includes(asset)) {
                state.revealedEndpoints.push(asset);
                assetName = asset;
            }
            break;
        case 'network':
            Object.assign(state.revealedNetwork, asset);
            assetName = Object.keys(asset).join(', ');
            break;
        default:
            if (!state.customAssets[assetType]) state.customAssets[assetType] = [];
            state.customAssets[assetType].push(asset);
            assetName = JSON.stringify(asset).substring(0, 80);
    }

    if (assetName) {
        session.discoveredAssets.push({
            type: assetType,
            name: assetName,
            timestamp: new Date().toISOString()
        });

        await sessionManager.addTimelineEntry(
            sessionId, 'ASSET_DISCOVERED',
            `Attacker discovered ${assetType}: ${assetName}`,
            { assetType, assetName }
        );
    }

    // Compute deception depth (1 point per category of asset discovered, max 5)
    let depth = 0;
    if (state.revealedEndpoints.length > 0) depth++;
    if (state.revealedServices.length > 0 || state.revealedDatabases.length > 0) depth++;
    if (state.revealedEmployees.length > 0) depth++;
    if (state.revealedCredentials.length > 0 || state.revealedConfigs.length > 0) depth++;
    if (state.revealedCloudResources.length > 0 || Object.keys(state.revealedNetwork).length > 0) depth++;
    
    if (depth > session.deceptionDepth) {
        session.deceptionDepth = depth;
    }

    await sessionManager.saveSession(session);
    log.info('Asset revealed', { sessionId, assetType, asset: assetName, depth: session.deceptionDepth });
}

// ── Stage Progression ───────────────────────────────────────────────────────

async function progressStage(sessionId, newStage) {
    if (!ATTACK_STAGES.includes(newStage)) return;
    const session = await sessionManager.getSession(sessionId);
    if (!session) return;

    const currentIdx = ATTACK_STAGES.indexOf(session.attackStage);
    const newIdx     = ATTACK_STAGES.indexOf(newStage);

    if (newIdx > currentIdx) {
        const oldStage = session.attackStage;
        session.attackStage = newStage;
        await sessionManager.saveSession(session);
        await sessionManager.addTimelineEntry(
            sessionId, 'STAGE_PROGRESSION',
            `Attack stage: ${oldStage} → ${newStage}`
        );
        log.info('Stage progressed', { sessionId, from: oldStage, to: newStage });
    }
}

// ── Context Builder (for AI prompts and fallback templates) ─────────────────

function getConsistentContext(deceptionState) {
    return {
        company:          deceptionState.company,
        environment:      deceptionState.environment,
        knownServices:    deceptionState.revealedServices,
        knownDatabases:   deceptionState.revealedDatabases,
        knownEmployees:   deceptionState.revealedEmployees,
        knownCredentials: deceptionState.revealedCredentials,
        knownCloud:       deceptionState.revealedCloudResources,
        knownConfigs:     deceptionState.revealedConfigs,
        knownNetwork:     deceptionState.revealedNetwork
    };
}

/**
 * Select which fictional assets to reveal based on the requested path.
 * This drives the "breadcrumb" effect — each new path reveals more.
 */
function selectAssetsForPath(path, method) {
    const p = path.toLowerCase();
    const assets = { type: null, data: null };

    if (p.includes('/config') || p.includes('/settings') || p.includes('.env') || p.includes('.yml') || p.includes('.yaml')) {
        assets.type = 'config';
        assets.data = 'database.yml';
        assets.extras = [
            { type: 'database', data: enterprise.DATABASES[0] },
            { type: 'service',  data: enterprise.SERVICES[0] }
        ];
    } else if (p.includes('/users') || p.includes('/employees') || p.includes('/staff')) {
        assets.type = 'employee';
        assets.data = enterprise.EMPLOYEES[Math.floor(Math.random() * enterprise.EMPLOYEES.length)];
    } else if (p.includes('/admin')) {
        assets.type = 'service';
        assets.data = enterprise.SERVICES.find(s => s.name === 'admin-service');
        assets.extras = [
            { type: 'employee', data: enterprise.EMPLOYEES[0] }
        ];
    } else if (p.includes('/database') || p.includes('/db') || p.includes('/sql')) {
        assets.type = 'database';
        assets.data = enterprise.DATABASES[0];
    } else if (p.includes('/payment') || p.includes('/transaction')) {
        assets.type = 'service';
        assets.data = enterprise.SERVICES.find(s => s.name === 'payment-service');
    } else if (p.includes('/auth') || p.includes('/login') || p.includes('/token')) {
        assets.type = 'service';
        assets.data = enterprise.SERVICES.find(s => s.name === 'auth-service');
    } else if (p.includes('/cloud') || p.includes('/aws') || p.includes('/metadata')) {
        assets.type = 'cloud';
        assets.data = enterprise.CLOUD_RESOURCES[0];
    } else if (p.includes('/network') || p.includes('/subnet') || p.includes('/internal')) {
        assets.type = 'network';
        assets.data = { subnet: enterprise.NETWORK.internalSubnet, gateway: enterprise.NETWORK.gateway };
    } else if (p.includes('/health') || p.includes('/status') || p.includes('/ping')) {
        assets.type = 'service';
        assets.data = enterprise.SERVICES[0];
    } else if (p.includes('/report') || p.includes('/analytics')) {
        assets.type = 'service';
        assets.data = enterprise.SERVICES.find(s => s.name === 'report-service');
    } else if (p.includes('/docs') || p.includes('/api-docs') || p.includes('/swagger')) {
        assets.type = 'endpoint';
        assets.data = '/api/v2';
    }

    return assets;
}

// ── Deception Strategy ──────────────────────────────────────────────────────

/**
 * Determines the best deception strategy based on the attacker's behavioral profile.
 */
function getDeceptionStrategy(session) {
    const profile = session.attackerProfile;
    if (!profile) return 'RECON_DECEPTION';

    const type = profile.attackerType;
    if (type === 'credential_hunting') return 'CREDENTIAL_DECEPTION';
    if (type === 'data_discovery') return 'DATABASE_DECEPTION';
    if (type === 'privilege_escalation') return 'ADMIN_DECEPTION';
    if (type === 'exploitation') return 'PRIVILEGE_DECEPTION';
    
    // Default/Fallback
    return 'RECON_DECEPTION';
}

module.exports = {
    ATTACK_STAGES,
    createDefaultState,
    getDeceptionState,
    revealAsset,
    progressStage,
    getConsistentContext,
    selectAssetsForPath,
    getDeceptionStrategy
};
