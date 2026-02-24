import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, X } from 'lucide-react';
import {
  ClosureSpecification,
  ClosureType,
  CLOSURE_TYPE_LABELS,
  CLOSURE_PLACEMENT_OPTIONS,
  useAccessoryStore,
} from '@/data/accessoryStore';

interface ClosureSelectorProps {
  value: ClosureSpecification[];
  onChange: (closures: ClosureSpecification[]) => void;
  componentLabel?: string;
}

export const ClosureSelector = ({ value, onChange, componentLabel = 'Component' }: ClosureSelectorProps) => {
  const [isAddingClosure, setIsAddingClosure] = useState(false);
  const [closureType, setClosureType] = useState<ClosureType | ''>('');
  const [selectedAccessoryId, setSelectedAccessoryId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [placement, setPlacement] = useState('');
  const [specifications, setSpecifications] = useState('');
  
  const { accessories, getAccessoriesByType, getAccessoryById } = useAccessoryStore();

  // Get relevant accessories based on closure type
  const relevantAccessories = closureType && closureType !== 'none' 
    ? accessories.filter(a => {
        if (closureType === 'buttons') return a.type === 'button';
        if (closureType === 'hooks') return a.type === 'hook';
        if (closureType === 'zipper') return a.type === 'zipper';
        if (closureType === 'snap-buttons') return a.type === 'snap';
        if (closureType === 'drawstring') return a.type === 'drawstring';
        if (closureType === 'dori') return a.type === 'dori';
        return false;
      })
    : [];

  const handleAddClosure = () => {
    if (!closureType || closureType === 'none' || !placement) return;
    
    const newClosure: ClosureSpecification = {
      id: `closure-${Date.now()}`,
      type: closureType,
      accessoryId: selectedAccessoryId || undefined,
      quantity,
      placement,
      specifications: specifications || undefined,
    };
    
    onChange([...value, newClosure]);
    resetForm();
  };

  const handleRemoveClosure = (closureId: string) => {
    onChange(value.filter(c => c.id !== closureId));
  };

  const resetForm = () => {
    setClosureType('');
    setSelectedAccessoryId('');
    setQuantity(1);
    setPlacement('');
    setSpecifications('');
    setIsAddingClosure(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Closures</Label>
        <Dialog open={isAddingClosure} onOpenChange={setIsAddingClosure}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Closure
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Closure to {componentLabel}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {/* Closure Type */}
              <div className="space-y-2">
                <Label>Closure Type *</Label>
                <Select
                  value={closureType}
                  onValueChange={(value) => {
                    setClosureType(value as ClosureType);
                    setSelectedAccessoryId('');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select closure type" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(CLOSURE_TYPE_LABELS) as ClosureType[])
                      .filter(type => type !== 'none')
                      .map((type) => (
                        <SelectItem key={type} value={type}>
                          {CLOSURE_TYPE_LABELS[type]}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Accessory Selection */}
              {closureType && closureType !== 'none' && (
                <div className="space-y-2">
                  <Label>Select from Inventory (Optional)</Label>
                  {relevantAccessories.length > 0 ? (
                    <Select
                      value={selectedAccessoryId}
                      onValueChange={setSelectedAccessoryId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select from inventory" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Custom / Not in inventory</SelectItem>
                        {relevantAccessories.map((acc) => (
                          <SelectItem key={acc.id} value={acc.id}>
                            <div className="flex items-center justify-between gap-4">
                              <span>{acc.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {acc.quantityAvailable} available • PKR {acc.costPerUnit}/pc
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm text-muted-foreground p-2 bg-muted/30 rounded">
                      No {CLOSURE_TYPE_LABELS[closureType]} in inventory
                    </p>
                  )}
                </div>
              )}

              {/* Quantity */}
              {closureType && closureType !== 'none' && (
                <div className="space-y-2">
                  <Label>Quantity *</Label>
                  <Input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  />
                </div>
              )}

              {/* Placement */}
              {closureType && closureType !== 'none' && (
                <div className="space-y-2">
                  <Label>Placement *</Label>
                  <Select value={placement} onValueChange={setPlacement}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select placement" />
                    </SelectTrigger>
                    <SelectContent>
                      {CLOSURE_PLACEMENT_OPTIONS.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Specifications */}
              {closureType && closureType !== 'none' && (
                <div className="space-y-2">
                  <Label>Additional Specifications</Label>
                  <Input
                    placeholder="Color, size, spacing..."
                    value={specifications}
                    onChange={(e) => setSpecifications(e.target.value)}
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddClosure}
                  disabled={!closureType || closureType === 'none' || !placement}
                >
                  Add Closure
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Applied Closures List */}
      {value.length > 0 ? (
        <div className="space-y-2">
          {value.map((closure) => {
            const accessory = closure.accessoryId ? getAccessoryById(closure.accessoryId) : null;
            const placementLabel = CLOSURE_PLACEMENT_OPTIONS.find(p => p.id === closure.placement)?.label || closure.placement;
            
            return (
              <Card key={closure.id} className="p-3 bg-card/30">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {CLOSURE_TYPE_LABELS[closure.type]}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        × {closure.quantity}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1 items-center">
                      <Badge variant="outline" className="text-xs">{placementLabel}</Badge>
                      {accessory && (
                        <span className="text-xs text-muted-foreground">
                          {accessory.name}
                        </span>
                      )}
                    </div>
                    {closure.specifications && (
                      <p className="text-xs text-muted-foreground">{closure.specifications}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveClosure(closure.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic">No closures added</p>
      )}
    </div>
  );
};
