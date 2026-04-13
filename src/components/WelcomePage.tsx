import { Terminal, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useProjectStore } from '@/stores/projectStore';
import { WelcomeLayout } from './WelcomeLayout';

export function WelcomePage() {
  const { detectCli, cliVersion, cliInstalled } = useProjectStore();

  return (
    <WelcomeLayout>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Terminal className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome to GSD UI</h1>
        <p className="text-muted-foreground mt-2">
          A desktop interface for the GSD workflow
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {!cliInstalled ? (
              <>
                <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                Claude CLI Not Found
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                Claude CLI Ready
              </>
            )}
          </CardTitle>
          <CardDescription>
            {!cliInstalled
              ? 'The Claude CLI is required to run GSD commands.'
              : `Version: ${cliVersion}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!cliInstalled ? (
            <>
              <div className="space-y-2">
                <p className="text-sm font-medium">Install the Claude CLI:</p>
                <div className="bg-muted rounded-md p-3 font-mono text-sm select-all">
                  npm install -g @anthropic/claude-code
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">After installation:</p>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Restart your terminal</li>
                  <li>Run <code className="bg-muted px-1 rounded text-xs">claude --version</code> to verify</li>
                  <li>Click "Check again" below</li>
                </ol>
              </div>
              <Button
                onClick={() => detectCli()}
                className="w-full"
                variant="default"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Check again
              </Button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Claude CLI is installed. You can now proceed to select your GSD project directory.
            </p>
          )}
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground mt-6">
        GSD UI requires the Claude CLI to be installed globally.
      </p>
    </WelcomeLayout>
  );
}
