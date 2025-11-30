import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sample } from '@/types/sample';
import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';

const lineColors: Record<string, string> = {
  woman: 'border-l-[hsl(var(--line-woman))]',
  cottage: 'border-l-[hsl(var(--line-cottage))]',
  formals: 'border-l-[hsl(var(--line-formals))]',
  classic: 'border-l-[hsl(var(--line-classic))]',
  ming: 'border-l-[hsl(var(--line-ming))]',
};

const stages = [
  { id: 'design', label: 'Design' },
  { id: 'pattern', label: 'Pattern' },
  { id: 'motif', label: 'Motif Dev' },
  { id: 'punching', label: 'Punching' },
  { id: 'semi-stitching', label: 'Semi Stitch' },
  { id: 'complete-stitching', label: 'Complete Stitch' },
  { id: 'screen-print', label: 'Screen Print' },
  { id: 'multihead', label: 'Multihead' },
  { id: 'pakki', label: 'Pakki' },
  { id: 'ari-dori', label: 'Ari/Dori' },
  { id: 'adda', label: 'Adda' },
  { id: 'cottage-work', label: 'Cottage' },
  { id: 'hand-finishes', label: 'Hand Finish' },
];

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
      // In a real app, this would update the backend
      console.log(`Moved ${draggedSample.sampleNumber} to ${stageId}`);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Sampling Heat Map</h1>
        <p className="text-muted-foreground">Real-time visual tracking of all samples</p>
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

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
                {stageSamples.map((sample) => (
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
                      'min-h-[80px]',
                      draggedSample?.id === sample.id && 'opacity-50',
                      lineColors[sample.line].replace('border-l-', 'bg-')
                    )}
                    style={{
                      background: `hsl(var(--line-${sample.line}) / 0.2)`,
                      borderColor: `hsl(var(--line-${sample.line}))`,
                    }}
                  >
                    <div className="absolute top-1 right-1">
                      {sample.isDelayed && (
                        <AlertTriangle className="h-3 w-3 text-[hsl(var(--status-delayed))]" />
                      )}
                    </div>
                    <div className="font-bold text-base">{sample.sampleNumber}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(sample.targetDate).toLocaleDateString()}
                    </div>
                  </div>
                ))}
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