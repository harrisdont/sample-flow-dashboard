import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sample, ProcessStage } from '@/types/sample';
import { cn } from '@/lib/utils';
import { AlertTriangle, Calendar, Clock } from 'lucide-react';
import { 
  getDateStatus, 
  formatShortDate,
  getDaysRemaining 
} from '@/lib/leadTimeCalculator';
import { DECORATION_STAGE_LABELS, isDecorationStage } from '@/lib/embroideryWorkflow';

const lineColors: Record<string, string> = {
  woman: 'border-l-[hsl(var(--line-woman))]',
  cottage: 'border-l-[hsl(var(--line-cottage))]',
  formals: 'border-l-[hsl(var(--line-formals))]',
  classic: 'border-l-[hsl(var(--line-classic))]',
  ming: 'border-l-[hsl(var(--line-ming))]',
};

// Production stages
const productionStages: { id: ProcessStage; label: string }[] = [
  { id: 'design', label: 'Design' },
  { id: 'pattern', label: 'Pattern' },
  { id: 'semi-stitching', label: 'Semi Stitch' },
  { id: 'complete-stitching', label: 'Complete Stitch' },
  { id: 'pakki', label: 'Pakki' },
  { id: 'ari-dori', label: 'Ari/Dori' },
  { id: 'adda', label: 'Adda' },
  { id: 'cottage-work', label: 'Cottage' },
  { id: 'hand-finishes', label: 'Hand Finish' },
];

// Decoration stages
const decorationStages: { id: ProcessStage; label: string }[] = [
  { id: 'motif-assignment', label: 'Motif Assign' },
  { id: 'motif-in-progress', label: 'Motif WIP' },
  { id: 'motif-review', label: 'Motif Review' },
  { id: 'multihead-punching', label: 'MH Punching' },
  { id: 'multihead', label: 'Multihead' },
  { id: 'pinning', label: 'Pinning' },
  { id: 'stencil-transfer', label: 'Stencil' },
  { id: 'hand-embroidery', label: 'Hand Emb.' },
  { id: 'screen-print-execution', label: 'Screen Print' },
  { id: 'hand-block-printing', label: 'Block Print' },
  { id: 'decoration-approval', label: 'Decor Approval' },
];

const allStages = [...productionStages, ...decorationStages];
const allStageIds = allStages.map(s => s.id);

const getStatusColor = (status: ReturnType<typeof getDateStatus>) => {
  switch (status) {
    case 'overdue': return 'text-destructive';
    case 'due-today': return 'text-[hsl(var(--status-pending))]';
    case 'due-soon': return 'text-[hsl(var(--status-pending))]';
    default: return 'text-muted-foreground';
  }
};

interface SamplingBoardProps {
  samples: Sample[];
  onSampleClick: (sample: Sample) => void;
}

