"use client";

import { useState, useEffect } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, ShieldAlert, Terminal } from 'lucide-react';

export default function AttackerReplay({ timeline = [], canaries = [] }: { timeline: any[], canaries: any[] }) {
  // Extract only HTTP requests, filtering out non-requests like SESSION_CREATED
  const requests = timeline.filter(entry => entry.eventType === 'REQUEST_PROCESSED');
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentIndex < requests.length - 1) {
      interval = setInterval(() => {
        setCurrentIndex(prev => prev + 1);
      }, 2500);
    } else if (currentIndex >= requests.length - 1) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentIndex, requests.length]);

  if (requests.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 text-center text-gray-500">
        No requests recorded for this session.
      </div>
    );
  }

  const currentReq = requests[currentIndex];
  
  // Parse details: e.g. "[GET] /robots.txt → 500"
  // The arrow might be '→' or '->' or just spaces depending on encoding
  const match = currentReq.details?.match(/\[(.*?)\] (.*?)\s+(?:→|->)\s+(\d+)/) || currentReq.details?.match(/\[(.*?)\] (.*?)\s+(\d+)/);
  const method = match ? match[1] : (currentReq.method || 'UNKNOWN');
  const path = match ? match[2] : (currentReq.path || 'UNKNOWN');
  const status = match ? match[3] : 'UNKNOWN';
  
  // Canary visually flag
  const hasCanary = currentReq.metadata?.canaryInjected;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-gray-800 bg-black/20 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-medium flex items-center gap-2">
            <Terminal className="text-green-400" size={18} /> Attacker's View (Replay)
          </h3>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="p-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 disabled:opacity-50"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1 px-3 rounded bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1 text-xs font-medium"
            >
              {isPlaying ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Auto-play</>}
            </button>
            <button 
              onClick={() => setCurrentIndex(prev => Math.min(requests.length - 1, prev + 1))}
              disabled={currentIndex === requests.length - 1}
              className="p-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 disabled:opacity-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          This is exactly what the attacker's terminal/browser received — not what our AI was analyzing in the background. 
          <span className="italic block mt-0.5">Note: Backend currently only stores method/path/status, full response bodies are not persisted.</span>
        </p>
      </div>

      <div className="p-5 flex-1 flex flex-col gap-4 font-mono text-sm bg-black/40">
        <div className="flex justify-between items-center text-gray-500 text-xs uppercase tracking-wider mb-2">
          <span>Step {currentIndex + 1} of {requests.length}</span>
          <span>{new Date(currentReq.timestamp).toLocaleTimeString()}</span>
        </div>

        {/* Request Block */}
        <div className="bg-gray-900 border border-gray-800 rounded p-4 shadow-inner">
          <div className="flex gap-3 text-gray-300 mb-2">
            <span className={`font-bold ${method === 'GET' ? 'text-blue-400' : 'text-green-400'}`}>{method}</span>
            <span className="text-white break-all">{path}</span>
            <span className="text-gray-500 ml-auto">HTTP/1.1</span>
          </div>
          <div className="text-gray-500 text-xs mt-2 pl-2 border-l-2 border-gray-800 space-y-1">
            <div>Host: honeypot.labyrinth.local</div>
            <div>User-Agent: {currentReq.metadata?.userAgent || "Attacker Client"}</div>
            <div>Accept: */*</div>
          </div>
        </div>

        {/* Response Block */}
        <div className="bg-[#0c1219] border border-gray-800 rounded p-4 shadow-inner flex-1 border-l-4 border-l-purple-500/50">
          <div className="flex items-center gap-3 text-gray-300 mb-3">
            <span className="text-gray-500">HTTP/1.1</span>
            <span className={`font-bold ${status.startsWith('2') ? 'text-green-400' : status.startsWith('4') ? 'text-yellow-400' : 'text-red-400'}`}>
              {status}
            </span>
            {hasCanary && (
              <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] uppercase px-2 py-0.5 rounded ml-auto flex items-center gap-1">
                <ShieldAlert size={12} /> Canary Issued Here
              </span>
            )}
          </div>
          <div className="text-gray-400 text-xs mt-2 pl-2 border-l-2 border-gray-800 space-y-1 mb-4">
            <div>Content-Type: application/json</div>
            <div>Server: Labyrinth Deception Engine</div>
            <div>Date: {new Date(currentReq.timestamp).toUTCString()}</div>
          </div>
          <div className="text-green-500/70 overflow-auto whitespace-pre-wrap">
            {currentReq.metadata?.rawBody ? (
              typeof currentReq.metadata.rawBody === 'string' 
                ? currentReq.metadata.rawBody 
                : JSON.stringify(currentReq.metadata.rawBody, null, 2)
            ) : (
              <span className="text-gray-600 italic">// Response body data not retained in timeline metadata.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
