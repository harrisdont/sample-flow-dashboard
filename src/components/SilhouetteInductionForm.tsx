import { useState, useMemo, useEffect, useRef } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  ImageIcon,
  Trash2,
  Crop,
  Palette,
  Sparkles,
  Download,
  Send,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
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
import { useNotificationStore } from '@/data/notificationStore';
import {
  seamFinishLibrary,
  SILHOUETTE_SUB_TYPES,
  CATEGORY_MEASUREMENTS,
  PRODUCT_LINES,
  CATEGORY_PREFIXES,
} from '@/data/libraryData';
import { SilhouettePreviewSheet } from '@/components/SilhouettePreviewSheet';

interface SilhouetteInductionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  silhouette?: Silhouette;
}

type Step = 'submit' | 'pattern' | 'review' | 'approve';

const STEP_CONFIG: Record<Step, { title: string; description: string }> = {
  submit: {
    title: 'Induct New Silhouette',
    description: 'Complete all sections to induct a new silhouette',
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

// Image Uploader Component
interface SketchUploaderProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  compact?: boolean;
}

const SketchUploader = ({ value, onChange, label = 'sketch image', compact = false }: SketchUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [urlMode, setUrlMode] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      onChange(e.target?.result as string);
      toast.success('Image uploaded');
    };
    reader.onerror = () => toast.error('Failed to read file');
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlInput('');
      setUrlMode(false);
      toast.success('URL added');
    }
  };

  const handleRemove = () => {
    onChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (value) {
    return (
      <div className="relative">
        <div className="border border-border rounded-lg overflow-hidden bg-muted/30">
          <div className={`${compact ? 'aspect-square max-h-[180px]' : 'aspect-[3/4] max-h-[250px]'} flex items-center justify-center p-3`}>
            <img src={value} alt="Preview" className="max-w-full max-h-full object-contain rounded" />
          </div>
          <div className="p-2 border-t border-border bg-muted/50 flex items-center justify-between">
            <span className="text-xs text-muted-foreground truncate flex-1">
              {value.startsWith('data:') ? 'Uploaded image' : value}
            </span>
            <Button type="button" variant="ghost" size="sm" onClick={handleRemove} className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          {/* Sketch Toolbar */}
          <div className="flex gap-1 p-2 border-t border-border bg-muted/30">
            <Button type="button" variant="ghost" size="sm" className="flex-1 text-xs gap-1" onClick={() => toast.info('Crop tool coming soon')}>
              <Crop className="h-3 w-3" /> Crop
            </Button>
            <Button type="button" variant="ghost" size="sm" className="flex-1 text-xs gap-1" onClick={() => toast.info('Color adjustment coming soon')}>
              <Palette className="h-3 w-3" /> Adjust
            </Button>
            <Button type="button" variant="ghost" size="sm" className="flex-1 text-xs gap-1" onClick={() => toast.info('AI enhancement coming soon')}>
              <Sparkles className="h-3 w-3" /> AI Enhance
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (urlMode) {
    return (
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="https://example.com/sketch.jpg" onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()} />
          <Button type="button" onClick={handleUrlSubmit} size="sm">Add</Button>
          <Button type="button" variant="outline" size="sm" onClick={() => setUrlMode(false)}>Cancel</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg ${compact ? 'p-4' : 'p-6'} text-center cursor-pointer transition-colors ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'}`}
      >
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleInputChange} className="hidden" />
        <div className="flex flex-col items-center gap-1">
          <ImageIcon className="h-5 w-5 text-muted-foreground" />
          <p className="font-medium text-xs">Drop {label} here</p>
          <p className="text-[10px] text-muted-foreground">JPG, PNG, WebP (max 10MB)</p>
        </div>
      </div>
      <div className="flex items-center justify-center">
        <Button type="button" variant="ghost" size="sm" onClick={() => setUrlMode(true)} className="text-xs text-muted-foreground">
          <LinkIcon className="h-3 w-3 mr-1" /> Or paste URL
        </Button>
      </div>
    </div>
  );
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
  
  const { fabrics, getFabricById } = useFabricStore();
  const { addNotification } = useNotificationStore();
  const previewRef = useRef<HTMLDivElement>(null);

  // Form state — new fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState<SilhouetteCategory>('top');
  const [subType, setSubType] = useState('');
  const [lineId, setLineId] = useState('');
  const [designerName, setDesignerName] = useState('');
  const [frontSketch, setFrontSketch] = useState('');
  const [backSketch, setBackSketch] = useState('');
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [measurements, setMeasurements] = useState<Record<string, string>>({});
  const [seamFinish, setSeamFinish] = useState('');
  const [linkedFabricId, setLinkedFabricId] = useState('');
  const [designerNotes, setDesignerNotes] = useState('');
  
  // Existing workflow fields
  const [patternNotes, setPatternNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [ggtFileLink, setGgtFileLink] = useState('');
  const [gradingSizes, setGradingSizes] = useState<string[]>([]);
  const [fabricConsumption, setFabricConsumption] = useState('');
  const [stitchingCost, setStitchingCost] = useState('');
  const [technicalDrawing, setTechnicalDrawing] = useState('');
  const [activeTab, setActiveTab] = useState('basic');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Reference image upload
  const refImageInputRef = useRef<HTMLInputElement>(null);

  // Determine current step
  const currentStep: Step = useMemo(() => {
    if (!silhouette) return 'submit';
    switch (silhouette.status) {
      case 'sketch-submitted': return 'pattern';
      case 'in-pattern': return 'review';
      case 'sample-ready': return 'approve';
      case 'approved':
      case 'rejected': return 'approve';
      default: return 'submit';
    }
  }, [silhouette]);

  const inductedFabrics = useMemo(() => fabrics.filter((f) => f.status === 'inducted'), [fabrics]);

  // Cost calculation for approve step
  const selectedFabricApprove = linkedFabricId ? getFabricById(linkedFabricId) : null;
  const fabricCostPerMeter = selectedFabricApprove?.technicalSpecs?.costPerMeter || 0;
  const consumption = parseFloat(fabricConsumption) || 0;
  const stitching = parseFloat(stitchingCost) || 0;
  const fabricCost = consumption * fabricCostPerMeter;
  const totalCost = fabricCost + stitching;
  const predictedSellingPrice = totalCost * 3.2;

  // Auto-generate code
  const generatedCode = useMemo(() => {
    if (!lineId || !category || !subType) return '';
    const linePrefix = PRODUCT_LINES.find((l) => l.id === lineId)?.prefix || 'XXX';
    const catPrefix = CATEGORY_PREFIXES[category] || 'XXX';
    const subPrefix = subType.substring(0, 3).toUpperCase();
    const num = String(Math.floor(Math.random() * 900) + 100);
    return `${linePrefix}-${catPrefix}-${subPrefix}-${num}`;
  }, [lineId, category, subType]);

  // Reset sub-type when category changes
  useEffect(() => {
    setSubType('');
  }, [category]);

  // Initialize form
  useEffect(() => {
    if (silhouette) {
      setName(silhouette.name);
      setCategory(silhouette.category);
      setSubType(silhouette.subType || '');
      setLineId(silhouette.lineId || '');
      setDesignerName(silhouette.designerName || '');
      setFrontSketch(silhouette.frontSketch || silhouette.sketchFile || '');
      setBackSketch(silhouette.backSketch || '');
      setReferenceImages(silhouette.referenceImages || []);
      setMeasurements(silhouette.measurements || {});
      setSeamFinish(silhouette.seamFinish || '');
      setLinkedFabricId(silhouette.linkedFabricId || '');
      setDesignerNotes(silhouette.designerNotes || '');
      setGgtFileLink(silhouette.ggtFileLink || '');
      setGradingSizes(silhouette.gradingSizes || []);
      setFabricConsumption(silhouette.fabricConsumption?.toString() || '');
      setStitchingCost(silhouette.stitchingCost?.toString() || '');
      setTechnicalDrawing(silhouette.technicalDrawing || '');
      setRejectionReason(silhouette.rejectedReason || '');
    } else {
      resetForm();
    }
  }, [silhouette, open]);

  const resetForm = () => {
    setName('');
    setCategory('top');
    setSubType('');
    setLineId('');
    setDesignerName('');
    setFrontSketch('');
    setBackSketch('');
    setReferenceImages([]);
    setMeasurements({});
    setSeamFinish('');
    setLinkedFabricId('');
    setDesignerNotes('');
    setPatternNotes('');
    setRejectionReason('');
    setGgtFileLink('');
    setGradingSizes([]);
    setFabricConsumption('');
    setStitchingCost('');
    setTechnicalDrawing('');
    setActiveTab('basic');
  };

  const toggleSize = (size: string) => {
    setGradingSizes((prev) => prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]);
  };

  const handleRefImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      if (file.size > 10 * 1024 * 1024) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        setReferenceImages((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
    if (refImageInputRef.current) refImageInputRef.current.value = '';
  };

  const removeRefImage = (index: number) => {
    setReferenceImages((prev) => prev.filter((_, i) => i !== index));
  };

  const updateMeasurement = (fieldId: string, value: string) => {
    setMeasurements((prev) => ({ ...prev, [fieldId]: value }));
  };

  // PDF Download
  const handleDownloadPdf = async () => {
    if (!previewRef.current) return;
    setIsGeneratingPdf(true);
    try {
      const canvas = await html2canvas(previewRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`silhouette-induction-${generatedCode || 'draft'}-${Date.now()}.pdf`);
      toast.success('PDF downloaded');
    } catch {
      toast.error('Failed to generate PDF');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Submit new silhouette
  const handleSubmitNew = () => {
    if (!name || !lineId || !category || !subType) {
      toast.error('Please fill in required fields (Name, Line, Category, Sub-Type)');
      setActiveTab('basic');
      return;
    }

    const code = generatedCode;
    const lineName = PRODUCT_LINES.find((l) => l.id === lineId)?.name || lineId;
    const subTypeLabel = SILHOUETTE_SUB_TYPES[category]?.find((s) => s.id === subType)?.label || subType;

    const newId = addSilhouette({
      code,
      name,
      category,
      subType,
      lineId,
      designerName,
      status: 'sketch-submitted',
      frontSketch: frontSketch || undefined,
      backSketch: backSketch || undefined,
      sketchFile: frontSketch || undefined,
      referenceImages: referenceImages.length > 0 ? referenceImages : undefined,
      measurements: Object.keys(measurements).length > 0 ? measurements : undefined,
      seamFinish: seamFinish || undefined,
      linkedFabricId: linkedFabricId || undefined,
      designerNotes: designerNotes || undefined,
      gradingComplete: false,
      gradingSizes: [],
    });

    // Create notification
    addNotification({
      type: 'task-assigned',
      severity: 'info',
      title: `New Silhouette Inducted: ${name}`,
      message: `${designerName || 'Designer'} has submitted silhouette ${code} (${subTypeLabel}) for ${lineName} line. Review required.`,
      relatedEntityType: 'design',
      relatedEntityId: newId,
      actionUrl: '/design-hub',
      actionLabel: 'View Silhouette',
      recipientRoles: ['design-lead', 'sampling-incharge'],
    });

    toast.success('Silhouette submitted for pattern development');
    onOpenChange(false);
  };

  // Existing workflow handlers
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
      technicalDrawing: technicalDrawing || undefined,
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
  const measurementFields = CATEGORY_MEASUREMENTS[category] || [];
  const subTypes = SILHOUETTE_SUB_TYPES[category] || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${currentStep === 'submit' ? 'max-w-4xl' : 'max-w-2xl'} max-h-[90vh] overflow-y-auto`}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>{STEP_CONFIG[currentStep].title}</DialogTitle>
              <DialogDescription>{STEP_CONFIG[currentStep].description}</DialogDescription>
            </div>
            {statusConfig && (
              <Badge style={{ backgroundColor: statusConfig.color, color: 'hsl(var(--background))' }}>
                {statusConfig.label}
              </Badge>
            )}
          </div>
        </DialogHeader>

        {/* ═══ SUBMIT STEP — Multi-tab form ═══ */}
        {currentStep === 'submit' && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="sketches">Sketches</TabsTrigger>
              <TabsTrigger value="technical">Technical</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            {/* Tab 1: Basic Info */}
            <TabsContent value="basic" className="space-y-4 mt-4">
              {generatedCode && (
                <div className="bg-muted/50 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-muted-foreground">Auto-Generated Code</span>
                    <p className="font-mono font-semibold text-foreground">{generatedCode}</p>
                  </div>
                  <Badge variant="outline">Auto</Badge>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Product Line *</Label>
                  <Select value={lineId} onValueChange={setLineId}>
                    <SelectTrigger><SelectValue placeholder="Select line..." /></SelectTrigger>
                    <SelectContent>
                      {PRODUCT_LINES.map((line) => (
                        <SelectItem key={line.id} value={line.id}>{line.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Designer Name</Label>
                  <Input value={designerName} onChange={(e) => setDesignerName(e.target.value)} placeholder="Designer name" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select value={category} onValueChange={(v) => setCategory(v as SilhouetteCategory)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(Object.keys(SILHOUETTE_CATEGORY_LABELS) as SilhouetteCategory[]).map((cat) => (
                        <SelectItem key={cat} value={cat}>{SILHOUETTE_CATEGORY_LABELS[cat]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Sub-Type *</Label>
                  <Select value={subType} onValueChange={setSubType}>
                    <SelectTrigger><SelectValue placeholder="Select sub-type..." /></SelectTrigger>
                    <SelectContent>
                      {subTypes.map((st) => (
                        <SelectItem key={st.id} value={st.id}>{st.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Silhouette Name *</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Long Kurta Classic" />
              </div>
            </TabsContent>

            {/* Tab 2: Sketches & References */}
            <TabsContent value="sketches" className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Front Sketch</Label>
                  <SketchUploader value={frontSketch} onChange={setFrontSketch} label="front sketch" compact />
                </div>
                <div className="space-y-2">
                  <Label>Back Sketch</Label>
                  <SketchUploader value={backSketch} onChange={setBackSketch} label="back sketch" compact />
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Reference Images</Label>
                  <Button type="button" variant="outline" size="sm" onClick={() => refImageInputRef.current?.click()} className="gap-1">
                    <Plus className="h-3 w-3" /> Add Images
                  </Button>
                  <input ref={refImageInputRef} type="file" accept="image/*" multiple onChange={handleRefImageUpload} className="hidden" />
                </div>
                {referenceImages.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2">
                    {referenceImages.map((img, i) => (
                      <div key={i} className="relative group border border-border rounded-lg overflow-hidden bg-muted/30 aspect-square flex items-center justify-center p-1">
                        <img src={img} alt={`Ref ${i + 1}`} className="max-w-full max-h-full object-contain" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeRefImage(i)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No reference images added yet.</p>
                )}
              </div>
            </TabsContent>

            {/* Tab 3: Technical Details */}
            <TabsContent value="technical" className="space-y-6 mt-4">
              {/* Measurements */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Ruler className="h-4 w-4" />
                  Measurements — {SILHOUETTE_CATEGORY_LABELS[category]}
                </Label>
                <p className="text-xs text-muted-foreground">All measurements are optional and in inches.</p>
                <div className="grid grid-cols-3 gap-3">
                  {measurementFields.map((field) => (
                    <div key={field.id} className="space-y-1">
                      <Label className="text-xs text-muted-foreground">{field.label}</Label>
                      <Input
                        type="number"
                        step="0.25"
                        value={measurements[field.id] || ''}
                        onChange={(e) => updateMeasurement(field.id, e.target.value)}
                        placeholder="—"
                        className="h-8 text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Seam Finish */}
              <div className="space-y-2">
                <Label>Seam Finish</Label>
                <Select value={seamFinish} onValueChange={setSeamFinish}>
                  <SelectTrigger><SelectValue placeholder="Select seam finish..." /></SelectTrigger>
                  <SelectContent>
                    {seamFinishLibrary.map((sf) => (
                      <SelectItem key={sf.id} value={sf.id}>
                        {sf.name} — {sf.type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Fabric Selector */}
              <div className="space-y-2">
                <Label>Link Inducted Fabric</Label>
                <Select value={linkedFabricId} onValueChange={setLinkedFabricId}>
                  <SelectTrigger><SelectValue placeholder="Select fabric..." /></SelectTrigger>
                  <SelectContent>
                    {inductedFabrics.map((fabric) => (
                      <SelectItem key={fabric.id} value={fabric.id}>
                        {fabric.fabricName} — {fabric.fabricComposition}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            {/* Tab 4: Designer Notes */}
            <TabsContent value="notes" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Designer Notes & Special Considerations</Label>
                <Textarea
                  value={designerNotes}
                  onChange={(e) => setDesignerNotes(e.target.value)}
                  placeholder="Any special instructions, construction considerations, fabric handling notes..."
                  rows={8}
                />
              </div>
            </TabsContent>

            {/* Tab 5: Preview & Submit */}
            <TabsContent value="preview" className="space-y-4 mt-4">
              <SilhouettePreviewSheet
                ref={previewRef}
                code={generatedCode}
                name={name}
                category={category}
                subType={subType}
                lineId={lineId}
                designerName={designerName}
                frontSketch={frontSketch}
                backSketch={backSketch}
                referenceImages={referenceImages}
                measurements={measurements}
                seamFinish={seamFinish}
                linkedFabricId={linkedFabricId}
                designerNotes={designerNotes}
              />

              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={handleDownloadPdf} disabled={isGeneratingPdf} className="gap-2">
                  <Download className="h-4 w-4" />
                  {isGeneratingPdf ? 'Generating...' : 'Download PDF'}
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                  <Button onClick={handleSubmitNew} className="gap-2">
                    <Send className="h-4 w-4" />
                    Submit for Pattern
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* ═══ PATTERN STEP ═══ */}
        {currentStep === 'pattern' && silhouette && (
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Code:</span> <span className="ml-2 font-mono">{silhouette.code}</span></div>
                <div><span className="text-muted-foreground">Name:</span> <span className="ml-2">{silhouette.name}</span></div>
              </div>
              {silhouette.designerNotes && (
                <div className="mt-3 pt-3 border-t border-border">
                  <span className="text-muted-foreground text-sm">Designer Notes:</span>
                  <p className="mt-1 text-sm">{silhouette.designerNotes}</p>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Pattern Development Notes</Label>
              <Textarea value={patternNotes} onChange={(e) => setPatternNotes(e.target.value)} placeholder="Progress updates, measurements, adjustments..." rows={4} />
            </div>
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleMoveToPattern}>Start Pattern Work</Button>
                <Button onClick={handleMarkSampleReady}>Mark Sample Ready <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        )}

        {/* ═══ REVIEW STEP ═══ */}
        {currentStep === 'review' && silhouette && (
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-4">
                {(silhouette.technicalDrawing || silhouette.frontSketch || silhouette.sketchFile) ? (
                  <img src={silhouette.technicalDrawing || silhouette.frontSketch || silhouette.sketchFile} alt={silhouette.name} className="w-24 h-32 object-contain bg-background rounded" />
                ) : (
                  <div className="w-24 h-32 bg-background rounded flex items-center justify-center"><FileText className="h-8 w-8 text-muted-foreground" /></div>
                )}
                <div>
                  <code className="text-xs font-mono text-muted-foreground">{silhouette.code}</code>
                  <h3 className="font-semibold">{silhouette.name}</h3>
                  <Badge variant="outline" className="mt-1">{SILHOUETTE_CATEGORY_LABELS[silhouette.category]}</Badge>
                </div>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Rejection Reason (if rejecting)</Label>
              <Textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Describe what needs to be revised..." rows={3} />
            </div>
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
              <div className="flex gap-2">
                <Button variant="destructive" onClick={handleReject}><X className="mr-2 h-4 w-4" /> Reject</Button>
                <Button onClick={() => { if (silhouette) { updateSilhouette(silhouette.id, { status: 'sample-ready' }); } }}>
                  <Check className="mr-2 h-4 w-4" /> Approve & Continue
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ═══ APPROVE STEP ═══ */}
        {currentStep === 'approve' && silhouette && (
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-4">
                {(silhouette.technicalDrawing || silhouette.frontSketch || silhouette.sketchFile) && (
                  <img src={silhouette.technicalDrawing || silhouette.frontSketch || silhouette.sketchFile} alt={silhouette.name} className="w-20 h-28 object-contain bg-background rounded" />
                )}
                <div>
                  <code className="text-xs font-mono text-muted-foreground">{silhouette.code}</code>
                  <h3 className="font-semibold">{silhouette.name}</h3>
                  <Badge variant="outline" className="mt-1">{SILHOUETTE_CATEGORY_LABELS[silhouette.category]}</Badge>
                </div>
              </div>
            </div>
            <Separator />

            <div className="space-y-2">
              <Label><LinkIcon className="inline h-4 w-4 mr-1" /> GGT Pattern File Link *</Label>
              <Input value={ggtFileLink} onChange={(e) => setGgtFileLink(e.target.value)} placeholder="https://drive.google.com/..." disabled={isViewOnly} />
            </div>

            {!isViewOnly && (
              <div className="space-y-2">
                <Label><ImageIcon className="inline h-4 w-4 mr-1" /> Technical Drawing (Optional)</Label>
                <SketchUploader value={technicalDrawing} onChange={setTechnicalDrawing} label="technical drawing" />
              </div>
            )}

            <div className="space-y-2">
              <Label><Ruler className="inline h-4 w-4 mr-1" /> Grading Sizes *</Label>
              <div className="flex flex-wrap gap-2">
                {GRADING_SIZE_OPTIONS.map((size) => (
                  <Badge key={size} variant={gradingSizes.includes(size) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => !isViewOnly && toggleSize(size)}>
                    {size}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2"><Calculator className="h-4 w-4" /> Cost Calculation</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Link Inducted Fabric</Label>
                  <Select value={linkedFabricId} onValueChange={setLinkedFabricId} disabled={isViewOnly}>
                    <SelectTrigger><SelectValue placeholder="Select fabric..." /></SelectTrigger>
                    <SelectContent>
                      {inductedFabrics.map((fabric) => (
                        <SelectItem key={fabric.id} value={fabric.id}>{fabric.fabricName} - Rs. {fabric.technicalSpecs?.costPerMeter}/m</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Fabric Consumption (meters) *</Label>
                  <Input type="number" step="0.1" value={fabricConsumption} onChange={(e) => setFabricConsumption(e.target.value)} placeholder="2.5" disabled={isViewOnly} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Stitching Cost (Rs.) *</Label>
                <Input type="number" value={stitchingCost} onChange={(e) => setStitchingCost(e.target.value)} placeholder="850" disabled={isViewOnly} />
              </div>

              {(consumption > 0 || stitching > 0) && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Fabric Cost ({consumption}m × Rs. {fabricCostPerMeter})</span>
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

            {silhouette.status === 'rejected' && silhouette.rejectedReason && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <Label className="text-destructive">Rejection Reason</Label>
                <p className="text-sm mt-1">{silhouette.rejectedReason}</p>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>{isViewOnly ? 'Close' : 'Cancel'}</Button>
              {!isViewOnly && (
                <Button onClick={handleApprove}><Check className="mr-2 h-4 w-4" /> Approve & Induct</Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
