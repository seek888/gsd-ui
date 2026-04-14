import { Clock, AlertTriangle, Lightbulb, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { SessionState } from '@/types/progress';
import { cn } from '@/lib/utils';

interface SessionContextProps {
  sessionState: SessionState | null;
}

export function SessionContext({ sessionState }: SessionContextProps) {
  if (!sessionState) {
    return (
      <Card className="border-muted">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground text-center">
            暂无会话数据
          </p>
        </CardContent>
      </Card>
    );
  }

  const { currentPhase, currentPlan, lastActivity, blockers, decisions } = sessionState;

  return (
    <Card className="border-muted bg-muted/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="h-4 w-4" />
          当前会话
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 最近位置 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="font-medium">最近位置：</span>
          </div>
          <div className="pl-6 text-sm space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">阶段：</span>
              <Badge variant="secondary">{currentPhase}</Badge>
              {currentPlan && (
                <>
                  <span className="text-muted-foreground">·</span>
                  <span>计划 {currentPlan}</span>
                </>
              )}
            </div>
            {lastActivity && (
              <p className="text-muted-foreground">{lastActivity}</p>
            )}
          </div>
        </div>

        <Separator />

        {/* 阻塞项 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <AlertTriangle className={cn(
              "h-4 w-4 shrink-0",
              blockers.length > 0 ? "text-destructive" : "text-muted-foreground"
            )} />
            <span className="font-medium">阻塞项：</span>
            {blockers.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                {blockers.length}
              </Badge>
            )}
          </div>
          <div className="pl-6 text-sm">
            {blockers.length === 0 ? (
              <p className="text-muted-foreground">无阻塞项</p>
            ) : (
              <ul className="space-y-1">
                {blockers.map((blocker) => (
                  <li
                    key={blocker.id}
                    className={cn(
                      "flex items-start gap-2",
                      blocker.severity === 'high' && "text-destructive",
                      blocker.severity === 'medium' && "text-yellow-600 dark:text-yellow-400"
                    )}
                  >
                    <span className="shrink-0">•</span>
                    <span>{blocker.description}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* 关键决策（可选显示，如果有空间） */}
        {decisions.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Lightbulb className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="font-medium">关键决策：</span>
                <Badge variant="outline" className="text-xs">
                  {decisions.length}
                </Badge>
              </div>
              <div className="pl-6 text-sm">
                <ul className="space-y-1">
                  {decisions.slice(0, 3).map((decision) => (
                    <li key={decision.id} className="text-muted-foreground">
                      • {decision.description}
                    </li>
                  ))}
                  {decisions.length > 3 && (
                    <li className="text-muted-foreground text-xs">
                      ...还有 {decisions.length - 3} 项决策
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
