import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
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
import { CalendarIcon, Upload, X, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface CapsuleCollectionPlanFormProps {
  lineName: string;
  lineColor: string;
  allocatedDesigns: number;
  onClose: () => void;
}

// Mock GTM strategies that would be fetched from Main Category Plan
const gtmStrategies = [
  { id: 'spring-launch', name: 'Spring Launch 2025', targetDate: new Date(2025, 2, 15) },
  { id: 'summer-collection', name: 'Summer Collection 2025', targetDate: new Date(2025, 5, 1) },
  { id: 'festive-season', name: 'Festive Season 2025', targetDate: new Date(2025, 9, 10) },
  { id: 'winter-release', name: 'Winter Release 2025', targetDate: new Date(2025, 11, 1) },
];

const techniques = [
  { id: 'jacquards', label: 'Jacquards' },
  { id: 'yarn-dyed', label: 'Yarn Dyed' },
  { id: 'embroidery', label: 'Embroidery' },
  { id: 'handwork', label: 'Handwork' },
  { id: 'block-printing', label: 'Block Printing' },
  { id: 'multihead', label: 'Multihead' },
];

const CapsuleCollectionPlanForm = ({
  lineName,
  lineColor,
  allocatedDesigns,
  onClose,
}: CapsuleCollectionPlanFormProps) => {
  const [collectionName, setCollectionName] = useState('');
  const [selectedGtm, setSelectedGtm] = useState('');
  const [targetDate, setTargetDate] = useState<Date | undefined>();
  const [productMix, setProductMix] = useState({
    twoPiece: 0,
    onePiece: 0,
    threePiece: 0,
  });
  const [moodboards, setMoodboards] = useState<File[]>([]);
  const [description, setDescription] = useState('');
  const [fabrics, setFabrics] = useState<string[]>([]);
  const [newFabric, setNewFabric] = useState('');
  const [selectedTechniques, setSelectedTechniques] = useState<string[]>([]);

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
    console.log({
      collectionName,
      selectedGtm,
      targetDate,
      productMix,
      moodboards,
      description,
      fabrics,
      selectedTechniques,
    });
    onClose();
  };

  const totalPieces = productMix.twoPiece + productMix.onePiece + productMix.threePiece;

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
          {techniques.map(technique => (
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
                className="text-sm cursor-pointer"
              >
                {technique.label}
              </label>
            </div>
          ))}
        </div>
      </div>

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
