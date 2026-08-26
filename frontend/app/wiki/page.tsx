"use client";

import { useState } from 'react';
import { Database, ShieldAlert, Server, Users, Settings, BookOpen } from 'lucide-react';
import SearchBox from '@/components/SearchBox';
import WikiResponse from '@/components/WikiResponse';
import LoadingState from '@/components/LoadingState';
import { searchWiki } from '@/lib/api';

export default function WikiPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [classification, setClassification] = useState<string>("INTERNAL");

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setResponse(null);
    
    try {
      const data = await searchWiki(query);
      setResponse(data.response);
      if (data.classification) {
        setClassification(data.classification);
      }
    } catch (error) {
      console.error("Search failed", error);
      setResponse("An error occurred while accessing internal systems.");
      setClassification("ERROR");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[var(--color-cyber-border)] glass-panel hidden md:block">
        <div className="p-6 border-b border-[var(--color-cyber-border)]">
          <h2 className="font-mono font-bold text-white tracking-wider">ACME CORP</h2>
          <p className="text-xs text-[var(--color-cyber-muted)] mt-1">Internal Knowledge Base</p>
        </div>
        
        <nav className="p-4 space-y-2">
          <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm text-[var(--color-cyber-text)] hover:bg-[var(--color-cyber-border)] hover:text-white transition-colors">
            <Server className="h-4 w-4" />
            <span>Engineering</span>
          </a>
          <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm text-[var(--color-cyber-text)] hover:bg-[var(--color-cyber-border)] hover:text-white transition-colors">
            <Settings className="h-4 w-4" />
            <span>DevOps</span>
          </a>
          <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm text-[var(--color-cyber-text)] hover:bg-[var(--color-cyber-border)] hover:text-white transition-colors">
            <Database className="h-4 w-4" />
            <span>Infrastructure</span>
          </a>
          <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm text-[var(--color-cyber-text)] hover:bg-[var(--color-cyber-border)] hover:text-white transition-colors">
            <Database className="h-4 w-4" />
            <span>Database</span>
          </a>
          <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm text-[var(--color-cyber-alert)] bg-[#ff2a2a]/10 border border-[#ff2a2a]/20 hover:bg-[#ff2a2a]/20 transition-colors">
            <ShieldAlert className="h-4 w-4" />
            <span className="font-bold">Security</span>
          </a>
          <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm text-[var(--color-cyber-text)] hover:bg-[var(--color-cyber-border)] hover:text-white transition-colors">
            <Users className="h-4 w-4" />
            <span>Onboarding</span>
          </a>
          <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm text-[var(--color-cyber-text)] hover:bg-[var(--color-cyber-border)] hover:text-white transition-colors">
            <BookOpen className="h-4 w-4" />
            <span>Company Policies</span>
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 md:p-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          
          <div className="text-center mb-12">
            <h1 className="text-3xl font-mono font-bold text-white mb-4">Internal Knowledge Search</h1>
            <p className="text-[var(--color-cyber-muted)] mb-8">
              Access secured corporate documentation and architecture guidelines.
            </p>
            
            <SearchBox onSearch={handleSearch} isLoading={isLoading} />
          </div>

          <div className="min-h-[300px]">
            {isLoading && (
              <LoadingState message="Searching internal systems..." />
            )}
            
            {!isLoading && response && (
              <WikiResponse response={response} classification={classification} />
            )}
            
            {!isLoading && !response && (
              <div className="flex flex-col items-center justify-center h-64 opacity-20">
                <ShieldAlert className="h-16 w-16 mb-4" />
                <p className="font-mono text-sm">AWAITING QUERY</p>
              </div>
            )}
          </div>
          
        </div>
      </main>
    </div>
  );
}
