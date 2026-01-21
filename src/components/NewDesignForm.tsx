import { useState, useRef, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { TechpackPreview } from '@/components/TechpackPreview';
import { useCapsuleStore, CategoryDesigns } from '@/data/capsuleCollectionData';
import { useDesignStore, Design } from '@/data/designStore';
import { useFabricStore, FabricEntry, PrintClassification, IroningInstruction } from '@/data/fabricStore';
import { useSilhouetteStore } from '@/data/silhouetteStore';
import {
  silhouetteLibrary,
  necklineLibrary,
  sleeveLibrary,
  seamFinishLibrary,
  fabricLibrary,
} from '@/data/libraryData';
import { toast } from 'sonner';
import { ChevronRight, ChevronLeft, Zap, Download, AlertCircle, CheckCircle2, IndianRupee, Calculator } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

type DesignCategory = 'onePiece' | 'twoPiece' | 'threePiece' | 'dupattas' | 'lowers';

const CATEGORY_LABELS: Record<DesignCategory, string> = {
  onePiece: '1-Piece',
  twoPiece: '2-Piece',
  threePiece: '3-Piece',
  dupattas: 'Dupattas',
  lowers: 'Lowers',
};

interface NewDesignFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = 1 | 2 | 3;

export const NewDesignForm = ({ open, onOpenChange }: NewDesignFormProps) => {
  const capsules = useCapsuleStore((state) => state.capsules);
  const capsuleList = Object.values(capsules);
  const { addDesign, getDesignCountByCategory } = useDesignStore();
  const { getFabricsByCollection, getFabricById } = useFabricStore();
  const { getApprovedSilhouettes, calculateSilhouetteCost, getSilhouetteById } = useSilhouetteStore();
  
  const [step, setStep] = useState<Step>(1);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DesignCategory | ''>('');
  const [selectedSilhouette, setSelectedSilhouette] = useState('');
  const [selectedFabric, setSelectedFabric] = useState('');
  const [selectedInductedFabric, setSelectedInductedFabric] = useState<FabricEntry | null>(null);
  const [isCustom, setIsCustom] = useState(false);
  const [selectedNeckline, setSelectedNeckline] = useState('');
  const [selectedSleeve, setSelectedSleeve] = useState('');
  const [selectedSeamFinish, setSelectedSeamFinish] = useState('');
  const [sampleType, setSampleType] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [fastTrack, setFastTrack] = useState(false);
  const [fastTrackReason, setFastTrackReason] = useState('');
  const [selectedProcesses, setSelectedProcesses] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const techpackRef = useRef<HTMLDivElement>(null);

  // Get approved silhouettes from the store
  const approvedSilhouettes = getApprovedSilhouettes();

  // Get inducted fabrics for selected collection
  const inductedFabrics = useMemo(() => {
    if (!selectedCollection) return [];
    return getFabricsByCollection(selectedCollection).filter(f => f.status === 'inducted');
  }, [selectedCollection, getFabricsByCollection]);

  // Calculate cost when silhouette and fabric are selected
  const selectedSilhouetteData = getSilhouetteById(selectedSilhouette);
  const costCalculation = useMemo(() => {
    if (!selectedSilhouette || !selectedInductedFabric?.technicalSpecs?.costPerMeter) return null;
    return calculateSilhouetteCost(selectedSilhouette, selectedInductedFabric.technicalSpecs.costPerMeter);
  }, [selectedSilhouette, selectedInductedFabric, calculateSilhouetteCost]);

  // Fallback: Calculate cost using the silhouette's linked fabric if no inducted fabric is selected
  const linkedFabricCost = useMemo(() => {
    if (!selectedSilhouetteData?.linkedFabricId || selectedInductedFabric) return null;
    const linkedFabric = getFabricById(selectedSilhouetteData.linkedFabricId);
    if (!linkedFabric?.technicalSpecs?.costPerMeter) return null;
    return calculateSilhouetteCost(selectedSilhouette, linkedFabric.technicalSpecs.costPerMeter);
  }, [selectedSilhouetteData, selectedInductedFabric, getFabricById, calculateSilhouetteCost, selectedSilhouette]);

  const displayCost = costCalculation || linkedFabricCost;

  // Get current collection's category limits and usage
  const selectedCapsule = capsules[selectedCollection];
  const currentDesignCounts = useMemo(() => {
    if (!selectedCollection) return null;
    return getDesignCountByCategory(selectedCollection);
  }, [selectedCollection, getDesignCountByCategory]);

  const categoryLimits = selectedCapsule?.categoryDesigns;

  // Calculate remaining capacity for each category
  const getCategoryCapacity = (category: DesignCategory): { used: number; limit: number; remaining: number } => {
    if (!categoryLimits || !currentDesignCounts) {
      return { used: 0, limit: 0, remaining: 0 };
    }
    const limit = categoryLimits[category] || 0;
    const used = currentDesignCounts[category] || 0;
    return { used, limit, remaining: Math.max(0, limit - used) };
  };

  // Check if a category has available capacity
  const isCategoryAvailable = (category: DesignCategory): boolean => {
    const { remaining } = getCategoryCapacity(category);
    return remaining > 0;
  };

  const availableProcesses = [
    { id: 'multihead', label: 'Multihead' },
    { id: 'pakki', label: 'Pakki' },
    { id: 'adda', label: 'Adda' },
    { id: 'block-print', label: 'Block Print' },
    { id: 'digital-print', label: 'Digital Print' },
    { id: 'screen-print', label: 'Screen Print' },
  ];

  const toggleProcess = (processId: string) => {
    setSelectedProcesses(prev => 
      prev.includes(processId)
        ? prev.filter(p => p !== processId)
        : [...prev, processId]
    );
  };

  const validateStep = (currentStep: Step): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!selectedCollection) newErrors.collection = 'Collection is required';
      if (!selectedCategory) newErrors.category = 'Design category is required';
      if (selectedCategory && !isCategoryAvailable(selectedCategory)) {
        newErrors.category = `${CATEGORY_LABELS[selectedCategory]} category has reached its limit`;
      }
      if (!selectedSilhouette) newErrors.silhouette = 'Silhouette is required';
      if (!selectedFabric) newErrors.fabric = 'Base fabric is required';
    }

    if (currentStep === 2 && isCustom) {
      if (!selectedNeckline) newErrors.neckline = 'Neckline is required for custom modifications';
      if (!selectedSleeve) newErrors.sleeve = 'Sleeve is required for custom modifications';
      if (!selectedSeamFinish) newErrors.seamFinish = 'Seam finish is required for custom modifications';
    }

    if (currentStep === 3) {
      if (!sampleType) newErrors.sampleType = 'Sample type is required';
      if (fastTrack && !fastTrackReason.trim()) {
        newErrors.fastTrackReason = 'Fast track reason is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(step)) {
      toast.error('Please complete all required fields');
      return;
    }
    if (step < 3) setStep((step + 1) as Step);
  };

  const handleBack = () => {
    if (step > 1) setStep((step - 1) as Step);
  };

  const handleDownloadPdf = async () => {
    if (!techpackRef.current) return;

    setIsGeneratingPdf(true);
    try {
      const canvas = await html2canvas(techpackRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`techpack-${selectedCollection}-${Date.now()}.pdf`);

      toast.success('PDF Downloaded Successfully');
    } catch (error) {
      toast.error('Failed to generate PDF');
      console.error('PDF generation error:', error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleSubmit = () => {
    if (!validateStep(3)) {
      toast.error('Please complete all required fields');
      return;
    }

    // Create and store the design
    const designId = `design-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newDesign: Design = {
      id: designId,
      collectionId: selectedCollection,
      silhouetteId: selectedSilhouette,
      fabricId: selectedFabric,
      inductedFabricId: selectedInductedFabric?.id,
      category: selectedCategory as DesignCategory,
      processes: selectedProcesses,
      isCustom,
      neckline: isCustom ? selectedNeckline : undefined,
      sleeve: isCustom ? selectedSleeve : undefined,
      seamFinish: isCustom ? selectedSeamFinish : undefined,
      sampleType,
      fastTrack,
      fastTrackReason: fastTrack ? fastTrackReason : undefined,
      additionalNotes: additionalNotes || undefined,
      createdAt: new Date(),
      status: 'pending',
    };

    addDesign(newDesign);

    const capsule = capsules[selectedCollection];
    const categoryLabel = CATEGORY_LABELS[selectedCategory as DesignCategory];
    
    toast.success('Design Submitted Successfully', {
      description: `${categoryLabel} design added to ${capsule?.collectionName}`,
    });
    
    onOpenChange(false);
    // Reset form
    setStep(1);
    setSelectedCollection('');
    setSelectedCategory('');
    setSelectedSilhouette('');
    setSelectedFabric('');
    setSelectedInductedFabric(null);
    setIsCustom(false);
    setSelectedNeckline('');
    setSelectedSleeve('');
    setSelectedSeamFinish('');
    setSampleType('');
    setAdditionalNotes('');
    setFastTrack(false);
    setFastTrackReason('');
    setSelectedProcesses([]);
    setErrors({});
    setAdditionalNotes('');
    setFastTrack(false);
    setFastTrackReason('');
    setSelectedProcesses([]);
    setErrors({});
  };

  // For TechpackPreview compatibility with library format
  const selectedSilhouetteForPreview = selectedSilhouetteData ? {
    id: selectedSilhouetteData.id,
    code: selectedSilhouetteData.code,
    name: selectedSilhouetteData.name,
    category: selectedSilhouetteData.category,
    technicalDrawing: selectedSilhouetteData.technicalDrawing,
  } : silhouetteLibrary.find(s => s.id === selectedSilhouette);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">New Design Submission</DialogTitle>
          <div className="flex gap-2 mt-4">
            <Badge variant={step === 1 ? 'default' : 'secondary'}>
              Step 1: Selection
            </Badge>
            <Badge variant={step === 2 ? 'default' : 'secondary'}>
              Step 2: Customization
            </Badge>
            <Badge variant={step === 3 ? 'default' : 'secondary'}>
              Step 3: Demand & Submission
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Step 1: Collection and Silhouette Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="collection">Collection *</Label>
                <Select
                  value={selectedCollection}
                  onValueChange={(value) => {
                    setSelectedCollection(value);
                    setErrors((prev) => ({ ...prev, collection: '' }));
                  }}
                >
                  <SelectTrigger id="collection" className={errors.collection ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select collection" />
                  </SelectTrigger>
                  <SelectContent>
                    {capsuleList.map((capsule) => (
                      <SelectItem key={capsule.id} value={capsule.id}>
                        {capsule.lineName} - {capsule.collectionName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.collection && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.collection}
                  </p>
                )}
              </div>

              {/* Design Category Selection with Capacity Display */}
              {selectedCollection && (
                <div className="space-y-3">
                  <Label>Design Category *</Label>
                  <p className="text-sm text-muted-foreground">
                    Select the category for this design. Available slots are based on collection plan.
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {(Object.keys(CATEGORY_LABELS) as DesignCategory[]).map((category) => {
                      const { used, limit, remaining } = getCategoryCapacity(category);
                      const isAvailable = remaining > 0;
                      const isSelected = selectedCategory === category;
                      const progressPercent = limit > 0 ? (used / limit) * 100 : 0;
                      
                      // Skip categories with 0 limit
                      if (limit === 0) return null;
                      
                      return (
                        <button
                          key={category}
                          type="button"
                          disabled={!isAvailable}
                          onClick={() => {
                            setSelectedCategory(category);
                            setErrors((prev) => ({ ...prev, category: '' }));
                          }}
                          className={`relative p-3 border rounded-lg transition-all text-left ${
                            isSelected
                              ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                              : isAvailable
                                ? 'border-border bg-card/50 hover:border-primary/50'
                                : 'border-border bg-muted/30 opacity-60 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{CATEGORY_LABELS[category]}</span>
                            {isSelected && (
                              <CheckCircle2 className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          
                          <div className="space-y-1">
                            <Progress value={progressPercent} className="h-1.5" />
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">{used} / {limit}</span>
                              <span className={remaining > 0 ? 'text-primary' : 'text-destructive'}>
                                {remaining} left
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  
                  {errors.category && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.category}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label>Silhouette * (Approved Only)</Label>
                <p className="text-sm text-muted-foreground">
                  Select from approved silhouettes with production-ready costing
                </p>
                {errors.silhouette && (
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">{errors.silhouette}</AlertDescription>
                  </Alert>
                )}
                {approvedSilhouettes.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No approved silhouettes available. Please approve silhouettes in the Sampling module first.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {approvedSilhouettes.map((silhouette) => (
                      <button
                        key={silhouette.id}
                        type="button"
                        onClick={() => {
                          setSelectedSilhouette(silhouette.id);
                          setErrors((prev) => ({ ...prev, silhouette: '' }));
                        }}
                        className={`relative p-4 border rounded-lg transition-all hover:border-primary ${
                          selectedSilhouette === silhouette.id
                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                            : 'border-border bg-card/50'
                        }`}
                      >
                        <div className="aspect-square mb-3 flex items-center justify-center bg-background/50 rounded">
                          {silhouette.technicalDrawing && (
                            <img
                              src={silhouette.technicalDrawing}
                              alt={silhouette.name}
                              className="w-full h-full object-contain p-2"
                            />
                          )}
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-mono text-muted-foreground mb-1">
                            {silhouette.code}
                          </p>
                          <p className="text-sm font-medium text-foreground">
                            {silhouette.name}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize mt-1">
                            {silhouette.category}
                          </p>
                          {silhouette.fabricConsumption && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {silhouette.fabricConsumption}m fabric
                            </p>
                          )}
                        </div>
                        {selectedSilhouette === silhouette.id && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                            <svg
                              className="w-3 h-3 text-primary-foreground"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Cost Display Panel */}
                {selectedSilhouette && selectedSilhouetteData && (
                  <div className="mt-4 p-4 border border-border rounded-lg bg-card/50 space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Calculator className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm">Cost Breakdown</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Fabric Consumption</p>
                        <p className="font-medium">{selectedSilhouetteData.fabricConsumption || '–'} meters</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Stitching Cost</p>
                        <p className="font-medium flex items-center">
                          <IndianRupee className="h-3 w-3" />
                          {selectedSilhouetteData.stitchingCost?.toLocaleString() || '–'}
                        </p>
                      </div>
                    </div>

                    {displayCost ? (
                      <div className="pt-3 border-t border-border space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Fabric Cost</span>
                          <span className="font-medium flex items-center">
                            <IndianRupee className="h-3 w-3" />
                            {displayCost.fabricCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Stitching Cost</span>
                          <span className="font-medium flex items-center">
                            <IndianRupee className="h-3 w-3" />
                            {displayCost.stitchingCost.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-border">
                          <span className="text-sm font-medium">Total Cost</span>
                          <span className="font-bold flex items-center text-primary">
                            <IndianRupee className="h-3.5 w-3.5" />
                            {displayCost.totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </span>
                        </div>
                        <div className="flex justify-between items-center bg-primary/10 p-2 rounded-md">
                          <span className="text-sm font-medium">Predicted Selling Price (3.2x)</span>
                          <span className="font-bold flex items-center text-primary">
                            <IndianRupee className="h-3.5 w-3.5" />
                            {displayCost.predictedSellingPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-3 border-t border-border">
                        <p className="text-xs text-muted-foreground italic">
                          {selectedInductedFabric 
                            ? "Cost data unavailable for this silhouette" 
                            : "Select an inducted fabric below to see full cost calculation"}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fabric">Base Fabric *</Label>
                <Select
                  value={selectedFabric}
                  onValueChange={(value) => {
                    setSelectedFabric(value);
                    setErrors((prev) => ({ ...prev, fabric: '' }));
                  }}
                >
                  <SelectTrigger id="fabric" className={errors.fabric ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select base fabric" />
                  </SelectTrigger>
                  <SelectContent>
                    {fabricLibrary.map((fabric) => (
                      <SelectItem key={fabric.id} value={fabric.id}>
                        {fabric.name} - {fabric.composition}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.fabric && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.fabric}
                  </p>
                )}
              </div>

              {/* Inducted Fabric Selection (optional - for enhanced specs) */}
              {inductedFabrics.length > 0 && (
                <div className="space-y-2">
                  <Label>Link Inducted Fabric (Optional)</Label>
                  <p className="text-sm text-muted-foreground">
                    Select an inducted fabric to include its color, print classification, and care specs in the techpack
                  </p>
                  <Select
                    value={selectedInductedFabric?.id || ''}
                    onValueChange={(value) => {
                      const fabric = inductedFabrics.find(f => f.id === value);
                      setSelectedInductedFabric(fabric || null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select inducted fabric (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {inductedFabrics.map((fabric) => (
                        <SelectItem key={fabric.id} value={fabric.id}>
                          {fabric.fabricName} - {fabric.componentType}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Production Processes</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Select applicable embellishment and printing processes
                </p>
                <div className="flex flex-wrap gap-2">
                  {availableProcesses.map((process) => (
                    <Badge
                      key={process.id}
                      variant={selectedProcesses.includes(process.id) ? 'default' : 'outline'}
                      className="cursor-pointer px-4 py-2 text-sm transition-all hover:scale-105"
                      onClick={() => toggleProcess(process.id)}
                    >
                      {process.label}
                      {selectedProcesses.includes(process.id) && (
                        <span className="ml-2">✓</span>
                      )}
                    </Badge>
                  ))}
                </div>
                {selectedProcesses.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {selectedProcesses.length} process(es) selected
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Specifying Changes and Customization */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-card/50">
                <div className="space-y-1">
                  <Label htmlFor="custom-toggle" className="text-base">
                    Custom Modifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Enable to specify custom changes to the silhouette
                  </p>
                </div>
                <Switch
                  id="custom-toggle"
                  checked={isCustom}
                  onCheckedChange={setIsCustom}
                />
              </div>

              {isCustom && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="neckline">Neckline *</Label>
                    <Select
                      value={selectedNeckline}
                      onValueChange={(value) => {
                        setSelectedNeckline(value);
                        setErrors((prev) => ({ ...prev, neckline: '' }));
                      }}
                    >
                      <SelectTrigger id="neckline" className={errors.neckline ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select neckline" />
                      </SelectTrigger>
                      <SelectContent>
                        {necklineLibrary.map((neckline) => (
                          <SelectItem key={neckline.id} value={neckline.id}>
                            {neckline.code} - {neckline.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.neckline && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.neckline}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sleeve">Sleeve *</Label>
                    <Select
                      value={selectedSleeve}
                      onValueChange={(value) => {
                        setSelectedSleeve(value);
                        setErrors((prev) => ({ ...prev, sleeve: '' }));
                      }}
                    >
                      <SelectTrigger id="sleeve" className={errors.sleeve ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select sleeve" />
                      </SelectTrigger>
                      <SelectContent>
                        {sleeveLibrary.map((sleeve) => (
                          <SelectItem key={sleeve.id} value={sleeve.id}>
                            {sleeve.code} - {sleeve.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.sleeve && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.sleeve}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="seam">Seam Finish Type *</Label>
                    <Select
                      value={selectedSeamFinish}
                      onValueChange={(value) => {
                        setSelectedSeamFinish(value);
                        setErrors((prev) => ({ ...prev, seamFinish: '' }));
                      }}
                    >
                      <SelectTrigger id="seam" className={errors.seamFinish ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select seam finish" />
                      </SelectTrigger>
                      <SelectContent>
                        {seamFinishLibrary.map((seam) => (
                          <SelectItem key={seam.id} value={seam.id}>
                            {seam.name} - {seam.type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.seamFinish && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.seamFinish}
                      </p>
                    )}
                  </div>
                </>
              )}

              {!isCustom && (
                <div className="p-4 border border-border rounded-lg bg-card/50 text-center">
                  <p className="text-sm text-muted-foreground">
                    Using standard silhouette specifications
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Generating Demand and Techpack Submission */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Sample Type Demand *</Label>
                {errors.sampleType && (
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">{errors.sampleType}</AlertDescription>
                  </Alert>
                )}
                <RadioGroup
                  value={sampleType}
                  onValueChange={(value) => {
                    setSampleType(value);
                    setErrors((prev) => ({ ...prev, sampleType: '' }));
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="butter-paper" id="butter-paper" />
                    <Label htmlFor="butter-paper" className="font-normal cursor-pointer">
                      Butter Paper Pattern
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="semi-stitched" id="semi-stitched" />
                    <Label htmlFor="semi-stitched" className="font-normal cursor-pointer">
                      Semi Stitched Sample
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fully-stitched" id="fully-stitched" />
                    <Label htmlFor="fully-stitched" className="font-normal cursor-pointer">
                      Fully Stitched Sample
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Instructions (Roman Urdu)</Label>
                <Textarea
                  id="notes"
                  placeholder="Specify any additional changes or instructions..."
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-4 p-4 border border-border rounded-lg bg-card/50">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-[hsl(var(--status-delayed))]" />
                      <Label htmlFor="fast-track" className="text-base">
                        Emergency Fast Track
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Request director approval for expedited processing
                    </p>
                  </div>
                  <Switch
                    id="fast-track"
                    checked={fastTrack}
                    onCheckedChange={setFastTrack}
                  />
                </div>

                {fastTrack && (
                  <div className="space-y-2 pt-2">
                    <Label htmlFor="fast-track-reason">Fast Track Reason *</Label>
                    <Textarea
                      id="fast-track-reason"
                      placeholder="Explain why this design needs fast track approval..."
                      value={fastTrackReason}
                      onChange={(e) => {
                        setFastTrackReason(e.target.value);
                        setErrors((prev) => ({ ...prev, fastTrackReason: '' }));
                      }}
                      rows={3}
                      className={errors.fastTrackReason ? 'border-destructive' : ''}
                    />
                    {errors.fastTrackReason && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.fastTrackReason}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-lg">Techpack Preview</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadPdf}
                    disabled={isGeneratingPdf || !selectedCollection || !selectedSilhouette || !selectedFabric}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isGeneratingPdf ? 'Generating...' : 'Download PDF'}
                  </Button>
                </div>

                <div className="max-h-[500px] overflow-y-auto border border-border rounded-lg">
                  <TechpackPreview
                    ref={techpackRef}
                    selectedCollection={selectedCollection}
                    selectedSilhouette={selectedSilhouette}
                    selectedFabric={selectedFabric}
                    selectedProcesses={selectedProcesses}
                    isCustom={isCustom}
                    selectedNeckline={selectedNeckline}
                    selectedSleeve={selectedSleeve}
                    selectedSeamFinish={selectedSeamFinish}
                    sampleType={sampleType}
                    additionalNotes={additionalNotes}
                    fastTrack={fastTrack}
                    fastTrackReason={fastTrackReason}
                    // Enhanced fabric specs from inducted fabric
                    colorId={selectedInductedFabric?.colorId}
                    printClassification={selectedInductedFabric?.printClassification}
                    recommendedSPI={selectedInductedFabric?.technicalSpecs?.recommendedSPI}
                    ironingInstructions={selectedInductedFabric?.technicalSpecs?.ironingInstructions}
                    handlingNotes={selectedInductedFabric?.technicalSpecs?.handlingNotes}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {step < 3 ? (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit}>
              Submit Techpack & Generate Demand
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
