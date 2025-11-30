import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Scan, Clock, MapPin, AlertTriangle } from 'lucide-react';
import { Collection, WorkloadMetrics } from '@/types/sample';
import { cn } from '@/lib/utils';

interface LiveDashboardProps {
  collections: Collection[];
  metrics: WorkloadMetrics;
  onScanSample: () => void;
  onCollectionClick: (collection: Collection) => void;
}

export const LiveDashboard = ({ collections, metrics, onScanSample, onCollectionClick }: LiveDashboardProps) => {
  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Live Dashboard</h1>
          <p className="text-muted-foreground">Real-time production status</p>
        </div>
        <Button onClick={onScanSample} size="lg" className="gap-2">
          <Scan className="h-5 w-5" />
          Scan Sample
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="text-sm text-muted-foreground mb-1">Total Samples</div>
          <div className="text-3xl font-bold">{metrics.totalSamples}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground mb-1">Due Today</div>
          <div className="text-3xl font-bold text-[hsl(var(--status-pending))]">{metrics.dueToday}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground mb-1">Overdue</div>
          <div className="text-3xl font-bold text-[hsl(var(--status-delayed))]">{metrics.overdue}</div>
        </Card>
        <Card className="p-6 bg-[hsl(var(--status-delayed))]/10 border-[hsl(var(--status-delayed))]/20">
          <div className="flex items-center gap-2 text-sm text-[hsl(var(--status-delayed))] mb-1">
            <AlertTriangle className="h-4 w-4" />
            Bottleneck Alert
          </div>
          <div className="text-sm font-medium text-[hsl(var(--status-delayed))]">{metrics.bottleneckAlert}</div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Active Collections</h2>
        <div className="space-y-3">
          {collections.map((collection, index) => (
            <div
              key={index}
              onClick={() => onCollectionClick(collection)}
              className="p-4 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{collection.name}</h3>
                    <Badge variant="outline">Slot {collection.slot}</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge 
                        className={cn(
                          collection.delay ? 'bg-[hsl(var(--status-delayed))]' : 'bg-[hsl(var(--status-in-progress))]',
                          'text-background'
                        )}
                      >
                        {collection.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {collection.location}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {collection.lastUpdate}
                      {collection.delay && (
                        <span className="text-[hsl(var(--status-delayed))] font-medium">
                          ({collection.delay}min delay)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};