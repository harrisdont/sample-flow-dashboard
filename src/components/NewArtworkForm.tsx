import { useState, useMemo } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Plus, X, Paintbrush, Printer, Sparkles, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

import { useCapsuleStore } from '@/data/capsuleCollectionData';
import { useSilhouetteStore } from '@/data/silhouetteStore';
import { useArtworkStore, ArtworkType, SHIRT_PLACEMENTS, LOWERS_PLACEMENTS, DUPATTA_PLACEMENTS, PLACEMENT_LABELS, Colourway } from '@/data/artworkStore';
import { useNotificationStore } from '@/data/notificationStore';

interface NewArtworkFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PRINT_TECHNIQUES = [
  { value: 'digital', label: 'Digital' },
  { value: 'rotary', label: 'Rotary' },
  { value: 'screen', label: 'Screen' },
];

const MOTIF_TECHNIQUES = [
  { value: 'multihead', label: 'Multihead' },
  { value: 'pakki', label: 'Pakki' },
  { value: 'ari-dori', label: 'Ari-Dori' },
  { value: 'adda', label: 'Adda' },
  { value: 'cottage', label: 'Cottage' },
];

const COMPONENTS = [
  { value: 'shirt', label: 'Shirt' },
  { value: 'dupatta', label: 'Dupatta' },
  { value: 'lowers', label: 'Lowers' },
];

