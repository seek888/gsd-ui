import { useEffect, useMemo, useRef } from 'react';
import { AppShell } from '@/components/AppShell';
import { BrowserPreviewPage } from '@/components/BrowserPreviewPage';
import { WelcomePage } from '@/components/WelcomePage';
import { DirectoryPicker } from '@/components/DirectoryPicker';
import { ErrorDialog } from '@/components/ui/error-dialog';
import { ErrorToaster } from '@/components/ui/error-toast';
import { useProjectStore } from '@/stores/projectStore';
import { useUIStore } from '@/stores/uiStore';
import { useErrorStore } from '@/stores/errorStore';
import { electronAPI } from '@/lib/electronAPI';
import './index.css';

function AppContent() {
  const cliInstalled = useProjectStore((s) => s.cliInstalled);
  const projectPath = useProjectStore((s) => s.projectPath);
  const isLoading = useProjectStore((s) => s.isLoading);
  const loadProjectSettings = useProjectStore((s) => s.loadSettings);
  const detectCli = useProjectStore((s) => s.detectCli);
  const loadUISettings = useUIStore((s) => s.loadSettings);

  const errors = useErrorStore((s) => s.errors);
  const clearError = useErrorStore((s) => s.clearError);
  const modalErrors = useMemo(
    () => errors.filter((e) => e.displayType === 'modal'),
    [errors],
  );

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    let mounted = true;

    const init = async () => {
      await Promise.all([
        loadProjectSettings(),
        loadUISettings(),
      ]);
      if (mounted) await detectCli();
    };
    init();

    return () => { mounted = false; };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Decision tree:
  // 1. CLI not installed -> show WelcomePage with install guide
  if (!cliInstalled) {
    return <WelcomePage />;
  }

  // 2. CLI installed but no project path -> show DirectoryPicker
  if (!projectPath) {
    return <DirectoryPicker />;
  }

  // 3. CLI installed AND project path set -> show full AppShell
  return (
    <>
      <AppShell />
      <ErrorToaster />
      {modalErrors.map((error) => (
        <ErrorDialog key={error.id} error={error} onClose={() => clearError(error.id)} />
      ))}
    </>
  );
}

export default AppContent;
