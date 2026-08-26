import { FileText, ShieldAlert } from 'lucide-react';

interface WikiResponseProps {
  response: string | null;
  classification?: string;
}

export default function WikiResponse({ response, classification = "INTERNAL" }: WikiResponseProps) {
  if (!response) return null;

  return (
    <div className="w-full max-w-3xl mx-auto mt-8">
      <div className="glass-panel rounded-lg overflow-hidden border border-[var(--color-cyber-border)]">
        
        {/* Header */}
        <div className="bg-[#1a2735] px-4 py-2 flex justify-between items-center border-b border-[var(--color-cyber-border)]">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-[var(--color-cyber-muted)]" />
            <span className="font-mono text-sm font-bold text-[var(--color-cyber-text)]">DOCUMENT RESPONSE</span>
          </div>
          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="text-[var(--color-cyber-muted)]">Classification:</span>
            <span className="text-[var(--color-cyber-alert)] flex items-center">
              <ShieldAlert className="h-3 w-3 mr-1" />
              {classification}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 bg-[#0a1118]">
          <pre className="font-mono text-sm text-[var(--color-cyber-text)] whitespace-pre-wrap leading-relaxed">
            {response}
          </pre>
        </div>

        {/* Footer */}
        <div className="bg-[#050a0f] px-4 py-3 flex justify-between items-center border-t border-[var(--color-cyber-border)] text-xs font-mono">
          <div className="text-[var(--color-cyber-muted)]">Source: Internal Knowledge Retrieval</div>
          <div className="text-[var(--color-cyber-primary)] flex items-center">
            <div className="w-2 h-2 rounded-full bg-[var(--color-cyber-primary)] mr-2"></div>
            Status: Retrieved
          </div>
        </div>
        
      </div>
    </div>
  );
}
