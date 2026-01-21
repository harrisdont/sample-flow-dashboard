import { useMemo } from 'react';
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
import { AlertCircle, IndianRupee, Calculator, CheckCircle2 } from 'lucide-react';
import { useSilhouetteStore, Silhouette, SilhouetteCategory } from '@/data/silhouetteStore';
import { FabricEntry } from '@/data/fabricStore';

export type ComponentType = 'shirt' | 'lowers' | 'dupatta' | 'slip' | 'lining' | 'lehenga' | 'choli' | 'saree' | 'blouse';

export interface ComponentConfig {
  silhouetteId: string;
  fabricId: string;
  inductedFabricId?: string;
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
}

const COMPONENT_TYPE_TO_SILHOUETTE_CATEGORY: Record<ComponentType, SilhouetteCategory[]> = {
  'shirt': ['kurta', 'shirt', 'dress'],
  'lowers': ['pants'],
  'dupatta': ['dupatta'],
  'slip': ['dress'],
  'lining': ['kurta', 'shirt'],
  'lehenga': ['pants'],
  'choli': ['shirt'],
  'saree': ['dupatta'],
  'blouse': ['shirt'],
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
}: ComponentSelectorProps) => {
  const { getApprovedSilhouettes, calculateSilhouetteCost, getSilhouetteById } = useSilhouetteStore();
  
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
  
  // Calculate cost
  const costCalculation = useMemo(() => {
    if (!value.silhouetteId || !selectedFabric?.technicalSpecs?.costPerMeter) return null;
    return calculateSilhouetteCost(value.silhouetteId, selectedFabric.technicalSpecs.costPerMeter);
  }, [value.silhouetteId, selectedFabric, calculateSilhouetteCost]);

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

      {/* Fabric Selection */}
      <div className="space-y-2">
        <Label className="text-sm">Fabric *</Label>
        {availableFabrics.length === 0 ? (
          <div className="p-3 text-sm text-muted-foreground bg-muted/30 rounded-md">
            No inducted fabrics available for this component.
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
              <SelectValue placeholder="Select fabric" />
            </SelectTrigger>
            <SelectContent>
              {availableFabrics.map((fabric) => (
                <SelectItem key={fabric.id} value={fabric.id}>
                  <div className="flex items-center gap-2">
                    <span>{fabric.fabricName}</span>
                    {fabric.technicalSpecs?.costPerMeter && (
                      <span className="text-xs text-muted-foreground">
                        ₹{fabric.technicalSpecs.costPerMeter}/m
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

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
              <span className="ml-2 font-medium flex items-center">
                <IndianRupee className="h-3 w-3" />
                {costCalculation.fabricCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Stitching:</span>
              <span className="ml-2 font-medium flex items-center">
                <IndianRupee className="h-3 w-3" />
                {costCalculation.stitchingCost.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-border">
            <span className="text-sm font-medium">Total</span>
            <span className="font-bold flex items-center text-primary">
              <IndianRupee className="h-3.5 w-3.5" />
              {costCalculation.totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
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
    </Card>
  );
};
