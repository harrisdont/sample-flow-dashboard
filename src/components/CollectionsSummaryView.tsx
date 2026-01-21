import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useCapsuleStore, CapsuleCollection } from '@/data/capsuleCollectionData';
import { calculateBackwardsSchedule, getMilestoneStatus } from '@/lib/schedulingEngine';
import { format, differenceInDays } from 'date-fns';
import { CheckCircle2, Clock, AlertTriangle, Layers, Calendar, Scissors, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollectionWithStatus extends CapsuleCollection {
  totalDesigns: number;
  fabricStatus: 'not-started' | 'in-progress' | 'completed';
  samplingStatus: 'not-started' | 'in-progress' | 'completed';
  productionStatus: 'not-started' | 'in-progress' | 'completed';
  daysUntilInStore: number;
}

const LINE_COLORS: Record<string, string> = {
  cottage: 'bg-fashion-cottage',
  classic: 'bg-fashion-classic',
  formals: 'bg-fashion-formals',
  woman: 'bg-fashion-woman',
  ming: 'bg-fashion-ming',
  basic: 'bg-sky-500',
  'semi-bridals': 'bg-rose-400',
  leather: 'bg-amber-600',
  regen: 'bg-emerald-600',
};

const getStatusBadge = (status: 'not-started' | 'in-progress' | 'completed') => {
  switch (status) {
    case 'completed':
      return (
        <Badge className="bg-[hsl(var(--status-in-progress))] text-background gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Done
        </Badge>
      );
    case 'in-progress':
      return (
        <Badge className="bg-[hsl(var(--status-pending))] text-background gap-1">
          <Clock className="h-3 w-3" />
          In Progress
        </Badge>
      );
    case 'not-started':
    default:
      return (
        <Badge variant="outline" className="gap-1 text-muted-foreground">
          <Clock className="h-3 w-3" />
          Not Started
        </Badge>
      );
  }
};

const getTimelineBadge = (daysUntilInStore: number) => {
  if (daysUntilInStore < 0) {
    return (
      <Badge className="bg-[hsl(var(--status-delayed))] text-background gap-1">
        <AlertTriangle className="h-3 w-3" />
        {Math.abs(daysUntilInStore)}d Overdue
      </Badge>
    );
  } else if (daysUntilInStore <= 14) {
    return (
      <Badge className="bg-[hsl(var(--status-pending))] text-background gap-1">
        <AlertTriangle className="h-3 w-3" />
        {daysUntilInStore}d Left
      </Badge>
    );
  } else if (daysUntilInStore <= 30) {
    return (
      <Badge variant="outline" className="gap-1">
        <Clock className="h-3 w-3" />
        {daysUntilInStore}d Left
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="gap-1">
      <Calendar className="h-3 w-3" />
      {daysUntilInStore}d
    </Badge>
  );
};

export const CollectionsSummaryView = () => {
  const { capsules } = useCapsuleStore();

  const collectionsWithStatus = useMemo(() => {
    const today = new Date();
    
    return Object.values(capsules)
      .map((collection): CollectionWithStatus => {
        const schedule = calculateBackwardsSchedule(
          new Date(collection.targetInStoreDate),
          collection.selectedTechniques
        );
        
        const totalDesigns = 
          (collection.categoryDesigns?.onePiece || 0) +
          (collection.categoryDesigns?.twoPiece || 0) +
          (collection.categoryDesigns?.threePiece || 0) +
          (collection.categoryDesigns?.dupattas || 0) +
          (collection.categoryDesigns?.lowers || 0);

        const daysUntilInStore = differenceInDays(new Date(collection.targetInStoreDate), today);

        // Determine statuses based on schedule and current date
        const fabricMilestone = schedule.milestones.find(m => m.id === 'fabric-ordering');
        const samplingMilestone = schedule.milestones.find(m => m.id === 'sampling');
        const productionMilestone = schedule.milestones.find(m => m.id === 'production');

        const getFabricStatus = (): 'not-started' | 'in-progress' | 'completed' => {
          if (!fabricMilestone) return 'not-started';
          if (today < fabricMilestone.startDate) return 'not-started';
          if (today > fabricMilestone.endDate) return 'completed';
          return 'in-progress';
        };

        const getSamplingStatus = (): 'not-started' | 'in-progress' | 'completed' => {
          if (!samplingMilestone) return 'not-started';
          if (today < samplingMilestone.startDate) return 'not-started';
          if (today > samplingMilestone.endDate) return 'completed';
          return 'in-progress';
        };

        const getProductionStatus = (): 'not-started' | 'in-progress' | 'completed' => {
          if (!productionMilestone) return 'not-started';
          if (today < productionMilestone.startDate) return 'not-started';
          if (today > productionMilestone.endDate) return 'completed';
          return 'in-progress';
        };

        return {
          ...collection,
          totalDesigns,
          fabricStatus: getFabricStatus(),
          samplingStatus: getSamplingStatus(),
          productionStatus: getProductionStatus(),
          daysUntilInStore,
        };
      })
      .sort((a, b) => new Date(a.targetInStoreDate).getTime() - new Date(b.targetInStoreDate).getTime());
  }, [capsules]);

  const summaryStats = useMemo(() => {
    const total = collectionsWithStatus.length;
    const overdue = collectionsWithStatus.filter(c => c.daysUntilInStore < 0).length;
    const inProduction = collectionsWithStatus.filter(c => c.productionStatus === 'in-progress').length;
    const inSampling = collectionsWithStatus.filter(c => c.samplingStatus === 'in-progress').length;
    const totalDesigns = collectionsWithStatus.reduce((sum, c) => sum + c.totalDesigns, 0);

    return { total, overdue, inProduction, inSampling, totalDesigns };
  }, [collectionsWithStatus]);

  if (collectionsWithStatus.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Layers className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Collections Planned</h3>
          <p className="text-muted-foreground">
            Create capsule collections for your product lines to see them here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Collections</div>
          <div className="text-2xl font-bold">{summaryStats.total}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Designs</div>
          <div className="text-2xl font-bold text-primary">{summaryStats.totalDesigns}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">In Sampling</div>
          <div className="text-2xl font-bold text-[hsl(var(--status-pending))]">{summaryStats.inSampling}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">In Production</div>
          <div className="text-2xl font-bold text-[hsl(var(--status-in-progress))]">{summaryStats.inProduction}</div>
        </Card>
        <Card className={cn(
          "p-4",
          summaryStats.overdue > 0 && "bg-[hsl(var(--status-delayed))]/10 border-[hsl(var(--status-delayed))]/20"
        )}>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            {summaryStats.overdue > 0 && <AlertTriangle className="h-3 w-3 text-[hsl(var(--status-delayed))]" />}
            Overdue
          </div>
          <div className={cn(
            "text-2xl font-bold",
            summaryStats.overdue > 0 ? "text-[hsl(var(--status-delayed))]" : "text-muted-foreground"
          )}>
            {summaryStats.overdue}
          </div>
        </Card>
      </div>

      {/* Collections Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            All Planned Collections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Line</TableHead>
                  <TableHead>Collection</TableHead>
                  <TableHead>Target In-Store</TableHead>
                  <TableHead className="text-center">Designs</TableHead>
                  <TableHead className="text-center">
                    <span className="flex items-center gap-1 justify-center">
                      <Package className="h-3.5 w-3.5" />
                      Fabric
                    </span>
                  </TableHead>
                  <TableHead className="text-center">
                    <span className="flex items-center gap-1 justify-center">
                      <Scissors className="h-3.5 w-3.5" />
                      Sampling
                    </span>
                  </TableHead>
                  <TableHead className="text-center">Production</TableHead>
                  <TableHead className="text-right">Timeline</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {collectionsWithStatus.map((collection) => (
                  <TableRow key={collection.id} className="hover:bg-accent/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "h-3 w-3 rounded-full",
                          LINE_COLORS[collection.lineId] || 'bg-muted'
                        )} />
                        <span className="font-medium">{collection.lineName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{collection.collectionName}</div>
                        {collection.fabrics && collection.fabrics.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            {collection.fabrics.slice(0, 2).join(', ')}
                            {collection.fabrics.length > 2 && ` +${collection.fabrics.length - 2}`}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(collection.targetInStoreDate), 'MMM d, yyyy')}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{collection.totalDesigns}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(collection.fabricStatus)}
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(collection.samplingStatus)}
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(collection.productionStatus)}
                    </TableCell>
                    <TableCell className="text-right">
                      {getTimelineBadge(collection.daysUntilInStore)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CollectionsSummaryView;
