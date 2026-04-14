import { Check, Circle, FileText, FileCheck } from 'lucide-react';
import type { Plan } from '@/types/progress';
import { cn } from '@/lib/utils';

interface PlanItemProps {
  plan: Plan;
}

export function PlanItem({ plan }: PlanItemProps) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* 计划 ID */}
        <span className="text-xs font-mono text-muted-foreground shrink-0">
          {plan.id}
        </span>

        {/* 计划名称 */}
        <span className="text-sm truncate">{plan.name}</span>
      </div>

      {/* 完成指标 */}
      <div className="flex items-center gap-3 shrink-0">
        {/* PLAN.md 指标 */}
        <div className="flex items-center gap-1" title={plan.hasPlanMd ? 'PLAN.md 存在' : 'PLAN.md 不存在'}>
          {plan.hasPlanMd ? (
            <FileText className="h-4 w-4 text-green-600" />
          ) : (
            <Circle className="h-4 w-4 text-gray-300" />
          )}
        </div>

        {/* SUMMARY.md 指标 */}
        <div className="flex items-center gap-1" title={plan.hasSummaryMd ? 'SUMMARY.md 存在' : 'SUMMARY.md 不存在'}>
          {plan.hasSummaryMd ? (
            <FileCheck className="h-4 w-4 text-green-600" />
          ) : (
            <Circle className="h-4 w-4 text-gray-300" />
          )}
        </div>

        {/* 状态文字 */}
        <span className={cn(
          "text-xs font-medium px-2 py-0.5 rounded-full",
          plan.status === 'complete' && "bg-green-100 text-green-700",
          plan.status === 'in-progress' && "bg-yellow-100 text-yellow-700",
          plan.status === 'not-started' && "bg-gray-100 text-gray-700"
        )}>
          {plan.status === 'complete' && '已完成'}
          {plan.status === 'in-progress' && '进行中'}
          {plan.status === 'not-started' && '未开始'}
        </span>
      </div>
    </div>
  );
}
