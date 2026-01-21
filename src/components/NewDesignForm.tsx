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
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TechpackPreview } from '@/components/TechpackPreview';
import { useCapsuleStore, CategoryDesigns, TwoPieceComposition } from '@/data/capsuleCollectionData';
import { useDesignStore, Design, ComponentSpec, TechpackAnnotations } from '@/data/designStore';
import { useFabricStore, FabricEntry, ComponentType as FabricComponentType } from '@/data/fabricStore';
import { useSilhouetteStore } from '@/data/silhouetteStore';
import { TrimApplication } from '@/data/trimsStore';
import { ClosureSpecification } from '@/data/accessoryStore';
import { ComponentSelector, ComponentConfig, ComponentType } from '@/components/design/ComponentSelector';
import { TrimSelector } from '@/components/design/TrimSelector';
import { ClosureSelector } from '@/components/design/ClosureSelector';
import { LiningConfigurator, LiningConfig, SlipConfig } from '@/components/design/LiningConfigurator';
import { TechpackCanvas } from '@/components/design/TechpackCanvas';
import { FabricBlockingPanel, FabricAssignment, FABRIC_COLORS } from '@/components/design/FabricBlockingPanel';
import {
  silhouetteLibrary,
  necklineLibrary,
  sleeveLibrary,
  seamFinishLibrary,
} from '@/data/libraryData';
import { toast } from 'sonner';
import { ChevronRight, ChevronLeft, Zap, Download, AlertCircle, CheckCircle2, IndianRupee, Calculator, Palette, PenTool } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

type DesignCategory = 'onePiece' | 'twoPiece' | 'threePiece' | 'dupattas' | 'lowers' | 'lehenga-set' | 'saree-set';

const CATEGORY_LABELS: Record<DesignCategory, string> = {
  onePiece: '1-Piece (Shirt/Kameez/Top)',
  twoPiece: '2-Piece',
  threePiece: '3-Piece',
  dupattas: 'Dupattas',
  lowers: 'Lowers',
  'lehenga-set': 'Lehenga Set',
  'saree-set': 'Saree Set',
};

const TWO_PIECE_LABELS: Record<TwoPieceComposition, string> = {
  'shirt-lowers': 'Shirt + Lowers/Trousers',
  'shirt-dupatta': 'Shirt + Dupatta',
};

interface NewDesignFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = 1 | 2 | 3 | 4;

const defaultLiningConfig: LiningConfig = {
  enabled: false,
  coverage: 'yoke',
  includeSleeves: false,
  finish: 'bound-edges',
};

const defaultSlipConfig: SlipConfig = {
  enabled: false,
};

const defaultComponentConfig: ComponentConfig = {
  silhouetteId: '',
  fabricId: '',
  inductedFabricId: undefined,
};

