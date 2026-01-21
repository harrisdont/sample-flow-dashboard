import { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  FileText,
  Check,
  X,
  Link as LinkIcon,
  Ruler,
  DollarSign,
  Calculator,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Silhouette,
  SilhouetteCategory,
  SilhouetteStatus,
  SILHOUETTE_CATEGORY_LABELS,
  SILHOUETTE_STATUS_CONFIG,
  GRADING_SIZE_OPTIONS,
  useSilhouetteStore,
} from '@/data/silhouetteStore';
import { useFabricStore, FabricEntry } from '@/data/fabricStore';

interface SilhouetteInductionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  silhouette?: Silhouette;
}

type Step = 'submit' | 'pattern' | 'review' | 'approve';

const STEP_CONFIG: Record<Step, { title: string; description: string }> = {
  submit: {
    title: 'Submit Sketch',
    description: 'Provide silhouette details and designer sketch',
  },
  pattern: {
    title: 'Pattern Development',
    description: 'Track pattern making progress',
  },
  review: {
    title: 'Sample Review',
    description: 'Review and approve or reject the sample',
  },
  approve: {
    title: 'Approval & Costing',
    description: 'Complete grading and cost calculation',
  },
};

export const SilhouetteInductionForm = ({
  open,
  onOpenChange,
  silhouette,
}: SilhouetteInductionFormProps) => {
  const {
    addSilhouette,
    updateSilhouette,
    moveToPattern,
    markSampleReady,
    approveSilhouette,
    rejectSilhouette,
  } = useSilhouetteStore();
  
  const { fabricEntries } = useFabricStore();

  // Form state
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<SilhouetteCategory>('kurta');
  const [sketchFile, setSketchFile] = useState('');
  const [designerNotes, setDesignerNotes] = useState('');
  const [patternNotes, setPatternNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Approval fields
  const [ggtFileLink, setGgtFileLink] = useState('');
  const [gradingSizes, setGradingSizes] = useState<string[]>([]);
  const [fabricConsumption, setFabricConsumption] = useState('');
  const [stitchingCost, setStitchingCost] = useState('');
  const [linkedFabricId, setLinkedFabricId] = useState('');

  // Determine current step based on status
  const currentStep: Step = useMemo(() => {
    if (!silhouette) return 'submit';
    switch (silhouette.status) {
      case 'sketch-submitted':
        return 'pattern';
      case 'in-pattern':
        return 'review';
      case 'sample-ready':
        return 'approve';
      case 'approved':
      case 'rejected':
        return 'approve'; // View mode
      default:
        return 'submit';
    }
  }, [silhouette]);

  // Get inducted fabrics for cost calculation
  const inductedFabrics = useMemo(() => {
    return fabrics.filter((f) => f.status === 'inducted');
  }, [fabrics]);

  // Calculate costs
  const selectedFabric = linkedFabricId ? getFabricById(linkedFabricId) : null;
  const fabricCostPerMeter = selectedFabric?.technicalSpecs?.costPerMeter || 0;
  const consumption = parseFloat(fabricConsumption) || 0;
  const stitching = parseFloat(stitchingCost) || 0;
  
  const fabricCost = consumption * fabricCostPerMeter;
  const totalCost = fabricCost + stitching;
  const predictedSellingPrice = totalCost * 3.2;

  // Initialize form with existing silhouette data
  useEffect(() => {
    if (silhouette) {
      setCode(silhouette.code);
      setName(silhouette.name);
      setCategory(silhouette.category);
      setSketchFile(silhouette.sketchFile || '');
      setDesignerNotes(silhouette.designerNotes || '');
      setGgtFileLink(silhouette.ggtFileLink || '');
      setGradingSizes(silhouette.gradingSizes || []);
      setFabricConsumption(silhouette.fabricConsumption?.toString() || '');
      setStitchingCost(silhouette.stitchingCost?.toString() || '');
      setLinkedFabricId(silhouette.linkedFabricId || '');
      setRejectionReason(silhouette.rejectedReason || '');
    } else {
      resetForm();
    }
  }, [silhouette, open]);

  const resetForm = () => {
    setCode('');
    setName('');
    setCategory('kurta');
    setSketchFile('');
    setDesignerNotes('');
    setPatternNotes('');
    setRejectionReason('');
    setGgtFileLink('');
    setGradingSizes([]);
    setFabricConsumption('');
    setStitchingCost('');
    setLinkedFabricId('');
  };

  const generateCode = () => {
    const prefix = category.substring(0, 3).toUpperCase();
    const num = Math.floor(Math.random() * 900) + 100;
    setCode(`W-${prefix}-${num}`);
  };

  const toggleSize = (size: string) => {
    setGradingSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleSubmitSketch = () => {
    if (!code || !name) {
      toast.error('Please fill in required fields');
      return;
    }

    if (silhouette) {
      updateSilhouette(silhouette.id, {
        code,
        name,
        category,
        sketchFile: sketchFile || undefined,
        designerNotes: designerNotes || undefined,
      });
      toast.success('Silhouette updated');
    } else {
      addSilhouette({
        code,
        name,
        category,
        status: 'sketch-submitted',
        sketchFile: sketchFile || undefined,
        designerNotes: designerNotes || undefined,
        gradingComplete: false,
        gradingSizes: [],
      });
      toast.success('Silhouette submitted for pattern development');
    }
    onOpenChange(false);
  };

  const handleMoveToPattern = () => {
    if (silhouette) {
      moveToPattern(silhouette.id);
      toast.success('Moved to pattern development');
      onOpenChange(false);
    }
  };

  const handleMarkSampleReady = () => {
    if (silhouette) {
      markSampleReady(silhouette.id);
      toast.success('Sample marked as ready for review');
      onOpenChange(false);
    }
  };

  const handleApprove = () => {
    if (!silhouette) return;
    
    if (!ggtFileLink || gradingSizes.length === 0 || !fabricConsumption || !stitchingCost) {
      toast.error('Please complete all required fields');
      return;
    }

    approveSilhouette(silhouette.id, {
      ggtFileLink,
      gradingSizes,
      fabricConsumption: parseFloat(fabricConsumption),
      stitchingCost: parseFloat(stitchingCost),
      linkedFabricId: linkedFabricId || undefined,
    });
    
    toast.success('Silhouette approved and inducted');
    onOpenChange(false);
  };

  const handleReject = () => {
    if (!silhouette || !rejectionReason) {
      toast.error('Please provide a rejection reason');
      return;
    }
    
    rejectSilhouette(silhouette.id, rejectionReason);
    toast.error('Silhouette rejected');
    onOpenChange(false);
  };

  const isViewOnly = silhouette?.status === 'approved' || silhouette?.status === 'rejected';
  const statusConfig = silhouette ? SILHOUETTE_STATUS_CONFIG[silhouette.status] : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>{STEP_CONFIG[currentStep].title}</DialogTitle>
              <DialogDescription>
                {STEP_CONFIG[currentStep].description}
              </DialogDescription>
            </div>
            {statusConfig && (
              <Badge
                style={{
                  backgroundColor: statusConfig.color,
                  color: 'hsl(var(--background))',
                }}
              >
                {statusConfig.label}
              </Badge>
            )}
          </div>
        </DialogHeader>

        {/* Step: Submit Sketch */}
        {currentStep === 'submit' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Silhouette Code *</Label>
                <div className="flex gap-2">
                  <Input
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="W-KRT-001"
                  />
                  <Button type="button" variant="outline" onClick={generateCode}>
                    Auto
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as SilhouetteCategory)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(SILHOUETTE_CATEGORY_LABELS) as SilhouetteCategory[]).map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {SILHOUETTE_CATEGORY_LABELS[cat]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Silhouette Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Long Kurta Classic"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sketch">Sketch File (URL)</Label>
              <div className="flex gap-2">
                <Input
                  id="sketch"
                  value={sketchFile}
                  onChange={(e) => setSketchFile(e.target.value)}
                  placeholder="https://..."
                />
                <Button type="button" variant="outline" size="icon">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Designer Notes</Label>
              <Textarea
                id="notes"
                value={designerNotes}
                onChange={(e) => setDesignerNotes(e.target.value)}
                placeholder="Special instructions for pattern making..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitSketch}>
                {silhouette ? 'Update' : 'Submit for Pattern'}
              </Button>
            </div>
          </div>
        )}

        {/* Step: Pattern Development */}
        {currentStep === 'pattern' && silhouette && (
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Code:</span>
                  <span className="ml-2 font-mono">{silhouette.code}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Name:</span>
                  <span className="ml-2">{silhouette.name}</span>
                </div>
              </div>
              {silhouette.designerNotes && (
                <div className="mt-3 pt-3 border-t border-border">
                  <span className="text-muted-foreground text-sm">Designer Notes:</span>
                  <p className="mt-1 text-sm">{silhouette.designerNotes}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="patternNotes">Pattern Development Notes</Label>
              <Textarea
                id="patternNotes"
                value={patternNotes}
                onChange={(e) => setPatternNotes(e.target.value)}
                placeholder="Progress updates, measurements, adjustments..."
                rows={4}
              />
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleMoveToPattern}>
                  Start Pattern Work
                </Button>
                <Button onClick={handleMarkSampleReady}>
                  Mark Sample Ready
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step: Sample Review */}
        {currentStep === 'review' && silhouette && (
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-4">
                {silhouette.technicalDrawing || silhouette.sketchFile ? (
                  <img
                    src={silhouette.technicalDrawing || silhouette.sketchFile}
                    alt={silhouette.name}
                    className="w-24 h-32 object-contain bg-background rounded"
                  />
                ) : (
                  <div className="w-24 h-32 bg-background rounded flex items-center justify-center">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <code className="text-xs font-mono text-muted-foreground">
                    {silhouette.code}
                  </code>
                  <h3 className="font-semibold">{silhouette.name}</h3>
                  <Badge variant="outline" className="mt-1">
                    {SILHOUETTE_CATEGORY_LABELS[silhouette.category]}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Review Decision</Label>
              <p className="text-sm text-muted-foreground">
                Review the physical sample and decide to approve or reject.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rejection">Rejection Reason (if rejecting)</Label>
              <Textarea
                id="rejection"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Describe what needs to be revised..."
                rows={3}
              />
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <div className="flex gap-2">
                <Button variant="destructive" onClick={handleReject}>
                  <X className="mr-2 h-4 w-4" />
                  Reject
                </Button>
                <Button onClick={() => {
                  if (silhouette) {
                    updateSilhouette(silhouette.id, { status: 'sample-ready' });
                    // Move to approve step
                  }
                }}>
                  <Check className="mr-2 h-4 w-4" />
                  Approve & Continue
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step: Approval & Costing */}
        {currentStep === 'approve' && silhouette && (
          <div className="space-y-4">
            {/* Silhouette Summary */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-4">
                {silhouette.technicalDrawing || silhouette.sketchFile ? (
                  <img
                    src={silhouette.technicalDrawing || silhouette.sketchFile}
                    alt={silhouette.name}
                    className="w-20 h-28 object-contain bg-background rounded"
                  />
                ) : null}
                <div>
                  <code className="text-xs font-mono text-muted-foreground">
                    {silhouette.code}
                  </code>
                  <h3 className="font-semibold">{silhouette.name}</h3>
                  <Badge variant="outline" className="mt-1">
                    {SILHOUETTE_CATEGORY_LABELS[silhouette.category]}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* GGT File Link */}
            <div className="space-y-2">
              <Label htmlFor="ggt">
                <LinkIcon className="inline h-4 w-4 mr-1" />
                GGT Pattern File Link *
              </Label>
              <Input
                id="ggt"
                value={ggtFileLink}
                onChange={(e) => setGgtFileLink(e.target.value)}
                placeholder="https://drive.google.com/..."
                disabled={isViewOnly}
              />
            </div>

            {/* Grading Sizes */}
            <div className="space-y-2">
              <Label>
                <Ruler className="inline h-4 w-4 mr-1" />
                Grading Sizes *
              </Label>
              <div className="flex flex-wrap gap-2">
                {GRADING_SIZE_OPTIONS.map((size) => (
                  <Badge
                    key={size}
                    variant={gradingSizes.includes(size) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => !isViewOnly && toggleSize(size)}
                  >
                    {size}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Costing Section */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Cost Calculation
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fabricId">Link Inducted Fabric</Label>
                  <Select value={linkedFabricId} onValueChange={setLinkedFabricId} disabled={isViewOnly}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select fabric..." />
                    </SelectTrigger>
                    <SelectContent>
                      {inductedFabrics.map((fabric) => (
                        <SelectItem key={fabric.id} value={fabric.id}>
                          {fabric.artworkName} - Rs. {fabric.technicalSpecs?.costPerMeter}/m
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="consumption">Fabric Consumption (meters) *</Label>
                  <Input
                    id="consumption"
                    type="number"
                    step="0.1"
                    value={fabricConsumption}
                    onChange={(e) => setFabricConsumption(e.target.value)}
                    placeholder="2.5"
                    disabled={isViewOnly}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stitching">Stitching Cost (Rs.) *</Label>
                <Input
                  id="stitching"
                  type="number"
                  value={stitchingCost}
                  onChange={(e) => setStitchingCost(e.target.value)}
                  placeholder="850"
                  disabled={isViewOnly}
                />
              </div>

              {/* Cost Preview */}
              {(consumption > 0 || stitching > 0) && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Fabric Cost ({consumption}m × Rs. {fabricCostPerMeter})
                    </span>
                    <span>Rs. {fabricCost.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Stitching Cost</span>
                    <span>Rs. {stitching.toFixed(0)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total Cost</span>
                    <span>Rs. {totalCost.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-primary font-semibold">
                    <span>Predicted Selling Price (3.2×)</span>
                    <span>Rs. {predictedSellingPrice.toFixed(0)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Rejection Reason Display */}
            {silhouette.status === 'rejected' && silhouette.rejectedReason && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <Label className="text-destructive">Rejection Reason</Label>
                <p className="text-sm mt-1">{silhouette.rejectedReason}</p>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                {isViewOnly ? 'Close' : 'Cancel'}
              </Button>
              {!isViewOnly && (
                <Button onClick={handleApprove}>
                  <Check className="mr-2 h-4 w-4" />
                  Approve & Induct
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
