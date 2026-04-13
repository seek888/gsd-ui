import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";

export interface JumpToBottomProps {
  visible: boolean;
  onClick: () => void;
}

export function JumpToBottom({ visible, onClick }: JumpToBottomProps) {
  if (!visible) return null;

  return (
    <Button
      variant="default"
      size="icon"
      onClick={onClick}
      className="absolute bottom-4 right-4 rounded-full w-10 h-10 shadow-lg z-10"
      title="Jump to bottom"
    >
      <ArrowDown className="w-4 h-4" />
    </Button>
  );
}
