import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertOctagon, 
  AlertTriangle, 
  ArrowLeftRight, 
  ArrowRight,
  CheckCircle2, 
  Clock,
  GitBranch,
  Lightbulb,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Users,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  BottleneckReport, 
  RedistributionSuggestion, 
  StageAnalysis,
  getSeverityColor,
  getSeverityBgColor,
} from '@/lib/bottleneckDetector';

interface BottleneckAnalysisPanelProps {
  report: BottleneckReport;
  onSuggestionAction?: (suggestion: RedistributionSuggestion) => void;
  compact?: boolean;
}

function SuggestionIcon({ type }: { type: RedistributionSuggestion['type'] }) {
  switch (type) {
    case 'redistribute':
      return <ArrowLeftRight className="h-4 w-4" />;
    case 'parallelize':
      return <GitBranch className="h-4 w-4" />;
    case 'prioritize':
      return <AlertTriangle className="h-4 w-4" />;
    case 'add-capacity':
      return <UserPlus className="h-4 w-4" />;
    case 'cross-train':
      return <Users className="h-4 w-4" />;
  }
}

function HealthIndicator({ severity }: { severity: 'critical' | 'warning' | 'healthy' }) {
  return (
    <div className={cn(
      'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium',
      getSeverityBgColor(severity),
      getSeverityColor(severity)
    )}>
      {severity === 'critical' && <AlertOctagon className="h-4 w-4" />}
      {severity === 'warning' && <AlertTriangle className="h-4 w-4" />}
      {severity === 'healthy' && <CheckCircle2 className="h-4 w-4" />}
      {severity === 'critical' && 'Critical Bottlenecks'}
      {severity === 'warning' && 'Bottlenecks Detected'}
      {severity === 'healthy' && 'All Stages Healthy'}
    </div>
  );
}

function StageHealthBar({ stage }: { stage: StageAnalysis }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{stage.stageName}</span>
        <div className="flex items-center gap-2">
          <span className={cn('text-xs', getSeverityColor(stage.severity))}>
            {stage.utilization}%
          </span>
          {stage.upstreamPressure > stage.totalCapacity && (
            <TrendingUp className="h-3 w-3 text-[hsl(var(--status-delayed))]" />
          )}
        </div>
      </div>
      <Progress 
        value={stage.utilization} 
        className={cn(
          'h-2',
          stage.severity === 'critical' && '[&>div]:bg-destructive',
          stage.severity === 'warning' && '[&>div]:bg-[hsl(var(--status-delayed))]',
        )}
      />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{stage.queueSize} in queue</span>
        <span>{stage.operatorCount} operators ({stage.totalCapacity}/day)</span>
      </div>
    </div>
  );
}

