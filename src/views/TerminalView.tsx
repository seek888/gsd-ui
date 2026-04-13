import { useRef, useEffect } from 'react';
import { useCLIStore } from '@/stores/cliStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

export function TerminalView() {
  const { output, clearOutput, isRunning } = useCLIStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when output changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [output]);

  return (
    <div className="h-full flex flex-col">
      {/* Terminal Header */}
      <div className="shrink-0 px-4 py-3 border-b flex items-center justify-between">
        <h2 className="text-sm font-medium">Output</h2>
        {output.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearOutput}>
            <Trash2 className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Terminal Content */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="p-4 font-mono text-sm">
          {output.length === 0 ? (
            <p className="text-muted-foreground">
              Run a command to see output here.
            </p>
          ) : (
            <div className="space-y-0.5">
              {output.map((line, i) => (
                <div
                  key={i}
                  className="whitespace-pre-wrap break-all"
                >
                  {line}
                </div>
              ))}
            </div>
          )}
          {isRunning && (
            <div className="mt-2 text-muted-foreground animate-pulse">
              [Running...]
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
