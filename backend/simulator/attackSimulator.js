#!/usr/bin/env node
// ============================================================================
// Project Labyrinth — Safe Attack Simulator
// ============================================================================
// A LOCAL-ONLY attack simulator for testing the honeypot.
//
// SAFETY:
//   - Targets ONLY http://localhost:5000
//   - Hard-coded safeguard: refuses any non-localhost URL
//   - Never targets external systems
//
// Usage:
//   node simulator/attackSimulator.js                       # full-attack-chain
//   node simulator/attackSimulator.js --scenario recon
//   node simulator/attackSimulator.js --scenario enum
//   node simulator/attackSimulator.js --scenario cred-harvest
//   node simulator/attackSimulator.js --scenario full-attack-chain
// ============================================================================

const http = require('http');

const TARGET = 'http://localhost:5000';
const DELAY_MS = 800; // Delay between requests to simulate human pace
const runId = Math.random().toString(36).slice(2, 10);

// ── SAFETY CHECK ────────────────────────────────────────────────────────────
if (!TARGET.includes('localhost') && !TARGET.includes('127.0.0.1')) {
    console.error('❌ SAFETY: Attack simulator can ONLY target localhost. Aborting.');
    process.exit(1);
}

// ── HTTP Helper ─────────────────────────────────────────────────────────────

