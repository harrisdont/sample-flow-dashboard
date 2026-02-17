import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, AlertTriangle, Layers } from 'lucide-react';
import { Sample, WorkloadMetrics, ProcessStage } from '@/types/sample';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { SampleStageCard } from '@/components/sampling/SampleStageCard';

interface SamplingDashboardPanelProps {
  samples: Sample[];
  metrics: WorkloadMetrics;
  onSampleClick: (sample: Sample) => void;
}

const FLOOR_STAGES: { id: ProcessStage; label: string; skill: string }[] = [
  { id: 'pattern', label: 'Pattern Making', skill: 'Pattern Maker' },
  { id: 'semi-stitching', label: 'Semi Stitching', skill: 'Stitcher' },
  { id: 'complete-stitching', label: 'Complete Stitching', skill: 'Master Tailor' },
  { id: 'pakki', label: 'Pakki', skill: 'Pakki Operator' },
  { id: 'ari-dori', label: 'Ari/Dori', skill: 'Ari/Dori Operator' },
  { id: 'cottage-work', label: 'Cottage Work', skill: 'Cottage Worker' },
  { id: 'hand-finishes', label: 'Hand Finishes', skill: 'Finisher' },
  { id: 'multihead', label: 'Multihead', skill: 'Machine Operator' },
];

export const SamplingDashboardPanel = ({
  samples,
  metrics,
  onSampleClick,
}: SamplingDashboardPanelProps) => {
  const today = format(new Date(), 'yyyy-MM-dd');

  // Samples on the sampling floor (exclude design stage)
  const floorSamples = samples.filter(s =>
    FLOOR_STAGES.some(fs => fs.id === s.currentStage)
  );
  const floorOverdue = floorSamples.filter(s => s.stageDeadline < today && s.approvalStatus === 'pending');
  const pendingApproval = samples.filter(s => s.currentStage === 'approval' && s.approvalStatus === 'pending');

  // Queue per stage
  const stageQueues = FLOOR_STAGES.map(stage => ({
    ...stage,
    samples: samples.filter(s => s.currentStage === stage.id),
    overdue: samples.filter(s => s.currentStage === stage.id && s.stageDeadline < today && s.approvalStatus === 'pending'),
  })).filter(sq => sq.samples.length > 0);

  return (
    <div className="space-y-6">
      {/* Floor KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Layers className="h-4 w-4" />
            On Floor
          </div>
          <div className="text-3xl font-bold">{floorSamples.length}</div>
          <p className="text-xs text-muted-foreground mt-1">of {metrics.totalSamples} total</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <AlertTriangle className="h-4 w-4" />
            Floor Overdue
          </div>
          <div className="text-3xl font-bold text-[hsl(var(--status-delayed))]">{floorOverdue.length}</div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Clock className="h-4 w-4" />
            Pending Approval
          </div>
          <div className="text-3xl font-bold text-[hsl(var(--status-pending))]">{pendingApproval.length}</div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Users className="h-4 w-4" />
            Active Stages
          </div>
          <div className="text-3xl font-bold">{stageQueues.length}</div>
        </Card>
      </div>

      {/* Stage-by-Stage Queue */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Stage Queues</h3>
        <div className="space-y-4">
          {stageQueues.map(sq => (
            <div key={sq.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h4 className="font-medium">{sq.label}</h4>
                  <Badge variant="secondary" className="text-xs">{sq.skill}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{sq.samples.length} samples</Badge>
                  {sq.overdue.length > 0 && (
                    <Badge className="bg-[hsl(var(--status-delayed))] text-background text-xs">
                      {sq.overdue.length} overdue
                    </Badge>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {sq.samples.map(sample => (
                  <SampleStageCard key={sample.id} sample={sample} onClick={() => onSampleClick(sample)} />
                ))}
              </div>
            </div>
          ))}
          {stageQueues.length === 0 && (
            <p className="text-muted-foreground text-center py-8">No samples on the sampling floor currently.</p>
          )}
        </div>
      </Card>
    </div>
  );
};
