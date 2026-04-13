import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { ActiveView } from '@/stores/uiStore';
import type { LucideIcon } from 'lucide-react';

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  view: ActiveView;
  active: boolean;
  onClick: () => void;
}

export function NavItem({ icon: Icon, label, active, onClick }: NavItemProps) {
  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start gap-3 px-3 h-11",
        active && "bg-accent text-accent-foreground font-medium"
      )}
      onClick={onClick}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span className="text-sm">{label}</span>
    </Button>
  );
}
