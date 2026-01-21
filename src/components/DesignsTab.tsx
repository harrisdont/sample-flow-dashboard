import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search, 
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react';
import { useDesignStore, Design } from '@/data/designStore';
import { useSilhouetteStore } from '@/data/silhouetteStore';
import { useFabricStore } from '@/data/fabricStore';
import { useCapsuleStore } from '@/data/capsuleCollectionData';
import { NewDesignForm } from '@/components/NewDesignForm';
import { format } from 'date-fns';

const STATUS_CONFIG: Record<Design['status'], { label: string; icon: React.ReactNode; color: string }> = {
  pending: { 
    label: 'Pending', 
    icon: <Clock className="h-3 w-3" />,
    color: 'hsl(var(--status-pending))',
  },
  'in-progress': { 
    label: 'In Progress', 
    icon: <Loader2 className="h-3 w-3" />,
    color: 'hsl(var(--status-in-progress))',
  },
  approved: { 
    label: 'Approved', 
    icon: <CheckCircle className="h-3 w-3" />,
    color: 'hsl(var(--status-complete))',
  },
  rejected: { 
    label: 'Rejected', 
    icon: <XCircle className="h-3 w-3" />,
    color: 'hsl(var(--status-delayed))',
  },
};

export const DesignsTab = () => {
  const [isAddDesignOpen, setIsAddDesignOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { designs } = useDesignStore();
  const { silhouettes } = useSilhouetteStore();
  const { fabrics, getFabricById } = useFabricStore();
  const { capsules } = useCapsuleStore();

  const allDesigns = useMemo(() => 
    Object.values(designs).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ), 
    [designs]
  );

  const filteredDesigns = useMemo(() => {
    if (!searchQuery) return allDesigns;
    
    const query = searchQuery.toLowerCase();
    return allDesigns.filter((design) => {
      const silhouette = silhouettes[design.silhouetteId];
      const collection = capsules[design.collectionId];
      return (
        silhouette?.name.toLowerCase().includes(query) ||
        silhouette?.code.toLowerCase().includes(query) ||
        collection?.collectionName.toLowerCase().includes(query) ||
        design.category.toLowerCase().includes(query)
      );
    });
  }, [allDesigns, searchQuery, silhouettes, capsules]);

  // Stats
  const stats = useMemo(() => {
    const byStatus: Record<Design['status'], number> = {
      pending: 0,
      'in-progress': 0,
      approved: 0,
      rejected: 0,
    };
    
    allDesigns.forEach((d) => {
      byStatus[d.status]++;
    });
    
    return {
      total: allDesigns.length,
      byStatus,
    };
  }, [allDesigns]);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(Object.keys(STATUS_CONFIG) as Design['status'][]).map((status) => (
          <Card key={status}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div style={{ color: STATUS_CONFIG[status].color }}>
                    {STATUS_CONFIG[status].icon}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {STATUS_CONFIG[status].label}
                  </span>
                </div>
                <span className="text-2xl font-bold">{stats.byStatus[status]}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Add */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search designs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button onClick={() => setIsAddDesignOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Design
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Designs List */}
      {filteredDesigns.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 'No designs match your search' : 'No designs submitted yet'}
            </p>
            <Button onClick={() => setIsAddDesignOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create First Design
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredDesigns.map((design) => {
            const silhouette = silhouettes[design.silhouetteId];
            const collection = capsules[design.collectionId];
            const fabric = design.inductedFabricId 
              ? getFabricById(design.inductedFabricId) 
              : null;
            const statusConfig = STATUS_CONFIG[design.status];

            return (
              <Card key={design.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Silhouette Thumbnail */}
                    <div className="w-16 h-20 bg-muted rounded overflow-hidden flex-shrink-0">
                      {silhouette?.technicalDrawing ? (
                        <img
                          src={silhouette.technicalDrawing}
                          alt={silhouette.name}
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <FileText className="h-6 w-6" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium truncate">
                          {silhouette?.name || 'Unknown Silhouette'}
                        </h3>
                        <Badge
                          className="gap-1"
                          style={{
                            backgroundColor: statusConfig.color,
                            color: 'hsl(var(--background))',
                          }}
                        >
                          {statusConfig.icon}
                          {statusConfig.label}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                        {collection && (
                          <span>{collection.collectionName}</span>
                        )}
                        <span>•</span>
                        <span className="capitalize">{design.category}</span>
                        {design.fastTrack && (
                          <>
                            <span>•</span>
                            <Badge variant="destructive" className="text-xs">
                              Fast Track
                            </Badge>
                          </>
                        )}
                      </div>

                      {fabric && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Fabric: {fabric.artworkName}
                        </div>
                      )}
                    </div>

                    {/* Date */}
                    <div className="text-sm text-muted-foreground text-right">
                      <div>{format(new Date(design.createdAt), 'MMM d, yyyy')}</div>
                      <div className="text-xs">{design.sampleType}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <NewDesignForm open={isAddDesignOpen} onOpenChange={setIsAddDesignOpen} />
    </div>
  );
};
