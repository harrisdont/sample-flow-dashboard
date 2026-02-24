import { useMemo, useState } from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, Calculator, CheckCircle2, Plus, X } from 'lucide-react';
import { useSilhouetteStore, Silhouette, SilhouetteCategory } from '@/data/silhouetteStore';
import { FabricEntry } from '@/data/fabricStore';
import { FabricInductionForm } from '@/components/FabricInductionForm';

export type ComponentType = 'shirt' | 'lowers' | 'dupatta' | 'slip' | 'lining' | 'lehenga' | 'choli' | 'saree' | 'blouse';

export interface AdditionalFabric {
  id: string;
  inductedFabricId: string;
}

export interface ComponentConfig {
  silhouetteId: string;
  fabricId: string;
  inductedFabricId?: string;
  additionalFabrics?: AdditionalFabric[];
}

interface ComponentSelectorProps {
  componentType: ComponentType;
  label: string;
  availableFabrics: FabricEntry[];
  silhouetteFilter?: SilhouetteCategory[];
  value: ComponentConfig;
  onChange: (config: ComponentConfig) => void;
  showCostBreakdown?: boolean;
  error?: string;
  collectionId?: string;
  onFabricAdded?: () => void;
}

const COMPONENT_TYPE_TO_SILHOUETTE_CATEGORY: Record<ComponentType, SilhouetteCategory[]> = {
  'shirt': ['top', 'dress'],
  'lowers': ['bottom'],
  'dupatta': ['dupatta'],
  'slip': ['slip', 'dress'],
  'lining': ['top'],
  'lehenga': ['bottom'],
  'choli': ['top'],
  'saree': ['dupatta'],
  'blouse': ['top'],
};

