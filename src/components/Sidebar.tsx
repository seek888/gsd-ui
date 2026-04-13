import { LayoutDashboard, Map, Terminal, FileText } from 'lucide-react';
import { NavItem } from './NavItem';
import { useUIStore, type ActiveView } from '@/stores/uiStore';
import { useProjectStore } from '@/stores/projectStore';
import { cn } from '@/lib/utils';

const NAV_ITEMS: { icon: typeof LayoutDashboard; label: string; view: ActiveView }[] = [
  { icon: LayoutDashboard, label: 'Dashboard', view: 'dashboard' },
  { icon: Map, label: 'Roadmap', view: 'roadmap' },
  { icon: Terminal, label: 'Terminal', view: 'terminal' },
  { icon: FileText, label: 'Documents', view: 'documents' },
];

export function Sidebar() {
  const { activeView, setActiveView } = useUIStore();
  const { projectPath, cliVersion } = useProjectStore();

  return (
    <aside className="w-[200px] h-screen shrink-0 border-r bg-card flex flex-col">
      {/* App Header */}
      <div className="h-14 border-b px-4 flex items-center">
        <span className="font-semibold text-base">GSD UI</span>
      </div>

      {/* Project Path Display */}
      {projectPath && (
        <div className="px-3 py-2 border-b">
          <p className="text-xs text-muted-foreground truncate" title={projectPath}>
            {projectPath.split('/').pop() || projectPath}
          </p>
        </div>
      )}

      {/* Navigation Items */}
      <nav className="flex-1 p-2 flex flex-col gap-1">
        {NAV_ITEMS.map(({ icon, label, view }) => (
          <NavItem
            key={view}
            icon={icon}
            label={label}
            view={view}
            active={activeView === view}
            onClick={() => setActiveView(view)}
          />
        ))}
      </nav>

      {/* CLI Status */}
      <div className="p-3 border-t">
        <div className={cn(
          "flex items-center gap-2 text-xs px-2 py-1 rounded",
          cliVersion ? "text-green-600 bg-green-50" : "text-muted-foreground"
        )}>
          <div className={cn(
            "w-2 h-2 rounded-full",
            cliVersion ? "bg-green-500" : "bg-muted-foreground"
          )} />
          <span>{cliVersion ? `CLI ${cliVersion}` : 'CLI not found'}</span>
        </div>
      </div>
    </aside>
  );
}
