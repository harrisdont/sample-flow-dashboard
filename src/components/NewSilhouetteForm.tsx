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
import { useCapsuleStore } from '@/data/capsuleCollectionData';
import { toast } from 'sonner';

interface NewSilhouetteFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewSilhouetteForm = ({ open, onOpenChange }: NewSilhouetteFormProps) => {
  const capsules = useCapsuleStore((state) => state.capsules);
  const capsuleList = Object.values(capsules);
  
  const [selectedCollection, setSelectedCollection] = useState('');
  const [silhouetteCode, setSilhouetteCode] = useState('');
  const [silhouetteName, setSilhouetteName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (!selectedCollection || !silhouetteCode || !silhouetteName || !category) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    toast.success('Silhouette Created Successfully', {
      description: `${silhouetteName} added to collection`,
    });
    
    // Reset form
    setSelectedCollection('');
    setSilhouetteCode('');
    setSilhouetteName('');
    setCategory('');
    setDescription('');
    onOpenChange(false);
  };

  const handleClose = () => {
    setSelectedCollection('');
    setSilhouetteCode('');
    setSilhouetteName('');
    setCategory('');
    setDescription('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Silhouette</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="collection">Collection *</Label>
            <Select value={selectedCollection} onValueChange={setSelectedCollection}>
              <SelectTrigger id="collection">
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Silhouette Code *</Label>
              <Input
                id="code"
                value={silhouetteCode}
                onChange={(e) => setSilhouetteCode(e.target.value)}
                placeholder="e.g., W-LNG-001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Silhouette Name *</Label>
              <Input
                id="name"
                value={silhouetteName}
                onChange={(e) => setSilhouetteName(e.target.value)}
                placeholder="e.g., Long Kurta"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tops">Tops</SelectItem>
                <SelectItem value="bottoms">Bottoms</SelectItem>
                <SelectItem value="outerwear">Outerwear</SelectItem>
                <SelectItem value="dresses">Dresses</SelectItem>
                <SelectItem value="accessories">Accessories</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the silhouette details..."
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Create Silhouette
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
