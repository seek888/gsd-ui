import { useEffect } from 'react';
import { AppShell } from '@/components/AppShell';
import { WelcomePage } from '@/components/WelcomePage';
import { DirectoryPicker } from '@/components/DirectoryPicker';
import { useProjectStore } from '@/stores/projectStore';
import './index.css';

function AppContent() {
  const { cliInstalled, projectPath, isLoading, loadSettings, detectCli } = useProjectStore();

  useEffect(() => {
    // Initialize: load persisted settings and detect CLI
    const init = async () => {
      await loadSettings();
      await detectCli();
    };
    init();
  }, []);

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
  return <AppShell />;
}

export default AppContent;
