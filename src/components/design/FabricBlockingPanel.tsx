import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Palette, Layers } from 'lucide-react';
import { FabricEntry } from '@/data/fabricStore';

export interface FabricAssignment {
  fabricId: string;
  fabricNumber: number;
  color: string;
  componentType: string;
  fabricName: string;
  swatch?: string;
  sections?: string[];
}

interface FabricBlockingPanelProps {
  selectedFabrics: {
    componentType: string;
    componentLabel: string;
    fabric?: FabricEntry;
  }[];
  onFabricNumbersChange?: (assignments: FabricAssignment[]) => void;
}

const FABRIC_COLORS = [
  { number: 1, color: '#3b82f6', name: 'Blue' },
  { number: 2, color: '#22c55e', name: 'Green' },
  { number: 3, color: '#f97316', name: 'Orange' },
  { number: 4, color: '#a855f7', name: 'Purple' },
  { number: 5, color: '#ef4444', name: 'Red' },
  { number: 6, color: '#eab308', name: 'Yellow' },
  { number: 7, color: '#06b6d4', name: 'Cyan' },
  { number: 8, color: '#ec4899', name: 'Pink' },
];

export const FabricBlockingPanel = ({
  selectedFabrics,
  onFabricNumbersChange,
}: FabricBlockingPanelProps) => {
  // Build unique fabric assignments with auto-numbering
  const fabricAssignments = useMemo(() => {
    const assignments: FabricAssignment[] = [];
    const seenFabricIds = new Map<string, number>();
    let nextNumber = 1;

    selectedFabrics.forEach(({ componentType, fabric }) => {
      if (!fabric) return;

      // Check if we already assigned a number to this fabric
      if (seenFabricIds.has(fabric.id)) {
        const existingNumber = seenFabricIds.get(fabric.id)!;
        // Add component to existing assignment's sections
        const existingAssignment = assignments.find(a => a.fabricId === fabric.id);
        if (existingAssignment && !existingAssignment.sections?.includes(componentType)) {
          existingAssignment.sections?.push(componentType);
        }
      } else {
        // Assign new number
        const colorInfo = FABRIC_COLORS[(nextNumber - 1) % FABRIC_COLORS.length];
        assignments.push({
          fabricId: fabric.id,
          fabricNumber: nextNumber,
          color: colorInfo.color,
          componentType,
          fabricName: fabric.fabricName,
          swatch: fabric.colorId, // Could be linked to color palette
          sections: [componentType],
        });
        seenFabricIds.set(fabric.id, nextNumber);
        nextNumber++;
      }
    });

    return assignments;
  }, [selectedFabrics]);

  // Calculate unique fabric count
  const uniqueFabricCount = fabricAssignments.length;

  // Get fabric numbers array for TechpackCanvas
  const fabricNumbers = useMemo(() => {
    return fabricAssignments.map(a => ({
      number: a.fabricNumber,
      color: a.color,
    }));
  }, [fabricAssignments]);

  // Notify parent of changes
  useMemo(() => {
    if (onFabricNumbersChange && fabricAssignments.length > 0) {
      onFabricNumbersChange(fabricAssignments);
    }
  }, [fabricAssignments, onFabricNumbersChange]);

  if (selectedFabrics.filter(f => f.fabric).length === 0) {
    return null;
  }

  const isColorBlocking = uniqueFabricCount > 1;

  return (
    <Card className="p-4 space-y-4 bg-card/50 border-dashed">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isColorBlocking ? (
            <Layers className="h-4 w-4 text-primary" />
          ) : (
            <Palette className="h-4 w-4 text-muted-foreground" />
          )}
          <Label className="text-base font-semibold">
            {isColorBlocking ? 'Multi-Fabric Color Blocking' : 'Fabric Assignment'}
          </Label>
        </div>
        <Badge variant={isColorBlocking ? 'default' : 'secondary'}>
          {uniqueFabricCount} {uniqueFabricCount === 1 ? 'Fabric' : 'Fabrics'}
        </Badge>
      </div>

      {isColorBlocking && (
        <p className="text-sm text-muted-foreground">
          Multiple fabrics detected. Use the numbered markers on the techpack canvas to indicate which fabric should be used for each section.
        </p>
      )}

      <Separator />

      {/* Fabric Legend */}
      <div className="space-y-3">
        <Label className="text-sm text-muted-foreground">Fabric Legend</Label>
        <div className="grid gap-3">
          {fabricAssignments.map((assignment) => (
            <div
              key={assignment.fabricId}
              className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border/50"
            >
              {/* Number Marker */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm"
                style={{ backgroundColor: assignment.color }}
              >
                {assignment.fabricNumber}
              </div>

              {/* Fabric Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">
                  {assignment.fabricName}
                </p>
                <p className="text-xs text-muted-foreground">
                  Used for: {assignment.sections?.map(s => {
                    const label = selectedFabrics.find(f => f.componentType === s)?.componentLabel;
                    return label || s;
                  }).join(', ')}
                </p>
              </div>

              {/* Color Swatch (if available) */}
              {assignment.swatch && (
                <div
                  className="w-6 h-6 rounded border border-border"
                  style={{ backgroundColor: assignment.swatch }}
                  title="Fabric Color"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {isColorBlocking && (
        <>
          <Separator />
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Palette className="h-4 w-4 text-primary mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-foreground">How to use fabric blocking:</p>
                <ol className="mt-1 text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Select the "Fabric #" tool in the canvas toolbar</li>
                  <li>Click on the numbered marker matching your fabric</li>
                  <li>Click on the technical drawing to place the marker</li>
                  <li>Repeat for each section that uses a different fabric</li>
                </ol>
              </div>
            </div>
          </div>
        </>
      )}
    </Card>
  );
};

export { FABRIC_COLORS };
