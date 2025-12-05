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
import { CalendarIcon, Upload, X, Plus, AlertTriangle, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { 
  TECHNIQUE_BUFFERS, 
  getComplexTechniques,
} from '@/data/leadTimeSettings';
import { calculateBackwardsSchedule, getPhaseColor } from '@/lib/schedulingEngine';
import { useCapsuleStore, CapsuleCollection } from '@/data/capsuleCollectionData';
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
  const [moodboards, setMoodboards] = useState<File[]>([]);
  const [description, setDescription] = useState(existingCapsule?.description || '');
  const [fabrics, setFabrics] = useState<string[]>(existingCapsule?.fabrics || []);
  const [newFabric, setNewFabric] = useState('');
  const [selectedTechniques, setSelectedTechniques] = useState<string[]>(existingCapsule?.selectedTechniques || []);

  // Load existing data when lineId changes
  useEffect(() => {
    if (existingCapsule) {
      setCollectionName(existingCapsule.collectionName);
      setSelectedGtm(existingCapsule.gtmStrategy);
      setTargetDate(existingCapsule.targetInStoreDate);
      setProductMix(existingCapsule.productMix);
      setDescription(existingCapsule.description);
      setFabrics(existingCapsule.fabrics);
      setSelectedTechniques(existingCapsule.selectedTechniques);
    }
  }, [existingCapsule]);

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
      selectedTechniques,
      fabrics,
      description,
      moodboardCount: moodboards.length,
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

  const totalPieces = productMix.twoPiece + productMix.onePiece + productMix.threePiece;

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

      {/* Product Mix */}
      <div className="space-y-3">
        <Label>Product Mix</Label>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label htmlFor="twoPiece" className="text-xs text-muted-foreground">2-Piece</Label>
            <Input
              id="twoPiece"
              type="number"
              min={0}
              value={productMix.twoPiece}
              onChange={(e) => setProductMix(prev => ({ ...prev, twoPiece: parseInt(e.target.value) || 0 }))}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="onePiece" className="text-xs text-muted-foreground">1-Piece</Label>
            <Input
              id="onePiece"
              type="number"
              min={0}
              value={productMix.onePiece}
              onChange={(e) => setProductMix(prev => ({ ...prev, onePiece: parseInt(e.target.value) || 0 }))}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="threePiece" className="text-xs text-muted-foreground">3-Piece</Label>
            <Input
              id="threePiece"
              type="number"
              min={0}
              value={productMix.threePiece}
              onChange={(e) => setProductMix(prev => ({ ...prev, threePiece: parseInt(e.target.value) || 0 }))}
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Total: {totalPieces} pieces</p>
      </div>

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
      </div>

      {/* Fabric/Materials Selection */}
      <div className="space-y-3">
        <Label>Fabric/Materials</Label>
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
