import { MonitorSmartphone, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WelcomeLayout } from './WelcomeLayout';

export function BrowserPreviewPage() {
  return (
    <WelcomeLayout>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <MonitorSmartphone className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Browser Preview</h1>
        <p className="text-muted-foreground mt-2">
          This page is only the Vite preview. The full app runs inside the Tauri desktop window.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-primary" />
            Tauri Required
          </CardTitle>
          <CardDescription>
            Claude CLI detection, local file access, and command execution only work inside Tauri.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>Use the desktop app window that opens after running <code className="bg-muted px-1 rounded text-xs">npm run tauri:dev</code>.</p>
          <p>If the desktop window is blank, keep this preview page open and check the Tauri window DevTools for runtime errors.</p>
        </CardContent>
      </Card>
    </WelcomeLayout>
  );
}
