import { useState, useEffect, useRef } from 'react';
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { CalendarIcon, Upload, FileText, Tag, Image, X, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  IroningInstruction,
  PrintCategory,
  PrintColorScheme,
  PrintScale,
  PrintClassification,
  getInitialStatus,
  FABRIC_TYPE_LABELS,
  PRINT_TYPE_LABELS,
  SURFACE_TREATMENT_LABELS,
  COMPONENT_TYPE_LABELS,
  FABRIC_STATUS_CONFIG,
  IRONING_INSTRUCTION_LABELS,
  PRINT_CATEGORY_LABELS,
  PRINT_COLOR_SCHEME_LABELS,
  PRINT_SCALE_LABELS,
  TechnicalSpecs,
} from '@/data/fabricStore';
import { baseFabricLibrary } from '@/data/libraryData';
import { useCapsuleStore } from '@/data/capsuleCollectionData';
import { ColorSelector } from '@/components/ColorSelector';
import { ColorPaletteManager } from '@/components/ColorPaletteManager';
import { useColorPaletteStore } from '@/data/colorPaletteStore';

interface FabricInductionFormProps {
  fabric?: FabricEntry;
  onClose: () => void;
  defaultCollectionId?: string;
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

interface CareLabelArtwork {
  id: string;
  fileName: string;
  dataUrl: string;
  uploadedAt: string;
  notes: string;
}

export const FabricInductionForm = ({ fabric, onClose, defaultCollectionId }: FabricInductionFormProps) => {
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
  const [selectedCollection, setSelectedCollection] = useState(fabric?.collectionId || defaultCollectionId || '');
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
  
  // Care & handling
  const [recommendedSPI, setRecommendedSPI] = useState(fabric?.technicalSpecs?.recommendedSPI?.toString() || '');
  const [ironingInstructions, setIroningInstructions] = useState<IroningInstruction | ''>(
    fabric?.technicalSpecs?.ironingInstructions || ''
  );
  const [handlingNotes, setHandlingNotes] = useState(fabric?.technicalSpecs?.handlingNotes || '');
  
  // Color selection
  const [selectedColorId, setSelectedColorId] = useState<string | undefined>(fabric?.colorId);
  const [showColorManager, setShowColorManager] = useState(false);
  const { getColorById } = useColorPaletteStore();
  
  // Print classification
  const [printCategory, setPrintCategory] = useState<PrintCategory | ''>(
    fabric?.printClassification?.category || ''
  );
  const [printColorScheme, setPrintColorScheme] = useState<PrintColorScheme | ''>(
    fabric?.printClassification?.colorScheme || ''
  );
  const [printScale, setPrintScale] = useState<PrintScale | ''>(
    fabric?.printClassification?.scale || ''
  );

  // Care Label Artwork state (local, stored as data URLs)
  const [careLabelArtworks, setCareLabelArtworks] = useState<CareLabelArtwork[]>([]);
  const [careLabelNotes, setCareLabelNotes] = useState('');
  const [careLabelDragOver, setCareLabelDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
  
  const collectionOptions = Object.values(capsules).flat().map((c) => ({
    id: c.id,
    name: c.collectionName,
    lineId: c.lineId,
    lineName: c.lineName,
    lineColor: lineColors[c.lineId] || 'bg-gray-500',
  }));
  
  const selectedCollectionData = collectionOptions.find((c) => c.id === selectedCollection);
  
  useEffect(() => {
    if (fabricType === 'jacquard' || fabricType === 'dobby' || fabricType === 'yarn-dyed') {
      setBaseTreatmentType('none');
    }
  }, [fabricType]);
  
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

  // Care Label Artwork handlers
  const processFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        toast.error(`${file.name} is not a supported file type`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setCareLabelArtworks((prev) => [...prev, {
          id: crypto.randomUUID(),
          fileName: file.name,
          dataUrl,
          uploadedAt: new Date().toISOString(),
          notes: '',
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    // Reset so same file can be re-selected
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setCareLabelDragOver(false);
    processFiles(e.dataTransfer.files);
  };

  const handleRemoveArtwork = (id: string) => {
    setCareLabelArtworks((prev) => prev.filter((a) => a.id !== id));
  };

  const handleArtworkNoteChange = (id: string, note: string) => {
    setCareLabelArtworks((prev) => prev.map((a) => a.id === id ? { ...a, notes: note } : a));
  };
  
  const handleSubmit = () => {
    if (!selectedCollection || !fabricName || !fabricComposition) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (isReadyForInduction) {
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
        recommendedSPI: recommendedSPI ? parseInt(recommendedSPI) : undefined,
        ironingInstructions: ironingInstructions || undefined,
        handlingNotes: handlingNotes || undefined,
      };
      
      inductFabric(fabric!.id, specs);
      toast.success('Fabric inducted successfully!');
      onClose();
      return;
    }
    
    const partialSpecs = {
      recommendedSPI: recommendedSPI ? parseInt(recommendedSPI) : undefined,
      ironingInstructions: ironingInstructions || undefined,
      handlingNotes: handlingNotes || undefined,
    };
    
    if (isEditing) {
      const printClassification: PrintClassification | undefined = 
        (baseTreatmentType === 'printing' && printCategory && printColorScheme && printScale)
          ? { category: printCategory as PrintCategory, colorScheme: printColorScheme as PrintColorScheme, scale: printScale as PrintScale }
          : undefined;
      
      const mergedSpecs = fabric?.technicalSpecs 
        ? { ...fabric.technicalSpecs, ...partialSpecs }
        : (partialSpecs.recommendedSPI || partialSpecs.ironingInstructions || partialSpecs.handlingNotes)
          ? partialSpecs as any
          : undefined;
      
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
        colorId: selectedColorId,
        printClassification,
        technicalSpecs: mergedSpecs,
      });
      toast.success('Fabric updated successfully!');
    } else {
      const collection = collectionOptions.find((c) => c.id === selectedCollection);
      if (!collection) {
        toast.error('Please select a collection');
        return;
      }
      
      const status = getInitialStatus(fabricType, baseTreatmentType);
      
      const printClassification: PrintClassification | undefined = 
        (baseTreatmentType === 'printing' && printCategory && printColorScheme && printScale)
          ? { category: printCategory as PrintCategory, colorScheme: printColorScheme as PrintColorScheme, scale: printScale as PrintScale }
          : undefined;
      
      const initialSpecs = (partialSpecs.recommendedSPI || partialSpecs.ironingInstructions || partialSpecs.handlingNotes)
        ? partialSpecs as any
        : undefined;
      
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
        colorId: selectedColorId,
        status,
        artworkSubmitted: false,
        baseTreatmentType,
        printType: baseTreatmentType === 'printing' ? printType : undefined,
        dyePlan: baseTreatmentType === 'dyeing' ? dyePlan : undefined,
        printPlan: baseTreatmentType === 'printing' ? printPlan : undefined,
        printClassification,
        baseTreatmentComplete: baseTreatmentType === 'none' && !['jacquard', 'dobby', 'yarn-dyed'].includes(fabricType),
        surfaceTreatments,
        surfaceTreatmentComplete: surfaceTreatments.length === 0,
        fabricDeadline,
        technicalSpecs: initialSpecs,
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
    <div className="space-y-4">
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

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="details" className="gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            Details
          </TabsTrigger>
          <TabsTrigger value="treatment" className="gap-1.5">
            <Tag className="h-3.5 w-3.5" />
            Treatment & Care
          </TabsTrigger>
          <TabsTrigger value="care-label" className="gap-1.5 relative">
            <Image className="h-3.5 w-3.5" />
            Care Label
            {careLabelArtworks.length > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-medium">
                {careLabelArtworks.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── TAB 1: Details ── */}
        <TabsContent value="details" className="mt-4 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold">Fabric Information</h3>
            
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

          {/* Technical Specifications - Only for induction */}
          {isReadyForInduction && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-base font-semibold">Technical Specifications</h3>
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
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Recommended SPI</Label>
                    <Input 
                      type="number"
                      value={recommendedSPI}
                      onChange={(e) => setRecommendedSPI(e.target.value)}
                      placeholder="e.g., 10-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ironing Instructions</Label>
                    <Select value={ironingInstructions} onValueChange={(v) => setIroningInstructions(v as IroningInstruction)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(IRONING_INSTRUCTION_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
                
                <div className="space-y-2">
                  <Label>Handling Notes (optional)</Label>
                  <Textarea 
                    value={handlingNotes}
                    onChange={(e) => setHandlingNotes(e.target.value)}
                    placeholder="e.g., Handle with care, avoid direct sunlight during storage"
                    rows={2}
                  />
                </div>
              </div>
            </>
          )}
        </TabsContent>

        {/* ── TAB 2: Treatment & Care ── */}
        <TabsContent value="treatment" className="mt-4 space-y-6">
          {/* Treatment Plan - Only for greige/solid-dyed */}
          {needsTreatmentPlan && !isReadyForInduction && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold">Base Treatment Plan</h3>
              
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
                  
                  <div className="p-4 rounded-lg border border-border bg-muted/30 space-y-4">
                    <h4 className="font-medium text-sm">Print Classification</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs">Category</Label>
                        <Select value={printCategory} onValueChange={(v) => setPrintCategory(v as PrintCategory)}>
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(PRINT_CATEGORY_LABELS).map(([key, label]) => (
                              <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Color Scheme</Label>
                        <Select value={printColorScheme} onValueChange={(v) => setPrintColorScheme(v as PrintColorScheme)}>
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(PRINT_COLOR_SCHEME_LABELS).map(([key, label]) => (
                              <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Scale</Label>
                        <Select value={printScale} onValueChange={(v) => setPrintScale(v as PrintScale)}>
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(PRINT_SCALE_LABELS).map(([key, label]) => (
                              <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Color Selection */}
          {!isReadyForInduction && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">Color Selection</h3>
                <ColorPaletteManager />
              </div>
              <div className="space-y-2">
                <Label>Internal Color</Label>
                <ColorSelector 
                  value={selectedColorId}
                  onChange={setSelectedColorId}
                />
              </div>
            </div>
          )}

          {/* Artwork Section */}
          {needsArtwork && !isReadyForInduction && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-base font-semibold">Artwork Submission</h3>
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
            </>
          )}

          {/* Surface Treatments */}
          {!isReadyForInduction && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-base font-semibold">Pre-Cut Surface Treatments</h3>
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

          {/* Care & Handling Specifications */}
          {!isReadyForInduction && (
            <>
              <Separator />
              <Card className="border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    Care & Handling Specifications
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">Optional - can be filled progressively</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="recommendedSPI">Recommended SPI (Stitches Per Inch)</Label>
                      <Input
                        id="recommendedSPI"
                        type="number"
                        placeholder="e.g., 12"
                        value={recommendedSPI}
                        onChange={(e) => setRecommendedSPI(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ironingInstructions">Ironing Instructions</Label>
                      <Select value={ironingInstructions} onValueChange={(v) => setIroningInstructions(v as IroningInstruction)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select ironing instructions" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(IRONING_INSTRUCTION_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="handlingNotes">Handling Notes</Label>
                      <Textarea
                        id="handlingNotes"
                        placeholder="Special handling instructions for this fabric..."
                        value={handlingNotes}
                        onChange={(e) => setHandlingNotes(e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* ── TAB 3: Care Label Artwork ── */}
        <TabsContent value="care-label" className="mt-4 space-y-6">
          <div className="space-y-2">
            <h3 className="text-base font-semibold">Care Label Artwork</h3>
            <p className="text-sm text-muted-foreground">
              Upload artwork files for the care label. Supports PNG, JPG, PDF and other image formats.
            </p>
          </div>

          {/* Drop zone */}
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
              careLabelDragOver
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-muted/30"
            )}
            onDragOver={(e) => { e.preventDefault(); setCareLabelDragOver(true); }}
            onDragLeave={() => setCareLabelDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm font-medium text-foreground">
              Drag & drop artwork files here
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              or click to browse — PNG, JPG, PDF supported
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              multiple
              className="hidden"
              onChange={handleFileInputChange}
            />
          </div>

          {/* Uploaded artworks */}
          {careLabelArtworks.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                {careLabelArtworks.length} file{careLabelArtworks.length > 1 ? 's' : ''} attached
              </h4>
              <div className="space-y-3">
                {careLabelArtworks.map((artwork) => (
                  <Card key={artwork.id} className="border-border">
                    <CardContent className="p-3">
                      <div className="flex gap-3">
                        {/* Preview */}
                        {artwork.dataUrl.startsWith('data:image') ? (
                          <div className="w-20 h-20 rounded-md border border-border overflow-hidden flex-shrink-0 bg-muted/30">
                            <img
                              src={artwork.dataUrl}
                              alt={artwork.fileName}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="w-20 h-20 rounded-md border border-border flex-shrink-0 bg-muted/30 flex items-center justify-center">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium truncate">{artwork.fileName}</p>
                              <p className="text-xs text-muted-foreground">
                                Added {format(new Date(artwork.uploadedAt), 'dd MMM yyyy, HH:mm')}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 flex-shrink-0 text-muted-foreground hover:text-destructive"
                              onClick={() => handleRemoveArtwork(artwork.id)}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          <Input
                            placeholder="Add a note for this file..."
                            value={artwork.notes}
                            onChange={(e) => handleArtworkNoteChange(artwork.id, e.target.value)}
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* General care label notes */}
          <div className="space-y-2">
            <Label>General Care Label Notes</Label>
            <Textarea
              placeholder="Any general instructions or notes about the care label artwork..."
              value={careLabelNotes}
              onChange={(e) => setCareLabelNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Care symbol guide */}
          <Card className="border-border bg-muted/20">
            <CardHeader className="pb-2 pt-3 px-4">
              <CardTitle className="text-sm text-muted-foreground">Common Care Symbols Reference</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-muted-foreground">
                <span>🫧 Machine wash cold</span>
                <span>🚫 Do not bleach</span>
                <span>🌡️ Warm iron only</span>
                <span>❌ Do not tumble dry</span>
                <span>♻️ Dry clean only</span>
                <span>💧 Hand wash only</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit}>
          {isReadyForInduction ? 'Induct Fabric' : isEditing ? 'Update Fabric' : 'Add Fabric'}
        </Button>
      </div>
    </div>
  );
};
