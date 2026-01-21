import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, X, Upload, Image as ImageIcon } from 'lucide-react';
import {
  TrimApplication,
  TrimType,
  TrimPlacement,
  TRIM_LIBRARY,
  TRIM_CATEGORY_LABELS,
  TRIM_PLACEMENT_LABELS,
  useTrimsStore,
} from '@/data/trimsStore';

interface TrimSelectorProps {
  value: TrimApplication[];
  onChange: (trims: TrimApplication[]) => void;
  componentLabel?: string;
}

export const TrimSelector = ({ value, onChange, componentLabel = 'Component' }: TrimSelectorProps) => {
  const [isAddingTrim, setIsAddingTrim] = useState(false);
  const [selectedTrim, setSelectedTrim] = useState<TrimType | null>(null);
  const [selectedPlacements, setSelectedPlacements] = useState<TrimPlacement[]>([]);
  const [customPlacement, setCustomPlacement] = useState('');
  const [specifications, setSpecifications] = useState('');
  const [referencePhoto, setReferencePhoto] = useState<string | null>(null);
  
  const { getAllTrims } = useTrimsStore();
  const allTrims = getAllTrims();

  const handleAddTrim = () => {
    if (!selectedTrim || selectedPlacements.length === 0) return;
    
    const newTrim: TrimApplication = {
      id: `trim-app-${Date.now()}`,
      trimId: selectedTrim.id,
      trimType: selectedTrim,
      placements: selectedPlacements,
      customPlacement: selectedPlacements.includes('custom') ? customPlacement : undefined,
      specifications: specifications || undefined,
      referencePhoto: referencePhoto || undefined,
    };
    
    onChange([...value, newTrim]);
    resetForm();
  };

  const handleRemoveTrim = (trimId: string) => {
    onChange(value.filter(t => t.id !== trimId));
  };

  const resetForm = () => {
    setSelectedTrim(null);
    setSelectedPlacements([]);
    setCustomPlacement('');
    setSpecifications('');
    setReferencePhoto(null);
    setIsAddingTrim(false);
  };

  const handlePlacementToggle = (placement: TrimPlacement) => {
    setSelectedPlacements(prev => 
      prev.includes(placement)
        ? prev.filter(p => p !== placement)
        : [...prev, placement]
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferencePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Group trims by category
  const trimsByCategory = TRIM_LIBRARY.reduce((acc, trim) => {
    if (!acc[trim.category]) acc[trim.category] = [];
    acc[trim.category].push(trim);
    return acc;
  }, {} as Record<string, TrimType[]>);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Trims & Details</Label>
        <Dialog open={isAddingTrim} onOpenChange={setIsAddingTrim}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Trim
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Trim to {componentLabel}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Trim Selection */}
              <div className="space-y-3">
                <Label>Select Trim Type *</Label>
                <div className="space-y-4">
                  {Object.entries(trimsByCategory).map(([category, trims]) => (
                    <div key={category} className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        {TRIM_CATEGORY_LABELS[category as keyof typeof TRIM_CATEGORY_LABELS]}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {trims.map((trim) => (
                          <Badge
                            key={trim.id}
                            variant={selectedTrim?.id === trim.id ? 'default' : 'outline'}
                            className="cursor-pointer px-3 py-1.5 transition-all hover:scale-105"
                            onClick={() => setSelectedTrim(trim)}
                          >
                            {trim.name}
                            {selectedTrim?.id === trim.id && <span className="ml-1">✓</span>}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Placement Selection */}
              {selectedTrim && (
                <div className="space-y-3">
                  <Label>Placement * (Select all that apply)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {(Object.keys(TRIM_PLACEMENT_LABELS) as TrimPlacement[]).map((placement) => (
                      <div
                        key={placement}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`placement-${placement}`}
                          checked={selectedPlacements.includes(placement)}
                          onCheckedChange={() => handlePlacementToggle(placement)}
                        />
                        <label
                          htmlFor={`placement-${placement}`}
                          className="text-sm cursor-pointer"
                        >
                          {TRIM_PLACEMENT_LABELS[placement]}
                        </label>
                      </div>
                    ))}
                  </div>
                  
                  {selectedPlacements.includes('custom') && (
                    <Input
                      placeholder="Specify custom placement location..."
                      value={customPlacement}
                      onChange={(e) => setCustomPlacement(e.target.value)}
                    />
                  )}
                </div>
              )}

              {/* Specifications */}
              {selectedTrim && (
                <div className="space-y-2">
                  <Label>Additional Specifications</Label>
                  <Textarea
                    placeholder="Width, color, spacing, special instructions..."
                    value={specifications}
                    onChange={(e) => setSpecifications(e.target.value)}
                    rows={2}
                  />
                </div>
              )}

              {/* Reference Photo */}
              {selectedTrim && (
                <div className="space-y-2">
                  <Label>Reference Photo (Optional)</Label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 px-4 py-2 border border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                      <Upload className="h-4 w-4" />
                      <span className="text-sm">Upload Reference</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoUpload}
                      />
                    </label>
                    {referencePhoto && (
                      <div className="relative w-16 h-16 rounded border border-border overflow-hidden">
                        <img
                          src={referencePhoto}
                          alt="Reference"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setReferencePhoto(null)}
                          className="absolute top-0 right-0 p-0.5 bg-destructive text-destructive-foreground rounded-bl"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddTrim}
                  disabled={!selectedTrim || selectedPlacements.length === 0}
                >
                  Add Trim
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Applied Trims List */}
      {value.length > 0 ? (
        <div className="space-y-2">
          {value.map((trim) => (
            <Card key={trim.id} className="p-3 bg-card/30">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{trim.trimType.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {TRIM_CATEGORY_LABELS[trim.trimType.category]}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {trim.placements.map((p) => (
                      <Badge key={p} variant="outline" className="text-xs">
                        {TRIM_PLACEMENT_LABELS[p]}
                      </Badge>
                    ))}
                  </div>
                  {trim.specifications && (
                    <p className="text-xs text-muted-foreground">{trim.specifications}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {trim.referencePhoto && (
                    <div className="w-8 h-8 rounded border border-border overflow-hidden">
                      <img
                        src={trim.referencePhoto}
                        alt="Ref"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveTrim(trim.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic">No trims added</p>
      )}
    </div>
  );
};
