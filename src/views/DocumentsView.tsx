import { Card, CardContent } from '@/components/ui/card';

export function DocumentsView() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
        <p className="text-muted-foreground mt-1">Browse and edit planning files</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">
            File browser and editor will be implemented in Phase 3. The Documents view
            will display a file tree for the <code>.planning/</code> directory with
            Monaco Editor integration for editing Markdown files.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
