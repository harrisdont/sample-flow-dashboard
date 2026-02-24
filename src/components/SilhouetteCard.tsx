import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  FileText, 
  Ruler, 
  DollarSign, 
  Eye,
  ArrowRight,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { 
  Silhouette, 
  SILHOUETTE_STATUS_CONFIG, 
  SILHOUETTE_CATEGORY_LABELS,
  useSilhouetteStore,
} from '@/data/silhouetteStore';
import { useFabricStore } from '@/data/fabricStore';
import { SilhouetteInductionForm } from '@/components/SilhouetteInductionForm';

interface SilhouetteCardProps {
  silhouette: Silhouette;
}

export const SilhouetteCard = ({ silhouette }: SilhouetteCardProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { calculateSilhouetteCost } = useSilhouetteStore();
  const { getFabricById } = useFabricStore();

  // Get linked fabric cost if available
  const linkedFabric = silhouette.linkedFabricId 
    ? getFabricById(silhouette.linkedFabricId) 
    : null;
  
  const fabricCostPerMeter = linkedFabric?.technicalSpecs?.costPerMeter || 0;
  const costData = silhouette.status === 'approved' 
    ? calculateSilhouetteCost(silhouette.id, fabricCostPerMeter) 
    : null;

  const statusConfig = SILHOUETTE_STATUS_CONFIG[silhouette.status];

  const getStatusIcon = () => {
    switch (silhouette.status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'sample-ready':
        return <Eye className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <>
      <Card className="overflow-hidden hover:border-primary/50 transition-colors group">
        {/* Image/Drawing Preview */}
        <div className="aspect-[3/4] bg-muted relative overflow-hidden">
          {silhouette.technicalDrawing ? (
            <img
              src={silhouette.technicalDrawing}
              alt={silhouette.name}
              className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform"
            />
          ) : silhouette.frontSketch || silhouette.sketchFile ? (
            <img
              src={silhouette.frontSketch || silhouette.sketchFile}
              alt={silhouette.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <FileText className="h-12 w-12" />
            </div>
          )}
          
          {/* Status Badge Overlay */}
          <div className="absolute top-2 right-2">
            <Badge
              className="gap-1"
              style={{
                backgroundColor: statusConfig.color,
                color: 'hsl(var(--background))',
              }}
            >
              {getStatusIcon()}
              {statusConfig.label}
            </Badge>
          </div>
        </div>

        <CardContent className="p-4 space-y-3">
          {/* Header */}
          <div>
            <div className="flex items-center justify-between">
              <code className="text-xs font-mono text-muted-foreground">
                {silhouette.code}
              </code>
              <Badge variant="outline" className="text-xs">
                {SILHOUETTE_CATEGORY_LABELS[silhouette.category]}
              </Badge>
            </div>
            <h3 className="font-semibold mt-1 line-clamp-1">{silhouette.name}</h3>
          </div>

          {/* Approved: Show Cost Data */}
          {silhouette.status === 'approved' && costData && (
            <>
              <Separator />
              <div className="grid grid-cols-2 gap-2 text-sm">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Ruler className="h-3 w-3" />
                      <span>{silhouette.fabricConsumption}m</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Fabric Consumption</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <DollarSign className="h-3 w-3" />
                      <span>PKR {costData.stitchingCost}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Stitching Cost</TooltipContent>
                </Tooltip>
              </div>
              
              <div className="bg-muted/50 rounded-md p-2 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Total Cost</span>
                   <span className="font-medium">PKR {costData.totalCost.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Selling Price (3.2x)</span>
                  <span className="font-semibold text-primary">
                    PKR {costData.predictedSellingPrice.toFixed(0)}
                  </span>
                </div>
              </div>
              
              {silhouette.gradingSizes.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {silhouette.gradingSizes.map((size) => (
                    <Badge key={size} variant="secondary" className="text-xs">
                      {size}
                    </Badge>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Rejected: Show Reason */}
          {silhouette.status === 'rejected' && silhouette.rejectedReason && (
            <div className="text-xs text-destructive bg-destructive/10 rounded-md p-2">
              {silhouette.rejectedReason}
            </div>
          )}

          {/* Designer Notes */}
          {silhouette.designerNotes && silhouette.status !== 'approved' && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {silhouette.designerNotes}
            </p>
          )}

          {/* Action Button */}
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2"
            onClick={() => setIsFormOpen(true)}
          >
            {silhouette.status === 'approved' ? 'View Details' : 'Continue'}
            <ArrowRight className="h-3 w-3" />
          </Button>
        </CardContent>
      </Card>

      <SilhouetteInductionForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        silhouette={silhouette}
      />
    </>
  );
};
