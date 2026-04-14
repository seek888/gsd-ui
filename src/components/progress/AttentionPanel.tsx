import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { RoadmapData, SessionState } from '@/types/progress';
import { cn } from '@/lib/utils';

interface AttentionPanelProps {
  roadmapData: RoadmapData | null;
  sessionState: SessionState | null;
}

interface AttentionItem {
  id: string;
  type: 'incomplete' | 'blocker' | 'info';
  title: string;
  description: string;
  phaseNumber?: number;
}

export function AttentionPanel({ roadmapData, sessionState }: AttentionPanelProps) {
  // 收集需要注意的事项
  const attentionItems: AttentionItem[] = [];

  // 添加未完成计划
  if (roadmapData) {
    roadmapData.phases.forEach((phase) => {
      if (phase.status !== 'complete') {
        phase.plans.forEach((plan) => {
          if (plan.status !== 'complete') {
            attentionItems.push({
              id: `plan-${plan.id}`,
              type: 'incomplete',
              title: `未完成计划: ${plan.id}`,
              description: plan.name,
              phaseNumber: phase.number,
            });
          }
        });
      }
    });

    // 添加当前阶段的未完成计划（高优先级）
    const currentPhase = roadmapData.phases.find(p => p.isActive);
    if (currentPhase && currentPhase.status !== 'complete') {
      attentionItems.unshift({
        id: 'current-phase',
        type: 'info',
        title: '当前阶段未完成',
        description: `${currentPhase.name} 还剩 ${currentPhase.plansCount - currentPhase.completedPlans} 个计划`,
        phaseNumber: currentPhase.number,
      });
    }
  }

  // 添加阻塞项
  if (sessionState && sessionState.blockers.length > 0) {
    sessionState.blockers.forEach((blocker, index) => {
      attentionItems.push({
        id: `blocker-${blocker.id}`,
        type: 'blocker',
        title: `阻塞项 #${index + 1}`,
        description: blocker.description,
      });
    });
  }

  // 如果没有需要关注的事项
  if (attentionItems.length === 0) {
    return null;
  }

  return (
    <Card className="border-yellow-200 dark:border-yellow-900 bg-yellow-50/50 dark:bg-yellow-900/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          需要关注
          <Badge variant="outline" className="ml-auto">
            {attentionItems.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {attentionItems.slice(0, 5).map((item) => {
            const Icon = item.type === 'blocker' ? AlertTriangle :
                        item.type === 'incomplete' ? AlertCircle : Info;

            return (
              <div
                key={item.id}
                className={cn(
                  "flex items-start gap-2 p-2 rounded-md bg-background/50",
                  item.type === 'blocker' && "border-l-2 border-destructive",
                  item.type === 'incomplete' && "border-l-2 border-yellow-500"
                )}
              >
                <Icon className={cn(
                  "h-4 w-4 shrink-0 mt-0.5",
                  item.type === 'blocker' && "text-destructive",
                  item.type === 'incomplete' && "text-yellow-600 dark:text-yellow-400",
                  item.type === 'info' && "text-blue-600 dark:text-blue-400"
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                  {item.phaseNumber && (
                    <Badge variant="outline" className="text-xs mt-1">
                      阶段 {item.phaseNumber}
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
          {attentionItems.length > 5 && (
            <p className="text-xs text-muted-foreground text-center pt-2">
              ...还有 {attentionItems.length - 5} 项
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
