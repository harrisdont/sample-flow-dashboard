import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Palette, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Collection, Sample, WorkloadMetrics } from '@/types/sample';
import { User } from '@/types/user';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { SampleStageCard } from '@/components/sampling/SampleStageCard';

interface DesignLeadDashboardPanelProps {
  currentUser: User;
  samples: Sample[];
  collections: Collection[];
  metrics: WorkloadMetrics;
  onSampleClick: (sample: Sample) => void;
  onCollectionClick: (collection: Collection) => void;
}

export const DesignLeadDashboardPanel = ({
  currentUser,
  samples,
  collections,
  metrics,
  onSampleClick,
  onCollectionClick,
}: DesignLeadDashboardPanelProps) => {
  const today = format(new Date(), 'yyyy-MM-dd');

  // Filter samples by designer name (matches the current user)
  const mySamples = samples.filter(s => s.designerName === currentUser.name);
  const myOverdue = mySamples.filter(s => s.stageDeadline < today && s.approvalStatus === 'pending');
  const myPending = mySamples.filter(s => s.approvalStatus === 'pending');
  const myApproved = mySamples.filter(s => s.approvalStatus === 'approved');

  // Filter collections relevant to assigned lines
  const myCollections = collections.filter(c => {
    if (!currentUser.assignedLines) return false;
    // Match collection slot (lineId) to assigned lines
    return currentUser.assignedLines.some(line => c.slot === line);
  });

  // Samples awaiting approval at design-relevant stages
  const awaitingMyApproval = samples.filter(
    s => s.approvalStatus === 'pending' && ['design', 'pattern', 'decoration-approval', 'motif-review'].includes(s.currentStage)
  );

  return (
    <div className="space-y-6">
      {/* Personal KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Palette className="h-4 w-4" />
            My Samples
          </div>
          <div className="text-3xl font-bold">{mySamples.length}</div>
          <p className="text-xs text-muted-foreground mt-1">{myApproved.length} approved</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Clock className="h-4 w-4" />
            Pending
          </div>
          <div className="text-3xl font-bold text-[hsl(var(--status-pending))]">{myPending.length}</div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <AlertTriangle className="h-4 w-4" />
            Overdue
          </div>
          <div className="text-3xl font-bold text-[hsl(var(--status-delayed))]">{myOverdue.length}</div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <CheckCircle className="h-4 w-4" />
            Awaiting Approval
          </div>
          <div className="text-3xl font-bold">{awaitingMyApproval.length}</div>
        </Card>
      </div>

      {/* My Collections */}
      {myCollections.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">My Collections ({currentUser.assignedLines?.map(l => l.charAt(0).toUpperCase() + l.slice(1)).join(', ')})</h3>
          <div className="space-y-3">
            {myCollections.map((collection, i) => (
              <div
                key={i}
                onClick={() => onCollectionClick(collection)}
                className="p-4 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer flex items-center justify-between"
              >
                <div>
                  <span className="font-medium">{collection.name}</span>
                  <Badge variant="outline" className="ml-2 text-xs">{collection.slot}</Badge>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>{collection.samplesCompleted}/{collection.totalSamples}</span>
                  <Badge
                    className={cn(
                      collection.delay ? 'bg-[hsl(var(--status-delayed))]' : 'bg-[hsl(var(--status-in-progress))]',
                      'text-background text-xs'
                    )}
                  >
                    {collection.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* My Overdue Samples */}
      {myOverdue.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-[hsl(var(--status-delayed))]">
            <AlertTriangle className="h-4 w-4" />
            Overdue Samples
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {myOverdue.map(sample => (
              <SampleStageCard key={sample.id} sample={sample} onClick={() => onSampleClick(sample)} />
            ))}
          </div>
        </Card>
      )}

      {/* Pipeline view */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">My Pipeline</h3>
        {mySamples.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {mySamples.map(sample => (
              <SampleStageCard key={sample.id} sample={sample} onClick={() => onSampleClick(sample)} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">No samples assigned to you yet.</p>
        )}
      </Card>
    </div>
  );
};