export const ComponentSelector = ({
  componentType,
  label,
  availableFabrics,
  silhouetteFilter,
  value,
  onChange,
  showCostBreakdown = true,
  error,
  collectionId,
  onFabricAdded,
}: ComponentSelectorProps) => {
  const { getApprovedSilhouettes, calculateSilhouetteCost, getSilhouetteById } = useSilhouetteStore();
  const [isAddFabricOpen, setIsAddFabricOpen] = useState(false);
  
  // Get approved silhouettes filtered by category
  const filteredSilhouettes = useMemo(() => {
    const approved = getApprovedSilhouettes();
    const categories = silhouetteFilter || COMPONENT_TYPE_TO_SILHOUETTE_CATEGORY[componentType] || [];
    if (categories.length === 0) return approved;
    return approved.filter(s => categories.includes(s.category));
  }, [getApprovedSilhouettes, componentType, silhouetteFilter]);

  // Get selected silhouette data
  const selectedSilhouette = value.silhouetteId ? getSilhouetteById(value.silhouetteId) : undefined;
  
  // Get selected fabric
  const selectedFabric = availableFabrics.find(f => f.id === value.inductedFabricId);
  
  // Get all selected fabrics (primary + additional)
  const allSelectedFabrics = useMemo(() => {
    const fabrics: { fabric: FabricEntry; label: string }[] = [];
    if (selectedFabric) {
      fabrics.push({ fabric: selectedFabric, label: 'Primary' });
    }
    value.additionalFabrics?.forEach((af, index) => {
      const fabric = availableFabrics.find(f => f.id === af.inductedFabricId);
      if (fabric) {
        fabrics.push({ fabric, label: `Fabric ${index + 2}` });
      }
    });
    return fabrics;
  }, [selectedFabric, value.additionalFabrics, availableFabrics]);
  
  // Calculate cost for all fabrics
  const costCalculation = useMemo(() => {
    if (!value.silhouetteId || allSelectedFabrics.length === 0) return null;
    
    let totalFabricCost = 0;
    let totalStitchingCost = 0;
    
    allSelectedFabrics.forEach(({ fabric }) => {
      if (fabric.technicalSpecs?.costPerMeter) {
        const calc = calculateSilhouetteCost(value.silhouetteId, fabric.technicalSpecs.costPerMeter);
        if (calc) {
          totalFabricCost += calc.fabricCost;
          totalStitchingCost = calc.stitchingCost; // Stitching cost is the same regardless of fabric count
        }
      }
    });
    
    return {
      fabricCost: totalFabricCost,
      stitchingCost: totalStitchingCost,
      totalCost: totalFabricCost + totalStitchingCost
    };
  }, [value.silhouetteId, allSelectedFabrics, calculateSilhouetteCost]);

  // Add another fabric
  const handleAddFabric = () => {
    const newFabric: AdditionalFabric = {
      id: crypto.randomUUID(),
      inductedFabricId: ''
    };
    onChange({
      ...value,
      additionalFabrics: [...(value.additionalFabrics || []), newFabric]
    });
  };

  // Remove additional fabric
  const handleRemoveFabric = (fabricId: string) => {
    onChange({
      ...value,
      additionalFabrics: value.additionalFabrics?.filter(f => f.id !== fabricId) || []
    });
  };

  // Update additional fabric
  const handleUpdateAdditionalFabric = (fabricId: string, inductedFabricId: string) => {
    onChange({
      ...value,
      additionalFabrics: value.additionalFabrics?.map(f => 
        f.id === fabricId ? { ...f, inductedFabricId } : f
      ) || []
    });
  };

  return (
    <Card className="p-4 space-y-4 bg-card/50 border-border">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-foreground">{label}</h4>
        <Badge variant="outline" className="capitalize">{componentType}</Badge>
      </div>

      {/* Silhouette Selection */}
      <div className="space-y-2">
        <Label className="text-sm">Silhouette *</Label>
        {filteredSilhouettes.length === 0 ? (
          <div className="p-3 text-sm text-muted-foreground bg-muted/30 rounded-md">
            No approved silhouettes available for this component type.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {filteredSilhouettes.map((silhouette) => (
              <button
                key={silhouette.id}
                type="button"
                onClick={() => onChange({ ...value, silhouetteId: silhouette.id })}
                className={`relative p-3 border rounded-lg transition-all text-left ${
                  value.silhouetteId === silhouette.id
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'border-border bg-card/50 hover:border-primary/50'
                }`}
              >
                {silhouette.technicalDrawing && (
                  <div className="aspect-square mb-2 flex items-center justify-center bg-background/50 rounded overflow-hidden">
                    <img
                      src={silhouette.technicalDrawing}
                      alt={silhouette.name}
                      className="w-full h-full object-contain p-1"
                    />
                  </div>
                )}
                <p className="text-xs font-mono text-muted-foreground">{silhouette.code}</p>
                <p className="text-sm font-medium text-foreground truncate">{silhouette.name}</p>
                {silhouette.fabricConsumption && (
                  <p className="text-xs text-muted-foreground">{silhouette.fabricConsumption}m</p>
                )}
                {value.silhouetteId === silhouette.id && (
                  <CheckCircle2 className="absolute top-2 right-2 h-4 w-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Primary Fabric Selection */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm">Primary Fabric *</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsAddFabricOpen(true)}
            className="h-6 px-2 text-xs text-primary hover:text-primary/80"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Fabric
          </Button>
        </div>
        {availableFabrics.length === 0 ? (
          <div className="p-3 text-sm text-muted-foreground bg-muted/30 rounded-md flex flex-col gap-2">
            <span>No inducted fabrics available for this component.</span>
            <Button 
              type="button"
              variant="outline" 
              size="sm" 
              onClick={() => setIsAddFabricOpen(true)}
              className="w-fit"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Fabric
            </Button>
          </div>
        ) : (
          <Select
            value={value.inductedFabricId || ''}
            onValueChange={(fabricId) => onChange({ 
              ...value, 
              inductedFabricId: fabricId,
              fabricId: fabricId 
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select primary fabric" />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border z-50">
              {availableFabrics.map((fabric) => (
                <SelectItem key={fabric.id} value={fabric.id}>
                  <div className="flex items-center gap-2">
                    <span>{fabric.fabricName}</span>
                    {fabric.technicalSpecs?.costPerMeter && (
                      <span className="text-xs text-muted-foreground">
                        PKR {fabric.technicalSpecs.costPerMeter}/m
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Additional Fabrics */}
      {value.additionalFabrics && value.additionalFabrics.length > 0 && (
        <div className="space-y-3">
          {value.additionalFabrics.map((af, index) => (
            <div key={af.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Fabric {index + 2}</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFabric(af.id)}
                  className="h-6 px-2 text-xs text-destructive hover:text-destructive/80"
                >
                  <X className="h-3 w-3 mr-1" />
                  Remove
                </Button>
              </div>
              <Select
                value={af.inductedFabricId || ''}
                onValueChange={(fabricId) => handleUpdateAdditionalFabric(af.id, fabricId)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Select fabric ${index + 2}`} />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border z-50">
                  {availableFabrics.map((fabric) => (
                    <SelectItem key={fabric.id} value={fabric.id}>
                      <div className="flex items-center gap-2">
                        <span>{fabric.fabricName}</span>
                        {fabric.technicalSpecs?.costPerMeter && (
                          <span className="text-xs text-muted-foreground">
                            PKR {fabric.technicalSpecs.costPerMeter}/m
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      )}

      {/* Add Another Fabric Button */}
      {availableFabrics.length > 0 && value.inductedFabricId && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddFabric}
          className="w-full gap-2 border-dashed"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Another Fabric
        </Button>
      )}

      {/* Cost Breakdown */}
      {showCostBreakdown && selectedSilhouette && costCalculation && (
        <div className="pt-3 border-t border-border space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calculator className="h-3.5 w-3.5" />
            <span>Cost Breakdown</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Fabric:</span>
              <span className="ml-2 font-medium">
                PKR {costCalculation.fabricCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Stitching:</span>
              <span className="ml-2 font-medium">
                PKR {costCalculation.stitchingCost.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-border">
            <span className="text-sm font-medium">Total</span>
            <span className="font-bold text-primary">
              PKR {costCalculation.totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}

      {/* Add Fabric Dialog */}
      <Dialog open={isAddFabricOpen} onOpenChange={setIsAddFabricOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Add New Fabric</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] pr-4">
            <FabricInductionForm 
              defaultCollectionId={collectionId}
              autoInduct
              onClose={() => {
                setIsAddFabricOpen(false);
                onFabricAdded?.();
              }} 
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
