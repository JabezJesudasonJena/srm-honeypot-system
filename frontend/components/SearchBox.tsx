import { Search } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface SearchBoxProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export default function SearchBox({ onSearch, isLoading }: SearchBoxProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-[var(--color-cyber-muted)] group-focus-within:text-[var(--color-cyber-primary)] transition-colors" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="block w-full pl-10 pr-24 py-4 border border-[var(--color-cyber-border)] rounded-lg leading-5 bg-[var(--color-cyber-panel)] text-white placeholder-[var(--color-cyber-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--color-cyber-primary)] focus:border-[var(--color-cyber-primary)] transition-all font-mono"
          placeholder="Search internal documentation..."
          disabled={isLoading}
        />
        <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="px-4 py-2 bg-[var(--color-cyber-border)] hover:bg-[var(--color-cyber-primary)] text-white hover:text-black font-mono text-sm rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Search
          </button>
        </div>
      </div>
    </form>
  );
}
