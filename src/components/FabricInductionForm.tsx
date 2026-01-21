import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { CalendarIcon, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { 
  useFabricStore, 
  FabricEntry, 
  FabricType, 
  PrintType, 
  SurfaceTreatment, 
  ComponentType,
  BaseTreatmentType,
  getInitialStatus,
  FABRIC_TYPE_LABELS,
  PRINT_TYPE_LABELS,
  SURFACE_TREATMENT_LABELS,
  COMPONENT_TYPE_LABELS,
  FABRIC_STATUS_CONFIG,
  TechnicalSpecs,
} from '@/data/fabricStore';
import { baseFabricLibrary } from '@/data/libraryData';
import { useCapsuleStore } from '@/data/capsuleCollectionData';

interface FabricInductionFormProps {
  fabric?: FabricEntry;
  onClose: () => void;
}

const CONSTRUCTION_OPTIONS = [
  'Plain Weave',
  'Twill Weave',
  'Satin Weave',
  'Dobby Weave',
  'Jacquard Weave',
  'Oxford Weave',
  'Basket Weave',
];

const WIDTH_OPTIONS = ['36 inches', '44 inches', '52 inches', '58 inches', '60 inches'];

export const FabricInductionForm = ({ fabric, onClose }: FabricInductionFormProps) => {
  const { capsules } = useCapsuleStore();
  const { 
    addFabricEntry, 
    updateFabricEntry, 
    inductFabric,
    markArtworkSubmitted,
    markBaseTreatmentComplete,
    markSurfaceTreatmentComplete,
    updateFabricStatus,
  } = useFabricStore();
  
  const isEditing = !!fabric;
  const isReadyForInduction = fabric?.status === 'ready-for-induction';
  
  // Form state
  const [selectedCollection, setSelectedCollection] = useState(fabric?.collectionId || '');
  const [componentType, setComponentType] = useState<ComponentType>(fabric?.componentType || 'shirt');
  const [fabricName, setFabricName] = useState(fabric?.fabricName || '');
  const [fabricComposition, setFabricComposition] = useState(fabric?.fabricComposition || '');
  const [fabricType, setFabricType] = useState<FabricType>(fabric?.fabricType || 'greige');
  const [baseTreatmentType, setBaseTreatmentType] = useState<BaseTreatmentType>(fabric?.baseTreatmentType || 'none');
  const [printType, setPrintType] = useState<PrintType>(fabric?.printType || 'none');
  const [dyePlan, setDyePlan] = useState(fabric?.dyePlan || '');
  const [printPlan, setPrintPlan] = useState(fabric?.printPlan || '');
  const [surfaceTreatments, setSurfaceTreatments] = useState<SurfaceTreatment[]>(fabric?.surfaceTreatments || []);
  const [fabricDeadline, setFabricDeadline] = useState<Date | undefined>(fabric?.fabricDeadline);
  
  // Technical specs
  const [construction, setConstruction] = useState(fabric?.technicalSpecs?.construction || '');
  const [fabricWidth, setFabricWidth] = useState(fabric?.technicalSpecs?.fabricWidth || '');
  const [gsm, setGsm] = useState(fabric?.technicalSpecs?.gsm?.toString() || '');
  const [costPerMeter, setCostPerMeter] = useState(fabric?.technicalSpecs?.costPerMeter?.toString() || '');
  const [shrinkageMargin, setShrinkageMargin] = useState(fabric?.technicalSpecs?.shrinkageMargin || '');
  const [stitchingSpecs, setStitchingSpecs] = useState(fabric?.technicalSpecs?.stitchingSpecs || '');
  const [careInstructions, setCareInstructions] = useState(fabric?.technicalSpecs?.careInstructions || '');
  
  // Product line colors mapping
  const lineColors: Record<string, string> = {
    'woman': 'bg-pink-500',
    'classic': 'bg-orange-500',
    'cottage': 'bg-yellow-500',
    'formals': 'bg-purple-500',
    'ming': 'bg-green-500',
    'basic': 'bg-sky-500',
    'semi-bridals': 'bg-rose-500',
  };
  
  // Get collection options from capsule store
  const collectionOptions = Object.values(capsules).flat().map((c) => ({
    id: c.id,
    name: c.collectionName,
    lineId: c.lineId,
    lineName: c.lineName,
    lineColor: lineColors[c.lineId] || 'bg-gray-500',
  }));
  
  const selectedCollectionData = collectionOptions.find((c) => c.id === selectedCollection);
  
  // Auto-set base treatment type based on fabric type
  useEffect(() => {
    if (fabricType === 'jacquard' || fabricType === 'dobby' || fabricType === 'yarn-dyed') {
      setBaseTreatmentType('none');
    }
  }, [fabricType]);
  
  // Handle fabric library selection
  const handleLibrarySelect = (fabricId: string) => {
    const selected = baseFabricLibrary.find((f) => f.id === fabricId);
    if (selected) {
      setFabricName(selected.name);
      setFabricComposition(selected.defaultComposition);
      setFabricType(selected.type as FabricType);
    }
  };
  
  const toggleSurfaceTreatment = (treatment: SurfaceTreatment) => {
    setSurfaceTreatments((prev) =>
      prev.includes(treatment)
        ? prev.filter((t) => t !== treatment)
        : [...prev, treatment]
    );
  };
  
  const handleSubmit = () => {
    if (!selectedCollection || !fabricName || !fabricComposition) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (isReadyForInduction) {
      // Induct with technical specs
      if (!construction || !fabricWidth || !costPerMeter || !shrinkageMargin || !stitchingSpecs) {
        toast.error('Please fill in all technical specifications');
        return;
      }
      
      const specs: TechnicalSpecs = {
        construction,
        fabricWidth,
        gsm: gsm ? parseInt(gsm) : undefined,
        costPerMeter: parseFloat(costPerMeter),
        shrinkageMargin,
        stitchingSpecs,
        careInstructions: careInstructions || undefined,
      };
      
      inductFabric(fabric!.id, specs);
      toast.success('Fabric inducted successfully!');
      onClose();
      return;
    }
    
    if (isEditing) {
      updateFabricEntry(fabric!.id, {
        fabricName,
        fabricComposition,
        fabricType,
        baseTreatmentType,
        printType: baseTreatmentType === 'printing' ? printType : undefined,
        dyePlan: baseTreatmentType === 'dyeing' ? dyePlan : undefined,
        printPlan: baseTreatmentType === 'printing' ? printPlan : undefined,
        surfaceTreatments,
        fabricDeadline,
      });
      toast.success('Fabric updated successfully!');
    } else {
      const collection = collectionOptions.find((c) => c.id === selectedCollection);
      if (!collection) {
        toast.error('Please select a collection');
        return;
      }
      
      const status = getInitialStatus(fabricType, baseTreatmentType);
      
      addFabricEntry({
        collectionId: collection.id,
        collectionName: collection.name,
        lineId: collection.lineId,
        lineName: collection.lineName,
        lineColor: collection.lineColor,
        componentType,
        fabricName,
        fabricComposition,
        fabricType,
        status,
        artworkSubmitted: false,
        baseTreatmentType,
        printType: baseTreatmentType === 'printing' ? printType : undefined,
        dyePlan: baseTreatmentType === 'dyeing' ? dyePlan : undefined,
        printPlan: baseTreatmentType === 'printing' ? printPlan : undefined,
        baseTreatmentComplete: baseTreatmentType === 'none' && !['jacquard', 'dobby', 'yarn-dyed'].includes(fabricType),
        surfaceTreatments,
        surfaceTreatmentComplete: surfaceTreatments.length === 0,
        fabricDeadline,
      });
      toast.success('Fabric added successfully!');
    }
    
    onClose();
  };
  
  const handleStatusAction = () => {
    if (!fabric) return;
    
    switch (fabric.status) {
      case 'pending-artwork':
        markArtworkSubmitted(fabric.id);
        toast.success('Artwork marked as submitted');
        break;
      case 'pending-dye-plan':
      case 'pending-print-plan':
        updateFabricStatus(fabric.id, 'in-base-treatment');
        toast.success('Moved to base treatment');
        break;
      case 'in-base-treatment':
        markBaseTreatmentComplete(fabric.id);
        toast.success('Base treatment completed');
        break;
      case 'pending-surface-treatment':
        updateFabricStatus(fabric.id, 'in-surface-treatment');
        toast.success('Started surface treatment');
        break;
      case 'in-surface-treatment':
        markSurfaceTreatmentComplete(fabric.id);
        toast.success('Surface treatment completed');
        break;
    }
    onClose();
  };
  
  const needsArtwork = fabricType === 'jacquard' || fabricType === 'dobby' || fabricType === 'yarn-dyed';
  const needsTreatmentPlan = fabricType === 'greige' || fabricType === 'solid-dyed';
  
  return (
    <div className="space-y-6">
      {/* Status Badge for existing fabric */}
      {isEditing && (
        <div className="flex items-center justify-between">
          <Badge 
            variant="outline" 
            className={FABRIC_STATUS_CONFIG[fabric.status].color}
          >
            {FABRIC_STATUS_CONFIG[fabric.status].label}
          </Badge>
          
          {fabric.status !== 'inducted' && fabric.status !== 'ready-for-induction' && (
            <Button variant="outline" size="sm" onClick={handleStatusAction}>
              {fabric.status === 'pending-artwork' && 'Mark Artwork Submitted'}
              {(fabric.status === 'pending-dye-plan' || fabric.status === 'pending-print-plan') && 'Start Treatment'}
              {fabric.status === 'in-base-treatment' && 'Complete Base Treatment'}
              {fabric.status === 'pending-surface-treatment' && 'Start Surface Treatment'}
              {fabric.status === 'in-surface-treatment' && 'Complete Surface Treatment'}
            </Button>
          )}
        </div>
      )}
      
      {/* Basic Info Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Fabric Information</h3>
        
        {!isEditing && (
          <>
            <div className="space-y-2">
              <Label>Collection *</Label>
              <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                <SelectTrigger>
                  <SelectValue placeholder="Select collection" />
                </SelectTrigger>
                <SelectContent>
                  {collectionOptions.map((col) => (
                    <SelectItem key={col.id} value={col.id}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${col.lineColor}`} />
                        {col.lineName} - {col.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Component Type *</Label>
              <Select value={componentType} onValueChange={(v) => setComponentType(v as ComponentType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(COMPONENT_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}
        
        {isEditing && (
          <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-lg">
            <div>
              <p className="text-xs text-muted-foreground">Collection</p>
              <p className="font-medium">{fabric.collectionName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Component</p>
              <p className="font-medium">{COMPONENT_TYPE_LABELS[fabric.componentType]}</p>
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <Label>Select from Library</Label>
          <Select onValueChange={handleLibrarySelect}>
            <SelectTrigger>
              <SelectValue placeholder="Or choose from fabric library..." />
            </SelectTrigger>
            <SelectContent>
              {baseFabricLibrary.map((fab) => (
                <SelectItem key={fab.id} value={fab.id}>
                  {fab.name} ({fab.defaultComposition})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Fabric Name *</Label>
            <Input 
              value={fabricName} 
              onChange={(e) => setFabricName(e.target.value)}
              placeholder="e.g., Slub Cotton Lawn"
            />
          </div>
          <div className="space-y-2">
            <Label>Composition *</Label>
            <Input 
              value={fabricComposition} 
              onChange={(e) => setFabricComposition(e.target.value)}
              placeholder="e.g., 100% Cotton"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Fabric Type *</Label>
            <Select value={fabricType} onValueChange={(v) => setFabricType(v as FabricType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(FABRIC_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Fabric Deadline</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !fabricDeadline && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {fabricDeadline ? format(fabricDeadline, "PPP") : "Set deadline"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={fabricDeadline}
                  onSelect={setFabricDeadline}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
      
      <Separator />
      
      {/* Treatment Plan Section - Only for greige/solid-dyed */}
      {needsTreatmentPlan && !isReadyForInduction && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Base Treatment Plan</h3>
          
          <div className="space-y-2">
            <Label>Treatment Type</Label>
            <Select value={baseTreatmentType} onValueChange={(v) => setBaseTreatmentType(v as BaseTreatmentType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (Ready as is)</SelectItem>
                <SelectItem value="dyeing">Dyeing</SelectItem>
                <SelectItem value="printing">Printing</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {baseTreatmentType === 'dyeing' && (
            <div className="space-y-2">
              <Label>Dye Plan</Label>
              <Textarea 
                value={dyePlan}
                onChange={(e) => setDyePlan(e.target.value)}
                placeholder="Describe the dye color, lot specifications, etc."
                rows={3}
              />
            </div>
          )}
          
          {baseTreatmentType === 'printing' && (
            <>
              <div className="space-y-2">
                <Label>Print Type</Label>
                <Select value={printType} onValueChange={(v) => setPrintType(v as PrintType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="digital">Digital Print</SelectItem>
                    <SelectItem value="rotary">Rotary Print</SelectItem>
                    <SelectItem value="sublimation">Sublimation</SelectItem>
                    <SelectItem value="base-screen">Base Screen Print</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Print Plan</Label>
                <Textarea 
                  value={printPlan}
                  onChange={(e) => setPrintPlan(e.target.value)}
                  placeholder="Describe the print design, repeat, colors, etc."
                  rows={3}
                />
              </div>
            </>
          )}
        </div>
      )}
      
      {/* Artwork Section - Only for jacquard/dobby/yarn-dyed */}
      {needsArtwork && !isReadyForInduction && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Artwork Submission</h3>
          <p className="text-sm text-muted-foreground">
            {FABRIC_TYPE_LABELS[fabricType]} fabrics require artwork submission before production.
          </p>
          
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Artwork upload will be available after fabric is created
            </p>
          </div>
        </div>
      )}
      
      {/* Surface Treatments */}
      {!isReadyForInduction && (
        <>
          <Separator />
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Pre-Cut Surface Treatments</h3>
            <p className="text-sm text-muted-foreground">
              Select any surface treatments needed before cutting
            </p>
            
            <div className="grid grid-cols-3 gap-3">
              {(Object.entries(SURFACE_TREATMENT_LABELS) as [SurfaceTreatment, string][]).map(([key, label]) => (
                <div
                  key={key}
                  className={cn(
                    "flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors",
                    surfaceTreatments.includes(key)
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-muted/50"
                  )}
                  onClick={() => toggleSurfaceTreatment(key)}
                >
                  <Checkbox checked={surfaceTreatments.includes(key)} />
                  <span className="text-sm">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      
      {/* Technical Specifications - Only for induction */}
      {isReadyForInduction && (
        <>
          <Separator />
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Technical Specifications</h3>
            <p className="text-sm text-muted-foreground">
              Enter the technical details for this fabric. These will be auto-fetched in tech packs.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Construction *</Label>
                <Select value={construction} onValueChange={setConstruction}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select construction" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONSTRUCTION_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Fabric Width *</Label>
                <Select value={fabricWidth} onValueChange={setFabricWidth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select width" />
                  </SelectTrigger>
                  <SelectContent>
                    {WIDTH_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>GSM (optional)</Label>
                <Input 
                  type="number"
                  value={gsm}
                  onChange={(e) => setGsm(e.target.value)}
                  placeholder="e.g., 120"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Cost per Meter (PKR) *</Label>
                <Input 
                  type="number"
                  value={costPerMeter}
                  onChange={(e) => setCostPerMeter(e.target.value)}
                  placeholder="e.g., 850"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Shrinkage Margin *</Label>
                <Input 
                  value={shrinkageMargin}
                  onChange={(e) => setShrinkageMargin(e.target.value)}
                  placeholder="e.g., 3-5%"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Stitching Specifications *</Label>
              <Textarea 
                value={stitchingSpecs}
                onChange={(e) => setStitchingSpecs(e.target.value)}
                placeholder="e.g., Use size 11 needle, 3mm stitch length, ballpoint for knits"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Care Instructions (optional)</Label>
              <Textarea 
                value={careInstructions}
                onChange={(e) => setCareInstructions(e.target.value)}
                placeholder="e.g., Machine wash cold, tumble dry low, do not bleach"
                rows={2}
              />
            </div>
          </div>
        </>
      )}
      
      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit}>
          {isReadyForInduction ? 'Induct Fabric' : isEditing ? 'Update Fabric' : 'Add Fabric'}
        </Button>
      </div>
    </div>
  );
};
