import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Silhouette, 
  SilhouetteStatus, 
  SILHOUETTE_STATUS_CONFIG,
  SILHOUETTE_CATEGORY_LABELS,
} from '@/data/silhouetteStore';
import { SilhouetteCard } from '@/components/SilhouetteCard';

interface SilhouetteStatusBoardProps {
  silhouettes: Silhouette[];
}

const STATUS_ORDER: SilhouetteStatus[] = [
  'sketch-submitted',
  'in-pattern',
  'sample-ready',
  'approved',
  'rejected',
];

export const SilhouetteStatusBoard = ({ silhouettes }: SilhouetteStatusBoardProps) => {
  const silhouettesByStatus = useMemo(() => {
    const grouped: Record<SilhouetteStatus, Silhouette[]> = {
      'sketch-submitted': [],
      'in-pattern': [],
      'sample-ready': [],
      'approved': [],
      'rejected': [],
    };
    
    silhouettes.forEach((s) => {
      grouped[s.status].push(s);
    });
    
    return grouped;
  }, [silhouettes]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto">
      {STATUS_ORDER.map((status) => {
        const statusConfig = SILHOUETTE_STATUS_CONFIG[status];
        const items = silhouettesByStatus[status];

        return (
          <Card key={status} className="min-w-[280px]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: statusConfig.color }}
                  />
                  {statusConfig.label}
                </CardTitle>
                <Badge variant="secondary">{items.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-2">
              <ScrollArea className="h-[calc(100vh-320px)]">
                <div className="space-y-3 p-1">
                  {items.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No silhouettes
                    </div>
                  ) : (
                    items.map((silhouette) => (
                      <MiniSilhouetteCard key={silhouette.id} silhouette={silhouette} />
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

// Compact card for board view
const MiniSilhouetteCard = ({ silhouette }: { silhouette: Silhouette }) => {
  return (
    <Card className="cursor-pointer hover:border-primary/50 transition-colors">
      <CardContent className="p-3">
        <div className="flex gap-3">
          {/* Thumbnail */}
          <div className="w-12 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
            {silhouette.technicalDrawing || silhouette.frontSketch || silhouette.sketchFile ? (
              <img
                src={silhouette.technicalDrawing || silhouette.frontSketch || silhouette.sketchFile}
                alt={silhouette.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                —
              </div>
            )}
          </div>
          
          {/* Info */}
          <div className="flex-1 min-w-0">
            <code className="text-[10px] font-mono text-muted-foreground">
              {silhouette.code}
            </code>
            <h4 className="text-sm font-medium truncate">{silhouette.name}</h4>
            <Badge variant="outline" className="text-[10px] mt-1">
              {SILHOUETTE_CATEGORY_LABELS[silhouette.category]}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
