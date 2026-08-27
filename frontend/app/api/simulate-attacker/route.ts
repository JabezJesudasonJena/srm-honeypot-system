import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('transactionId');

    if (!transactionId) {
        return NextResponse.json({ error: 'transactionId required' }, { status: 400 });
    }

    try {
        // 1. Fetch transaction as attacker (no cookies, unique user agent)
        const attackRes = await fetch(`http://localhost:5000/api/transaction/${transactionId}`, {
            headers: {
                'User-Agent': `Attacker-Sim-${Date.now()}`
            },
            cache: 'no-store'
        });
        const fakeData = await attackRes.json();

        // 2. Fetch attacks to get the latest session ID
        const listRes = await fetch(`http://localhost:5000/labyrinth-api/attacks`, { cache: 'no-store' });
        const listData = await listRes.json();
        
        // Find the most recently created session
        const sessions = listData.attacks || [];
        const latestSessionId = sessions.length > 0 ? sessions[0].sessionId : null;
        
        let scoreHistory = [];
        let threatScore = 0;

        if (latestSessionId) {
            // 3. Fetch detailed session info
            const sessionRes = await fetch(`http://localhost:5000/labyrinth-api/attacks/${latestSessionId}`, { cache: 'no-store' });
            const sessionData = await sessionRes.json();
            scoreHistory = sessionData.scoreHistory || [];
            threatScore = sessionData.threatScore || 0;
        }

        return NextResponse.json({
            fakeData,
            session: {
                sessionId: latestSessionId,
                threatScore,
                scoreHistory
            }
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
