"use client";

import { useState } from 'react';

export default function DeceptionDemoPage() {
    const [transactionId, setTransactionId] = useState<string | null>(null);
    const [realData, setRealData] = useState<any>(null);
    const [attackerData, setAttackerData] = useState<any>(null);
    const [attackerSession, setAttackerSession] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const runDemo = async () => {
        setLoading(true);
        setError(null);
        setTransactionId(null);
        setRealData(null);
        setAttackerData(null);
        setAttackerSession(null);

        try {
            // 1. Create transaction (browser session)
            const createRes = await fetch('http://localhost:5000/labyrinth-api/transaction/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!createRes.ok) throw new Error('Failed to create transaction');
            const createData = await createRes.json();
            const txId = createData.transactionId;
            setTransactionId(txId);

            // 2. Fetch as real user (browser session)
            const realRes = await fetch(`http://localhost:5000/api/transaction/${txId}`);
            const rData = await realRes.json();
            setRealData(rData);

            // 3. Fetch as attacker (server-side to isolate session)
            const attackerRes = await fetch(`/api/simulate-attacker?transactionId=${txId}`);
            if (!attackerRes.ok) throw new Error('Failed to simulate attacker');
            const aData = await attackerRes.json();
            setAttackerData(aData.fakeData);
            setAttackerSession(aData.session);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <header className="border-b border-[#1c2a38] pb-6 mb-2">
                <h1 className="text-2xl font-bold font-mono tracking-tight text-white mb-2">Adaptive Deception Engine</h1>
                <p className="text-sm text-gray-400">
                    Proves context-aware data generation. Both views access the exact same URL concurrently, but receive entirely different payloads based on session ownership, while simultaneously triggering the threat scorer.
                </p>
            </header>

            <div className="flex justify-between items-center bg-[#0c1219] p-4 border border-[#1c2a38] rounded-lg">
                <div className="font-mono text-sm">
                    {transactionId ? (
                        <>
                            <span className="text-gray-400">Target URL: </span>
                            <span className="text-blue-400">/api/transaction/{transactionId}</span>
                        </>
                    ) : (
                        <span className="text-gray-500">No active transaction</span>
                    )}
                </div>
                <button 
                    onClick={runDemo} 
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm font-bold transition-colors disabled:opacity-50"
                >
                    {loading ? 'Running...' : 'Run Demo Sequence'}
                </button>
            </div>

            {error && (
                <div className="bg-red-900/30 border border-red-500/50 text-red-200 p-4 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Real User Panel */}
                <div className="flex flex-col border border-[#1c2a38] rounded-lg overflow-hidden bg-[#0a0f16]">
                    <div className="bg-[#1c2a38] px-4 py-2 border-b border-[#2c3e50] flex justify-between items-center">
                        <span className="font-bold text-green-400 font-mono text-sm">Real User (Owner Session)</span>
                    </div>
                    <div className="p-4 flex-1">
                        {realData ? (
                            <pre className="text-xs font-mono text-gray-300 overflow-auto whitespace-pre-wrap">
                                {JSON.stringify(realData, null, 2)}
                            </pre>
                        ) : (
                            <div className="text-center text-gray-600 italic text-sm mt-10">Waiting...</div>
                        )}
                    </div>
                    {realData && (
                        <div className="bg-green-900/20 border-t border-green-900/50 p-3 text-xs text-green-400 font-mono flex gap-2 items-center">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            Access verified: session matches transaction owner
                        </div>
                    )}
                </div>

                {/* Attacker Panel */}
                <div className="flex flex-col border border-[#1c2a38] rounded-lg overflow-hidden bg-[#0a0f16]">
                    <div className="bg-[#1c2a38] px-4 py-2 border-b border-[#2c3e50] flex justify-between items-center">
                        <span className="font-bold text-red-400 font-mono text-sm">Attacker (Unauthorized Session)</span>
                    </div>
                    <div className="p-4 flex-1">
                        {attackerData ? (
                            <pre className="text-xs font-mono text-orange-300 overflow-auto whitespace-pre-wrap">
                                {JSON.stringify(attackerData, null, 2)}
                            </pre>
                        ) : (
                            <div className="text-center text-gray-600 italic text-sm mt-10">Waiting...</div>
                        )}
                    </div>
                    {attackerData && attackerSession && (
                        <div className="bg-red-900/20 border-t border-red-900/50 p-3 flex flex-col gap-2">
                            <div className="text-xs text-red-400 font-mono flex gap-2 items-center font-bold">
                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                Flagged as attacker (Threat Score: {attackerSession.threatScore})
                            </div>
                            {attackerSession.scoreHistory && attackerSession.scoreHistory.length > 0 && (
                                <div className="text-xs text-red-300/80 font-mono ml-4">
                                    Reason: {attackerSession.scoreHistory[attackerSession.scoreHistory.length - 1].reason} 
                                    <br/>
                                    (Delta: +{attackerSession.scoreHistory[attackerSession.scoreHistory.length - 1].delta})
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
