"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Radar, AlertTriangle, Database, Activity } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { name: "Overview", href: "/", icon: Radar },
    { name: "Attacks", href: "/attacks", icon: Shield },
    { name: "Alerts", href: "/alerts", icon: AlertTriangle },
    { name: "Intelligence", href: "/intelligence", icon: Database },
    { name: "System", href: "/system", icon: Activity },
  ];

  return (
    <aside className="w-64 bg-[var(--color-soc-panel)] border-r border-[var(--color-soc-border)] hidden md:flex flex-col h-screen shrink-0">
      <div className="p-4 border-b border-[var(--color-soc-border)] flex items-center gap-3">
        <Shield className="text-[var(--color-soc-primary)] w-8 h-8" />
        <div>
          <h1 className="font-bold text-lg tracking-wider text-[var(--color-soc-text)] leading-tight">LABYRINTH</h1>
          <p className="text-xs text-[var(--color-soc-text-muted)] tracking-widest">SOC DASHBOARD</p>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href));
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                isActive 
                  ? "bg-[var(--color-soc-primary)]/10 text-[var(--color-soc-primary)] border border-[var(--color-soc-primary)]/20" 
                  : "text-[var(--color-soc-text-secondary)] hover:bg-[var(--color-soc-border-light)] hover:text-[var(--color-soc-text)]"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[var(--color-soc-border)] text-xs text-[var(--color-soc-text-muted)] flex flex-col gap-1">
        <p>PROJECT LABYRINTH</p>
        <p>v1.0.0-hackathon</p>
      </div>
    </aside>
  );
}
