#!/usr/bin/env node
// ============================================================================
// Project Labyrinth — Integration Test
// ============================================================================
// Tests the complete pipeline: request → session → intent → scoring →
// deception → canary → detection → timeline → dashboard API
//
// Run: node tests/integration/pipeline.test.js
// Requires: Docker containers running (redis + honeypot on localhost:5000)
// ============================================================================

const http = require('http');

const TARGET = 'http://localhost:5000';
let passed = 0;
let failed = 0;
let sessionCookie = null;

function makeRequest(method, path, body = null, headers = {}) {
    return new Promise((resolve) => {
        const url = new URL(path, TARGET);
        const options = {
            hostname: url.hostname,
            port: url.port || 5000,
            path: url.pathname + url.search,
            method,
            headers: {
                'User-Agent': 'TestSuite/1.0',
                'Accept': 'application/json',
                ...headers,
                ...(body ? { 'Content-Type': 'application/json' } : {}),
                ...(sessionCookie ? { 'Cookie': sessionCookie } : {})
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                // Capture session cookie
                const setCookie = res.headers['set-cookie'];
                if (setCookie) {
                    const match = setCookie.join(';').match(/labyrinth-sid=([^;]+)/);
                    if (match) sessionCookie = `labyrinth-sid=${match[1]}`;
                }

                let parsed = null;
                try { parsed = JSON.parse(data); } catch { parsed = data; }
                resolve({ status: res.statusCode, headers: res.headers, body: parsed });
            });
        });

        req.on('error', (err) => resolve({ status: 0, error: err.message }));
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

function assert(name, condition) {
    if (condition) {
        console.log(`  ✅ ${name}`);
        passed++;
    } else {
        console.log(`  ❌ ${name}`);
        failed++;
    }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function runTests() {
    console.log('🧪 Project Labyrinth — Integration Tests');
    console.log('='.repeat(60));

    // ── Test 1: Honeypot responds to GET /.env ──
    console.log('\n📋 Test 1: Basic honeypot trap');
    const envProbe = await makeRequest('GET', '/.env');
    assert('GET /.env returns response', envProbe.status > 0);
    assert('Response is JSON', typeof envProbe.body === 'object');
    assert('Response has error field', !!envProbe.body?.error || !!envProbe.body?.debug);

    await sleep(500);

    // ── Test 2: Session creation ──
    console.log('\n📋 Test 2: Session tracking');
    assert('Session cookie set', !!sessionCookie);

    // ── Test 3: Deceptive responses per path ──
    console.log('\n📋 Test 3: Contextual deception');
    const configProbe = await makeRequest('GET', '/api/config');
    assert('GET /api/config returns response', configProbe.status > 0);
    assert('Config response has debug/database info', JSON.stringify(configProbe.body).includes('postgres') || JSON.stringify(configProbe.body).includes('database'));

    const usersProbe = await makeRequest('GET', '/api/users');
    assert('GET /api/users returns response', usersProbe.status > 0);
    assert('Users response has user data', JSON.stringify(usersProbe.body).includes('user') || JSON.stringify(usersProbe.body).includes('USR'));

    const adminProbe = await makeRequest('GET', '/api/admin');
    assert('GET /api/admin returns response', adminProbe.status > 0);

    const dbProbe = await makeRequest('GET', '/api/database/status');
    assert('GET /api/database/status returns response', dbProbe.status > 0);
    assert('Database response references postgres', JSON.stringify(dbProbe.body).includes('postgres') || JSON.stringify(dbProbe.body).includes('PostgreSQL'));

    await sleep(500);

    // ── Test 4: Canary injection ──
    console.log('\n📋 Test 4: Canary credential injection');
    const canaryProbe = await makeRequest('GET', '/api/admin/config');
    const canaryResponse = JSON.stringify(canaryProbe.body);
    const canaryMatch = canaryResponse.match(/LAB-[a-f0-9]{8}-CAN-[A-F0-9]{8}/);
    assert('Canary credential injected in response', !!canaryMatch);

    let canaryId = null;
    if (canaryMatch) {
        canaryId = canaryMatch[0];
        console.log(`    Canary found: ${canaryId}`);
    }

    await sleep(500);

    // ── Test 5: Canary reuse detection ──
    console.log('\n📋 Test 5: Canary reuse detection');
    if (canaryId) {
        const reuseProbe = await makeRequest('POST', '/api/auth/login', {
            username: 'admin',
            password: canaryId
        });
        assert('Canary reuse request accepted', reuseProbe.status > 0);
        await sleep(1000); // Wait for async processing
    } else {
        console.log('  ⚠️  Skipped — no canary available');
    }

    // ── Test 6: Dashboard API ──
    console.log('\n📋 Test 6: Dashboard API');

    const overview = await makeRequest('GET', '/labyrinth-api/overview');
    assert('Dashboard overview returns 200', overview.status === 200);
    assert('Overview has totalSessions', overview.body?.totalSessions !== undefined);
    assert('Overview shows deception engine mode', !!overview.body?.deceptionEngine);

    const attacks = await makeRequest('GET', '/labyrinth-api/attacks');
    assert('Attacks endpoint returns 200', attacks.status === 200);
    assert('Attacks returns array', Array.isArray(attacks.body?.attacks));
    assert('At least 1 attack session', (attacks.body?.attacks?.length || 0) >= 1);

    let testSessionId = null;
    if (attacks.body?.attacks?.length > 0) {
        testSessionId = attacks.body.attacks[0].sessionId;

        const sessionDetail = await makeRequest('GET', `/labyrinth-api/attacks/${testSessionId}`);
        assert('Session detail returns 200', sessionDetail.status === 200);
        assert('Session has threatScore', sessionDetail.body?.threatScore !== undefined);
        assert('Session has timeline', Array.isArray(sessionDetail.body?.timeline));

        const timeline = await makeRequest('GET', `/labyrinth-api/attacks/${testSessionId}/timeline`);
        assert('Timeline returns entries', (timeline.body?.timeline?.length || 0) > 0);

        const assets = await makeRequest('GET', `/labyrinth-api/attacks/${testSessionId}/assets`);
        assert('Assets endpoint returns 200', assets.status === 200);

        const canaries = await makeRequest('GET', `/labyrinth-api/attacks/${testSessionId}/canaries`);
        assert('Canaries endpoint returns 200', canaries.status === 200);
    }

    const health = await makeRequest('GET', '/labyrinth-api/system/health');
    assert('System health returns 200', health.status === 200);
    assert('Health shows operational status', health.body?.status === 'operational');

    const sysMetrics = await makeRequest('GET', '/labyrinth-api/system/metrics');
    assert('System metrics returns 200', sysMetrics.status === 200);
    assert('Metrics has requestsProcessed', sysMetrics.body?.requestsProcessed !== undefined);

    const alerts = await makeRequest('GET', '/labyrinth-api/alerts');
    assert('Alerts endpoint returns 200', alerts.status === 200);

    // ── Test 7: Threat intelligence report ──
    console.log('\n📋 Test 7: Threat intelligence');
    if (testSessionId) {
        const report = await makeRequest('GET', `/labyrinth-api/threat-intelligence/${testSessionId}`);
        assert('Threat report returns 200', report.status === 200);
        assert('Report has threat score', report.body?.threatScore !== undefined);
        assert('Report has executive summary', !!report.body?.executiveSummary);
        assert('Report has endpoints accessed', Array.isArray(report.body?.endpointsAccessed));
    }

    // ── Test 8: Session persistence ──
    console.log('\n📋 Test 8: Session persistence');
    const probe2 = await makeRequest('GET', '/api/payments');
    await sleep(500);
    const attacks2 = await makeRequest('GET', '/labyrinth-api/attacks');
    const sessionCount = attacks2.body?.attacks?.length || 0;
    assert('All requests grouped in same session (cookie)', sessionCount === 1);

    // ── Test 9: SQL injection detection ──
    console.log('\n📋 Test 9: Attack pattern detection');
    const sqliProbe = await makeRequest('POST', '/api/login', { username: "admin' OR 1=1 --", password: 'test' });
    assert('SQLi probe returns response', sqliProbe.status > 0);

    // ── Test 10: Deception Consistency ──
    console.log('\n📋 Test 10: Deception Consistency');
    const dept1 = await makeRequest('GET', '/api/department');
    const dept2 = await makeRequest('GET', '/api/department');
    assert('Consistent deception for same path', JSON.stringify(dept1.body) === JSON.stringify(dept2.body));

    // ── Test 11: Demo Reset Mode ──
    console.log('\n📋 Test 11: Demo Reset Mode');
    const reset = await makeRequest('POST', '/labyrinth-api/system/reset');
    assert('Reset endpoint returns 200', reset.status === 200);
    const postResetMetrics = await makeRequest('GET', '/labyrinth-api/system/metrics');
    assert('Metrics are zeroed out after reset', postResetMetrics.body?.totalAttacks === 0);

    // ── Summary ──
    console.log('\n' + '='.repeat(60));
    console.log(`🏁 Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
    console.log('='.repeat(60));

    process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
    console.error('Test runner failed:', err);
    process.exit(1);
});
