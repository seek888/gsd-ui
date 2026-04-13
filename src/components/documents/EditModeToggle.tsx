import { Eye, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EditModeToggleProps {
  currentMode: 'preview' | 'edit';
  onToggle: () => void;
}

export function EditModeToggle({ currentMode, onToggle }: EditModeToggleProps) {
  const isEditMode = currentMode === 'edit';

  return (
    <Button
      variant={isEditMode ? 'default' : 'outline'}
      size="sm"
      onClick={onToggle}
      className="gap-1"
    >
      {isEditMode ? (
        <>
          <Edit className="w-4 h-4" />
          Edit
        </>
      ) : (
        <>
          <Eye className="w-4 h-4" />
          Preview
        </>
      )}
    </Button>
  );
}
