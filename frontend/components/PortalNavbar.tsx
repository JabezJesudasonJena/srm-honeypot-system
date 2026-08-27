"use client";

import Link from "next/link";
import { Building2, Search, ShieldCheck, ArrowUpRight, User } from "lucide-react";

interface PortalNavbarProps {
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  onSearchSubmit?: () => void;
}

export default function PortalNavbar({
  searchQuery = "",
  onSearchChange,
  onSearchSubmit
}: PortalNavbarProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onSearchSubmit) {
      onSearchSubmit();
    }
  };

  return (
    <header className="w-full bg-[#0b1320] border-b border-slate-800 sticky top-0 z-30 shadow-sm backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Corporate Identity */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-900/30">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-sans font-bold text-white text-base tracking-wide">
                  ACME CORP
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold bg-blue-950/80 text-blue-300 border border-blue-800/60 rounded">
                  INTRANET
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans hidden sm:block">
                Internal Knowledge Portal
              </p>
            </div>
          </div>

          {/* Center Search Bar */}
          <div className="flex-1 max-w-xl mx-2 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search internal guides, clusters, policies, API specs..."
                className="w-full pl-10 pr-12 py-2 bg-slate-900/90 border border-slate-700/80 rounded-lg text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700 rounded">
                  ↵ Search
                </kbd>
              </div>
            </div>
          </div>

          {/* Right Actions: User Profile & Demo Switch */}
          <div className="flex items-center space-x-3 shrink-0">
            {/* Demo Switch to SOC Dashboard */}
            <Link
              href="/dashboard"
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-md text-xs font-mono text-emerald-400 transition-all shadow-sm group"
              title="Switch to Admin Security Dashboard for Demo"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span className="hidden sm:inline font-semibold">Demo: Security SOC</span>
              <span className="sm:hidden font-semibold">SOC</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>

            {/* Corporate User Badge */}
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                <User className="h-4 w-4" />
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold text-slate-200 leading-none">John Doe</p>
                <p className="text-[10px] text-slate-400 leading-tight">Staff SRE</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