export const NewDesignForm = ({ open, onOpenChange }: NewDesignFormProps) => {
  const capsules = useCapsuleStore((state) => state.capsules);
  const capsuleList = Object.values(capsules);
  const { addDesign, getDesignCountByCategory } = useDesignStore();
  const { getFabricsByCollection, getFabricById } = useFabricStore();
  const { getApprovedSilhouettes, calculateSilhouetteCost, getSilhouetteById } = useSilhouetteStore();
  
  const [step, setStep] = useState<Step>(1);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DesignCategory | ''>('');
  const [selectedTwoPieceType, setSelectedTwoPieceType] = useState<TwoPieceComposition | ''>('');
  
  // Component configurations for multi-piece
  const [shirtConfig, setShirtConfig] = useState<ComponentConfig>(defaultComponentConfig);
  const [lowersConfig, setLowersConfig] = useState<ComponentConfig>(defaultComponentConfig);
  const [dupattaConfig, setDupattaConfig] = useState<ComponentConfig>(defaultComponentConfig);
  const [lehengaConfig, setLehengaConfig] = useState<ComponentConfig>(defaultComponentConfig);
  const [choliConfig, setCholiConfig] = useState<ComponentConfig>(defaultComponentConfig);
  const [sareeConfig, setSareeConfig] = useState<ComponentConfig>(defaultComponentConfig);
  const [blouseConfig, setBlouseConfig] = useState<ComponentConfig>(defaultComponentConfig);
  
  // Trims and closures for each component
  const [shirtTrims, setShirtTrims] = useState<TrimApplication[]>([]);
  const [lowersTrims, setLowersTrims] = useState<TrimApplication[]>([]);
  const [dupattaTrims, setDupattaTrims] = useState<TrimApplication[]>([]);
  const [shirtClosures, setShirtClosures] = useState<ClosureSpecification[]>([]);
  const [lowersClosures, setLowersClosures] = useState<ClosureSpecification[]>([]);
  
  // Lining and slip
  const [liningConfig, setLiningConfig] = useState<LiningConfig>(defaultLiningConfig);
  const [slipConfig, setSlipConfig] = useState<SlipConfig>(defaultSlipConfig);
  
  // Legacy fields for backward compatibility
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
  const [fabricAssignments, setFabricAssignments] = useState<FabricAssignment[]>([]);
  const [canvasAnnotationDataUrl, setCanvasAnnotationDataUrl] = useState<string | null>(null);
  const techpackRef = useRef<HTMLDivElement>(null);

  // Get selected capsule and its composition settings
  const selectedCapsule = capsules[selectedCollection];
  const categoryComposition = selectedCapsule?.categoryComposition;
  const garmentExtras = categoryComposition?.garmentExtras;

  // Get inducted fabrics for selected collection, grouped by component type
  const collectionFabrics = useMemo(() => {
    if (!selectedCollection) return [];
    return getFabricsByCollection(selectedCollection).filter(f => f.status === 'inducted');
  }, [selectedCollection, getFabricsByCollection]);

  const fabricsByComponent = useMemo(() => {
    const grouped: Record<string, FabricEntry[]> = {
      shirt: [],
      lowers: [],
      dupatta: [],
      lining: [],
      slip: [],
      lehenga: [],
      choli: [],
      saree: [],
      blouse: [],
    };
    
    collectionFabrics.forEach(fabric => {
      const componentType = fabric.componentType || 'shirt';
      if (grouped[componentType]) {
        grouped[componentType].push(fabric);
      }
    });
    
    return grouped;
  }, [collectionFabrics]);

  // Determine available 2-piece options based on collection settings
  const available2PieceOptions = useMemo(() => {
    if (!categoryComposition) return ['shirt-lowers', 'shirt-dupatta'] as TwoPieceComposition[];
    // If collection has specific setting, use it
    return [categoryComposition.twoPieceType];
  }, [categoryComposition]);

  // Auto-select 2-piece type if only one option
  useMemo(() => {
    if (selectedCategory === 'twoPiece' && available2PieceOptions.length === 1 && !selectedTwoPieceType) {
      setSelectedTwoPieceType(available2PieceOptions[0]);
    }
  }, [selectedCategory, available2PieceOptions, selectedTwoPieceType]);

  // Get available categories based on collection limits and specialized categories
  const availableCategories = useMemo(() => {
    const categories: DesignCategory[] = ['onePiece', 'twoPiece', 'threePiece', 'dupattas', 'lowers'];
    
    if (categoryComposition?.specializedCategory === 'lehenga-set' && categoryComposition.specializedCount > 0) {
      categories.push('lehenga-set');
    }
    if (categoryComposition?.specializedCategory === 'saree-set' && categoryComposition.specializedCount > 0) {
      categories.push('saree-set');
    }
    
    return categories;
  }, [categoryComposition]);

  // Get current collection's category limits and usage
  const currentDesignCounts = useMemo(() => {
    if (!selectedCollection) return null;
    return getDesignCountByCategory(selectedCollection);
  }, [selectedCollection, getDesignCountByCategory]);

  const categoryLimits = selectedCapsule?.categoryDesigns;

  const getCategoryCapacity = (category: DesignCategory): { used: number; limit: number; remaining: number } => {
    if (!categoryLimits || !currentDesignCounts) {
      return { used: 0, limit: 0, remaining: 0 };
    }
    
    // Handle specialized categories
    if (category === 'lehenga-set' || category === 'saree-set') {
      const limit = categoryComposition?.specializedCount || 0;
      const used = currentDesignCounts[category] || 0;
      return { used, limit, remaining: Math.max(0, limit - used) };
    }
    
    const limit = categoryLimits[category as keyof CategoryDesigns] || 0;
    const used = currentDesignCounts[category] || 0;
    return { used, limit, remaining: Math.max(0, limit - used) };
  };

  const isCategoryAvailable = (category: DesignCategory): boolean => {
    const { remaining, limit } = getCategoryCapacity(category);
    return remaining > 0 || limit > 0;
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

  // Get primary silhouette for cost calculation
  const primarySilhouette = useMemo(() => {
    if (selectedCategory === 'onePiece' || selectedCategory === 'dupattas' || selectedCategory === 'lowers') {
      return getSilhouetteById(shirtConfig.silhouetteId);
    }
    if (selectedCategory === 'twoPiece' || selectedCategory === 'threePiece') {
      return getSilhouetteById(shirtConfig.silhouetteId);
    }
    if (selectedCategory === 'lehenga-set') {
      return getSilhouetteById(lehengaConfig.silhouetteId);
    }
    if (selectedCategory === 'saree-set') {
      return getSilhouetteById(sareeConfig.silhouetteId);
    }
    return undefined;
  }, [selectedCategory, shirtConfig, lehengaConfig, sareeConfig, getSilhouetteById]);

  // Calculate total cost across all components
  const totalCostCalculation = useMemo(() => {
    let totalFabricCost = 0;
    let totalStitchingCost = 0;
    
    const calculateComponentCost = (config: ComponentConfig, fabrics: FabricEntry[]) => {
      if (!config.silhouetteId) return { fabric: 0, stitching: 0 };
      const fabric = fabrics.find(f => f.id === config.inductedFabricId);
      if (!fabric?.technicalSpecs?.costPerMeter) return { fabric: 0, stitching: 0 };
      const cost = calculateSilhouetteCost(config.silhouetteId, fabric.technicalSpecs.costPerMeter);
      return cost ? { fabric: cost.fabricCost, stitching: cost.stitchingCost } : { fabric: 0, stitching: 0 };
    };
    
    // Add costs based on category
    if (selectedCategory === 'onePiece') {
      const cost = calculateComponentCost(shirtConfig, fabricsByComponent.shirt);
      totalFabricCost += cost.fabric;
      totalStitchingCost += cost.stitching;
    } else if (selectedCategory === 'twoPiece') {
      const shirtCost = calculateComponentCost(shirtConfig, fabricsByComponent.shirt);
      totalFabricCost += shirtCost.fabric;
      totalStitchingCost += shirtCost.stitching;
      
      if (selectedTwoPieceType === 'shirt-lowers') {
        const lowersCost = calculateComponentCost(lowersConfig, fabricsByComponent.lowers);
        totalFabricCost += lowersCost.fabric;
        totalStitchingCost += lowersCost.stitching;
      } else {
        const dupattaCost = calculateComponentCost(dupattaConfig, fabricsByComponent.dupatta);
        totalFabricCost += dupattaCost.fabric;
        totalStitchingCost += dupattaCost.stitching;
      }
    } else if (selectedCategory === 'threePiece') {
      const shirtCost = calculateComponentCost(shirtConfig, fabricsByComponent.shirt);
      const lowersCost = calculateComponentCost(lowersConfig, fabricsByComponent.lowers);
      const dupattaCost = calculateComponentCost(dupattaConfig, fabricsByComponent.dupatta);
      totalFabricCost += shirtCost.fabric + lowersCost.fabric + dupattaCost.fabric;
      totalStitchingCost += shirtCost.stitching + lowersCost.stitching + dupattaCost.stitching;
    } else if (selectedCategory === 'lehenga-set') {
      const lehengaCost = calculateComponentCost(lehengaConfig, fabricsByComponent.lehenga);
      const choliCost = calculateComponentCost(choliConfig, fabricsByComponent.choli);
      const dupattaCost = calculateComponentCost(dupattaConfig, fabricsByComponent.dupatta);
      totalFabricCost += lehengaCost.fabric + choliCost.fabric + dupattaCost.fabric;
      totalStitchingCost += lehengaCost.stitching + choliCost.stitching + dupattaCost.stitching;
    } else if (selectedCategory === 'saree-set') {
      const sareeCost = calculateComponentCost(sareeConfig, fabricsByComponent.saree);
      const blouseCost = calculateComponentCost(blouseConfig, fabricsByComponent.blouse);
      totalFabricCost += sareeCost.fabric + blouseCost.fabric;
      totalStitchingCost += sareeCost.stitching + blouseCost.stitching;
    } else if (selectedCategory === 'dupattas') {
      const dupattaCost = calculateComponentCost(dupattaConfig, fabricsByComponent.dupatta);
      totalFabricCost += dupattaCost.fabric;
      totalStitchingCost += dupattaCost.stitching;
    } else if (selectedCategory === 'lowers') {
      const lowersCost = calculateComponentCost(lowersConfig, fabricsByComponent.lowers);
      totalFabricCost += lowersCost.fabric;
      totalStitchingCost += lowersCost.stitching;
    }
    
    const totalCost = totalFabricCost + totalStitchingCost;
    return totalCost > 0 ? {
      fabricCost: totalFabricCost,
      stitchingCost: totalStitchingCost,
      totalCost,
      predictedSellingPrice: Math.round(totalCost * 3.2),
    } : null;
  }, [selectedCategory, selectedTwoPieceType, shirtConfig, lowersConfig, dupattaConfig, lehengaConfig, choliConfig, sareeConfig, blouseConfig, fabricsByComponent, calculateSilhouetteCost]);

  const validateStep = (currentStep: Step): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!selectedCollection) newErrors.collection = 'Collection is required';
      if (!selectedCategory) newErrors.category = 'Design category is required';
      if (selectedCategory && !isCategoryAvailable(selectedCategory)) {
        newErrors.category = `${CATEGORY_LABELS[selectedCategory]} category has reached its limit`;
      }
      if (selectedCategory === 'twoPiece' && available2PieceOptions.length > 1 && !selectedTwoPieceType) {
        newErrors.twoPieceType = 'Select 2-piece composition';
      }
    }

    if (currentStep === 2) {
      // Validate component selections based on category
      if (selectedCategory === 'onePiece') {
        if (!shirtConfig.silhouetteId) newErrors.shirtSilhouette = 'Silhouette is required';
        if (!shirtConfig.inductedFabricId && fabricsByComponent.shirt.length > 0) {
          newErrors.shirtFabric = 'Fabric is required';
        }
      } else if (selectedCategory === 'twoPiece') {
        if (!shirtConfig.silhouetteId) newErrors.shirtSilhouette = 'Shirt silhouette is required';
        if (selectedTwoPieceType === 'shirt-lowers' && !lowersConfig.silhouetteId) {
          newErrors.lowersSilhouette = 'Lowers silhouette is required';
        }
        if (selectedTwoPieceType === 'shirt-dupatta' && !dupattaConfig.silhouetteId) {
          newErrors.dupattaSilhouette = 'Dupatta silhouette is required';
        }
      } else if (selectedCategory === 'threePiece') {
        if (!shirtConfig.silhouetteId) newErrors.shirtSilhouette = 'Shirt silhouette is required';
        if (!lowersConfig.silhouetteId) newErrors.lowersSilhouette = 'Lowers silhouette is required';
        if (!dupattaConfig.silhouetteId) newErrors.dupattaSilhouette = 'Dupatta silhouette is required';
      }
      // Similar validation for other categories...
    }

    if (currentStep === 4) {
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
    if (step < 4) setStep((step + 1) as Step);
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
    if (!validateStep(4)) {
      toast.error('Please complete all required fields');
      return;
    }

    // Build components based on category
    const components: Design['components'] = {};
    
    const buildComponentSpec = (config: ComponentConfig, trims: TrimApplication[], closures: ClosureSpecification[]): ComponentSpec => ({
      silhouetteId: config.silhouetteId,
      fabricId: config.fabricId,
      inductedFabricId: config.inductedFabricId,
      trims,
      closures,
    });
    
    if (selectedCategory === 'onePiece' || selectedCategory === 'twoPiece' || selectedCategory === 'threePiece') {
      components.shirt = buildComponentSpec(shirtConfig, shirtTrims, shirtClosures);
    }
    if ((selectedCategory === 'twoPiece' && selectedTwoPieceType === 'shirt-lowers') || selectedCategory === 'threePiece' || selectedCategory === 'lowers') {
      components.lowers = buildComponentSpec(lowersConfig, lowersTrims, lowersClosures);
    }
    if ((selectedCategory === 'twoPiece' && selectedTwoPieceType === 'shirt-dupatta') || selectedCategory === 'threePiece' || selectedCategory === 'dupattas') {
      components.dupatta = buildComponentSpec(dupattaConfig, dupattaTrims, []);
    }
    if (selectedCategory === 'lehenga-set') {
      components.lehenga = buildComponentSpec(lehengaConfig, [], []);
      components.choli = buildComponentSpec(choliConfig, [], shirtClosures);
      components.dupatta = buildComponentSpec(dupattaConfig, dupattaTrims, []);
    }
    if (selectedCategory === 'saree-set') {
      components.saree = buildComponentSpec(sareeConfig, [], []);
      components.blouse = buildComponentSpec(blouseConfig, [], shirtClosures);
    }

    const designId = `design-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Build techpack annotations if canvas has been modified
    const techpackAnnotations: TechpackAnnotations | undefined = canvasAnnotationDataUrl ? {
      dataUrl: canvasAnnotationDataUrl,
      fabricLegend: fabricAssignments.map(a => ({
        number: a.fabricNumber,
        fabricName: a.fabricName,
        color: a.color,
        componentType: a.componentType,
      })),
      createdAt: new Date(),
    } : undefined;
    
    const newDesign: Design = {
      id: designId,
      collectionId: selectedCollection,
      silhouetteId: shirtConfig.silhouetteId || lowersConfig.silhouetteId || dupattaConfig.silhouetteId,
      fabricId: shirtConfig.fabricId || lowersConfig.fabricId || dupattaConfig.fabricId,
      inductedFabricId: shirtConfig.inductedFabricId,
      category: selectedCategory as DesignCategory,
      components,
      fabricAssignments: fabricAssignments.length > 0 ? fabricAssignments : undefined,
      techpackAnnotations,
      trims: shirtTrims,
      closures: shirtClosures,
      liningConfig: liningConfig.enabled ? liningConfig : undefined,
      slipConfig: slipConfig.enabled ? slipConfig : undefined,
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
    resetForm();
  };

  const resetForm = () => {
    setStep(1);
    setSelectedCollection('');
    setSelectedCategory('');
    setSelectedTwoPieceType('');
    setShirtConfig(defaultComponentConfig);
    setLowersConfig(defaultComponentConfig);
    setDupattaConfig(defaultComponentConfig);
    setLehengaConfig(defaultComponentConfig);
    setCholiConfig(defaultComponentConfig);
    setSareeConfig(defaultComponentConfig);
    setBlouseConfig(defaultComponentConfig);
    setShirtTrims([]);
    setLowersTrims([]);
    setDupattaTrims([]);
    setShirtClosures([]);
    setLowersClosures([]);
    setLiningConfig(defaultLiningConfig);
    setSlipConfig(defaultSlipConfig);
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
    setFabricAssignments([]);
    setCanvasAnnotationDataUrl(null);
  };

  // For TechpackPreview compatibility
  const selectedSilhouetteForPreview = primarySilhouette ? {
    id: primarySilhouette.id,
    code: primarySilhouette.code,
    name: primarySilhouette.name,
    category: primarySilhouette.category,
    technicalDrawing: primarySilhouette.technicalDrawing,
  } : silhouetteLibrary.find(s => s.id === shirtConfig.silhouetteId);

  const primaryFabric = useMemo(() => {
    const fabricId = shirtConfig.inductedFabricId || lowersConfig.inductedFabricId || dupattaConfig.inductedFabricId;
    return fabricId ? getFabricById(fabricId) : null;
  }, [shirtConfig, lowersConfig, dupattaConfig, getFabricById]);

  // Build selected fabrics list for FabricBlockingPanel
  const selectedFabricsForBlocking = useMemo(() => {
    const fabrics: { componentType: string; componentLabel: string; fabric?: FabricEntry }[] = [];
    
    if (selectedCategory === 'onePiece') {
      if (shirtConfig.inductedFabricId) {
        fabrics.push({
          componentType: 'shirt',
          componentLabel: 'Shirt / Kameez',
          fabric: getFabricById(shirtConfig.inductedFabricId) || undefined,
        });
      }
    } else if (selectedCategory === 'twoPiece') {
      if (shirtConfig.inductedFabricId) {
        fabrics.push({
          componentType: 'shirt',
          componentLabel: 'Shirt',
          fabric: getFabricById(shirtConfig.inductedFabricId) || undefined,
        });
      }
      if (selectedTwoPieceType === 'shirt-lowers' && lowersConfig.inductedFabricId) {
        fabrics.push({
          componentType: 'lowers',
          componentLabel: 'Lowers / Trousers',
          fabric: getFabricById(lowersConfig.inductedFabricId) || undefined,
        });
      }
      if (selectedTwoPieceType === 'shirt-dupatta' && dupattaConfig.inductedFabricId) {
        fabrics.push({
          componentType: 'dupatta',
          componentLabel: 'Dupatta',
          fabric: getFabricById(dupattaConfig.inductedFabricId) || undefined,
        });
      }
    } else if (selectedCategory === 'threePiece') {
      if (shirtConfig.inductedFabricId) {
        fabrics.push({
          componentType: 'shirt',
          componentLabel: 'Shirt',
          fabric: getFabricById(shirtConfig.inductedFabricId) || undefined,
        });
      }
      if (lowersConfig.inductedFabricId) {
        fabrics.push({
          componentType: 'lowers',
          componentLabel: 'Lowers',
          fabric: getFabricById(lowersConfig.inductedFabricId) || undefined,
        });
      }
      if (dupattaConfig.inductedFabricId) {
        fabrics.push({
          componentType: 'dupatta',
          componentLabel: 'Dupatta',
          fabric: getFabricById(dupattaConfig.inductedFabricId) || undefined,
        });
      }
    } else if (selectedCategory === 'lehenga-set') {
      if (lehengaConfig.inductedFabricId) {
        fabrics.push({
          componentType: 'lehenga',
          componentLabel: 'Lehenga',
          fabric: getFabricById(lehengaConfig.inductedFabricId) || undefined,
        });
      }
      if (choliConfig.inductedFabricId) {
        fabrics.push({
          componentType: 'choli',
          componentLabel: 'Choli',
          fabric: getFabricById(choliConfig.inductedFabricId) || undefined,
        });
      }
      if (dupattaConfig.inductedFabricId) {
        fabrics.push({
          componentType: 'dupatta',
          componentLabel: 'Dupatta',
          fabric: getFabricById(dupattaConfig.inductedFabricId) || undefined,
        });
      }
    } else if (selectedCategory === 'saree-set') {
      if (sareeConfig.inductedFabricId) {
        fabrics.push({
          componentType: 'saree',
          componentLabel: 'Saree',
          fabric: getFabricById(sareeConfig.inductedFabricId) || undefined,
        });
      }
      if (blouseConfig.inductedFabricId) {
        fabrics.push({
          componentType: 'blouse',
          componentLabel: 'Blouse',
          fabric: getFabricById(blouseConfig.inductedFabricId) || undefined,
        });
      }
    } else if (selectedCategory === 'dupattas') {
      if (dupattaConfig.inductedFabricId) {
        fabrics.push({
          componentType: 'dupatta',
          componentLabel: 'Dupatta',
          fabric: getFabricById(dupattaConfig.inductedFabricId) || undefined,
        });
      }
    } else if (selectedCategory === 'lowers') {
      if (lowersConfig.inductedFabricId) {
        fabrics.push({
          componentType: 'lowers',
          componentLabel: 'Lowers',
          fabric: getFabricById(lowersConfig.inductedFabricId) || undefined,
        });
      }
    }
    
    // Add lining fabric if configured
    if (liningConfig.enabled && liningConfig.fabricId) {
      fabrics.push({
        componentType: 'lining',
        componentLabel: 'Lining',
        fabric: getFabricById(liningConfig.fabricId) || undefined,
      });
    }
    
    // Add slip fabric if configured
    if (slipConfig.enabled && slipConfig.fabricId) {
      fabrics.push({
        componentType: 'slip',
        componentLabel: 'Slip',
        fabric: getFabricById(slipConfig.fabricId) || undefined,
      });
    }
    
    return fabrics;
  }, [selectedCategory, selectedTwoPieceType, shirtConfig, lowersConfig, dupattaConfig, lehengaConfig, choliConfig, sareeConfig, blouseConfig, liningConfig, slipConfig, getFabricById]);

  // Generate fabric numbers for canvas from assignments
  const fabricNumbersForCanvas = useMemo(() => {
    return fabricAssignments.map(a => ({
      number: a.fabricNumber,
      color: a.color,
    }));
  }, [fabricAssignments]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">New Design Submission</DialogTitle>
          <div className="flex gap-2 mt-4 flex-wrap">
            <Badge variant={step === 1 ? 'default' : 'secondary'}>
              Step 1: Category
            </Badge>
            <Badge variant={step === 2 ? 'default' : 'secondary'}>
              Step 2: Components
            </Badge>
            <Badge variant={step === 3 ? 'default' : 'secondary'}>
              Step 3: Details & Trims
            </Badge>
            <Badge variant={step === 4 ? 'default' : 'secondary'}>
              Step 4: Submission
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Step 1: Collection and Category Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="collection">Collection *</Label>
                <Select
                  value={selectedCollection}
                  onValueChange={(value) => {
                    setSelectedCollection(value);
                    setSelectedCategory('');
                    setSelectedTwoPieceType('');
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

              {/* Category Selection */}
              {selectedCollection && (
                <div className="space-y-3">
                  <Label>Design Category *</Label>
                  <p className="text-sm text-muted-foreground">
                    Select the category for this design. Available slots are based on collection plan.
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {availableCategories.map((category) => {
                      const { used, limit, remaining } = getCategoryCapacity(category);
                      const isAvailable = remaining > 0 || limit === 0;
                      const isSelected = selectedCategory === category;
                      const progressPercent = limit > 0 ? (used / limit) * 100 : 0;
                      
                      if (limit === 0 && category !== 'lehenga-set' && category !== 'saree-set') return null;
                      
                      return (
                        <button
                          key={category}
                          type="button"
                          disabled={!isAvailable && limit > 0}
                          onClick={() => {
                            setSelectedCategory(category);
                            setSelectedTwoPieceType('');
                            setErrors((prev) => ({ ...prev, category: '' }));
                          }}
                          className={`relative p-3 border rounded-lg transition-all text-left ${
                            isSelected
                              ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                              : isAvailable || limit === 0
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
                          
                          {limit > 0 && (
                            <div className="space-y-1">
                              <Progress value={progressPercent} className="h-1.5" />
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">{used} / {limit}</span>
                                <span className={remaining > 0 ? 'text-primary' : 'text-destructive'}>
                                  {remaining} left
                                </span>
                              </div>
                            </div>
                          )}
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

              {/* 2-Piece Type Selection */}
              {selectedCategory === 'twoPiece' && available2PieceOptions.length > 1 && (
                <div className="space-y-3">
                  <Label>2-Piece Composition *</Label>
                  <RadioGroup
                    value={selectedTwoPieceType}
                    onValueChange={(value) => setSelectedTwoPieceType(value as TwoPieceComposition)}
                    className="grid grid-cols-2 gap-3"
                  >
                    {available2PieceOptions.map((option) => (
                      <div
                        key={option}
                        className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer ${
                          selectedTwoPieceType === option ? 'border-primary bg-primary/5' : 'border-border'
                        }`}
                        onClick={() => setSelectedTwoPieceType(option)}
                      >
                        <RadioGroupItem value={option} id={option} />
                        <Label htmlFor={option} className="cursor-pointer">
                          {TWO_PIECE_LABELS[option]}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  {errors.twoPieceType && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.twoPieceType}
                    </p>
                  )}
                </div>
              )}

              {/* Collection Fabrics Summary */}
              {selectedCollection && collectionFabrics.length > 0 && (
                <Card className="p-4 bg-card/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Palette className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">Inducted Fabrics for this Collection</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {collectionFabrics.map((fabric) => (
                      <Badge key={fabric.id} variant="outline" className="text-xs">
                        {fabric.fabricName} ({fabric.componentType})
                      </Badge>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Step 2: Component Selection */}
          {step === 2 && (
            <div className="space-y-6">
              {/* 1-Piece: Single component */}
              {selectedCategory === 'onePiece' && (
                <ComponentSelector
                  componentType="shirt"
                  label="Shirt / Kameez / Top"
                  availableFabrics={fabricsByComponent.shirt.length > 0 ? fabricsByComponent.shirt : collectionFabrics}
                  value={shirtConfig}
                  onChange={setShirtConfig}
                  error={errors.shirtSilhouette || errors.shirtFabric}
                />
              )}

              {/* 2-Piece: Two components */}
              {selectedCategory === 'twoPiece' && (
                <div className="space-y-4">
                  <ComponentSelector
                    componentType="shirt"
                    label="Shirt / Kameez"
                    availableFabrics={fabricsByComponent.shirt.length > 0 ? fabricsByComponent.shirt : collectionFabrics}
                    value={shirtConfig}
                    onChange={setShirtConfig}
                    error={errors.shirtSilhouette}
                  />
                  
                  {selectedTwoPieceType === 'shirt-lowers' && (
                    <ComponentSelector
                      componentType="lowers"
                      label="Lowers / Trousers / Shalwar"
                      availableFabrics={fabricsByComponent.lowers.length > 0 ? fabricsByComponent.lowers : collectionFabrics}
                      value={lowersConfig}
                      onChange={setLowersConfig}
                      error={errors.lowersSilhouette}
                    />
                  )}
                  
                  {selectedTwoPieceType === 'shirt-dupatta' && (
                    <ComponentSelector
                      componentType="dupatta"
                      label="Dupatta"
                      availableFabrics={fabricsByComponent.dupatta.length > 0 ? fabricsByComponent.dupatta : collectionFabrics}
                      value={dupattaConfig}
                      onChange={setDupattaConfig}
                      error={errors.dupattaSilhouette}
                    />
                  )}
                </div>
              )}

              {/* 3-Piece: Three components */}
              {selectedCategory === 'threePiece' && (
                <div className="space-y-4">
                  <ComponentSelector
                    componentType="shirt"
                    label="Shirt / Kameez"
                    availableFabrics={fabricsByComponent.shirt.length > 0 ? fabricsByComponent.shirt : collectionFabrics}
                    value={shirtConfig}
                    onChange={setShirtConfig}
                    error={errors.shirtSilhouette}
                  />
                  <ComponentSelector
                    componentType="lowers"
                    label="Lowers / Trousers / Shalwar"
                    availableFabrics={fabricsByComponent.lowers.length > 0 ? fabricsByComponent.lowers : collectionFabrics}
                    value={lowersConfig}
                    onChange={setLowersConfig}
                    error={errors.lowersSilhouette}
                  />
                  <ComponentSelector
                    componentType="dupatta"
                    label="Dupatta"
                    availableFabrics={fabricsByComponent.dupatta.length > 0 ? fabricsByComponent.dupatta : collectionFabrics}
                    value={dupattaConfig}
                    onChange={setDupattaConfig}
                    error={errors.dupattaSilhouette}
                  />
                </div>
              )}

              {/* Standalone Dupattas */}
              {selectedCategory === 'dupattas' && (
                <ComponentSelector
                  componentType="dupatta"
                  label="Dupatta"
                  availableFabrics={fabricsByComponent.dupatta.length > 0 ? fabricsByComponent.dupatta : collectionFabrics}
                  value={dupattaConfig}
                  onChange={setDupattaConfig}
                />
              )}

              {/* Standalone Lowers */}
              {selectedCategory === 'lowers' && (
                <ComponentSelector
                  componentType="lowers"
                  label="Lowers / Trousers"
                  availableFabrics={fabricsByComponent.lowers.length > 0 ? fabricsByComponent.lowers : collectionFabrics}
                  value={lowersConfig}
                  onChange={setLowersConfig}
                />
              )}

              {/* Lehenga Set */}
              {selectedCategory === 'lehenga-set' && (
                <div className="space-y-4">
                  <ComponentSelector
                    componentType="lehenga"
                    label="Lehenga"
                    availableFabrics={fabricsByComponent.lehenga.length > 0 ? fabricsByComponent.lehenga : collectionFabrics}
                    value={lehengaConfig}
                    onChange={setLehengaConfig}
                  />
                  <ComponentSelector
                    componentType="choli"
                    label="Choli / Blouse"
                    availableFabrics={fabricsByComponent.choli.length > 0 ? fabricsByComponent.choli : collectionFabrics}
                    value={choliConfig}
                    onChange={setCholiConfig}
                  />
                  <ComponentSelector
                    componentType="dupatta"
                    label="Dupatta"
                    availableFabrics={fabricsByComponent.dupatta.length > 0 ? fabricsByComponent.dupatta : collectionFabrics}
                    value={dupattaConfig}
                    onChange={setDupattaConfig}
                  />
                </div>
              )}

              {/* Saree Set */}
              {selectedCategory === 'saree-set' && (
                <div className="space-y-4">
                  <ComponentSelector
                    componentType="saree"
                    label="Saree"
                    availableFabrics={fabricsByComponent.saree.length > 0 ? fabricsByComponent.saree : collectionFabrics}
                    value={sareeConfig}
                    onChange={setSareeConfig}
                  />
                  <ComponentSelector
                    componentType="blouse"
                    label="Blouse"
                    availableFabrics={fabricsByComponent.blouse.length > 0 ? fabricsByComponent.blouse : collectionFabrics}
                    value={blouseConfig}
                    onChange={setBlouseConfig}
                  />
                </div>
              )}

              {/* Total Cost Summary */}
              {totalCostCalculation && (
                <Card className="p-4 bg-primary/5 border-primary/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Calculator className="h-4 w-4 text-primary" />
                    <span className="font-medium">Total Design Cost</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Fabric Cost</p>
                      <p className="font-medium flex items-center">
                        <IndianRupee className="h-3 w-3" />
                        {totalCostCalculation.fabricCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Stitching Cost</p>
                      <p className="font-medium flex items-center">
                        <IndianRupee className="h-3 w-3" />
                        {totalCostCalculation.stitchingCost.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Cost</p>
                      <p className="font-bold flex items-center text-primary">
                        <IndianRupee className="h-3.5 w-3.5" />
                        {totalCostCalculation.totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Selling Price (3.2x)</p>
                      <p className="font-bold flex items-center text-primary">
                        <IndianRupee className="h-3.5 w-3.5" />
                        {totalCostCalculation.predictedSellingPrice.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Step 3: Trims, Closures, Lining */}
          {step === 3 && (
            <div className="space-y-6">
              {/* Shirt Trims & Closures */}
              {(selectedCategory === 'onePiece' || selectedCategory === 'twoPiece' || selectedCategory === 'threePiece') && (
                <Card className="p-4 space-y-4 bg-card/50">
                  <h4 className="font-semibold text-foreground">Shirt / Kameez Details</h4>
                  <TrimSelector
                    value={shirtTrims}
                    onChange={setShirtTrims}
                    componentLabel="Shirt"
                  />
                  <Separator />
                  <ClosureSelector
                    value={shirtClosures}
                    onChange={setShirtClosures}
                    componentLabel="Shirt"
                  />
                </Card>
              )}

              {/* Lowers Trims */}
              {((selectedCategory === 'twoPiece' && selectedTwoPieceType === 'shirt-lowers') || 
                selectedCategory === 'threePiece' || 
                selectedCategory === 'lowers') && (
                <Card className="p-4 space-y-4 bg-card/50">
                  <h4 className="font-semibold text-foreground">Lowers / Trousers Details</h4>
                  <TrimSelector
                    value={lowersTrims}
                    onChange={setLowersTrims}
                    componentLabel="Lowers"
                  />
                  <Separator />
                  <ClosureSelector
                    value={lowersClosures}
                    onChange={setLowersClosures}
                    componentLabel="Lowers"
                  />
                </Card>
              )}

              {/* Dupatta Trims */}
              {((selectedCategory === 'twoPiece' && selectedTwoPieceType === 'shirt-dupatta') || 
                selectedCategory === 'threePiece' || 
                selectedCategory === 'dupattas' ||
                selectedCategory === 'lehenga-set') && (
                <Card className="p-4 space-y-4 bg-card/50">
                  <h4 className="font-semibold text-foreground">Dupatta Details</h4>
                  <TrimSelector
                    value={dupattaTrims}
                    onChange={setDupattaTrims}
                    componentLabel="Dupatta"
                  />
                </Card>
              )}

              {/* Lining & Slip Configuration */}
              {garmentExtras && (garmentExtras.hasLining || garmentExtras.hasSlip) && (
                <LiningConfigurator
                  liningConfig={liningConfig}
                  onLiningChange={setLiningConfig}
                  slipConfig={slipConfig}
                  onSlipChange={setSlipConfig}
                  availableFabrics={collectionFabrics}
                  showSlip={garmentExtras.hasSlip}
                />
              )}

              {/* Production Processes */}
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
              </div>

              {/* Custom Modifications Toggle */}
              <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-card/50">
                <div className="space-y-1">
                  <Label htmlFor="custom-toggle" className="text-base">
                    Custom Modifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Enable to specify custom neckline, sleeve, seam changes
                  </p>
                </div>
                <Switch
                  id="custom-toggle"
                  checked={isCustom}
                  onCheckedChange={setIsCustom}
                />
              </div>

              {isCustom && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="neckline">Neckline</Label>
                    <Select value={selectedNeckline} onValueChange={setSelectedNeckline}>
                      <SelectTrigger id="neckline">
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sleeve">Sleeve</Label>
                    <Select value={selectedSleeve} onValueChange={setSelectedSleeve}>
                      <SelectTrigger id="sleeve">
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="seam">Seam Finish</Label>
                    <Select value={selectedSeamFinish} onValueChange={setSelectedSeamFinish}>
                      <SelectTrigger id="seam">
                        <SelectValue placeholder="Select finish" />
                      </SelectTrigger>
                      <SelectContent>
                        {seamFinishLibrary.map((seam) => (
                          <SelectItem key={seam.id} value={seam.id}>
                            {seam.name} - {seam.type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Submission */}
          {step === 4 && (
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

              {/* Fast Track */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-card/50">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-amber-500" />
                    <div className="space-y-1">
                      <Label htmlFor="fast-track" className="text-base">
                        Emergency Fast Track
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Request priority processing for this design
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="fast-track"
                    checked={fastTrack}
                    onCheckedChange={(checked) => {
                      setFastTrack(checked);
                      if (!checked) setFastTrackReason('');
                    }}
                  />
                </div>

                {fastTrack && (
                  <div className="space-y-2">
                    <Label htmlFor="fast-track-reason" className="text-destructive">
                      Fast Track Justification *
                    </Label>
                    <Textarea
                      id="fast-track-reason"
                      placeholder="Explain why this design needs fast track processing..."
                      value={fastTrackReason}
                      onChange={(e) => {
                        setFastTrackReason(e.target.value);
                        setErrors((prev) => ({ ...prev, fastTrackReason: '' }));
                      }}
                      rows={2}
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

              {/* Fabric Blocking Panel */}
              {selectedFabricsForBlocking.length > 0 && (
                <FabricBlockingPanel
                  selectedFabrics={selectedFabricsForBlocking}
                  onFabricNumbersChange={setFabricAssignments}
                />
              )}

              {/* Techpack Annotation Canvas */}
              {primarySilhouette?.technicalDrawing && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <PenTool className="h-4 w-4 text-primary" />
                    <Label className="text-lg">Annotate Technical Drawing</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Use the canvas below to mark fabric placements, add notes, or make modifications to the technical drawing.
                  </p>
                  <TechpackCanvas
                    imageUrl={primarySilhouette.technicalDrawing}
                    width={550}
                    height={450}
                    fabricNumbers={fabricNumbersForCanvas.length > 0 ? fabricNumbersForCanvas : FABRIC_COLORS.slice(0, 5).map(c => ({ number: c.number, color: c.color }))}
                    onAnnotationsChange={setCanvasAnnotationDataUrl}
                  />
                  {canvasAnnotationDataUrl && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      Annotations will be saved with this design
                    </p>
                  )}
                </div>
              )}

              {/* Techpack Preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-lg">Techpack Preview</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadPdf}
                    disabled={isGeneratingPdf}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isGeneratingPdf ? 'Generating...' : 'Download PDF'}
                  </Button>
                </div>
                <TechpackPreview
                  ref={techpackRef}
                  selectedCollection={selectedCapsule?.collectionName || ''}
                  selectedSilhouette={selectedSilhouetteForPreview?.id || ''}
                  selectedFabric={primaryFabric?.fabricName || ''}
                  selectedProcesses={selectedProcesses}
                  isCustom={isCustom}
                  selectedNeckline={selectedNeckline}
                  selectedSleeve={selectedSleeve}
                  selectedSeamFinish={selectedSeamFinish}
                  sampleType={sampleType}
                  additionalNotes={additionalNotes}
                  fastTrack={fastTrack}
                  fastTrackReason={fastTrackReason}
                  colorId={primaryFabric?.colorId}
                  printClassification={primaryFabric?.printClassification}
                  recommendedSPI={primaryFabric?.technicalSpecs?.recommendedSPI}
                  ironingInstructions={primaryFabric?.technicalSpecs?.ironingInstructions}
                  handlingNotes={primaryFabric?.technicalSpecs?.handlingNotes}
                  annotatedDrawingUrl={canvasAnnotationDataUrl || undefined}
                  fabricLegend={fabricAssignments.map(a => ({
                    number: a.fabricNumber,
                    fabricName: a.fabricName,
                    color: a.color,
                    componentType: a.componentType,
                  }))}
                />
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6 border-t border-border">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {step < 4 ? (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="bg-primary">
              Submit Design
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
