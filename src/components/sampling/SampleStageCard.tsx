import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sample, ProcessStage } from '@/types/sample';
import { cn } from '@/lib/utils';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { getDateStatus, formatShortDate, getDaysRemaining } from '@/lib/leadTimeCalculator';
import { isDecorationStage, getTechniqueLabel, getFullProductionPath } from '@/lib/embroideryWorkflow';

// Labels for all stages
const STAGE_LABELS: Record<ProcessStage, string> = {
  'design': 'Design',
  'pattern': 'Pattern',
  'motif': 'Motif Dev',
  'punching': 'Punching',
  'semi-stitching': 'Semi Stitching',
  'complete-stitching': 'Complete Stitching',
  'screen-print': 'Screen Print',
  'multihead': 'Multihead',
  'pakki': 'Pakki',
  'ari-dori': 'Ari/Dori',
  'adda': 'Adda',
  'cottage-work': 'Cottage Work',
  'hand-finishes': 'Hand Finishes',
  'approval': 'Approval',
  'motif-assignment': 'Motif Assignment',
  'motif-in-progress': 'Motif In Progress',
  'motif-review': 'Motif Review',
  'multihead-punching': 'Multihead Punching',
  'pinning': 'Pinning',
  'stencil-transfer': 'Stencil Transfer',
  'hand-embroidery': 'Hand Embroidery',
  'screen-print-execution': 'Screen Print Exec',
  'hand-block-printing': 'Hand Block Print',
  'decoration-approval': 'Decoration Approval',
};

interface SampleStageCardProps {
  sample: Sample;
  compact?: boolean;
  onClick?: () => void;
}

export const SampleStageCard = ({ sample, compact = false, onClick }: SampleStageCardProps) => {
  const dateStatus = getDateStatus(sample.stageDeadline);
  const daysRemaining = getDaysRemaining(sample.stageDeadline);
  
  // Calculate progress through the full routing path
  const fullPath = getFullProductionPath(sample.decorationTechnique);
  const currentIndex = fullPath.indexOf(sample.currentStage);
  const progressPercent = fullPath.length > 0 
    ? Math.round(((currentIndex + 1) / fullPath.length) * 100) 
    : 0;

  const statusColor = dateStatus === 'overdue' 
    ? 'text-destructive' 
    : dateStatus === 'due-today' || dateStatus === 'due-soon'
      ? 'text-[hsl(var(--status-delayed))]'
      : 'text-[hsl(var(--status-approved))]';

  const statusBg = dateStatus === 'overdue'
    ? 'bg-destructive/10 border-destructive/30'
    : dateStatus === 'due-today' || dateStatus === 'due-soon'
      ? 'bg-[hsl(var(--status-delayed))]/10 border-[hsl(var(--status-delayed))]/30'
      : 'bg-[hsl(var(--status-approved))]/10 border-[hsl(var(--status-approved))]/30';

  if (compact) {
    return (
      <div
        className={cn(
          'p-3 rounded-lg border cursor-pointer hover:shadow-sm transition-shadow',
          dateStatus === 'overdue' && 'border-destructive/50 bg-destructive/5'
        )}
        onClick={onClick}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{sample.sampleNumber}</p>
            <p className="text-xs text-muted-foreground truncate">{sample.collectionName}</p>
          </div>
          <Badge variant="outline" className={cn('text-xs shrink-0', statusColor)}>
            {daysRemaining < 0 ? `${Math.abs(daysRemaining)}d late` : daysRemaining === 0 ? 'Today' : `${daysRemaining}d`}
          </Badge>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">{STAGE_LABELS[sample.currentStage]}</Badge>
          {sample.decorationTechnique && (
            <Badge variant="outline" className="text-xs">{getTechniqueLabel(sample.decorationTechnique)}</Badge>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card
      className={cn(
        'p-4 cursor-pointer hover:shadow-md transition-shadow',
        dateStatus === 'overdue' && 'border-destructive/50'
      )}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm">{sample.sampleNumber}</h4>
            {sample.decorationTechnique && (
              <Badge variant="outline" className="text-xs">
                {getTechniqueLabel(sample.decorationTechnique)}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{sample.collectionName}</p>
        </div>
        <div className={cn('px-2 py-1 rounded-md border text-xs font-medium', statusBg, statusColor)}>
          {daysRemaining < 0 
            ? `${Math.abs(daysRemaining)}d overdue` 
            : daysRemaining === 0 
              ? 'Due today'
              : `${daysRemaining}d left`
          }
        </div>
      </div>

      {/* Current Stage - prominent */}
      <div className="mt-3 p-2.5 rounded-md bg-muted/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Current Stage</p>
            <p className="font-bold text-sm">{STAGE_LABELS[sample.currentStage]}</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* Dates row */}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          <div>
            <p className="text-[10px] text-muted-foreground">Entered</p>
            <p className="text-xs font-medium">{formatShortDate(sample.stageEntryDate)}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className={cn('h-3.5 w-3.5', statusColor)} />
          <div>
            <p className="text-[10px] text-muted-foreground">Deadline</p>
            <p className={cn('text-xs font-medium', statusColor)}>
              {formatShortDate(sample.stageDeadline)}
            </p>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
          <span>Progress</span>
          <span>{currentIndex + 1}/{fullPath.length} stages</span>
        </div>
        <Progress value={progressPercent} className="h-1.5" />
      </div>
    </Card>
  );
};