export const SamplingBoard = ({ samples, onSampleClick }: SamplingBoardProps) => {
  const [draggedSample, setDraggedSample] = useState<Sample | null>(null);

  const getSamplesForStage = (stageId: string) => {
    return samples.filter(s => s.currentStage === stageId);
  };

  const handleDragStart = (sample: Sample) => {
    setDraggedSample(sample);
  };

  const handleDragEnd = () => {
    setDraggedSample(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (stageId: string) => {
    if (draggedSample) {
      console.log(`Moved ${draggedSample.sampleNumber} to ${stageId}`);
    }
  };

  const renderStageSection = (
    title: string,
    stages: { id: ProcessStage; label: string }[]
  ) => {
    const stagesWithSamples = stages.filter(s => getSamplesForStage(s.id).length > 0);
    const emptyStages = stages.filter(s => getSamplesForStage(s.id).length === 0);

    return (
      <div>
        <h2 className="text-lg font-semibold mb-3 text-muted-foreground">{title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
          {stages.map((stage) => {
            const stageSamples = getSamplesForStage(stage.id);
            return (
              <Card
                key={stage.id}
                className="p-4"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(stage.id)}
              >
                <div className="mb-3">
                  <h3 className="font-semibold text-sm">{stage.label}</h3>
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {stageSamples.length}
                  </Badge>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {stageSamples.map((sample) => {
                    const dateStatus = getDateStatus(sample.stageDeadline);
                    const daysRemaining = getDaysRemaining(sample.stageDeadline);
                    const entryDays = getDaysRemaining(sample.stageEntryDate);
                    const daysInStage = Math.abs(entryDays);
                    
                    return (
                      <div
                        key={sample.id}
                        draggable
                        onDragStart={() => handleDragStart(sample)}
                        onDragEnd={handleDragEnd}
                        onClick={() => onSampleClick(sample)}
                        className={cn(
                          'relative p-3 rounded-lg border-2 cursor-move transition-all',
                          'hover:scale-105 hover:shadow-lg',
                          'flex flex-col items-center justify-center text-center',
                          'min-h-[120px]',
                          draggedSample?.id === sample.id && 'opacity-50',
                        )}
                        style={{
                          background: `hsl(var(--line-${sample.line}) / 0.2)`,
                          borderColor: `hsl(var(--line-${sample.line}))`,
                        }}
                      >
                        <div className="absolute top-1 right-1">
                          {(sample.isDelayed || dateStatus === 'overdue') && (
                            <AlertTriangle className="h-3 w-3 text-destructive" />
                          )}
                        </div>
                        <div className="font-bold text-base">{sample.sampleNumber}</div>
                        
                        {/* Entry date */}
                        <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-0.5">
                          <Calendar className="h-2.5 w-2.5" />
                          In: {formatShortDate(sample.stageEntryDate)}
                          <span className="text-muted-foreground/60">({daysInStage}d ago)</span>
                        </div>
                        
                        {/* Deadline */}
                        <div className={cn('text-xs mt-0.5 flex items-center gap-0.5 font-medium', getStatusColor(dateStatus))}>
                          <Clock className="h-2.5 w-2.5" />
                          {formatShortDate(sample.stageDeadline)}
                        </div>
                        
                        {/* Days remaining */}
                        <div className={cn('text-[10px] mt-0.5 font-medium', getStatusColor(dateStatus))}>
                          {daysRemaining < 0 
                            ? `${Math.abs(daysRemaining)}d overdue`
                            : daysRemaining === 0 
                              ? 'Due today'
                              : `${daysRemaining}d left`
                          }
                        </div>
                        
                        {/* Technique badge */}
                        {sample.decorationTechnique && (
                          <div className="text-[9px] text-muted-foreground/70 mt-0.5 capitalize">
                            {sample.decorationTechnique.replace('-', ' ')}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {stageSamples.length === 0 && (
                    <div className="text-xs text-muted-foreground text-center py-8 border-2 border-dashed border-border rounded-lg">
                      Drop here
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Sampling Heat Map</h1>
        <p className="text-muted-foreground">Real-time visual tracking of all samples across production &amp; decoration stages</p>
      </div>

      <div className="mb-6 grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="flex items-center gap-2">
          <div className="h-3 w-8 rounded bg-[hsl(var(--line-woman))]" />
          <span className="text-sm">Woman</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-8 rounded bg-[hsl(var(--line-cottage))]" />
          <span className="text-sm">Cottage</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-8 rounded bg-[hsl(var(--line-formals))]" />
          <span className="text-sm">Formals</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-8 rounded bg-[hsl(var(--line-classic))]" />
          <span className="text-sm">Classic</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-8 rounded bg-[hsl(var(--line-ming))]" />
          <span className="text-sm">Ming</span>
        </div>
      </div>

      {renderStageSection('Production Stages', productionStages)}
      {renderStageSection('Decoration Processes', decorationStages)}

      <Card className="mt-6 p-6">
        <h3 className="font-semibold mb-4">Weekly Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-2xl font-bold text-[hsl(var(--status-approved))]">12</div>
            <div className="text-sm text-muted-foreground">Approved</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[hsl(var(--status-delayed))]">3</div>
            <div className="text-sm text-muted-foreground">Rejected</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[hsl(var(--status-pending))]">5</div>
            <div className="text-sm text-muted-foreground">On Redo</div>
          </div>
          <div>
            <div className="text-2xl font-bold">8</div>
            <div className="text-sm text-muted-foreground">Pending Approval</div>
          </div>
        </div>
      </Card>
    </div>
  );
};
