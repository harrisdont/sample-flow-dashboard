import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { differenceInDays, format } from 'date-fns';
import { AlertTriangle, Clock, MoveRight } from 'lucide-react';
import { 
  FabricEntry, 
  FabricStatus, 
  FABRIC_STATUS_CONFIG, 
  COMPONENT_TYPE_LABELS,
  useFabricStore,
} from '@/data/fabricStore';
import { FabricInductionForm } from '@/components/FabricInductionForm';

interface FabricStatusBoardProps {
  fabrics: FabricEntry[];
}

const WORKFLOW_STAGES: { status: FabricStatus; label: string }[] = [
  { status: 'pending-artwork', label: 'Pending Artwork' },
  { status: 'pending-dye-plan', label: 'Pending Dye Plan' },
  { status: 'pending-print-plan', label: 'Pending Print Plan' },
  { status: 'in-base-treatment', label: 'In Base Treatment' },
  { status: 'pending-surface-treatment', label: 'Pending Surface' },
  { status: 'in-surface-treatment', label: 'In Surface Treatment' },
  { status: 'ready-for-induction', label: 'Ready for Induction' },
  { status: 'inducted', label: 'Inducted' },
];

export const FabricStatusBoard = ({ fabrics }: FabricStatusBoardProps) => {
  const [selectedFabric, setSelectedFabric] = useState<FabricEntry | null>(null);
  const [draggedFabric, setDraggedFabric] = useState<FabricEntry | null>(null);
  const { updateFabricStatus } = useFabricStore();
  
  const getDeadlineStatus = (deadline?: Date) => {
    if (!deadline) return null;
    const daysUntil = differenceInDays(deadline, new Date());
    if (daysUntil < 0) return { status: 'overdue', label: `${Math.abs(daysUntil)}d overdue`, color: 'text-destructive' };
    if (daysUntil === 0) return { status: 'today', label: 'Due today', color: 'text-amber-600' };
    if (daysUntil <= 7) return { status: 'soon', label: `${daysUntil}d`, color: 'text-amber-500' };
    return { status: 'ok', label: `${daysUntil}d`, color: 'text-muted-foreground' };
  };
  
  const handleDragStart = (fabric: FabricEntry) => {
    setDraggedFabric(fabric);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const handleDrop = (targetStatus: FabricStatus) => {
    if (!draggedFabric) return;
    
    // Don't allow moving to inducted (must go through form)
    if (targetStatus === 'inducted') {
      setDraggedFabric(null);
      return;
    }
    
    updateFabricStatus(draggedFabric.id, targetStatus);
    setDraggedFabric(null);
  };
  
  // Group fabrics by status
  const fabricsByStatus = WORKFLOW_STAGES.reduce((acc, stage) => {
    acc[stage.status] = fabrics.filter((f) => f.status === stage.status);
    return acc;
  }, {} as Record<FabricStatus, FabricEntry[]>);
  
  // Only show columns that have fabrics or are part of the core workflow
  const activeStages = WORKFLOW_STAGES.filter((stage) => {
    const hasFabrics = fabricsByStatus[stage.status]?.length > 0;
    const isCoreStage = ['pending-artwork', 'in-base-treatment', 'ready-for-induction', 'inducted'].includes(stage.status);
    return hasFabrics || isCoreStage;
  });
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MoveRight className="h-4 w-4" />
        <span>Drag cards to move fabrics through the workflow</span>
      </div>
      
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${activeStages.length}, minmax(200px, 1fr))` }}>
        {activeStages.map((stage) => {
          const stageFabrics = fabricsByStatus[stage.status] || [];
          const config = FABRIC_STATUS_CONFIG[stage.status];
          
          return (
            <div
              key={stage.status}
              className="space-y-3"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(stage.status)}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm text-foreground">{stage.label}</h3>
                <Badge variant="outline" className={config.color}>
                  {stageFabrics.length}
                </Badge>
              </div>
              
              <div className="space-y-2 min-h-[200px] p-2 bg-muted/30 rounded-lg">
                {stageFabrics.length === 0 ? (
                  <div className="flex items-center justify-center h-24 text-xs text-muted-foreground">
                    No fabrics
                  </div>
                ) : (
                  stageFabrics.map((fabric) => {
                    const deadlineStatus = getDeadlineStatus(fabric.fabricDeadline);
                    
                    return (
                      <Dialog key={fabric.id}>
                        <DialogTrigger asChild>
                          <Card
                            className="cursor-pointer hover:shadow-md transition-shadow"
                            draggable={stage.status !== 'inducted'}
                            onDragStart={() => handleDragStart(fabric)}
                            onClick={() => setSelectedFabric(fabric)}
                          >
                            <CardContent className="p-3 space-y-2">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">{fabric.fabricName}</p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {fabric.fabricComposition}
                                  </p>
                                </div>
                                
                                {deadlineStatus && deadlineStatus.status !== 'ok' && (
                                  <Tooltip>
                                    <TooltipTrigger>
                                      {deadlineStatus.status === 'overdue' ? (
                                        <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
                                      ) : (
                                        <Clock className="h-4 w-4 text-amber-500 flex-shrink-0" />
                                      )}
                                    </TooltipTrigger>
                                    <TooltipContent>{deadlineStatus.label}</TooltipContent>
                                  </Tooltip>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${fabric.lineColor}`} />
                                <span className="text-xs text-muted-foreground truncate">
                                  {fabric.collectionName}
                                </span>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <Badge variant="secondary" className="text-xs">
                                  {COMPONENT_TYPE_LABELS[fabric.componentType]}
                                </Badge>
                                
                                {deadlineStatus && (
                                  <span className={`text-xs ${deadlineStatus.color}`}>
                                    {deadlineStatus.label}
                                  </span>
                                )}
                              </div>
                              
                              {fabric.surfaceTreatments.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {fabric.surfaceTreatments.map((t) => (
                                    <Badge 
                                      key={t} 
                                      variant="outline" 
                                      className="text-[10px] px-1 py-0"
                                    >
                                      {t.replace('-', ' ')}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>
                              {fabric.status === 'ready-for-induction' 
                                ? 'Induct Fabric' 
                                : 'Fabric Details'}
                            </DialogTitle>
                          </DialogHeader>
                          <FabricInductionForm 
                            fabric={fabric} 
                            onClose={() => setSelectedFabric(null)} 
                          />
                        </DialogContent>
                      </Dialog>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
