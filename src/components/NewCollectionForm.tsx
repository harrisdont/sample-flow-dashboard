import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useCapsuleStore, defaultCategoryComposition, defaultFabricRequirements, LINE_COLLECTION_CAPACITY } from '@/data/capsuleCollectionData';
import { toast } from 'sonner';

interface NewCollectionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PRODUCT_LINES = [
  { id: 'cottage', name: 'Cottage' },
  { id: 'classic', name: 'Classic' },
  { id: 'formals', name: 'Formals' },
  { id: 'woman', name: 'Woman' },
  { id: 'ming', name: 'Ming' },
  { id: 'basic', name: 'Basic' },
  { id: 'semi-bridals', name: 'Semi Bridals' },
  { id: 'leather', name: 'Leather' },
  { id: 'regen', name: 'Regen' },
];

const GTM_STRATEGIES = [
  { id: 'spring-launch', name: 'Spring Launch' },
  { id: 'summer-collection', name: 'Summer Collection' },
  { id: 'festive-season', name: 'Festive Season' },
  { id: 'winter-release', name: 'Winter Release' },
  { id: 'resort-collection', name: 'Resort Collection' },
];

export const NewCollectionForm = ({ open, onOpenChange }: NewCollectionFormProps) => {
  const addCapsule = useCapsuleStore((state) => state.addCapsule);
  
  const [lineId, setLineId] = useState('');
  const [collectionName, setCollectionName] = useState('');
  const [gtmStrategy, setGtmStrategy] = useState('');
  const [targetDate, setTargetDate] = useState<Date>();
  const [description, setDescription] = useState('');
  const [pinterestLink, setPinterestLink] = useState('');

  const selectedLine = PRODUCT_LINES.find(l => l.id === lineId);
  const capacity = lineId ? LINE_COLLECTION_CAPACITY[lineId] || 12 : 0;

  const handleSubmit = () => {
    if (!lineId || !collectionName || !gtmStrategy || !targetDate) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    const id = `${lineId}-${collectionName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    
    addCapsule({
      id,
      lineId,
      lineName: selectedLine?.name || '',
      collectionName,
      gtmStrategy,
      targetInStoreDate: targetDate,
      productMix: { onePiece: 0, twoPiece: 0, threePiece: 0 },
      categoryDesigns: { onePiece: 0, twoPiece: 0, threePiece: 0, dupattas: 0, lowers: 0 },
      categoryComposition: { ...defaultCategoryComposition },
      fabricRequirements: { ...defaultFabricRequirements },
      selectedTechniques: [],
      fabrics: [],
      description,
      moodboardCount: 0,
      pinterestBoardLink: pinterestLink,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    toast.success('Collection Created Successfully', {
      description: `${collectionName} added to ${selectedLine?.name}`,
    });
    
    // Reset form
    setLineId('');
    setCollectionName('');
    setGtmStrategy('');
    setTargetDate(undefined);
    setDescription('');
    setPinterestLink('');
    onOpenChange(false);
  };

  const handleClose = () => {
    setLineId('');
    setCollectionName('');
    setGtmStrategy('');
    setTargetDate(undefined);
    setDescription('');
    setPinterestLink('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Collection</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="line">Product Line *</Label>
            <Select value={lineId} onValueChange={setLineId}>
              <SelectTrigger id="line">
                <SelectValue placeholder="Select product line" />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_LINES.map((line) => (
                  <SelectItem key={line.id} value={line.id}>
                    {line.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {lineId && (
              <p className="text-xs text-muted-foreground">
                Capacity: {capacity} designs per collection
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Collection Name *</Label>
            <Input
              id="name"
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              placeholder="e.g., Spring Heritage"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gtm">GTM Strategy *</Label>
            <Select value={gtmStrategy} onValueChange={setGtmStrategy}>
              <SelectTrigger id="gtm">
                <SelectValue placeholder="Select GTM strategy" />
              </SelectTrigger>
              <SelectContent>
                {GTM_STRATEGIES.map((strategy) => (
                  <SelectItem key={strategy.id} value={strategy.id}>
                    {strategy.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Target In-Store Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !targetDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {targetDate ? format(targetDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={targetDate}
                  onSelect={setTargetDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pinterest">Pinterest Board Link</Label>
            <Input
              id="pinterest"
              value={pinterestLink}
              onChange={(e) => setPinterestLink(e.target.value)}
              placeholder="https://pinterest.com/..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the collection concept..."
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Create Collection
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
