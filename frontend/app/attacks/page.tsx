"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { SessionInfo } from "@/lib/types";
import { useRealtimeEvents } from "@/hooks/useRealtimeEvents";
import AttackTable from "@/components/AttackTable";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import { Search } from "lucide-react";

export default function AttacksPage() {
  const [attacks, setAttacks] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useRealtimeEvents(() => {
    fetchAttacks();
  });

  const fetchAttacks = async () => {
    try {
      const data = await api.getAttacks();
      setAttacks(data || []);
      setError(false);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttacks();
    const interval = setInterval(fetchAttacks, 10000);
    return () => clearInterval(interval);
  }, []);

  const filteredAttacks = attacks.filter(a => 
    a.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (a.currentIntent && a.currentIntent.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) return <LoadingState message="Loading threat data..." />;
  if (error && attacks.length === 0) return <ErrorState onRetry={fetchAttacks} />;

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-soc-text)]">Active Attacks</h1>
          <p className="text-[var(--color-soc-text-muted)] text-sm">Monitor and analyze live threat sessions</p>
        </div>
        
        <div className="relative w-full md:w-64">
          <input 
            type="text" 
            placeholder="Search by ID or Intent..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--color-soc-surface)] border border-[var(--color-soc-border-light)] rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-[var(--color-soc-primary)] focus:ring-1 focus:ring-[var(--color-soc-primary)] text-[var(--color-soc-text)] placeholder-[var(--color-soc-text-muted)]"
          />
          <Search className="w-4 h-4 text-[var(--color-soc-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <AttackTable attacks={filteredAttacks} />
      </div>
    </div>
  );
}
