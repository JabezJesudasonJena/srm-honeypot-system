import { Activity } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-cyber-border)] bg-black/50 py-6 mt-auto relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center space-x-2 text-sm text-[var(--color-cyber-muted)]">
          <Activity className="h-4 w-4" />
          <span className="font-mono">Labyrinth SOC Engine v1.0</span>
        </div>
        <div className="text-xs text-[var(--color-cyber-muted)] mt-4 md:mt-0 font-mono">
          © {new Date().getFullYear()} Acme Corp Security. Internal Use Only.
        </div>
      </div>
    </footer>
  );
}
