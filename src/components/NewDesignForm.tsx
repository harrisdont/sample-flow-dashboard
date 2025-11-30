import { useState } from 'react';
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
import { mockCollections } from '@/data/mockData';
import {
  silhouetteLibrary,
  necklineLibrary,
  sleeveLibrary,
  seamFinishLibrary,
  fabricLibrary,
} from '@/data/libraryData';
import { toast } from 'sonner';
import { ChevronRight, ChevronLeft, Zap } from 'lucide-react';

interface NewDesignFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = 1 | 2 | 3;

export const NewDesignForm = ({ open, onOpenChange }: NewDesignFormProps) => {
  const [step, setStep] = useState<Step>(1);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [selectedSilhouette, setSelectedSilhouette] = useState('');
  const [selectedFabric, setSelectedFabric] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [selectedNeckline, setSelectedNeckline] = useState('');
  const [selectedSleeve, setSelectedSleeve] = useState('');
  const [selectedSeamFinish, setSelectedSeamFinish] = useState('');
  const [sampleType, setSampleType] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [fastTrack, setFastTrack] = useState(false);
  const [fastTrackReason, setFastTrackReason] = useState('');

  const handleNext = () => {
    if (step === 1 && (!selectedCollection || !selectedSilhouette || !selectedFabric)) {
      toast.error('Please complete all required fields');
      return;
    }
    if (step === 2 && isCustom && (!selectedNeckline || !selectedSleeve || !selectedSeamFinish)) {
      toast.error('Please complete all customization fields');
      return;
    }
    if (step < 3) setStep((step + 1) as Step);
  };

  const handleBack = () => {
    if (step > 1) setStep((step - 1) as Step);
  };

  const handleSubmit = () => {
    if (!sampleType) {
      toast.error('Please select a sample type');
      return;
    }
    toast.success('Design Submitted Successfully', {
      description: 'Sample demand generated and approval process initiated',
    });
    onOpenChange(false);
    // Reset form
    setStep(1);
    setSelectedCollection('');
    setSelectedSilhouette('');
    setSelectedFabric('');
    setIsCustom(false);
    setSelectedNeckline('');
    setSelectedSleeve('');
    setSelectedSeamFinish('');
    setSampleType('');
    setAdditionalNotes('');
    setFastTrack(false);
    setFastTrackReason('');
  };

  const selectedSilhouetteData = silhouetteLibrary.find(s => s.id === selectedSilhouette);

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
                <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                  <SelectTrigger id="collection">
                    <SelectValue placeholder="Select collection" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCollections.map((collection) => (
                      <SelectItem key={collection.name} value={collection.name}>
                        {collection.name} - Slot {collection.slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="silhouette">Silhouette *</Label>
                <Select value={selectedSilhouette} onValueChange={setSelectedSilhouette}>
                  <SelectTrigger id="silhouette">
                    <SelectValue placeholder="Select silhouette" />
                  </SelectTrigger>
                  <SelectContent>
                    {silhouetteLibrary.map((silhouette) => (
                      <SelectItem key={silhouette.id} value={silhouette.id}>
                        {silhouette.code} - {silhouette.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedSilhouetteData && (
                  <div className="p-4 border border-border rounded-lg bg-card/50">
                    <p className="text-sm text-muted-foreground">
                      Category: <span className="text-foreground capitalize">{selectedSilhouetteData.category}</span>
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fabric">Base Fabric *</Label>
                <Select value={selectedFabric} onValueChange={setSelectedFabric}>
                  <SelectTrigger id="fabric">
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
                    <Label htmlFor="sleeve">Sleeve *</Label>
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
                    <Label htmlFor="seam">Seam Finish Type *</Label>
                    <Select value={selectedSeamFinish} onValueChange={setSelectedSeamFinish}>
                      <SelectTrigger id="seam">
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
                <RadioGroup value={sampleType} onValueChange={setSampleType}>
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
                      onChange={(e) => setFastTrackReason(e.target.value)}
                      rows={3}
                    />
                  </div>
                )}
              </div>

              <div className="p-4 border border-border rounded-lg bg-card/50">
                <h4 className="font-semibold mb-2">Techpack Preview</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-muted-foreground">Collection:</span> {selectedCollection}</p>
                  <p><span className="text-muted-foreground">Silhouette:</span> {selectedSilhouetteData?.name}</p>
                  <p><span className="text-muted-foreground">Fabric:</span> {fabricLibrary.find(f => f.id === selectedFabric)?.name}</p>
                  {isCustom && (
                    <>
                      <p><span className="text-muted-foreground">Neckline:</span> {necklineLibrary.find(n => n.id === selectedNeckline)?.name}</p>
                      <p><span className="text-muted-foreground">Sleeve:</span> {sleeveLibrary.find(s => s.id === selectedSleeve)?.name}</p>
                      <p><span className="text-muted-foreground">Seam Finish:</span> {seamFinishLibrary.find(s => s.id === selectedSeamFinish)?.name}</p>
                    </>
                  )}
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
