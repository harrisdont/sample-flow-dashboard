import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CalendarIcon, Upload, X, Plus, AlertTriangle, Clock, ArrowRight, CheckCircle2, Link as LinkIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { 
  TECHNIQUE_BUFFERS, 
  getComplexTechniques,
} from '@/data/leadTimeSettings';
import { calculateBackwardsSchedule, getPhaseColor } from '@/lib/schedulingEngine';
import { 
  useCapsuleStore, 
  CapsuleCollection, 
  CategoryDesigns,
  CategoryComposition,
  FabricRequirements,
  TwoPieceComposition,
  SpecializedCategory,
  defaultCategoryComposition,
  defaultFabricRequirements,
  getRequiredFabricFields,
  FABRIC_FIELD_LABELS,
} from '@/data/capsuleCollectionData';
import { toast } from 'sonner';

interface CapsuleCollectionPlanFormProps {
  lineId: string;
  lineName: string;
  lineColor: string;
  allocatedDesigns: number;
  onClose: () => void;
  onSave?: () => void;
}

// Mock GTM strategies that would be fetched from Main Category Plan
const gtmStrategies = [
  { id: 'spring-launch', name: 'Spring Launch 2025', targetDate: new Date(2025, 2, 15) },
  { id: 'summer-collection', name: 'Summer Collection 2025', targetDate: new Date(2025, 5, 1) },
  { id: 'festive-season', name: 'Festive Season 2025', targetDate: new Date(2025, 9, 10) },
  { id: 'winter-release', name: 'Winter Release 2025', targetDate: new Date(2025, 11, 1) },
];

// Category labels for main categories only
const MAIN_CATEGORY_LABELS: Record<'onePiece' | 'twoPiece' | 'threePiece', string> = {
  onePiece: '1-Piece',
  twoPiece: '2-Piece',
  threePiece: '3-Piece',
};

// More categories (dupattas, lowers, specialized)
const MORE_CATEGORY_LABELS: Record<'dupattas' | 'lowers', string> = {
  dupattas: 'Dupattas',
  lowers: 'Lowers',
};

const SPECIALIZED_OPTIONS: { value: SpecializedCategory; label: string; description: string }[] = [
  { value: 'lehenga-set', label: 'Lehenga Set', description: 'Lehenga + Choli + Dupatta' },
  { value: 'saree-set', label: 'Saree Set', description: 'Saree + Blouse' },
];

// Category extras that can be added to any category
type CategoryExtras = {
  hasLining: boolean;
  hasSlip: boolean;
  hasPetticoat: boolean;
};

type CategoryWithExtras = keyof CategoryDesigns | 'lehenga-set' | 'saree-set';

// Composition options
const TWO_PIECE_OPTIONS: { value: TwoPieceComposition; label: string }[] = [
  { value: 'shirt-lowers', label: 'Shirt + Lowers' },
  { value: 'shirt-dupatta', label: 'Shirt + Dupatta' },
];