export const NewArtworkForm = ({ open, onOpenChange }: NewArtworkFormProps) => {
  const { capsules } = useCapsuleStore();
  const { getApprovedSilhouettes } = useSilhouetteStore();
  const { addArtwork } = useArtworkStore();
  const { addNotification } = useNotificationStore();

  // Form state
  const [artworkType, setArtworkType] = useState<ArtworkType>('print');
  const [collectionId, setCollectionId] = useState('');
  const [designerName, setDesignerName] = useState('');
  const [technique, setTechnique] = useState('');
  const [layout, setLayout] = useState('');
  const [components, setComponents] = useState<string[]>([]);
  const [placements, setPlacements] = useState<string[]>([]);
  const [artworkFileLink, setArtworkFileLink] = useState('');
  const [colourways, setColourways] = useState<Colourway[]>([]);
  const [butterPaperId, setButterPaperId] = useState('');
  const [notes, setNotes] = useState('');

  const collections = useMemo(() => Object.values(capsules), [capsules]);
  const selectedCollection = collections.find(c => c.id === collectionId);
  const approvedSilhouettes = useMemo(() => getApprovedSilhouettes(), [getApprovedSilhouettes]);
  const selectedButterPaper = approvedSilhouettes.find(s => s.id === butterPaperId);

  // Determine if we need layout selection
  const showLayout = artworkType === 'print' || (artworkType === 'motif' && technique === 'multihead');
  const layoutOptions = artworkType === 'motif' && technique === 'multihead'
    ? ['running', 'engineered', 'borders']
    : ['running', 'engineered'];

  // Determine if we show component/placement
  const showComponents = layout === 'running' || layout === 'borders' ||
    (layout === 'engineered' && artworkType === 'print') ||
    (artworkType === 'motif' && technique !== 'multihead' && technique !== '');
  
  const showPlacements = (layout === 'engineered' && artworkType === 'print') ||
    (artworkType === 'motif' && technique !== 'multihead' && technique !== '');

  const showButterPaper = artworkType === 'motif' && technique === 'multihead' && layout === 'engineered';

  const getPlacementsForComponent = (comp: string) => {
    switch (comp) {
      case 'shirt': return SHIRT_PLACEMENTS;
      case 'lowers': return LOWERS_PLACEMENTS;
      case 'dupatta': return DUPATTA_PLACEMENTS;
      default: return [];
    }
  };

  const availablePlacements = components.flatMap(c => [...getPlacementsForComponent(c)]);

  const toggleComponent = (comp: string) => {
    setComponents(prev =>
      prev.includes(comp) ? prev.filter(c => c !== comp) : [...prev, comp]
    );
    // Clear placements for removed components
    if (components.includes(comp)) {
      const removedPlacements = [...getPlacementsForComponent(comp)];
      setPlacements(prev => prev.filter(p => !removedPlacements.includes(p as any)));
    }
  };

  const togglePlacement = (pl: string) => {
    setPlacements(prev =>
      prev.includes(pl) ? prev.filter(p => p !== pl) : [...prev, pl]
    );
  };

  const addColourway = () => {
    setColourways(prev => [...prev, { id: `cw-${Date.now()}`, name: '', fileLink: '' }]);
  };

  const updateColourway = (id: string, field: 'name' | 'fileLink', value: string) => {
    setColourways(prev => prev.map(cw => cw.id === id ? { ...cw, [field]: value } : cw));
  };

  const removeColourway = (id: string) => {
    setColourways(prev => prev.filter(cw => cw.id !== id));
  };

  const resetForm = () => {
    setArtworkType('print');
    setCollectionId('');
    setDesignerName('');
    setTechnique('');
    setLayout('');
    setComponents([]);
    setPlacements([]);
    setArtworkFileLink('');
    setColourways([]);
    setButterPaperId('');
    setNotes('');
  };

  const handleSubmit = () => {
    if (!collectionId || !designerName || !technique) {
      toast.error('Please fill in all required fields');
      return;
    }

    const autoFilledDetails = selectedButterPaper ? {
      silhouetteName: selectedButterPaper.name,
      componentName: selectedButterPaper.category,
      code: selectedButterPaper.code,
      category: selectedButterPaper.category,
      subType: selectedButterPaper.subType || '',
    } : undefined;

    addArtwork({
      type: artworkType,
      collectionId,
      designerName,
      lineId: selectedCollection?.lineId || '',
      technique,
      layout,
      components,
      placements,
      artworkFileLink,
      colourways,
      butterPaperId: butterPaperId || undefined,
      autoFilledDetails,
      status: 'submitted',
      notes,
    });

    addNotification({
      type: 'task-assigned',
      severity: 'info',
      title: 'New Artwork Submitted',
      message: `${designerName} submitted a new ${artworkType} artwork (${technique}) for ${selectedCollection?.collectionName || 'collection'}.`,
      recipientRoles: ['design-lead'],
      actionUrl: '/design-hub',
      actionLabel: 'View Artwork',
    });

    toast.success('Artwork submitted successfully');
    resetForm();
    onOpenChange(false);
  };

  // Reset technique/layout/components when type changes
  const handleTypeChange = (type: ArtworkType) => {
    setArtworkType(type);
    setTechnique('');
    setLayout('');
    setComponents([]);
    setPlacements([]);
    setButterPaperId('');
  };

  const handleTechniqueChange = (t: string) => {
    setTechnique(t);
    setLayout('');
    setComponents([]);
    setPlacements([]);
    setButterPaperId('');
  };

  const handleLayoutChange = (l: string) => {
    setLayout(l);
    setComponents([]);
    setPlacements([]);
    setButterPaperId('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6 space-y-6">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Paintbrush className="h-5 w-5" />
                New Artwork Induction
              </DialogTitle>
              <DialogDescription>
                Submit a new print or motif artwork for your collection
              </DialogDescription>
            </DialogHeader>

            {/* Section 1 — Type & Common Fields */}
            <div className="space-y-4">
              <Label className="text-sm font-semibold">Artwork Type</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={artworkType === 'print' ? 'default' : 'outline'}
                  className="h-16 gap-3 text-base"
                  onClick={() => handleTypeChange('print')}
                >
                  <Printer className="h-5 w-5" />
                  Print
                </Button>
                <Button
                  type="button"
                  variant={artworkType === 'motif' ? 'default' : 'outline'}
                  className="h-16 gap-3 text-base"
                  onClick={() => handleTypeChange('motif')}
                >
                  <Sparkles className="h-5 w-5" />
                  Motif
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Collection *</Label>
                  <Select value={collectionId} onValueChange={setCollectionId}>
                    <SelectTrigger><SelectValue placeholder="Select collection" /></SelectTrigger>
                    <SelectContent>
                      {collections.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.collectionName} ({c.lineName})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Designer Name *</Label>
                  <Input value={designerName} onChange={e => setDesignerName(e.target.value)} placeholder="Enter designer name" />
                </div>
              </div>

              {selectedCollection && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="secondary">{selectedCollection.lineName}</Badge>
                  <span>•</span>
                  <span>{selectedCollection.collectionName}</span>
                </div>
              )}
            </div>

            <Separator />

            {/* Section 2 — Technique Selection */}
            <div className="space-y-4">
              <Label className="text-sm font-semibold">
                {artworkType === 'print' ? 'Print Technique' : 'Motif Technique'} *
              </Label>
              <div className="flex flex-wrap gap-2">
                {(artworkType === 'print' ? PRINT_TECHNIQUES : MOTIF_TECHNIQUES).map(t => (
                  <Button
                    key={t.value}
                    type="button"
                    variant={technique === t.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleTechniqueChange(t.value)}
                  >
                    {t.label}
                  </Button>
                ))}
              </div>

              {/* Layout selection */}
              {showLayout && technique && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Layout</Label>
                  <div className="flex flex-wrap gap-2">
                    {layoutOptions.map(l => (
                      <Button
                        key={l}
                        type="button"
                        variant={layout === l ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleLayoutChange(l)}
                        className="capitalize"
                      >
                        {l}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Section 3 — Component & Placement */}
            {(showComponents || showButterPaper) && (
              <>
                <Separator />
                <div className="space-y-4">
                  {showButterPaper ? (
                    // Butter Paper selection for multihead engineered
                    <div className="space-y-4">
                      <Label className="text-sm font-semibold">Select Butter Paper (Approved Silhouette)</Label>
                      <Select value={butterPaperId} onValueChange={setButterPaperId}>
                        <SelectTrigger><SelectValue placeholder="Select butter paper" /></SelectTrigger>
                        <SelectContent>
                          {approvedSilhouettes.map(s => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.code} — {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {selectedButterPaper && (
                        <Card className="border-primary/30 bg-primary/5">
                          <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground mb-2">Auto-filled from Butter Paper</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                              <div>
                                <span className="text-muted-foreground">Name:</span>{' '}
                                <span className="font-medium">{selectedButterPaper.name}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Code:</span>{' '}
                                <span className="font-medium">{selectedButterPaper.code}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Category:</span>{' '}
                                <Badge variant="secondary" className="capitalize">{selectedButterPaper.category}</Badge>
                              </div>
                              {selectedButterPaper.subType && (
                                <div>
                                  <span className="text-muted-foreground">Sub-type:</span>{' '}
                                  <span className="font-medium capitalize">{selectedButterPaper.subType}</span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Manual placement override */}
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Placement Override (optional)</Label>
                        <div className="flex flex-wrap gap-2">
                          {[...SHIRT_PLACEMENTS, ...LOWERS_PLACEMENTS, ...DUPATTA_PLACEMENTS].map(pl => (
                            <label key={pl} className="flex items-center gap-1.5 text-sm">
                              <Checkbox
                                checked={placements.includes(pl)}
                                onCheckedChange={() => togglePlacement(pl)}
                              />
                              {PLACEMENT_LABELS[pl]}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Standard component & placement
                    <div className="space-y-4">
                      <Label className="text-sm font-semibold">Component</Label>
                      <div className="flex flex-wrap gap-3">
                        {COMPONENTS.map(c => (
                          <label key={c.value} className="flex items-center gap-2 text-sm">
                            <Checkbox
                              checked={components.includes(c.value)}
                              onCheckedChange={() => toggleComponent(c.value)}
                            />
                            {c.label}
                          </label>
                        ))}
                      </div>

                      {showPlacements && components.length > 0 && (
                        <div className="space-y-3">
                          <Label className="text-sm font-semibold">Placement</Label>
                          {components.map(comp => {
                            const compPlacements = getPlacementsForComponent(comp);
                            if (compPlacements.length === 0) return null;
                            return (
                              <div key={comp} className="space-y-2">
                                <p className="text-xs text-muted-foreground capitalize font-medium">{comp}</p>
                                <div className="flex flex-wrap gap-2">
                                  {compPlacements.map(pl => (
                                    <label key={pl} className="flex items-center gap-1.5 text-sm">
                                      <Checkbox
                                        checked={placements.includes(pl)}
                                        onCheckedChange={() => togglePlacement(pl)}
                                      />
                                      {PLACEMENT_LABELS[pl]}
                                    </label>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            <Separator />

            {/* Section 4 — Artwork Files */}
            <div className="space-y-4">
              <Label className="text-sm font-semibold">Artwork File</Label>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">File Link (local/network path)</Label>
                <Input
                  value={artworkFileLink}
                  onChange={e => setArtworkFileLink(e.target.value)}
                  placeholder="\\\\server\\artwork\\filename.psd"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Colourways</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addColourway} className="gap-1">
                    <Plus className="h-3 w-3" />
                    Add Colourway
                  </Button>
                </div>
                {colourways.length === 0 && (
                  <p className="text-sm text-muted-foreground">No colourways added yet</p>
                )}
                {colourways.map(cw => (
                  <div key={cw.id} className="flex items-start gap-2">
                    <div className="grid grid-cols-2 gap-2 flex-1">
                      <Input
                        placeholder="Colourway name"
                        value={cw.name}
                        onChange={e => updateColourway(cw.id, 'name', e.target.value)}
                      />
                      <Input
                        placeholder="File link"
                        value={cw.fileLink}
                        onChange={e => updateColourway(cw.id, 'fileLink', e.target.value)}
                      />
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeColourway(cw.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Section 5 — Notes */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Designer Notes</Label>
              <Textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Any additional notes about this artwork..."
                rows={3}
              />
            </div>

            {/* Section 6 — Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => { resetForm(); onOpenChange(false); }}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} className="gap-2">
                <FileText className="h-4 w-4" />
                Submit Artwork
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
