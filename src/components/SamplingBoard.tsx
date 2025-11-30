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
  const getSamplesForStage = (stageId: string) => {
    return samples.filter(s => s.currentStage === stageId);
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
            <Card key={stage.id} className="p-4">
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
                    onClick={() => onSampleClick(sample)}
                    className={cn(
                      'p-3 rounded-lg border-l-4 bg-card hover:bg-accent cursor-pointer transition-colors',
                      lineColors[sample.line]
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-medium text-sm">{sample.sampleNumber}</div>
                      {sample.isDelayed && (
                        <AlertTriangle className="h-4 w-4 text-[hsl(var(--status-delayed))] flex-shrink-0" />
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(sample.targetDate).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                {stageSamples.length === 0 && (
                  <div className="text-xs text-muted-foreground text-center py-4">
                    No samples
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