const CapsuleCollectionPlanForm = ({
  lineId,
  lineName,
  lineColor,
  allocatedDesigns,
  onClose,
  onSave,
}: CapsuleCollectionPlanFormProps) => {
  const { getCapsuleByLine, addCapsule, updateCapsule } = useCapsuleStore();
  const existingCapsule = getCapsuleByLine(lineId);

  const [collectionName, setCollectionName] = useState(existingCapsule?.collectionName || '');
  const [selectedGtm, setSelectedGtm] = useState(existingCapsule?.gtmStrategy || '');
  const [targetDate, setTargetDate] = useState<Date | undefined>(existingCapsule?.targetInStoreDate);
  const [productMix, setProductMix] = useState(existingCapsule?.productMix || {
    twoPiece: 0,
    onePiece: 0,
    threePiece: 0,
  });
  const [categoryDesigns, setCategoryDesigns] = useState<CategoryDesigns>(existingCapsule?.categoryDesigns || {
    onePiece: 0,
    twoPiece: 0,
    threePiece: 0,
    dupattas: 0,
    lowers: 0,
  });
  const [categoryComposition, setCategoryComposition] = useState<CategoryComposition>(
    existingCapsule?.categoryComposition || { ...defaultCategoryComposition }
  );
  const [fabricRequirements, setFabricRequirements] = useState<FabricRequirements>(
    existingCapsule?.fabricRequirements || { ...defaultFabricRequirements }
  );
  const [moodboards, setMoodboards] = useState<File[]>([]);
  const [pinterestBoardLink, setPinterestBoardLink] = useState(existingCapsule?.pinterestBoardLink || '');
  const [description, setDescription] = useState(existingCapsule?.description || '');
  const [fabrics, setFabrics] = useState<string[]>(existingCapsule?.fabrics || []);
  const [newFabric, setNewFabric] = useState('');
  const [selectedTechniques, setSelectedTechniques] = useState<string[]>(existingCapsule?.selectedTechniques || []);
  const [moreCategoriesOpen, setMoreCategoriesOpen] = useState(false);
  const [categoryExtrasPopover, setCategoryExtrasPopover] = useState<CategoryWithExtras | null>(null);
  const [perCategoryExtras, setPerCategoryExtras] = useState<Record<CategoryWithExtras, CategoryExtras>>({
    onePiece: { hasLining: false, hasSlip: false, hasPetticoat: false },
    twoPiece: { hasLining: false, hasSlip: false, hasPetticoat: false },
    threePiece: { hasLining: false, hasSlip: false, hasPetticoat: false },
    dupattas: { hasLining: false, hasSlip: false, hasPetticoat: false },
    lowers: { hasLining: false, hasSlip: false, hasPetticoat: false },
    'lehenga-set': { hasLining: false, hasSlip: false, hasPetticoat: false },
    'saree-set': { hasLining: false, hasSlip: false, hasPetticoat: true },
  });

  // Load existing data when lineId changes
  useEffect(() => {
    if (existingCapsule) {
      setCollectionName(existingCapsule.collectionName);
      setSelectedGtm(existingCapsule.gtmStrategy);
      setTargetDate(existingCapsule.targetInStoreDate);
      setProductMix(existingCapsule.productMix);
      setCategoryDesigns(existingCapsule.categoryDesigns);
      setCategoryComposition(existingCapsule.categoryComposition || { ...defaultCategoryComposition });
      setFabricRequirements(existingCapsule.fabricRequirements || { ...defaultFabricRequirements });
      setPinterestBoardLink(existingCapsule.pinterestBoardLink);
      setDescription(existingCapsule.description);
      setFabrics(existingCapsule.fabrics);
      setSelectedTechniques(existingCapsule.selectedTechniques);
    }
  }, [existingCapsule]);

  // Get required fabric fields based on current composition
  const requiredFabricFields = useMemo(() => 
    getRequiredFabricFields(categoryDesigns, categoryComposition),
    [categoryDesigns, categoryComposition]
  );

  // Auto-fetch target date when GTM strategy is selected
  const handleGtmChange = (value: string) => {
    setSelectedGtm(value);
    const strategy = gtmStrategies.find(s => s.id === value);
    if (strategy) {
      setTargetDate(strategy.targetDate);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setMoodboards(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeMoodboard = (index: number) => {
    setMoodboards(prev => prev.filter((_, i) => i !== index));
  };

  const addFabric = () => {
    if (newFabric.trim() && !fabrics.includes(newFabric.trim())) {
      setFabrics(prev => [...prev, newFabric.trim()]);
      setNewFabric('');
    }
  };

  const removeFabric = (fabric: string) => {
    setFabrics(prev => prev.filter(f => f !== fabric));
  };

  const toggleTechnique = (techniqueId: string) => {
    setSelectedTechniques(prev =>
      prev.includes(techniqueId)
        ? prev.filter(t => t !== techniqueId)
        : [...prev, techniqueId]
    );
  };

  const handleCategoryDesignChange = (category: keyof CategoryDesigns, value: number) => {
    setCategoryDesigns(prev => ({
      ...prev,
      [category]: Math.max(0, value),
    }));
  };

  const handleCompositionChange = (field: keyof CategoryComposition, value: string | number | boolean) => {
    setCategoryComposition(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePerCategoryExtrasChange = (category: CategoryWithExtras, field: keyof CategoryExtras, value: boolean) => {
    setPerCategoryExtras(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }));
    // Also update the global garmentExtras for fabric calculation
    if (category === categoryComposition.specializedCategory || 
        (categoryDesigns[category as keyof CategoryDesigns] > 0)) {
      setCategoryComposition(prev => ({
        ...prev,
        garmentExtras: {
          ...prev.garmentExtras,
          [field]: value || prev.garmentExtras[field],
        },
      }));
    }
  };

  const handleFabricRequirementChange = (field: keyof FabricRequirements, value: string) => {
    setFabricRequirements(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!targetDate || !collectionName) {
      toast.error('Please fill in collection name and target date');
      return;
    }

    const capsuleId = existingCapsule?.id || `${lineId}-${Date.now()}`;
    const capsuleData: CapsuleCollection = {
      id: capsuleId,
      lineId,
      lineName,
      collectionName,
      gtmStrategy: selectedGtm,
      targetInStoreDate: targetDate,
      productMix,
      categoryDesigns,
      categoryComposition,
      fabricRequirements,
      selectedTechniques,
      fabrics,
      description,
      moodboardCount: moodboards.length + (existingCapsule?.moodboardCount || 0),
      pinterestBoardLink,
      createdAt: existingCapsule?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    if (existingCapsule) {
      updateCapsule(capsuleId, capsuleData);
      toast.success('Collection plan updated');
    } else {
      addCapsule(capsuleData);
      toast.success('Collection plan saved');
    }

    onSave?.();
    onClose();
  };

  const totalCategoryDesigns = Object.values(categoryDesigns).reduce((sum, val) => sum + val, 0) + categoryComposition.specializedCount;

  // Calculate complete schedule with backwards scheduling
  const schedule = useMemo(() => {
    if (!targetDate) return null;
    return calculateBackwardsSchedule(targetDate, selectedTechniques);
  }, [targetDate, selectedTechniques]);

  const complexTechniques = useMemo(() => 
    getComplexTechniques(selectedTechniques),
    [selectedTechniques]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b">
        <div className={`w-4 h-4 rounded-full ${lineColor}`} />
        <div>
          <h2 className="text-xl font-semibold">Capsule Collection Plan</h2>
          <p className="text-sm text-muted-foreground">
            {lineName} Line • {allocatedDesigns} designs allocated
          </p>
        </div>
      </div>

      {/* Collection Name */}
      <div className="space-y-2">
        <Label htmlFor="collectionName">Collection Name</Label>
        <Input
          id="collectionName"
          value={collectionName}
          onChange={(e) => setCollectionName(e.target.value)}
          placeholder="Enter collection name"
        />
      </div>

      {/* GTM Strategy & Target Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>GTM Strategy</Label>
          <Select value={selectedGtm} onValueChange={handleGtmChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select GTM strategy" />
            </SelectTrigger>
            <SelectContent>
              {gtmStrategies.map(strategy => (
                <SelectItem key={strategy.id} value={strategy.id}>
                  {strategy.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Target In-store Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !targetDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {targetDate ? format(targetDate, 'PPP') : 'Auto-fetched from GTM'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={targetDate}
                onSelect={setTargetDate}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Category Design Counts with Composition Dropdowns */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Design Count by Category</Label>
          <Badge variant={totalCategoryDesigns > allocatedDesigns ? "destructive" : "secondary"}>
            {totalCategoryDesigns} / {allocatedDesigns} designs
          </Badge>
        </div>
        
        {/* Main Categories (1pc, 2pc, 3pc) */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {/* 1-Piece */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="onePiece" className="text-xs text-muted-foreground">
                {MAIN_CATEGORY_LABELS.onePiece}
              </Label>
              <Popover open={categoryExtrasPopover === 'onePiece'} onOpenChange={(open) => setCategoryExtrasPopover(open ? 'onePiece' : null)}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-5 w-5">
                    <Plus className="h-3 w-3" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-3" align="end">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Add Components</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="onePiece-lining"
                          checked={perCategoryExtras.onePiece.hasLining}
                          onCheckedChange={(checked) => handlePerCategoryExtrasChange('onePiece', 'hasLining', !!checked)}
                        />
                        <label htmlFor="onePiece-lining" className="text-sm cursor-pointer">Lining</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="onePiece-slip"
                          checked={perCategoryExtras.onePiece.hasSlip}
                          onCheckedChange={(checked) => handlePerCategoryExtrasChange('onePiece', 'hasSlip', !!checked)}
                        />
                        <label htmlFor="onePiece-slip" className="text-sm cursor-pointer">Slip</label>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <Input
              id="onePiece"
              type="number"
              min={0}
              value={categoryDesigns.onePiece}
              onChange={(e) => handleCategoryDesignChange('onePiece', parseInt(e.target.value) || 0)}
              className="h-9"
            />
            {(perCategoryExtras.onePiece.hasLining || perCategoryExtras.onePiece.hasSlip) && (
              <div className="flex flex-wrap gap-1">
                {perCategoryExtras.onePiece.hasLining && <Badge variant="secondary" className="text-[10px] h-4">+Lining</Badge>}
                {perCategoryExtras.onePiece.hasSlip && <Badge variant="secondary" className="text-[10px] h-4">+Slip</Badge>}
              </div>
            )}
          </div>

          {/* 2-Piece with Dropdown */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="twoPiece" className="text-xs text-muted-foreground">
                {MAIN_CATEGORY_LABELS.twoPiece}
              </Label>
              <Popover open={categoryExtrasPopover === 'twoPiece'} onOpenChange={(open) => setCategoryExtrasPopover(open ? 'twoPiece' : null)}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-5 w-5">
                    <Plus className="h-3 w-3" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-3" align="end">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Add Components</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="twoPiece-lining"
                          checked={perCategoryExtras.twoPiece.hasLining}
                          onCheckedChange={(checked) => handlePerCategoryExtrasChange('twoPiece', 'hasLining', !!checked)}
                        />
                        <label htmlFor="twoPiece-lining" className="text-sm cursor-pointer">Lining</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="twoPiece-slip"
                          checked={perCategoryExtras.twoPiece.hasSlip}
                          onCheckedChange={(checked) => handlePerCategoryExtrasChange('twoPiece', 'hasSlip', !!checked)}
                        />
                        <label htmlFor="twoPiece-slip" className="text-sm cursor-pointer">Slip</label>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1.5">
              <Input
                id="twoPiece"
                type="number"
                min={0}
                value={categoryDesigns.twoPiece}
                onChange={(e) => handleCategoryDesignChange('twoPiece', parseInt(e.target.value) || 0)}
                className="h-9"
              />
              {categoryDesigns.twoPiece > 0 && (
                <Select 
                  value={categoryComposition.twoPieceType} 
                  onValueChange={(v) => handleCompositionChange('twoPieceType', v as TwoPieceComposition)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TWO_PIECE_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value} className="text-xs">
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {(perCategoryExtras.twoPiece.hasLining || perCategoryExtras.twoPiece.hasSlip) && (
                <div className="flex flex-wrap gap-1">
                  {perCategoryExtras.twoPiece.hasLining && <Badge variant="secondary" className="text-[10px] h-4">+Lining</Badge>}
                  {perCategoryExtras.twoPiece.hasSlip && <Badge variant="secondary" className="text-[10px] h-4">+Slip</Badge>}
                </div>
              )}
            </div>
          </div>

          {/* 3-Piece with fixed composition */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="threePiece" className="text-xs text-muted-foreground">
                {MAIN_CATEGORY_LABELS.threePiece}
              </Label>
              <Popover open={categoryExtrasPopover === 'threePiece'} onOpenChange={(open) => setCategoryExtrasPopover(open ? 'threePiece' : null)}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-5 w-5">
                    <Plus className="h-3 w-3" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-3" align="end">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Add Components</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="threePiece-lining"
                          checked={perCategoryExtras.threePiece.hasLining}
                          onCheckedChange={(checked) => handlePerCategoryExtrasChange('threePiece', 'hasLining', !!checked)}
                        />
                        <label htmlFor="threePiece-lining" className="text-sm cursor-pointer">Lining</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="threePiece-slip"
                          checked={perCategoryExtras.threePiece.hasSlip}
                          onCheckedChange={(checked) => handlePerCategoryExtrasChange('threePiece', 'hasSlip', !!checked)}
                        />
                        <label htmlFor="threePiece-slip" className="text-sm cursor-pointer">Slip</label>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1.5">
              <Input
                id="threePiece"
                type="number"
                min={0}
                value={categoryDesigns.threePiece}
                onChange={(e) => handleCategoryDesignChange('threePiece', parseInt(e.target.value) || 0)}
                className="h-9"
              />
              {categoryDesigns.threePiece > 0 && (
                <p className="text-[10px] text-muted-foreground">Shirt + Lowers + Dupatta</p>
              )}
              {(perCategoryExtras.threePiece.hasLining || perCategoryExtras.threePiece.hasSlip) && (
                <div className="flex flex-wrap gap-1">
                  {perCategoryExtras.threePiece.hasLining && <Badge variant="secondary" className="text-[10px] h-4">+Lining</Badge>}
                  {perCategoryExtras.threePiece.hasSlip && <Badge variant="secondary" className="text-[10px] h-4">+Slip</Badge>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Selected More Categories - shown when they have values */}
        {(categoryDesigns.dupattas > 0 || categoryDesigns.lowers > 0 || categoryComposition.specializedCategory !== 'none') && (
          <div className="flex flex-wrap gap-2">
            {categoryDesigns.dupattas > 0 && (
              <Badge variant="outline" className="gap-1 py-1.5 px-3">
                <span className="font-medium">{categoryDesigns.dupattas}</span> Dupattas
                {(perCategoryExtras.dupattas.hasLining || perCategoryExtras.dupattas.hasSlip) && (
                  <span className="text-muted-foreground ml-1">
                    ({perCategoryExtras.dupattas.hasLining && 'Lining'}{perCategoryExtras.dupattas.hasLining && perCategoryExtras.dupattas.hasSlip && ', '}{perCategoryExtras.dupattas.hasSlip && 'Slip'})
                  </span>
                )}
                <button 
                  type="button" 
                  onClick={() => handleCategoryDesignChange('dupattas', 0)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {categoryDesigns.lowers > 0 && (
              <Badge variant="outline" className="gap-1 py-1.5 px-3">
                <span className="font-medium">{categoryDesigns.lowers}</span> Lowers
                {(perCategoryExtras.lowers.hasLining || perCategoryExtras.lowers.hasSlip) && (
                  <span className="text-muted-foreground ml-1">
                    ({perCategoryExtras.lowers.hasLining && 'Lining'}{perCategoryExtras.lowers.hasLining && perCategoryExtras.lowers.hasSlip && ', '}{perCategoryExtras.lowers.hasSlip && 'Slip'})
                  </span>
                )}
                <button 
                  type="button" 
                  onClick={() => handleCategoryDesignChange('lowers', 0)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {categoryComposition.specializedCategory === 'lehenga-set' && categoryComposition.specializedCount > 0 && (
              <Badge variant="outline" className="gap-1 py-1.5 px-3">
                <span className="font-medium">{categoryComposition.specializedCount}</span> Lehenga Sets
                {(perCategoryExtras['lehenga-set'].hasLining || perCategoryExtras['lehenga-set'].hasSlip) && (
                  <span className="text-muted-foreground ml-1">
                    ({perCategoryExtras['lehenga-set'].hasLining && 'Lining'}{perCategoryExtras['lehenga-set'].hasLining && perCategoryExtras['lehenga-set'].hasSlip && ', '}{perCategoryExtras['lehenga-set'].hasSlip && 'Slip'})
                  </span>
                )}
                <button 
                  type="button" 
                  onClick={() => {
                    handleCompositionChange('specializedCategory', 'none');
                    handleCompositionChange('specializedCount', 0);
                  }}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {categoryComposition.specializedCategory === 'saree-set' && categoryComposition.specializedCount > 0 && (
              <Badge variant="outline" className="gap-1 py-1.5 px-3">
                <span className="font-medium">{categoryComposition.specializedCount}</span> Saree Sets
                {(perCategoryExtras['saree-set'].hasLining || perCategoryExtras['saree-set'].hasSlip || perCategoryExtras['saree-set'].hasPetticoat) && (
                  <span className="text-muted-foreground ml-1">
                    ({[
                      perCategoryExtras['saree-set'].hasLining && 'Lining',
                      perCategoryExtras['saree-set'].hasSlip && 'Slip',
                      perCategoryExtras['saree-set'].hasPetticoat && 'Petticoat'
                    ].filter(Boolean).join(', ')})
                  </span>
                )}
                <button 
                  type="button" 
                  onClick={() => {
                    handleCompositionChange('specializedCategory', 'none');
                    handleCompositionChange('specializedCount', 0);
                  }}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}

        {/* More Categories Button + Dialog */}
        <Dialog open={moreCategoriesOpen} onOpenChange={setMoreCategoriesOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              More Categories
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>More Categories</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              {/* Dupattas */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="dialog-dupattas" className="text-sm">{MORE_CATEGORY_LABELS.dupattas}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Plus className="h-3 w-3" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-3" align="end">
                      <div className="space-y-2">
                        <Label className="text-xs font-medium">Add Components</Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="dupattas-lining"
                              checked={perCategoryExtras.dupattas.hasLining}
                              onCheckedChange={(checked) => handlePerCategoryExtrasChange('dupattas', 'hasLining', !!checked)}
                            />
                            <label htmlFor="dupattas-lining" className="text-sm cursor-pointer">Lining</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="dupattas-slip"
                              checked={perCategoryExtras.dupattas.hasSlip}
                              onCheckedChange={(checked) => handlePerCategoryExtrasChange('dupattas', 'hasSlip', !!checked)}
                            />
                            <label htmlFor="dupattas-slip" className="text-sm cursor-pointer">Slip</label>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <Input
                  id="dialog-dupattas"
                  type="number"
                  min={0}
                  value={categoryDesigns.dupattas}
                  onChange={(e) => handleCategoryDesignChange('dupattas', parseInt(e.target.value) || 0)}
                  className="h-9"
                />
                {(perCategoryExtras.dupattas.hasLining || perCategoryExtras.dupattas.hasSlip) && (
                  <div className="flex flex-wrap gap-1">
                    {perCategoryExtras.dupattas.hasLining && <Badge variant="secondary" className="text-[10px] h-4">+Lining</Badge>}
                    {perCategoryExtras.dupattas.hasSlip && <Badge variant="secondary" className="text-[10px] h-4">+Slip</Badge>}
                  </div>
                )}
              </div>

              {/* Lowers */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="dialog-lowers" className="text-sm">{MORE_CATEGORY_LABELS.lowers}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Plus className="h-3 w-3" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-3" align="end">
                      <div className="space-y-2">
                        <Label className="text-xs font-medium">Add Components</Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="lowers-lining"
                              checked={perCategoryExtras.lowers.hasLining}
                              onCheckedChange={(checked) => handlePerCategoryExtrasChange('lowers', 'hasLining', !!checked)}
                            />
                            <label htmlFor="lowers-lining" className="text-sm cursor-pointer">Lining</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="lowers-slip"
                              checked={perCategoryExtras.lowers.hasSlip}
                              onCheckedChange={(checked) => handlePerCategoryExtrasChange('lowers', 'hasSlip', !!checked)}
                            />
                            <label htmlFor="lowers-slip" className="text-sm cursor-pointer">Slip</label>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <Input
                  id="dialog-lowers"
                  type="number"
                  min={0}
                  value={categoryDesigns.lowers}
                  onChange={(e) => handleCategoryDesignChange('lowers', parseInt(e.target.value) || 0)}
                  className="h-9"
                />
                {(perCategoryExtras.lowers.hasLining || perCategoryExtras.lowers.hasSlip) && (
                  <div className="flex flex-wrap gap-1">
                    {perCategoryExtras.lowers.hasLining && <Badge variant="secondary" className="text-[10px] h-4">+Lining</Badge>}
                    {perCategoryExtras.lowers.hasSlip && <Badge variant="secondary" className="text-[10px] h-4">+Slip</Badge>}
                  </div>
                )}
              </div>

              {/* Specialized - Lehenga Set */}
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">Lehenga Set</Label>
                    <p className="text-xs text-muted-foreground">Lehenga + Choli + Dupatta</p>
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Plus className="h-3 w-3" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-3" align="end">
                      <div className="space-y-2">
                        <Label className="text-xs font-medium">Add Components</Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="lehenga-lining"
                              checked={perCategoryExtras['lehenga-set'].hasLining}
                              onCheckedChange={(checked) => handlePerCategoryExtrasChange('lehenga-set', 'hasLining', !!checked)}
                            />
                            <label htmlFor="lehenga-lining" className="text-sm cursor-pointer">Lining</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="lehenga-slip"
                              checked={perCategoryExtras['lehenga-set'].hasSlip}
                              onCheckedChange={(checked) => handlePerCategoryExtrasChange('lehenga-set', 'hasSlip', !!checked)}
                            />
                            <label htmlFor="lehenga-slip" className="text-sm cursor-pointer">Slip</label>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <Input
                  type="number"
                  min={0}
                  value={categoryComposition.specializedCategory === 'lehenga-set' ? categoryComposition.specializedCount : 0}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    if (val > 0) {
                      handleCompositionChange('specializedCategory', 'lehenga-set');
                      handleCompositionChange('specializedCount', val);
                    } else if (categoryComposition.specializedCategory === 'lehenga-set') {
                      handleCompositionChange('specializedCount', 0);
                    }
                  }}
                  className="h-9"
                  disabled={categoryComposition.specializedCategory === 'saree-set' && categoryComposition.specializedCount > 0}
                />
                {(perCategoryExtras['lehenga-set'].hasLining || perCategoryExtras['lehenga-set'].hasSlip) && categoryComposition.specializedCategory === 'lehenga-set' && (
                  <div className="flex flex-wrap gap-1">
                    {perCategoryExtras['lehenga-set'].hasLining && <Badge variant="secondary" className="text-[10px] h-4">+Lining</Badge>}
                    {perCategoryExtras['lehenga-set'].hasSlip && <Badge variant="secondary" className="text-[10px] h-4">+Slip</Badge>}
                  </div>
                )}
              </div>

              {/* Specialized - Saree Set */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">Saree Set</Label>
                    <p className="text-xs text-muted-foreground">Saree + Blouse</p>
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Plus className="h-3 w-3" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-3" align="end">
                      <div className="space-y-2">
                        <Label className="text-xs font-medium">Add Components</Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="saree-lining"
                              checked={perCategoryExtras['saree-set'].hasLining}
                              onCheckedChange={(checked) => handlePerCategoryExtrasChange('saree-set', 'hasLining', !!checked)}
                            />
                            <label htmlFor="saree-lining" className="text-sm cursor-pointer">Lining</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="saree-slip"
                              checked={perCategoryExtras['saree-set'].hasSlip}
                              onCheckedChange={(checked) => handlePerCategoryExtrasChange('saree-set', 'hasSlip', !!checked)}
                            />
                            <label htmlFor="saree-slip" className="text-sm cursor-pointer">Slip</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="saree-petticoat"
                              checked={perCategoryExtras['saree-set'].hasPetticoat}
                              onCheckedChange={(checked) => handlePerCategoryExtrasChange('saree-set', 'hasPetticoat', !!checked)}
                            />
                            <label htmlFor="saree-petticoat" className="text-sm cursor-pointer">Petticoat</label>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <Input
                  type="number"
                  min={0}
                  value={categoryComposition.specializedCategory === 'saree-set' ? categoryComposition.specializedCount : 0}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    if (val > 0) {
                      handleCompositionChange('specializedCategory', 'saree-set');
                      handleCompositionChange('specializedCount', val);
                    } else if (categoryComposition.specializedCategory === 'saree-set') {
                      handleCompositionChange('specializedCount', 0);
                    }
                  }}
                  className="h-9"
                  disabled={categoryComposition.specializedCategory === 'lehenga-set' && categoryComposition.specializedCount > 0}
                />
                {categoryComposition.specializedCategory === 'saree-set' && (perCategoryExtras['saree-set'].hasLining || perCategoryExtras['saree-set'].hasSlip || perCategoryExtras['saree-set'].hasPetticoat) && (
                  <div className="flex flex-wrap gap-1">
                    {perCategoryExtras['saree-set'].hasLining && <Badge variant="secondary" className="text-[10px] h-4">+Lining</Badge>}
                    {perCategoryExtras['saree-set'].hasSlip && <Badge variant="secondary" className="text-[10px] h-4">+Slip</Badge>}
                    {perCategoryExtras['saree-set'].hasPetticoat && <Badge variant="secondary" className="text-[10px] h-4">+Petticoat</Badge>}
                  </div>
                )}
              </div>

              <Button 
                type="button" 
                onClick={() => setMoreCategoriesOpen(false)} 
                className="w-full mt-4"
              >
                Done
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {totalCategoryDesigns > allocatedDesigns && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Total exceeds allocated designs for this line
          </p>
        )}
      </div>

      {/* Auto-generated Fabric Requirements */}
      {requiredFabricFields.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Label>Fabric Requirements</Label>
            <Badge variant="outline" className="text-xs">Auto-generated</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {requiredFabricFields.map(field => (
              <div key={field} className="space-y-1">
                <Label htmlFor={field} className="text-xs text-muted-foreground flex items-center gap-1">
                  {FABRIC_FIELD_LABELS[field]}
                  {field === 'trimsFabric' && (
                    <Badge variant="secondary" className="text-[10px] h-4">Suggested</Badge>
                  )}
                </Label>
                <Input
                  id={field}
                  value={fabricRequirements[field]}
                  onChange={(e) => handleFabricRequirementChange(field, e.target.value)}
                  placeholder={`Enter ${FABRIC_FIELD_LABELS[field].toLowerCase()}`}
                  className="h-9"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Collection Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Collection Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the collection concept, inspiration, and key themes..."
          rows={3}
        />
      </div>

      {/* Visual Inspiration / Moodboards */}
      <div className="space-y-3">
        <Label>Visual Inspiration (Moodboards)</Label>
        <div className="border-2 border-dashed rounded-lg p-4">
          <input
            type="file"
            id="moodboard-upload"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <label
            htmlFor="moodboard-upload"
            className="flex flex-col items-center justify-center cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
          >
            <Upload className="h-8 w-8 mb-2" />
            <span className="text-sm">Click to upload moodboards</span>
            <span className="text-xs">PNG, JPG up to 10MB</span>
          </label>
        </div>
        {moodboards.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {moodboards.map((file, index) => (
              <Badge key={index} variant="secondary" className="gap-1">
                {file.name}
                <button
                  type="button"
                  onClick={() => removeMoodboard(index)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        {existingCapsule && existingCapsule.moodboardCount > 0 && (
          <p className="text-xs text-muted-foreground">
            {existingCapsule.moodboardCount} existing moodboard(s) saved
          </p>
        )}
      </div>

      {/* Pinterest Board Link */}
      <div className="space-y-2">
        <Label htmlFor="pinterestLink" className="flex items-center gap-2">
          <LinkIcon className="h-4 w-4" />
          Pinterest Board Link
        </Label>
        <Input
          id="pinterestLink"
          type="url"
          value={pinterestBoardLink}
          onChange={(e) => setPinterestBoardLink(e.target.value)}
          placeholder="https://pinterest.com/yourbrand/collection-board"
        />
      </div>

      {/* Additional Fabric/Materials Selection */}
      <div className="space-y-3">
        <Label>Additional Fabric/Materials</Label>
        <div className="flex gap-2">
          <Input
            value={newFabric}
            onChange={(e) => setNewFabric(e.target.value)}
            placeholder="Add fabric or material"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFabric())}
          />
          <Button type="button" variant="outline" size="icon" onClick={addFabric}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {fabrics.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {fabrics.map(fabric => (
              <Badge key={fabric} variant="secondary" className="gap-1">
                {fabric}
                <button
                  type="button"
                  onClick={() => removeFabric(fabric)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Techniques/Processes */}
      <div className="space-y-3">
        <Label>Techniques/Processes Planned</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {TECHNIQUE_BUFFERS.map(technique => (
            <div
              key={technique.id}
              className="flex items-center space-x-2"
            >
              <Checkbox
                id={technique.id}
                checked={selectedTechniques.includes(technique.id)}
                onCheckedChange={() => toggleTechnique(technique.id)}
              />
              <label
                htmlFor={technique.id}
                className={cn(
                  "text-sm cursor-pointer",
                  technique.isComplex && "font-medium"
                )}
              >
                {technique.label}
                {technique.isComplex && (
                  <span className="text-xs text-muted-foreground ml-1">(+{technique.bufferDays}d)</span>
                )}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Production Timeline Summary - Full Critical Path */}
      {targetDate && schedule && (
        <Card className="p-4 bg-muted/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <Label className="text-base font-medium">Production Timeline</Label>
            </div>
            <Badge variant="outline">
              {schedule.totalDays} days total
            </Badge>
          </div>
          
          {complexTechniques.length > 0 && (
            <div className="flex items-start gap-2 mb-3 p-2 rounded bg-[hsl(var(--status-pending))]/10 border border-[hsl(var(--status-pending))]/20">
              <AlertTriangle className="h-4 w-4 text-[hsl(var(--status-pending))] mt-0.5" />
              <div className="text-sm">
                <span className="font-medium">Complex techniques selected:</span>
                <span className="ml-1">
                  {complexTechniques.map(t => t.label).join(', ')}
                </span>
                <span className="text-muted-foreground ml-1">
                  (+{schedule.techniqueBuffer} buffer days added)
                </span>
              </div>
            </div>
          )}

          {/* Key Dates Summary */}
          <div className="grid grid-cols-3 gap-3 text-sm mb-4">
            <div className="p-2 rounded bg-purple-500/10 border border-purple-500/20">
              <div className="text-xs text-muted-foreground">Design Start</div>
              <div className="font-medium text-purple-600">
                {format(schedule.fabricDesignStartDate, 'MMM d, yyyy')}
              </div>
            </div>
            <div className="p-2 rounded bg-red-500/10 border border-red-500/20">
              <div className="text-xs text-muted-foreground">Production Start</div>
              <div className="font-medium text-red-600">
                {format(schedule.productionStartDate, 'MMM d, yyyy')}
              </div>
            </div>
            <div className="p-2 rounded bg-green-500/10 border border-green-500/20">
              <div className="text-xs text-muted-foreground">In-Store Date</div>
              <div className="font-medium text-green-600">
                {format(targetDate, 'MMM d, yyyy')}
              </div>
            </div>
          </div>

          {/* Full Milestone Breakdown */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Critical Path Breakdown</Label>
            <ScrollArea className="h-40">
              <div className="space-y-1 pr-4">
                {schedule.milestones.map((milestone, idx) => (
                  <div 
                    key={milestone.id}
                    className="flex items-center gap-2 text-xs py-1.5 px-2 rounded hover:bg-muted/50"
                  >
                    {idx > 0 && (
                      <ArrowRight className="h-3 w-3 text-muted-foreground/50 -ml-1" />
                    )}
                    <div className={cn('w-2 h-2 rounded', getPhaseColor(milestone.phase))} />
                    <span className="flex-1 font-medium">{milestone.label}</span>
                    <span className="text-muted-foreground">
                      {format(milestone.startDate, 'MMM d')} - {format(milestone.endDate, 'MMM d')}
                    </span>
                    <Badge variant="secondary" className="text-[10px] h-5">
                      {milestone.duration}d
                    </Badge>
                  </div>
                ))}
                {/* Final In-Store milestone */}
                <div className="flex items-center gap-2 text-xs py-1.5 px-2 rounded bg-green-500/10">
                  <ArrowRight className="h-3 w-3 text-muted-foreground/50 -ml-1" />
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  <span className="flex-1 font-medium text-green-600">In-Store Delivery</span>
                  <span className="font-semibold text-green-600">
                    {format(targetDate, 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
            </ScrollArea>
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          Save Collection Plan
        </Button>
      </div>
    </form>
  );
};

export default CapsuleCollectionPlanForm;