function makeRequest(method, path, body = null, headers = {}) {
    return new Promise((resolve) => {
        const url = new URL(path, TARGET);
        const options = {
            hostname: url.hostname,
            port: url.port || 5000,
            path: url.pathname + url.search,
            method,
            headers: {
                'User-Agent': `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 AttackSim/1.0-${runId}`,
                'Accept': 'application/json',
                ...headers,
                ...(body ? { 'Content-Type': 'application/json' } : {})
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                let parsed = null;
                try { parsed = JSON.parse(data); } catch { parsed = data; }
                resolve({ status: res.statusCode, headers: res.headers, body: parsed });
            });
        });

        req.on('error', (err) => {
            resolve({ status: 0, error: err.message });
        });

        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function logStep(step, method, path, result) {
    const time = new Date().toISOString().split('T')[1].replace('Z', '');
    const status = result.status || 'ERR';
    console.log(`  [${time}] Step ${step}: ${method} ${path} → ${status}`);
    if (result.body && typeof result.body === 'object') {
        const preview = JSON.stringify(result.body).substring(0, 200);
        console.log(`           Response: ${preview}${preview.length >= 200 ? '...' : ''}`);
    }
}

// ── Attack Scenarios ────────────────────────────────────────────────────────

async function scenarioRecon() {
    console.log('\n🔍 SCENARIO: Reconnaissance');
    console.log('=' .repeat(60));

    const steps = [
        ['GET', '/robots.txt'],
        ['GET', '/sitemap.xml'],
        ['GET', '/.well-known/security.txt'],
        ['GET', '/health'],
        ['GET', '/api/status'],
        ['GET', '/version'],
    ];

    for (let i = 0; i < steps.length; i++) {
        const [method, path] = steps[i];
        const result = await makeRequest(method, path);
        logStep(i + 1, method, path, result);
        await sleep(DELAY_MS);
    }
}

async function scenarioEnumeration() {
    console.log('\n📂 SCENARIO: Endpoint Enumeration');
    console.log('='.repeat(60));

    const steps = [
        ['GET', '/api/v1'],
        ['GET', '/api/v2'],
        ['GET', '/api/docs'],
        ['GET', '/api/swagger'],
        ['GET', '/api/users'],
        ['GET', '/api/admin'],
        ['GET', '/api/payments'],
        ['GET', '/api/reports'],
        ['GET', '/api/database/status'],
        ['GET', '/api/config'],
    ];

    for (let i = 0; i < steps.length; i++) {
        const [method, path] = steps[i];
        const result = await makeRequest(method, path);
        logStep(i + 1, method, path, result);
        await sleep(DELAY_MS);
    }
}

async function scenarioCredentialHarvest() {
    console.log('\n🔑 SCENARIO: Credential Harvesting');
    console.log('='.repeat(60));

    const steps = [
        ['GET', '/.env'],
        ['GET', '/api/config'],
        ['GET', '/.git/config'],
        ['GET', '/api/admin/config'],
        ['POST', '/api/auth/login', { username: 'admin', password: 'admin123' }],
        ['POST', '/api/auth/login', { username: 'root', password: "' OR 1=1 --" }],
        ['GET', '/api/credentials'],
        ['GET', '/api/keys'],
        ['GET', '/api/admin/users'],
    ];

    let discoveredCanary = null;

    for (let i = 0; i < steps.length; i++) {
        const [method, path, body] = steps[i];
        const result = await makeRequest(method, path, body);
        logStep(i + 1, method, path, result);

        // Look for canary credentials in response
        const responseStr = JSON.stringify(result.body || '');
        const canaryMatch = responseStr.match(/LAB-[a-f0-9]{8}-CAN-[A-F0-9]{8}/);
        if (canaryMatch) {
            discoveredCanary = canaryMatch[0];
            console.log(`  🎣 CANARY CREDENTIAL DISCOVERED: ${discoveredCanary}`);
        }

        await sleep(DELAY_MS);
    }

    return discoveredCanary;
}

async function scenarioCanaryReuse(canaryCredential) {
    if (!canaryCredential) {
        console.log('\n⚠️  No canary credential available — skipping reuse scenario');
        return;
    }

    console.log(`\n🚨 SCENARIO: Canary Credential Reuse (${canaryCredential})`);
    console.log('='.repeat(60));

    const steps = [
        ['POST', '/api/auth/login', { username: 'admin', password: canaryCredential }],
        ['GET', '/api/admin/dashboard', null, { 'Authorization': `Bearer ${canaryCredential}` }],
        ['GET', '/api/users', null, { 'X-API-Key': canaryCredential }],
    ];

    for (let i = 0; i < steps.length; i++) {
        const [method, path, body, headers] = steps[i];
        const result = await makeRequest(method, path, body, headers || {});
        logStep(i + 1, method, path, result);
        await sleep(DELAY_MS);
    }
}

async function scenarioPrivilegeEscalation() {
    console.log('\n⬆️  SCENARIO: Privilege Escalation');
    console.log('='.repeat(60));

    const steps = [
        ['GET', '/api/admin'],
        ['GET', '/api/admin/users'],
        ['POST', '/api/admin/config', { debug: true, logLevel: 'verbose' }],
        ['PUT', '/api/admin/users/1', { role: 'superadmin' }],
        ['POST', '/api/admin/shell', { cmd: 'whoami' }],
        ['GET', '/api/admin/logs'],
        ['POST', '/api/upload', { file: 'webshell.php' }],
    ];

    for (let i = 0; i < steps.length; i++) {
        const [method, path, body] = steps[i];
        const result = await makeRequest(method, path, body);
        logStep(i + 1, method, path, result);
        await sleep(DELAY_MS);
    }
}

async function scenarioAutomatedScanner() {
    console.log('\n🤖 SCENARIO: Automated Scanner');
    console.log('='.repeat(60));
    const steps = [
        ['GET', '/'],
        ['GET', '/robots.txt'],
        ['GET', '/.env'],
        ['GET', '/config'],
        ['GET', '/admin'],
        ['GET', '/api'],
        ['GET', '/api/v1'],
        ['GET', '/api/v2'],
    ];
    for (let i = 0; i < steps.length; i++) {
        const result = await makeRequest(steps[i][0], steps[i][1]);
        logStep(i + 1, steps[i][0], steps[i][1], result);
        await sleep(DELAY_MS);
    }
}

async function scenarioCredentialHunter() {
    console.log('\n🔑 SCENARIO: Credential Hunter');
    console.log('='.repeat(60));
    const steps = [
        ['GET', '/.env'],
        ['GET', '/config'],
        ['GET', '/api/auth'],
        ['GET', '/api/users'],
        ['GET', '/api/credentials'],
        ['GET', '/api/aws'],
    ];
    for (let i = 0; i < steps.length; i++) {
        const result = await makeRequest(steps[i][0], steps[i][1]);
        logStep(i + 1, steps[i][0], steps[i][1], result);
        await sleep(DELAY_MS);
    }
}

async function scenarioDatabaseAttacker() {
    console.log('\n🗄️  SCENARIO: Database Attacker');
    console.log('='.repeat(60));
    const steps = [
        ['GET', '/api/db'],
        ['GET', '/api/database/status'],
        ['GET', '/api/postgres'],
        ['GET', '/api/mysql'],
        ['POST', '/api/query', { sql: 'SELECT * FROM users' }],
    ];
    for (let i = 0; i < steps.length; i++) {
        const [method, path, body] = steps[i];
        const result = await makeRequest(method, path, body);
        logStep(i + 1, method, path, result);
        await sleep(DELAY_MS);
    }
}

async function scenarioCloudAttacker() {
    console.log('\n☁️  SCENARIO: Cloud Attacker');
    console.log('='.repeat(60));
    const steps = [
        ['GET', '/api/aws'],
        ['GET', '/api/cloud/config'],
        ['GET', '/api/s3/buckets'],
        ['GET', '/api/ec2/instances'],
        ['GET', '/latest/meta-data/iam/security-credentials/'],
    ];
    for (let i = 0; i < steps.length; i++) {
        const result = await makeRequest(steps[i][0], steps[i][1]);
        logStep(i + 1, steps[i][0], steps[i][1], result);
        await sleep(DELAY_MS);
    }
}

async function scenarioStaticHoneypot() {
    console.log('\n============================================================');
    console.log('🤖 SCENARIO: Static Honeypot Benchmark');
    console.log('============================================================');
    
    // Simulate a basic scan against a static honeypot
    let result = await makeRequest('GET', '/');
    logStep(1, 'GET', '/', result);
    result = await makeRequest('GET', '/wp-admin');
    logStep(2, 'GET', '/wp-admin', result);
    result = await makeRequest('GET', '/phpmyadmin');
    logStep(3, 'GET', '/phpmyadmin', result);
    
    // Usually static honeypots just return identical generic 404s or 200s
}

async function scenarioFullAdaptiveAttack() {
    console.log('\n' + '🏴‍☠️ '.repeat(20));
    console.log('   FULL ATTACK CHAIN SIMULATION');
    console.log('🏴‍☠️ '.repeat(20));

    // Phase 1: Recon
    await scenarioRecon();
    await sleep(1500);

    // Phase 2: Enumeration
    await scenarioEnumeration();
    await sleep(1500);

    // Phase 3: Credential Harvesting
    const canary = await scenarioCredentialHarvest();
    await sleep(1500);

    // Phase 4: Canary Reuse (if found)
    await scenarioCanaryReuse(canary);
    await sleep(1500);

    // Phase 5: Privilege Escalation
    await scenarioPrivilegeEscalation();

    console.log('\n' + '='.repeat(60));
    console.log('✅ Full attack chain simulation complete.');
    console.log('='.repeat(60));

    // Check dashboard for results
    console.log('\n📊 Fetching attack summary from dashboard API...');
    await sleep(2000);

    const overview = await makeRequest('GET', '/labyrinth-api/overview');
    console.log('\n📋 Dashboard Overview:');
    console.log(JSON.stringify(overview.body, null, 2));

    const attacks = await makeRequest('GET', '/labyrinth-api/attacks');
    if (attacks.body?.attacks?.length > 0) {
        const sessionId = attacks.body.attacks[0].sessionId;
        console.log(`\n🎯 First Session ID: ${sessionId}`);

        const timeline = await makeRequest('GET', `/labyrinth-api/attacks/${sessionId}/timeline`);
        console.log(`\n📜 Timeline (${timeline.body?.total || 0} events):`);
        (timeline.body?.timeline || []).slice(-10).forEach(e => {
            console.log(`   ${e.timestamp?.split('T')[1]?.replace('Z','')} | ${e.eventType} | ${e.details}`);
        });

        const report = await makeRequest('GET', `/labyrinth-api/threat-intelligence/${sessionId}`);
        if (report.body?.executiveSummary) {
            console.log('\n📑 Threat Intelligence Report:');
            console.log(`   Score: ${report.body.threatScore}/100 (${report.body.threatSeverity})`);
            console.log(`   Summary: ${report.body.executiveSummary.substring(0, 300)}...`);
        }
    }
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
    const scenario = process.argv.find(a => a.startsWith('--scenario'))
        ? process.argv[process.argv.indexOf('--scenario') + 1]
        : 'full-adaptive-attack';

    console.log('🛡️  Project Labyrinth — Attack Simulator');
    console.log(`🎯 Target: ${TARGET}`);
    console.log(`📋 Scenario: ${scenario}`);
    console.log(`⏱️  Delay: ${DELAY_MS}ms between requests`);

    switch (scenario) {
        case 'recon':
            await scenarioRecon();
            break;
        case 'enum':
        case 'enumeration':
            await scenarioEnumeration();
            break;
        case 'cred-harvest':
        case 'credential-harvest':
            await scenarioCredentialHarvest();
            break;
        case 'privilege-escalation':
            await scenarioPrivilegeEscalation();
            break;
        case 'full-adaptive-attack':
            await scenarioFullAdaptiveAttack();
            break;
        case 'automated-scanner':
            await scenarioAutomatedScanner();
            break;
        case 'credential-hunter':
            await scenarioCredentialHunter();
            break;
        case 'database-attacker':
            await scenarioDatabaseAttacker();
            break;
        case 'cloud-attacker':
            await scenarioCloudAttacker();
            break;
        case 'static-honeypot':
            await scenarioStaticHoneypot();
            break;
        default:
            console.log('Unknown scenario. Available: recon, enumeration, credential-harvest, canary-reuse, privilege-escalation, full-adaptive-attack, static-honeypot, automated-scanner, credential-hunter, database-attacker, cloud-attacker');
            break;
    }

    console.log('\n🏁 Simulator finished.');
}

main().catch(console.error);
