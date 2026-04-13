import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import matter from 'gray-matter';

interface FrontMatterProps {
  content: string;
}

export function FrontMatter({ content }: FrontMatterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data } = matter(content);

  if (Object.keys(data).length === 0) {
    return null;
  }

  return (
    <div className="border-b">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 flex items-center gap-2 text-sm text-muted-foreground hover:bg-muted/50"
      >
        {isOpen ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
        <span>YAML metadata</span>
      </button>
      {isOpen && (
        <pre className="px-4 py-2 text-sm bg-muted/30 overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}
