import Link from 'next/link';
import { Shield } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full glass-panel border-b border-[var(--color-cyber-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-[var(--color-cyber-primary)]" />
            <Link href="/" className="font-mono font-bold text-xl tracking-wider text-white text-glow flex items-center">
              <span className="text-[var(--color-cyber-primary)] mr-2">◈</span>
              PROJECT LABYRINTH
            </Link>
          </div>

          <div className="flex items-center space-x-8">
            <div className="hidden md:flex space-x-6">
              <Link href="/" className="text-sm font-medium text-gray-300 hover:text-white hover:text-glow transition-all">
                Home
              </Link>
              <Link href="/wiki" className="text-sm font-medium text-gray-300 hover:text-white hover:text-glow transition-all">
                Wiki
              </Link>
              <Link href="/dashboard" className="text-sm font-medium text-gray-300 hover:text-white hover:text-glow transition-all">
                Dashboard
              </Link>
            </div>
            
            <div className="flex items-center space-x-2 bg-black/40 px-3 py-1 rounded-full border border-[var(--color-cyber-border)]">
              <div className="w-2 h-2 rounded-full bg-[var(--color-cyber-primary)] animate-pulse shadow-[0_0_8px_var(--color-cyber-primary)]"></div>
              <span className="text-xs font-mono text-[var(--color-cyber-primary)]">SYSTEM ACTIVE</span>
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
}
