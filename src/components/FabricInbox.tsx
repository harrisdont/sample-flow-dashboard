import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useFabricStore, FABRIC_STATUS_CONFIG, FabricStatus } from '@/data/fabricStore';
import { useCapsuleStore, CapsuleCollection } from '@/data/capsuleCollectionData';
import { useCurrentUser } from '@/contexts/UserContext';
import { Package, CheckCircle2, Clock, Truck, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

export const FabricInbox = () => {
  const { currentUser } = useCurrentUser();
  const { fabrics } = useFabricStore();
  const { capsules } = useCapsuleStore();

  // Get collections for user's assigned lines
  const myCollections = useMemo((): CapsuleCollection[] => {
    if (!currentUser?.assignedLines) return [];
    return Object.values(capsules).filter((c: CapsuleCollection) =>
      currentUser.assignedLines?.includes(c.lineId as any)
    );
  }, [capsules, currentUser]);

  // Group fabrics by collection and status
  const fabricsByCollection = useMemo(() => {
    return myCollections.map(collection => {
      const collectionFabrics = fabrics.filter(f => f.collectionId === collection.id);
      const inducted = collectionFabrics.filter(f => f.status === 'inducted');
      const inProgress = collectionFabrics.filter(f =>
        f.status === 'in-base-treatment' || f.status === 'in-surface-treatment'
      );
      const pending = collectionFabrics.filter(f =>
        f.status === 'pending-artwork' || f.status === 'pending-dye-plan' || f.status === 'pending-print-plan'
      );
      const ready = collectionFabrics.filter(f => f.status === 'ready-for-induction');

      return {
        collection,
        total: collectionFabrics.length,
        inducted: inducted.length,
        inProgress: inProgress.length,
        pending: pending.length,
        ready: ready.length,
        fabrics: collectionFabrics,
      };
    }).filter(c => c.total > 0);
  }, [myCollections, fabrics]);

  if (fabricsByCollection.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-medium">No Fabrics Assigned</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Fabrics for your collections will appear here once sourcing processes them
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-300px)]">
      <div className="space-y-4">
        {fabricsByCollection.map(({ collection, total, inducted, inProgress, pending, ready, fabrics: collFabrics }) => {
          const progress = total > 0 ? Math.round((inducted / total) * 100) : 0;

          return (
            <Card key={collection.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{collection.collectionName}</CardTitle>
                    <CardDescription className="capitalize">{collection.lineName}</CardDescription>
                  </div>
                  <Badge variant={progress === 100 ? 'default' : 'outline'}>
                    {progress}% Ready
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Progress value={progress} className="h-2" />

                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-[hsl(var(--status-approved))]/10">
                      <CheckCircle2 className="h-4 w-4 mx-auto text-[hsl(var(--status-approved))] mb-1" />
                      <p className="text-lg font-bold">{inducted}</p>
                      <p className="text-xs text-muted-foreground">In-House</p>
                    </div>
                    <div className="p-2 rounded-lg bg-[hsl(var(--status-in-progress))]/10">
                      <Truck className="h-4 w-4 mx-auto text-[hsl(var(--status-in-progress))] mb-1" />
                      <p className="text-lg font-bold">{inProgress}</p>
                      <p className="text-xs text-muted-foreground">In Treatment</p>
                    </div>
                    <div className="p-2 rounded-lg bg-[hsl(var(--status-pending))]/10">
                      <Clock className="h-4 w-4 mx-auto text-[hsl(var(--status-pending))] mb-1" />
                      <p className="text-lg font-bold">{pending}</p>
                      <p className="text-xs text-muted-foreground">Pending</p>
                    </div>
                    <div className="p-2 rounded-lg bg-[hsl(var(--chart-2))]/10">
                      <Package className="h-4 w-4 mx-auto text-[hsl(var(--chart-2))] mb-1" />
                      <p className="text-lg font-bold">{ready}</p>
                      <p className="text-xs text-muted-foreground">Ready</p>
                    </div>
                  </div>

                  {/* Individual fabric items */}
                  <div className="space-y-1.5 mt-2">
                    {collFabrics.map(fabric => {
                      const statusConfig = FABRIC_STATUS_CONFIG[fabric.status];
                      return (
                        <div key={fabric.id} className="flex items-center justify-between py-1.5 px-2 rounded border text-sm">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{fabric.fabricName}</p>
                            <p className="text-xs text-muted-foreground capitalize">{fabric.componentType}</p>
                          </div>
                          <Badge variant="outline" className={cn('text-xs ml-2', statusConfig.color)}>
                            {statusConfig.label}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </ScrollArea>
  );
};
