import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useProjectStore } from '@/stores/projectStore';
import { DirectoryPicker } from '@/components/DirectoryPicker';

export function DashboardView() {
  const { projectPath } = useProjectStore();

  if (!projectPath) {
    return <DirectoryPicker />;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your GSD project</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project</CardTitle>
          <CardDescription>{projectPath}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Progress data will appear here once Phase 4 is implemented.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current Phase</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">--</p>
            <p className="text-xs text-muted-foreground">Phase 4 will populate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0%</p>
            <p className="text-xs text-muted-foreground">No phases completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0/27</p>
            <p className="text-xs text-muted-foreground">Across 5 phases</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
