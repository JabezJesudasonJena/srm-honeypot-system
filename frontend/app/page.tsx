import Link from "next/link";
import { ShieldAlert, Database, Cpu, Shield, Server, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto text-center space-y-8 py-20 relative z-10">
        <div className="absolute inset-0 -z-10 flex items-center justify-center">
          <div className="w-64 h-64 bg-[var(--color-cyber-primary)] rounded-full blur-[100px] opacity-10"></div>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold font-mono tracking-tighter text-white">
          THE TRAP IS <span className="text-[var(--color-cyber-primary)] text-glow">THE DATA.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-[var(--color-cyber-text)] max-w-2xl mx-auto font-sans leading-relaxed">
          Project Labyrinth is an AI-powered RAG honeypot designed to detect attackers,
          capture malicious reconnaissance, deploy canary credentials, and generate
          real-time threat intelligence.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Link href="/user" className="w-full sm:w-auto px-8 py-3 bg-[var(--color-cyber-panel)] hover:bg-[var(--color-cyber-border)] border border-blue-500/40 rounded-md font-mono text-white transition-all flex items-center justify-center group shadow-[0_0_15px_rgba(37,99,235,0.2)]">
            <span className="text-blue-400 mr-2">◈</span>
            Enter Corporate User Portal
            <ArrowRight className="ml-2 h-4 w-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/dashboard" className="w-full sm:w-auto px-8 py-3 bg-[var(--color-cyber-primary)] hover:bg-[#00cc7d] text-black rounded-md font-mono font-bold shadow-[0_0_15px_rgba(0,255,157,0.4)] hover:shadow-[0_0_25px_rgba(0,255,157,0.6)] transition-all flex items-center justify-center">
            Open Security Dashboard
          </Link>
        </div>
      </section>

      {/* Architecture Section */}
      <section className="max-w-7xl mx-auto w-full py-16">
        <h2 className="text-2xl font-mono text-center text-white mb-12">SYSTEM ARCHITECTURE</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          
          <div className="glass-panel p-6 rounded-lg text-center flex flex-col items-center hover:border-[var(--color-cyber-primary)] transition-colors group">
            <div className="w-12 h-12 bg-black/50 border border-[var(--color-cyber-border)] rounded-lg flex items-center justify-center mb-4 group-hover:text-[var(--color-cyber-primary)] transition-colors">
              <Server className="h-6 w-6" />
            </div>
            <h3 className="font-mono font-bold text-white mb-2">Ingress Layer</h3>
            <ul className="text-sm text-[var(--color-cyber-muted)] space-y-1">
              <li>Fake Corporate Portal</li>
              <li>Labyrinth AI Assistant</li>
            </ul>
          </div>

          <div className="glass-panel p-6 rounded-lg text-center flex flex-col items-center hover:border-[var(--color-cyber-primary)] transition-colors group">
            <div className="w-12 h-12 bg-black/50 border border-[var(--color-cyber-border)] rounded-lg flex items-center justify-center mb-4 group-hover:text-[var(--color-cyber-primary)] transition-colors">
              <Database className="h-6 w-6" />
            </div>
            <h3 className="font-mono font-bold text-white mb-2">Queue Layer</h3>
            <ul className="text-sm text-[var(--color-cyber-muted)] space-y-1">
              <li>Redis</li>
              <li>BullMQ</li>
            </ul>
          </div>

          <div className="glass-panel p-6 rounded-lg text-center flex flex-col items-center hover:border-[var(--color-cyber-primary)] transition-colors group">
            <div className="w-12 h-12 bg-black/50 border border-[var(--color-cyber-border)] rounded-lg flex items-center justify-center mb-4 group-hover:text-[var(--color-cyber-primary)] transition-colors">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="font-mono font-bold text-white mb-2">Retrieval Layer</h3>
            <ul className="text-sm text-[var(--color-cyber-muted)] space-y-1">
              <li>PostgreSQL</li>
              <li>pgvector</li>
            </ul>
          </div>

          <div className="glass-panel p-6 rounded-lg text-center flex flex-col items-center hover:border-[var(--color-cyber-accent)] transition-colors group">
            <div className="w-12 h-12 bg-black/50 border border-[var(--color-cyber-border)] rounded-lg flex items-center justify-center mb-4 group-hover:text-[var(--color-cyber-accent)] transition-colors">
              <Cpu className="h-6 w-6" />
            </div>
            <h3 className="font-mono font-bold text-white mb-2">Generation Layer</h3>
            <ul className="text-sm text-[var(--color-cyber-muted)] space-y-1">
              <li>Gemini AI</li>
              <li>Canary Credentials</li>
            </ul>
          </div>

          <div className="glass-panel p-6 rounded-lg text-center flex flex-col items-center hover:border-[var(--color-cyber-alert)] transition-colors group">
            <div className="w-12 h-12 bg-black/50 border border-[var(--color-cyber-border)] rounded-lg flex items-center justify-center mb-4 group-hover:text-[var(--color-cyber-alert)] transition-colors">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <h3 className="font-mono font-bold text-white mb-2">Threat Intel</h3>
            <ul className="text-sm text-[var(--color-cyber-muted)] space-y-1">
              <li>Breach Detection</li>
              <li>AI Reports</li>
            </ul>
          </div>

        </div>
      </section>
    </div>
  );
}
