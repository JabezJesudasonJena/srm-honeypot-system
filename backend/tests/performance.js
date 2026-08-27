const http = require('http');

const TARGET = 'http://localhost:5000/api/auth/login';
const PAYLOAD = JSON.stringify({ username: 'admin', password: 'password123' });

async function runLoadTest(totalRequests, concurrency) {
    console.log(`\n🚀 Starting load test: ${totalRequests} requests at concurrency ${concurrency}`);
    let completed = 0;
    let failed = 0;
    let totalLatency = 0;
    const start = Date.now();

    const doRequest = () => new Promise((resolve) => {
        const reqStart = Date.now();
        const req = http.request(TARGET, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': PAYLOAD.length,
                'User-Agent': 'LoadTester/1.0'
            }
        }, (res) => {
            res.on('data', () => {});
            res.on('end', () => {
                if (res.statusCode >= 500) failed++;
                totalLatency += (Date.now() - reqStart);
                completed++;
                resolve();
            });
        });

        req.on('error', () => {
            failed++;
            completed++;
            resolve();
        });

        req.write(PAYLOAD);
        req.end();
    });

    let active = 0;
    let launched = 0;

    return new Promise((resolve) => {
        const interval = setInterval(() => {
            while (active < concurrency && launched < totalRequests) {
                launched++;
                active++;
                doRequest().then(() => {
                    active--;
                });
            }
            if (completed >= totalRequests) {
                clearInterval(interval);
                const duration = (Date.now() - start) / 1000;
                console.log(`✅ Completed ${completed} requests in ${duration.toFixed(2)}s`);
                console.log(`   RPS (Req/Sec): ${(completed / duration).toFixed(2)}`);
                console.log(`   Avg Latency:   ${(totalLatency / completed).toFixed(2)}ms`);
                console.log(`   Failed:        ${failed}`);
                resolve();
            }
        }, 10);
    });
}

async function main() {
    await runLoadTest(10, 2);
    await runLoadTest(100, 10);
    await runLoadTest(500, 50);
}

main();
