import { Sidebar } from './Sidebar';
import { DashboardView } from '@/views/DashboardView';
import { RoadmapView } from '@/views/RoadmapView';
import { TerminalView } from '@/views/TerminalView';
import { DocumentsView } from '@/views/DocumentsView';
import { useUIStore } from '@/stores/uiStore';

export function AppShell() {
  const { activeView } = useUIStore();

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'roadmap':
        return <RoadmapView />;
      case 'terminal':
        return <TerminalView />;
      case 'documents':
        return <DocumentsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-background">
        {renderContent()}
      </main>
    </div>
  );
}
