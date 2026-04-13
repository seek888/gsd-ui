import { Card, CardContent } from '@/components/ui/card';

export function RoadmapView() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Roadmap</h1>
        <p className="text-muted-foreground mt-1">Phase progress and planning</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">
            Roadmap view will be implemented in Phase 4. Phase details will display
            completion status, progress bars, and plan-level drill-down.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
