import { FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { open } from '@tauri-apps/plugin-dialog';
import { useProjectStore } from '@/stores/projectStore';
import { WelcomeLayout } from './WelcomeLayout';

export function DirectoryPicker() {
  const { saveProjectPath, cliVersion } = useProjectStore();

  const handleSelectDirectory = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Select GSD Project Directory',
      });
      if (selected && typeof selected === 'string') {
        await saveProjectPath(selected);
      }
    } catch (err) {
      console.error('Failed to select directory:', err);
    }
  };

  return (
    <WelcomeLayout>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <FolderOpen className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Select Your Project</h1>
        <p className="text-muted-foreground mt-2">
          Choose the GSD project directory to work with
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Directory</CardTitle>
          <CardDescription>
            Select the root directory of your GSD project. This directory should contain a <code>.planning/</code> folder.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleSelectDirectory}
            className="w-full"
            size="lg"
          >
            <FolderOpen className="w-5 h-5 mr-2" />
            Choose Directory
          </Button>
        </CardContent>
      </Card>

      {/* Status footer */}
      <div className="mt-6 flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          CLI Ready
        </span>
        {cliVersion && <span>v{cliVersion}</span>}
      </div>
    </WelcomeLayout>
  );
}
