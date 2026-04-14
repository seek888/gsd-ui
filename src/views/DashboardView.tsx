import { useEffect } from 'react';
import { FolderOpen, RefreshCw, AlertCircle } from 'lucide-react';
import { useProgressStore } from '@/stores/progressStore';
import { useProjectStore } from '@/stores/projectStore';
import { PhaseCard } from '@/components/progress/PhaseCard';
import { DirectoryPicker } from '@/components/DirectoryPicker';
import { cn } from '@/lib/utils';

export function DashboardView() {
  const { projectPath } = useProjectStore();
  const {
    roadmapData,
    loadingState,
    error,
    expandedPhases,
    loadProgressData,
    refreshData,
    togglePhaseExpansion,
    clearError,
  } = useProgressStore();

  // 加载进度数据
  useEffect(() => {
    if (projectPath) {
      loadProgressData(projectPath);
    }
  }, [projectPath, loadProgressData]);

  // 未选择项目路径时显示目录选择器
  if (!projectPath) {
    return <DirectoryPicker />;
  }

  // 加载中状态
  if (loadingState === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" />
        <p className="text-muted-foreground">正在加载进度数据...</p>
      </div>
    );
  }

  // 错误状态
  if (error && loadingState === 'error') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-lg font-semibold mb-2">加载失败</h2>
        <p className="text-muted-foreground text-center mb-4 max-w-md">{error}</p>
        <div className="flex gap-2">
          <button
            onClick={() => projectPath && loadProgressData(projectPath)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            重试
          </button>
          <button
            onClick={clearError}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    );
  }

  // 无数据状态
  if (!roadmapData || roadmapData.phases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-semibold mb-2">暂无项目进度数据</h2>
        <p className="text-muted-foreground text-center max-w-md">
          请确保在有效的 GSD 项目目录中，并检查 .planning/ROADMAP.md 文件是否存在。
        </p>
      </div>
    );
  }

  // 主内容：阶段列表
  return (
    <div className="h-full flex flex-col">
      {/* 头部：标题 + 刷新按钮 */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">项目进度</h1>
          <p className="text-sm text-muted-foreground mt-1">
            共 {roadmapData.totalPhases} 个阶段，
            {roadmapData.completedPlans}/{roadmapData.totalPlans} 个计划已完成
          </p>
        </div>
        <button
          onClick={() => refreshData(projectPath)}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
          disabled={loadingState === 'loading'}
        >
          <RefreshCw className={cn("h-4 w-4", loadingState === 'loading' && "animate-spin")} />
          刷新
        </button>
      </div>

      {/* 阶段卡片列表 */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {roadmapData.phases.map((phase) => (
            <PhaseCard
              key={phase.number}
              phase={phase}
              isExpanded={expandedPhases.has(phase.number)}
              onToggle={() => togglePhaseExpansion(phase.number)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
