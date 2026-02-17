import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { Collection, Sample, WorkloadMetrics } from '@/types/sample';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CapsuleCollection } from '@/data/capsuleCollectionData';

interface DirectorDashboardPanelProps {
  collections: Collection[];
  metrics: WorkloadMetrics;
  samples: Sample[];
  capsules: Record<string, CapsuleCollection>;
  onCollectionClick: (collection: Collection) => void;
}

type RAGStatus = 'green' | 'amber' | 'red';

const getRAGStatus = (collection: Collection, samples: Sample[]): RAGStatus => {
  const collSamples = samples.filter(s => s.collectionName === collection.name);
  if (collSamples.length === 0) return 'green';
  const today = format(new Date(), 'yyyy-MM-dd');
  const overdueCount = collSamples.filter(s => s.stageDeadline < today && s.approvalStatus === 'pending').length;
  const overdueRatio = overdueCount / collSamples.length;
  if (overdueRatio > 0.5) return 'red';
  if (overdueRatio > 0) return 'amber';
  return 'green';
};

const ragColors: Record<RAGStatus, string> = {
  green: 'bg-[hsl(var(--status-approved))]',
  amber: 'bg-[hsl(var(--status-pending))]',
  red: 'bg-[hsl(var(--status-delayed))]',
};

const ragLabels: Record<RAGStatus, string> = {
  green: 'On Track',
  amber: 'At Risk',
  red: 'Critical',
};

export const DirectorDashboardPanel = ({
  collections,
  metrics,
  samples,
  capsules,
  onCollectionClick,
}: DirectorDashboardPanelProps) => {
  const today = format(new Date(), 'yyyy-MM-dd');

  // Aggregate stats
  const totalCollections = collections.length;
  const completedCollections = collections.filter(c => c.status === 'Completed').length;
  const criticalCollections = collections.filter(c => getRAGStatus(c, samples) === 'red').length;
  const atRiskCollections = collections.filter(c => getRAGStatus(c, samples) === 'amber').length;

  // Stage distribution
  const stageDistribution = samples.reduce((acc, s) => {
    const dept = getDepartment(s.currentStage);
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Executive KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <TrendingUp className="h-4 w-4" />
            Season Progress
          </div>
          <div className="text-3xl font-bold">
            {totalCollections > 0 ? Math.round((completedCollections / totalCollections) * 100) : 0}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">{completedCollections}/{totalCollections} collections</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <AlertTriangle className="h-4 w-4 text-[hsl(var(--status-delayed))]" />
            Critical
          </div>
          <div className="text-3xl font-bold text-[hsl(var(--status-delayed))]">{criticalCollections}</div>
          <p className="text-xs text-muted-foreground mt-1">{atRiskCollections} at risk</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Clock className="h-4 w-4" />
            Overdue Samples
          </div>
          <div className="text-3xl font-bold">{metrics.overdue}</div>
          <p className="text-xs text-muted-foreground mt-1">of {metrics.totalSamples} total</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <CheckCircle className="h-4 w-4" />
            Bottleneck
          </div>
          <div className="text-sm font-medium mt-1">{metrics.bottleneckAlert || 'None'}</div>
        </Card>
      </div>

      {/* Department Pipeline */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Pipeline by Department</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Design', count: stageDistribution['design'] || 0 },
            { label: 'Production', count: stageDistribution['production'] || 0 },
            { label: 'Decoration', count: stageDistribution['decoration'] || 0 },
          ].map(dept => (
            <div key={dept.label} className="text-center">
              <div className="text-2xl font-bold">{dept.count}</div>
              <div className="text-sm text-muted-foreground">{dept.label}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* RAG Collection Status */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Collection RAG Status</h3>
        <div className="space-y-3">
          {collections.map((collection, i) => {
            const rag = getRAGStatus(collection, samples);
            const progress = collection.totalSamples > 0
              ? Math.round((collection.samplesCompleted / collection.totalSamples) * 100)
              : 0;
            return (
              <div
                key={i}
                onClick={() => onCollectionClick(collection)}
                className="p-4 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={cn('h-3 w-3 rounded-full', ragColors[rag])} />
                    <span className="font-medium">{collection.name}</span>
                    <Badge variant="outline" className="text-xs">{collection.slot}</Badge>
                  </div>
                  <Badge className={cn(ragColors[rag], 'text-background text-xs')}>
                    {ragLabels[rag]}
                  </Badge>
                </div>
                <div className="flex items-center gap-4">
                  <Progress value={progress} className="flex-1 h-2" />
                  <span className="text-xs text-muted-foreground w-16 text-right">
                    {collection.samplesCompleted}/{collection.totalSamples}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

function getDepartment(stage: string): string {
  if (['design', 'pattern'].includes(stage)) return 'design';
  if (['motif', 'motif-assignment', 'motif-in-progress', 'motif-review', 'multihead-punching', 'multihead', 'pinning', 'stencil-transfer', 'hand-embroidery', 'screen-print-execution', 'hand-block-printing', 'decoration-approval', 'screen-print', 'pakki', 'ari-dori', 'adda', 'cottage-work'].includes(stage)) return 'decoration';
  return 'production';
}
