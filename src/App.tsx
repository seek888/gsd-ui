import { useEffect } from 'react';
import { isTauri } from '@tauri-apps/api/core';
import { AppShell } from '@/components/AppShell';
import { BrowserPreviewPage } from '@/components/BrowserPreviewPage';
import { WelcomePage } from '@/components/WelcomePage';
import { DirectoryPicker } from '@/components/DirectoryPicker';
import { ErrorDialog } from '@/components/ui/error-dialog';
import { ErrorToaster } from '@/components/ui/error-toast';
import { useProjectStore } from '@/stores/projectStore';
import { useErrorStore } from '@/stores/errorStore';
import './index.css';

function AppContent() {
  const { cliInstalled, projectPath, isLoading, loadSettings, detectCli } = useProjectStore();

  // Subscribe to errorStore for error UI (D-02)
  const modalErrors = useErrorStore((state) => state.getErrorsByDisplayType('modal'));
  const clearError = useErrorStore((state) => state.clearError);

  const runningInTauri = isTauri();

  useEffect(() => {
    if (!runningInTauri) return;

    // Initialize: load persisted settings and detect CLI
    let mounted = true;
    const init = async () => {
      await loadSettings();
      if (mounted) await detectCli();
    };
    init();
    return () => { mounted = false; };
  }, [runningInTauri, loadSettings, detectCli]);

  if (!runningInTauri) {
    return <BrowserPreviewPage />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Decision tree per D-05 and D-06:
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
      {/* Error UI components connected to errorStore (D-02) */}
      <ErrorToaster />
      {modalErrors.map((error) => (
        <ErrorDialog key={error.id} error={error} onClose={() => clearError(error.id)} />
      ))}
    </>
  );
}

export default AppContent;
