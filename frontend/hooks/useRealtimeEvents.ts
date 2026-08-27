import { useEffect, useState } from 'react';

export function useRealtimeEvents(callback?: (data: any) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<any>(null);

  useEffect(() => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/labyrinth-api";
    const eventSource = new EventSource(`${API_BASE}/events/stream`);

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastEvent(data);
        if (callback) {
          callback(data);
        }
      } catch (err) {
        console.error("Error parsing SSE event:", err);
      }
    };

    eventSource.onerror = (error) => {
      console.warn("EventSource disconnected or failed to connect. Falling back to polling.");
      setIsConnected(false);
      eventSource.close();
      
      // Implement a simple fallback or let it try to reconnect on its own
    };

    return () => {
      eventSource.close();
    };
  }, [callback]);

  return { isConnected, lastEvent };
}
