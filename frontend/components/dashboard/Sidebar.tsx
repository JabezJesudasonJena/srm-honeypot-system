'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Swords, Users, Brain, Shield, BarChart3,
  Settings, ChevronLeft, ChevronRight, Hexagon,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard#attacks', label: 'Attacks', icon: Swords },
  { href: '/dashboard#sessions', label: 'Sessions', icon: Users },
  { href: '/dashboard#intelligence', label: 'Intelligence', icon: Brain },
  { href: '/dashboard#deception', label: 'Deception', icon: Shield },
  { href: '/dashboard#benchmark', label: 'Benchmarks', icon: BarChart3 },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={`${collapsed ? 'w-16' : 'w-56'} transition-all duration-200 flex flex-col border-r border-soc-border bg-soc-surface shrink-0`}
    >
      {/* Logo */}
      <div className="h-14 flex items-center gap-2 px-4 border-b border-soc-border">
        <Hexagon className="w-6 h-6 text-soc-primary shrink-0" />
        {!collapsed && (
          <span className="text-sm font-semibold tracking-wide text-soc-text truncate">
            LABYRINTH
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 space-y-0.5 px-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                active
                  ? 'bg-soc-primary/10 text-soc-primary'
                  : 'text-soc-text-secondary hover:bg-soc-panel hover:text-soc-text'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Settings + Collapse */}
      <div className="border-t border-soc-border p-2 space-y-0.5">
        <Link
          href="/dashboard#settings"
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-soc-text-secondary hover:bg-soc-panel hover:text-soc-text transition-colors"
        >
          <Settings className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-soc-text-muted hover:bg-soc-panel hover:text-soc-text transition-colors w-full"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