function SuggestionCard({ 
  suggestion, 
  onAction 
}: { 
  suggestion: RedistributionSuggestion; 
  onAction?: () => void;
}) {
  return (
    <Card className={cn(
      'transition-colors',
      suggestion.severity === 'critical' && 'border-destructive/50',
      suggestion.severity === 'warning' && 'border-[hsl(var(--status-delayed))]/50',
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
            getSeverityBgColor(suggestion.severity),
            getSeverityColor(suggestion.severity)
          )}>
            <SuggestionIcon type={suggestion.type} />
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-medium text-sm">{suggestion.title}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {suggestion.description}
                </p>
              </div>
              <Badge 
                variant="outline" 
                className={cn(
                  'shrink-0 text-xs',
                  suggestion.priority >= 8 && 'border-destructive text-destructive',
                  suggestion.priority >= 5 && suggestion.priority < 8 && 'border-[hsl(var(--status-delayed))] text-[hsl(var(--status-delayed))]',
                )}
              >
                P{suggestion.priority}
              </Badge>
            </div>
            
            {suggestion.fromStage && suggestion.toStage && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary" className="text-xs">
                  {suggestion.fromStage}
                </Badge>
                <ArrowRight className="h-3 w-3" />
                <Badge variant="secondary" className="text-xs">
                  {suggestion.toStage}
                </Badge>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{suggestion.samplesAffected} samples</span>
                <span className="text-[hsl(var(--status-completed))]">
                  {suggestion.estimatedImpact}
                </span>
              </div>
              {suggestion.actionable && onAction && (
                <Button size="sm" variant="outline" onClick={onAction}>
                  Apply
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function BottleneckAnalysisPanel({ 
  report, 
  onSuggestionAction,
  compact = false,
}: BottleneckAnalysisPanelProps) {
  const topSuggestions = useMemo(() => 
    report.suggestions.slice(0, compact ? 3 : 5),
    [report.suggestions, compact]
  );

  if (compact) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Bottleneck Analysis
            </CardTitle>
            <HealthIndicator severity={report.overallHealth} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {report.bottlenecks.length > 0 ? (
            <>
              <div className="space-y-3">
                {report.bottlenecks.map(bottleneck => (
                  <div 
                    key={bottleneck.stageId}
                    className={cn(
                      'flex items-center justify-between p-2 rounded-lg',
                      getSeverityBgColor(bottleneck.severity)
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <AlertOctagon className={cn('h-4 w-4', getSeverityColor(bottleneck.severity))} />
                      <span className="font-medium text-sm">{bottleneck.stageName}</span>
                    </div>
                    <div className="text-right text-xs">
                      <span className={getSeverityColor(bottleneck.severity)}>
                        {bottleneck.utilization}% used
                      </span>
                      <p className="text-muted-foreground">{bottleneck.estimatedClearDays}d to clear</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {topSuggestions.length > 0 && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                    <Lightbulb className="h-3 w-3" />
                    Top suggestion
                  </p>
                  <p className="text-sm">{topSuggestions[0].title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {topSuggestions[0].estimatedImpact}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-4">
              <CheckCircle2 className="h-8 w-8 mx-auto text-[hsl(var(--status-completed))] mb-2" />
              <p className="text-sm font-medium">No bottlenecks detected</p>
              <p className="text-xs text-muted-foreground">All stages operating within capacity</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Bottleneck Analysis
              </CardTitle>
              <CardDescription>
                Real-time production floor analysis with redistribution suggestions
              </CardDescription>
            </div>
            <HealthIndicator severity={report.overallHealth} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">{report.bottlenecks.length}</p>
              <p className="text-xs text-muted-foreground">Active Bottlenecks</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">{report.projectedClearTime}d</p>
              <p className="text-xs text-muted-foreground">Pipeline Clear Time</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">{report.suggestions.length}</p>
              <p className="text-xs text-muted-foreground">Suggestions</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stage Health Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Stage Health</CardTitle>
            <CardDescription>Utilization and queue depth per stage</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
                {report.stages.map(stage => (
                  <StageHealthBar key={stage.stageId} stage={stage} />
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Redistribution Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Redistribution Suggestions
            </CardTitle>
            <CardDescription>
              AI-generated recommendations to optimize throughput
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-3">
                {topSuggestions.length > 0 ? (
                  topSuggestions.map(suggestion => (
                    <SuggestionCard 
                      key={suggestion.id} 
                      suggestion={suggestion}
                      onAction={onSuggestionAction ? () => onSuggestionAction(suggestion) : undefined}
                    />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle2 className="h-8 w-8 mx-auto text-[hsl(var(--status-completed))] mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No redistribution needed - all stages balanced
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Critical Path Alert */}
      {report.criticalPathStages.length > 0 && (
        <Card className="border-[hsl(var(--status-delayed))]/50 bg-[hsl(var(--status-delayed))]/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-[hsl(var(--status-delayed))]" />
              <div>
                <p className="font-medium">Critical Path Stages</p>
                <p className="text-sm text-muted-foreground">
                  These stages determine overall pipeline speed: {' '}
                  {report.criticalPathStages.map((stage, i) => (
                    <Badge key={stage} variant="secondary" className="mr-1">
                      {stage}
                    </Badge>
                  ))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
