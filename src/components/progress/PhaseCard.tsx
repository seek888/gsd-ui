import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { CheckCircle, Circle, Clock } from 'lucide-react';
import type { Phase } from '@/types/progress';
import { PlanItem } from './PlanItem';
import { cn } from '@/lib/utils';

interface PhaseCardProps {
  phase: Phase;
  isExpanded: boolean;
  onToggle: () => void;
}

export function PhaseCard({ phase, isExpanded, onToggle }: PhaseCardProps) {
  // 状态徽章配置
  const statusConfig = {
    complete: {
      label: '已完成',
      variant: 'success' as const,
      icon: CheckCircle,
    },
    'in-progress': {
      label: '进行中',
      variant: 'warning' as const,
      icon: Clock,
    },
    'not-started': {
      label: '未开始',
      variant: 'outline' as const,
      icon: Circle,
    },
  };

  const config = statusConfig[phase.status];
  const StatusIcon = config.icon;

  return (
    <Accordion
      type="single"
      value={isExpanded ? 'expanded' : 'collapsed'}
      onValueChange={onToggle}
      className="w-full"
    >
      <AccordionItem value="expanded" className={cn(
        "border rounded-lg transition-all",
        phase.isActive && "ring-2 ring-ring ring-offset-2"
      )}>
        {/* 卡片头部 */}
        <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/30 transition-colors [&[data-state=open]]:bg-muted/30">
          <div className="flex items-center gap-4 flex-1">
            {/* 阶段编号 */}
            <div className={cn(
              "flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold shrink-0",
              phase.isActive
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}>
              {phase.number}
            </div>

            {/* 阶段信息 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-semibold truncate">{phase.name}</h3>
                {/* 状态徽章 */}
                {phase.isActive && (
                  <Badge variant="default" className="shrink-0">当前</Badge>
                )}
              </div>

              {/* 进度条 + 百分比 */}
              <div className="flex items-center gap-3">
                <Progress value={phase.progress} className="flex-1 h-2" />
                <span className="text-sm font-medium w-12 text-right">{phase.progress}%</span>
              </div>
            </div>

            {/* 右侧信息 */}
            <div className="flex items-center gap-3 shrink-0">
              {/* 状态徽章 */}
              <Badge variant={config.variant} className="gap-1">
                <StatusIcon className="h-3 w-3" />
                {config.label}
              </Badge>

              {/* 计划完成数 */}
              <span className="text-sm text-muted-foreground">
                {phase.completedPlans}/{phase.plansCount}
              </span>
            </div>
          </div>
        </AccordionTrigger>

        {/* 展开内容：计划列表 */}
        <AccordionContent className="px-6 pb-4">
          <div className="pt-2 border-t space-y-1">
            {phase.plans.map((plan) => (
              <PlanItem key={plan.id} plan={plan} />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
