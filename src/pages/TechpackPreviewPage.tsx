import { useState, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainNav } from '@/components/MainNav';
import { RoleSwitcher } from '@/components/RoleSwitcher';
import { NotificationBell } from '@/components/alerts/NotificationBell';
import { useDesignStore, Design, ConstructionCallout, GradedMeasurement, BOMItem, BodySizeEntry, ArtworkPlacement, Colorway, ComponentFinish } from '@/data/designStore';
import { ColorwayFabricMatrix, ComponentFinishesSection, SpecialInstructionsSection } from '@/components/techpack/ColorwayFabricMatrix';
import { useSampleStore } from '@/data/sampleStore';
import { useFabricStore, IRONING_INSTRUCTION_LABELS, COMPONENT_TYPE_LABELS } from '@/data/fabricStore';
import { useColorPaletteStore } from '@/data/colorPaletteStore';
import { useCapsuleStore } from '@/data/capsuleCollectionData';
import { useConstructionLibraryStore } from '@/data/constructionLibraryStore';
import { useSilhouetteStore } from '@/data/silhouetteStore';
import { getFullProductionPath, DECORATION_STAGE_LABELS, getTechniqueLabel } from '@/lib/embroideryWorkflow';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  ChevronLeft,
  FileText,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  Lock,
  Link2,
  ExternalLink,
  AlertTriangle,
  Zap,
  ImageIcon,
  Plus,
  Trash2,
  Save,
  Eye,
  Edit3,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const SIZES = ['0', '2', '4', '6', '8', '10', '12', '14'];

const PRODUCTION_STAGE_LABELS: Record<string, string> = {
  design: 'Design', pattern: 'Pattern Making', 'semi-stitching': 'Semi Stitching',
  'complete-stitching': 'Complete Stitching', 'hand-finishes': 'Hand Finishes',
  approval: 'Final Approval', multihead: 'Multihead Embroidery',
  'hand-embroidery': 'Hand Embroidery', 'screen-print': 'Screen Print',
  'hand-block-printing': 'Hand Block Printing', ...DECORATION_STAGE_LABELS,
};
const getStageLabel = (stage: string) => PRODUCTION_STAGE_LABELS[stage] || stage;

const CATEGORY_LABELS: Record<string, string> = {
  onePiece: '1 Piece', twoPiece: '2 Piece', threePiece: '3 Piece',
  dupattas: 'Dupatta', lowers: 'Lowers', 'lehenga-set': 'Lehenga Set', 'saree-set': 'Saree Set',
};

const TechpackPreviewPage = () => {
  const { designId } = useParams<{ designId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const contentRef = useRef<HTMLDivElement>(null);

  const designs = useDesignStore(s => s.designs);
  const updateDesign = useDesignStore(s => s.updateDesign);
  const approveDesign = useDesignStore(s => s.approveDesign);
  const samples = useSampleStore(s => s.samples);
  const fabrics = useFabricStore(s => s.fabrics);
  const getColorById = useColorPaletteStore(s => s.getColorById);
  const capsules = useCapsuleStore(s => s.capsules);
  const necklines = useConstructionLibraryStore(s => s.necklines);
  const sleeves = useConstructionLibraryStore(s => s.sleeves);
  const silhouetteStore = useSilhouetteStore(s => s.silhouettes);

  const design = designId ? designs[designId] : undefined;
  const sample = useMemo(() => {
    if (!design) return undefined;
    return samples.find(s =>
      s.collectionName === design.collectionId || s.silhouetteCode === design.silhouetteId
    );
  }, [design, samples]);

  const isApproved = design?.status === 'approved';
  const [isEditing, setIsEditing] = useState(!isApproved);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Editable state
  const [seamFinish, setSeamFinish] = useState(design?.seamFinish || '');
  const [additionalNotes, setAdditionalNotes] = useState(design?.additionalNotes || '');
  const [textileDesigner, setTextileDesigner] = useState(design?.textileDesigner || '');
  const [distribution, setDistribution] = useState(design?.distribution || '');
  const [specialInstructions, setSpecialInstructions] = useState(design?.specialInstructions || '');
  const [callouts, setCallouts] = useState<ConstructionCallout[]>(design?.constructionCallouts || []);
  const [specMeasurements, setSpecMeasurements] = useState<GradedMeasurement[]>(
    design?.gradedSpecSheet?.measurements || []
  );
  const [bodySizeChart, setBodySizeChart] = useState<BodySizeEntry[]>(design?.bodySizeChart || []);
  const [bomItems, setBomItems] = useState<BOMItem[]>(design?.billOfMaterials || []);
  const [artworkPlacements, setArtworkPlacements] = useState<ArtworkPlacement[]>(design?.artworkPlacements || []);

  // Derived
  const fabric = fabrics.find(f => f.collectionName === (sample?.collectionName || design?.collectionId));
  const specs = fabric?.technicalSpecs;
  const fabricColor = fabric?.colorId ? getColorById(fabric.colorId) : undefined;
  const colourDisplay = fabricColor ? `${fabricColor.name} (${fabricColor.hexCode})` : sample?.colour || '—';
  const capsule = design?.collectionId ? capsules[design.collectionId] : undefined;
  const gtmDate = capsule?.targetInStoreDate ? format(capsule.targetInStoreDate, 'dd MMM yyyy') : '—';
  const silhouette = design?.silhouetteId ? silhouetteStore[design.silhouetteId] : undefined;
  const bomTotal = bomItems.reduce((sum, item) => sum + (item.totalCost || 0), 0);

  const resolveNeckline = () => {
    const nkId = silhouette?.necklineId;
    if (nkId) { const found = necklines.find(n => n.id === nkId); if (found) return `${found.name} (${found.code})`; }
    return design?.neckline || '—';
  };
  const resolveSleeve = () => {
    const slId = silhouette?.sleeveId;
    if (slId) { const found = sleeves.find(s => s.id === slId); if (found) return `${found.name} (${found.code})`; }
    return design?.sleeve || '—';
  };

  const handleSave = useCallback(() => {
    if (!design) return;
    updateDesign(design.id, {
      seamFinish,
      additionalNotes,
      constructionCallouts: callouts,
      gradedSpecSheet: design.gradedSpecSheet ? { ...design.gradedSpecSheet, measurements: specMeasurements } : undefined,
      bodySizeChart,
      billOfMaterials: bomItems,
      artworkPlacements,
    });
    toast({ title: 'Changes saved', description: 'Techpack has been updated.' });
  }, [design, seamFinish, additionalNotes, callouts, specMeasurements, bodySizeChart, bomItems, artworkPlacements, updateDesign, toast]);

  const handleApprove = useCallback(() => {
    if (!design) return;
    // Save first
    updateDesign(design.id, {
      seamFinish, additionalNotes, constructionCallouts: callouts,
      gradedSpecSheet: design.gradedSpecSheet ? { ...design.gradedSpecSheet, measurements: specMeasurements } : undefined,
      bodySizeChart, billOfMaterials: bomItems, artworkPlacements,
    });
    approveDesign(design.id);
    toast({ title: 'Techpack Approved', description: 'Design has been approved for production.' });
    navigate('/design-hub');
  }, [design, seamFinish, additionalNotes, callouts, specMeasurements, bodySizeChart, bomItems, artworkPlacements, updateDesign, approveDesign, toast, navigate]);

  const handleDownloadPdf = useCallback(async () => {
    if (!contentRef.current) return;
    setIsGeneratingPdf(true);
    setIsEditing(false);
    await new Promise(r => setTimeout(r, 200));
    try {
      const canvas = await html2canvas(contentRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const pdf = new jsPDF('p', 'pt', 'a4');
      const pageWidth = 595.28;
      const pageHeight = 841.89;
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let yOffset = 0;
      let page = 0;
      while (yOffset < imgHeight) {
        if (page > 0) pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', margin, -yOffset + margin, imgWidth, imgHeight);
        yOffset += pageHeight - margin * 2;
        page++;
      }
      const dateStr = format(new Date(), 'yyyy-MM-dd');
      const sampleNum = sample?.sampleNumber || designId || 'unknown';
      const collName = (sample?.collectionName || design?.collectionId || 'Collection').replace(/\s+/g, '');
      pdf.save(`Techpack_${sampleNum}_${collName}_${dateStr}.pdf`);
    } catch (err) {
      toast({ title: 'PDF generation failed', description: String(err), variant: 'destructive' });
    } finally {
      if (!isApproved) setIsEditing(true);
      setIsGeneratingPdf(false);
    }
  }, [sample, design, designId, isApproved, toast]);

  // Spec measurement updater
  const updateSpecValue = (mIdx: number, size: string, val: number) => {
    setSpecMeasurements(prev => prev.map((m, i) => i === mIdx ? { ...m, values: { ...m.values, [size]: val } } : m));
  };
  const updateSpecField = (mIdx: number, field: 'grade' | 'tolMinus' | 'tolPlus', val: number) => {
    setSpecMeasurements(prev => prev.map((m, i) => i === mIdx ? { ...m, [field]: val } : m));
  };

  // Body size chart updater
  const updateBodyValue = (rIdx: number, size: string, val: number) => {
    setBodySizeChart(prev => prev.map((r, i) => i === rIdx ? { ...r, values: { ...r.values, [size]: val } } : r));
  };

  // BOM updaters
  const updateBomField = (idx: number, field: keyof BOMItem, val: string | number) => {
    setBomItems(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      const updated = { ...item, [field]: val };
      if (field === 'unitCost' || field === 'quantity') {
        updated.totalCost = (updated.unitCost || 0) * (updated.quantity || 0);
      }
      return updated;
    }));
  };

  // Callout updaters
  const updateCallout = (idx: number, desc: string) => {
    setCallouts(prev => prev.map((c, i) => i === idx ? { ...c, description: desc } : c));
  };
  const addCallout = () => {
    const nextLabel = String.fromCharCode(65 + callouts.length);
    setCallouts(prev => [...prev, { label: nextLabel, description: '' }]);
  };
  const removeCallout = (idx: number) => {
    setCallouts(prev => prev.filter((_, i) => i !== idx).map((c, i) => ({ ...c, label: String.fromCharCode(65 + i) })));
  };

  // Artwork updaters
  const updateArtwork = (idx: number, field: keyof ArtworkPlacement, val: string) => {
    setArtworkPlacements(prev => prev.map((a, i) => i === idx ? { ...a, [field]: val } : a));
  };

  // Stage gate tracker
  const fullPath = sample ? getFullProductionPath(sample.decorationTechnique) : [];
  let foundBlocked = false;
  const stageStatuses = fullPath.map((stage) => {
    const proc = sample?.processes.find(p => p.stage === stage);
    if (!proc) { const isBlocked = foundBlocked; if (!foundBlocked) foundBlocked = true; return { stage, proc: null, isBlocked }; }
    if (!foundBlocked && (proc.approvalStatus === 'pending' || proc.approvalStatus === 'rejected')) { foundBlocked = true; return { stage, proc, isBlocked: false }; }
    return { stage, proc, isBlocked: foundBlocked && proc.approvalStatus !== 'approved' };
  });

  if (!design) {
    return (
      <div className="min-h-screen bg-background">
        <MainNav><NotificationBell /><RoleSwitcher /></MainNav>
        <div className="container mx-auto px-6 py-12 text-center">
          <h2 className="text-xl font-semibold">Design not found</h2>
          <p className="text-muted-foreground mt-2">No design with ID "{designId}"</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/design-hub')}>Back to Design Hub</Button>
        </div>
      </div>
    );
  }

  const canEdit = isEditing && !isApproved && !isGeneratingPdf;

  return (
    <div className="min-h-screen bg-background">
      <MainNav><NotificationBell /><RoleSwitcher /></MainNav>

      {/* Sticky action bar */}
      <div className="sticky top-14 z-30 bg-card border-b border-border px-6 py-2 flex items-center gap-3 shadow-sm">
        <Button variant="ghost" size="sm" onClick={() => navigate('/design-hub')} className="gap-1.5">
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold truncate">
            Techpack Preview — {sample?.sampleNumber || design.id}
          </h2>
          <p className="text-xs text-muted-foreground truncate">
            {sample?.collectionName || design.collectionId} · {sample?.silhouetteName || design.silhouetteId}
          </p>
        </div>

        {!isApproved && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Eye className="h-3.5 w-3.5" />
            <span>Preview</span>
            <Switch checked={isEditing} onCheckedChange={setIsEditing} />
            <Edit3 className="h-3.5 w-3.5" />
            <span>Edit</span>
          </div>
        )}

        {isApproved && (
          <Badge className="bg-primary/10 text-primary border-primary/30 gap-1">
            <ShieldCheck className="h-3.5 w-3.5" /> Approved
          </Badge>
        )}

        <div className="flex items-center gap-2">
          {!isApproved && (
            <Button size="sm" variant="outline" onClick={handleSave} className="gap-1.5">
              <Save className="h-3.5 w-3.5" /> Save
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={handleDownloadPdf} disabled={isGeneratingPdf} className="gap-1.5">
            <Download className="h-3.5 w-3.5" /> {isGeneratingPdf ? 'Generating...' : 'PDF'}
          </Button>
          {!isApproved && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" className="gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" /> Approve for Production
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Approve Techpack for Production?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will save all edits, mark the design as approved, and lock the techpack. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleApprove}>Approve</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Techpack content */}
      <div ref={contentRef} className="max-w-5xl mx-auto px-4 py-8 space-y-8">

        {/* ─── 1. PRODUCT DETAIL ─── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">1 · Product Detail</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  <HeaderRow label="Brand" value="Studio Collection" />
                  <HeaderRow label="Style Name" value={sample?.silhouetteName || '—'} />
                  <HeaderRow label="Style Code" value={sample?.silhouetteCode || design.silhouetteId} />
                  <HeaderRow label="Season / Collection" value={`${sample?.season || 'SS26'} — ${sample?.collectionName || design.collectionId}`} />
                  <HeaderRow label="Sample Number" value={sample?.sampleNumber || '—'} />
                  <HeaderRow label="Sample Type" value={design.sampleType || '—'} />
                  <HeaderRow label="Sample Size" value={design.gradedSpecSheet?.sampleSize || sample?.sizes[0] || '—'} />
                  <HeaderRow label="Size Range" value={design.gradedSpecSheet?.sizeRange || sample?.sizes.join(', ') || '—'} />
                  <HeaderRow label="Designer" value={sample?.designerName || '—'} />
                  <HeaderRow label="Line" value={sample?.lineName || '—'} />
                  <HeaderRow label="Target Date" value={sample?.targetDate || '—'} />
                  <HeaderRow label="Colour" value={colourDisplay} />
                  <HeaderRow label="Fabric Name" value={fabric?.fabricName || '—'} />
                  <HeaderRow label="Fabric Code" value={fabric?.id || '—'} />
                  <HeaderRow label="SPI" value={specs?.recommendedSPI != null ? `${specs.recommendedSPI} SPI` : '—'} />
                  <HeaderRow label="Ironing" value={specs?.ironingInstructions ? IRONING_INSTRUCTION_LABELS[specs.ironingInstructions] : '—'} />
                  {canEdit ? (
                    <tr className="border-b border-border last:border-b-0">
                      <td className="px-4 py-2 text-muted-foreground font-medium w-1/3 bg-muted/30">Seam Style</td>
                      <td className="px-4 py-2"><Input value={seamFinish} onChange={e => setSeamFinish(e.target.value)} className="h-8 text-sm" /></td>
                    </tr>
                  ) : (
                    <HeaderRow label="Seam Style" value={seamFinish || design.seamFinish || '—'} />
                  )}
                  <HeaderRow label="Product Category" value={design.category ? CATEGORY_LABELS[design.category] || design.category : '—'} />
                  <HeaderRow label="GTM Date" value={gtmDate} />
                  <HeaderRow label="Neckline" value={resolveNeckline()} />
                  <HeaderRow label="Sleeve" value={resolveSleeve()} />
                  <HeaderRow label="Order Qty" value={sample?.totalQty ? String(sample.totalQty) : '—'} />
                </tbody>
              </table>
            </div>
            {/* Additional Notes */}
            <div className="mt-4">
              <p className="text-xs text-muted-foreground mb-1">Additional Notes</p>
              {canEdit ? (
                <Textarea value={additionalNotes} onChange={e => setAdditionalNotes(e.target.value)} className="text-sm min-h-[60px]" />
              ) : (
                <p className="text-sm">{additionalNotes || design.additionalNotes || '—'}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ─── 2. TECHNICAL SKETCH ─── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">2 · Technical Sketch</CardTitle>
          </CardHeader>
          <CardContent>
            {design.sketchViews ? (
              <div className="grid grid-cols-2 gap-4">
                {(['front', 'back', 'left', 'right'] as const).map(view => (
                  <SketchQuadrant key={view} label={`${view.charAt(0).toUpperCase()}${view.slice(1)} View`} src={design.sketchViews?.[view]} />
                ))}
              </div>
            ) : design.techpackAnnotations?.dataUrl ? (
              <img src={design.techpackAnnotations.dataUrl} alt="Techpack annotation" className="max-w-full rounded-md border border-border" />
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {['Front View', 'Back View', 'Left View', 'Right View'].map(label => (
                  <SketchQuadrant key={label} label={label} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ─── 3. CONSTRUCTION CALLOUTS ─── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">3 · Construction Callouts</CardTitle>
          </CardHeader>
          <CardContent>
            {callouts.length > 0 ? (
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left px-4 py-2 font-semibold w-16 border-b border-border">Label</th>
                      <th className="text-left px-4 py-2 font-semibold border-b border-border">Description</th>
                      {canEdit && <th className="w-10 border-b border-border" />}
                    </tr>
                  </thead>
                  <tbody>
                    {callouts.map((c, i) => (
                      <tr key={i} className={i % 2 === 0 ? '' : 'bg-muted/20'}>
                        <td className="px-4 py-2 font-bold text-primary border-b border-border">{c.label}</td>
                        <td className="px-4 py-2 border-b border-border">
                          {canEdit ? (
                            <Input value={c.description} onChange={e => updateCallout(i, e.target.value)} className="h-8 text-sm" />
                          ) : c.description}
                        </td>
                        {canEdit && (
                          <td className="px-2 py-2 border-b border-border">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeCallout(i)}>
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No construction callouts.</p>
            )}
            {canEdit && (
              <Button variant="outline" size="sm" className="mt-3 gap-1.5" onClick={addCallout}>
                <Plus className="h-3.5 w-3.5" /> Add Callout
              </Button>
            )}
          </CardContent>
        </Card>

        {/* ─── 4. GRADED SPEC SHEET ─── */}
        {design.gradedSpecSheet && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">4 · Specification Sheet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 text-xs text-muted-foreground mb-3">
                <span>Sample Size: <strong className="text-foreground">{design.gradedSpecSheet.sampleSize}</strong></span>
                <span>Range: <strong className="text-foreground">{design.gradedSpecSheet.sizeRange}</strong></span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse border border-border min-w-[700px]">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="border border-border px-2 py-1.5 text-left font-semibold w-10">Label</th>
                      <th className="border border-border px-2 py-1.5 text-left font-semibold min-w-[180px]">Point of Measurement (cm)</th>
                      <th className="border border-border px-2 py-1.5 text-center font-semibold w-14">Grade</th>
                      <th className="border border-border px-2 py-1.5 text-center font-semibold w-12">Tol −</th>
                      <th className="border border-border px-2 py-1.5 text-center font-semibold w-12">Tol +</th>
                      {SIZES.map(s => (
                        <th key={s} className={cn("border border-border px-2 py-1.5 text-center font-semibold w-14", s === design.gradedSpecSheet!.sampleSize && 'bg-primary/10')}>{s}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {specMeasurements.map((m, i) => (
                      <tr key={i} className={i % 2 === 0 ? '' : 'bg-muted/20'}>
                        <td className="border border-border px-2 py-1.5 font-bold text-primary">{m.label}</td>
                        <td className="border border-border px-2 py-1.5">{m.pointOfMeasurement}</td>
                        <td className="border border-border px-2 py-1.5 text-center">
                          {canEdit ? <input type="number" step="0.1" value={m.grade} onChange={e => updateSpecField(i, 'grade', parseFloat(e.target.value) || 0)} className="w-12 text-center bg-transparent border-b border-border text-xs" /> : m.grade}
                        </td>
                        <td className="border border-border px-2 py-1.5 text-center">
                          {canEdit ? <input type="number" step="0.1" value={m.tolMinus} onChange={e => updateSpecField(i, 'tolMinus', parseFloat(e.target.value) || 0)} className="w-10 text-center bg-transparent border-b border-border text-xs" /> : m.tolMinus}
                        </td>
                        <td className="border border-border px-2 py-1.5 text-center">
                          {canEdit ? <input type="number" step="0.1" value={m.tolPlus} onChange={e => updateSpecField(i, 'tolPlus', parseFloat(e.target.value) || 0)} className="w-10 text-center bg-transparent border-b border-border text-xs" /> : m.tolPlus}
                        </td>
                        {SIZES.map(s => (
                          <td key={s} className={cn("border border-border px-2 py-1.5 text-center tabular-nums", s === design.gradedSpecSheet!.sampleSize && 'bg-primary/10')}>
                            {canEdit ? (
                              <input type="number" step="0.1" value={m.values[s] ?? ''} onChange={e => updateSpecValue(i, s, parseFloat(e.target.value) || 0)} className="w-14 text-center bg-transparent border-b border-border text-xs" />
                            ) : (m.values[s] ?? '—')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ─── 5. BODY SIZE CHARTS ─── */}
        {bodySizeChart.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">5 · Body Size Charts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse border border-border min-w-[600px]">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="border border-border px-2 py-1.5 text-left font-semibold w-10">Label</th>
                      <th className="border border-border px-2 py-1.5 text-left font-semibold min-w-[120px]">Measurement</th>
                      {SIZES.map(s => (
                        <th key={s} className="border border-border px-2 py-1.5 text-center font-semibold w-14">{s}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bodySizeChart.map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? '' : 'bg-muted/20'}>
                        <td className="border border-border px-2 py-1.5 font-bold text-primary">{row.label}</td>
                        <td className="border border-border px-2 py-1.5">{row.measurement}</td>
                        {SIZES.map(s => (
                          <td key={s} className="border border-border px-2 py-1.5 text-center tabular-nums">
                            {canEdit ? (
                              <input type="number" step="0.1" value={row.values[s] ?? ''} onChange={e => updateBodyValue(i, s, parseFloat(e.target.value) || 0)} className="w-14 text-center bg-transparent border-b border-border text-xs" />
                            ) : (row.values[s] ?? '—')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ─── 6. PATTERN UV LAYOUTS ─── */}
        {design.patternLayouts && design.patternLayouts.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">6 · Pattern UV Layouts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {design.patternLayouts.map((piece, i) => (
                  <div key={i} className="border border-border rounded-lg p-3 text-center space-y-2">
                    {piece.imageUrl ? (
                      <img src={piece.imageUrl} alt={piece.pieceName} className="w-full h-20 object-contain rounded" />
                    ) : (
                      <div className="w-full h-20 bg-muted/30 rounded flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
                      </div>
                    )}
                    <p className="text-xs font-medium leading-tight">{piece.pieceName}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ─── 7. FABRIC SPECIFICATIONS ─── */}
        {fabric && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">7 · Fabric Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <Field label="Fabric Name" value={fabric.fabricName} />
                <Field label="Composition" value={fabric.fabricComposition} />
                <Field label="Component" value={COMPONENT_TYPE_LABELS[fabric.componentType]} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* ─── 8. TRIMS & CLOSURES ─── */}
        {design && ((design.trims && design.trims.length > 0) || (design.closures && design.closures.length > 0)) && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">8 · Trims & Closures</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {design.trims && design.trims.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Trims</p>
                  <div className="flex flex-wrap gap-2">
                    {design.trims.map((t, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{t.trimType?.name || t.trimId} — {t.placements?.join(', ')}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {design.closures && design.closures.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Closures</p>
                  <div className="flex flex-wrap gap-2">
                    {design.closures.map((c, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{c.type} — {c.placement}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ─── 9. ARTWORK PLACEMENT ─── */}
        {(sample?.decorationTechnique || artworkPlacements.length > 0) && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">9 · Artwork Placement</CardTitle>
            </CardHeader>
            <CardContent>
              {sample?.decorationTechnique && (
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs text-muted-foreground">Decoration:</span>
                  <Badge variant="secondary">{getTechniqueLabel(sample.decorationTechnique)}</Badge>
                </div>
              )}
              {artworkPlacements.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse border border-border">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="border border-border px-3 py-2 text-left font-semibold">Type</th>
                        <th className="border border-border px-3 py-2 text-center font-semibold">Width</th>
                        <th className="border border-border px-3 py-2 text-center font-semibold">Height</th>
                        <th className="border border-border px-3 py-2 text-center font-semibold">Angle</th>
                        <th className="border border-border px-3 py-2 text-left font-semibold">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {artworkPlacements.map((ap, i) => (
                        <tr key={i} className={i % 2 === 0 ? '' : 'bg-muted/20'}>
                          <td className="border border-border px-3 py-2 font-medium">{ap.artworkType}</td>
                          <td className="border border-border px-3 py-2 text-center">
                            {canEdit ? <input value={ap.width} onChange={e => updateArtwork(i, 'width', e.target.value)} className="w-20 text-center bg-transparent border-b border-border text-xs" /> : ap.width}
                          </td>
                          <td className="border border-border px-3 py-2 text-center">
                            {canEdit ? <input value={ap.height} onChange={e => updateArtwork(i, 'height', e.target.value)} className="w-20 text-center bg-transparent border-b border-border text-xs" /> : ap.height}
                          </td>
                          <td className="border border-border px-3 py-2 text-center">
                            {canEdit ? <input value={ap.angle} onChange={e => updateArtwork(i, 'angle', e.target.value)} className="w-14 text-center bg-transparent border-b border-border text-xs" /> : ap.angle}
                          </td>
                          <td className="border border-border px-3 py-2">
                            {canEdit ? <input value={ap.notes || ''} onChange={e => updateArtwork(i, 'notes', e.target.value)} className="w-full bg-transparent border-b border-border text-xs" /> : (ap.notes || '—')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ─── 10. BILL OF MATERIALS ─── */}
        {bomItems.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">10 · Bill of Materials (BOM)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse border border-border">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="border border-border px-3 py-2 text-left font-semibold">Item</th>
                      <th className="border border-border px-3 py-2 text-left font-semibold">Description</th>
                      <th className="border border-border px-3 py-2 text-left font-semibold">Supplier</th>
                      <th className="border border-border px-3 py-2 text-right font-semibold">Unit Cost (PKR)</th>
                      <th className="border border-border px-3 py-2 text-center font-semibold">Qty</th>
                      <th className="border border-border px-3 py-2 text-center font-semibold">Unit</th>
                      <th className="border border-border px-3 py-2 text-right font-semibold">Total (PKR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bomItems.map((item, i) => (
                      <tr key={i} className={i % 2 === 0 ? '' : 'bg-muted/20'}>
                        <td className="border border-border px-3 py-2 font-medium">{item.item}</td>
                        <td className="border border-border px-3 py-2">{item.description}</td>
                        <td className="border border-border px-3 py-2">{item.supplier || '—'}</td>
                        <td className="border border-border px-3 py-2 text-right tabular-nums">
                          {canEdit ? <input type="number" step="1" value={item.unitCost ?? ''} onChange={e => updateBomField(i, 'unitCost', parseFloat(e.target.value) || 0)} className="w-20 text-right bg-transparent border-b border-border text-xs" /> : (item.unitCost?.toLocaleString() || '—')}
                        </td>
                        <td className="border border-border px-3 py-2 text-center tabular-nums">
                          {canEdit ? <input type="number" step="0.1" value={item.quantity ?? ''} onChange={e => updateBomField(i, 'quantity', parseFloat(e.target.value) || 0)} className="w-14 text-center bg-transparent border-b border-border text-xs" /> : (item.quantity || '—')}
                        </td>
                        <td className="border border-border px-3 py-2 text-center">{item.unit || '—'}</td>
                        <td className="border border-border px-3 py-2 text-right tabular-nums font-medium">{item.totalCost?.toLocaleString() || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-muted/50 font-semibold">
                      <td colSpan={6} className="border border-border px-3 py-2 text-right">Total Cost</td>
                      <td className="border border-border px-3 py-2 text-right tabular-nums">PKR {bomTotal.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ─── 11. LINING & SLIP ─── */}
        {design && (design.liningConfig || design.slipConfig) && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">11 · Lining & Slip Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                {design.liningConfig && (
                  <>
                    <Field label="Coverage" value={design.liningConfig.coverage || '—'} />
                    <Field label="Finish" value={design.liningConfig.finish || '—'} />
                  </>
                )}
                {design.slipConfig && design.slipConfig.length && <Field label="Slip Length" value={design.slipConfig.length} />}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ─── 12. GGT FILES ─── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
              <Link2 className="h-4 w-4" /> 12 · GGT / Pattern Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            {design.ggtFiles && design.ggtFiles.length > 0 ? (
              <div className="space-y-2">
                {design.ggtFiles.map(file => (
                  <div key={file.id} className="flex items-center gap-3 p-3 rounded-md border border-border bg-muted/20 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.label}</p>
                      <p className="text-xs text-muted-foreground">Added by {file.addedBy} · {format(parseISO(file.addedAt), 'dd MMM yyyy')}</p>
                    </div>
                    <a href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline shrink-0">
                      Open <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No GGT files linked.</p>
            )}
          </CardContent>
        </Card>

        {/* ─── 13. CARE & HANDLING ─── */}
        {(specs?.careInstructions || sample?.careInstructions || specs?.ironingInstructions) && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">13 · Care & Handling</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {(specs?.careInstructions || sample?.careInstructions) && <Field label="Care Instructions" value={specs?.careInstructions || sample?.careInstructions || ''} />}
                {specs?.ironingInstructions && <Field label="Ironing" value={IRONING_INSTRUCTION_LABELS[specs.ironingInstructions]} />}
                {specs?.shrinkageMargin && <Field label="Shrinkage Margin" value={specs.shrinkageMargin} />}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ─── 14. STAGE APPROVAL GATE TRACKER ─── */}
        {sample && stageStatuses.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">14 · Stage Approval Gate Tracker</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stageStatuses.map(({ stage, proc, isBlocked }, idx) => {
                  const status = proc?.approvalStatus;
                  const isApproved = status === 'approved';
                  const isRejected = status === 'rejected';
                  const isPending = status === 'pending' || status === 'redo';
                  const isNotStarted = !proc;
                  const isCurrent = sample.currentStage === stage;
                  return (
                    <div key={stage} className={cn('flex items-start gap-4 p-3 rounded-lg border',
                      isApproved && 'bg-muted/20 border-border',
                      isPending && !isBlocked && 'bg-primary/5 border-primary/30',
                      isRejected && 'bg-destructive/5 border-destructive/30',
                      isBlocked && 'bg-muted/10 border-dashed border-muted opacity-60',
                      isNotStarted && !isBlocked && 'bg-muted/10 border-dashed border-muted',
                    )}>
                      <div className="shrink-0 mt-0.5">
                        {isApproved && <CheckCircle2 className="h-5 w-5 text-primary" />}
                        {isPending && !isBlocked && <Clock className="h-5 w-5 text-primary" />}
                        {isRejected && <XCircle className="h-5 w-5 text-destructive" />}
                        {isBlocked && <Lock className="h-5 w-5 text-muted-foreground" />}
                        {isNotStarted && !isBlocked && <Clock className="h-5 w-5 text-muted-foreground" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-muted-foreground font-mono">{String(idx + 1).padStart(2, '0')}</span>
                          <span className={cn('font-medium text-sm', isBlocked && 'text-muted-foreground')}>{getStageLabel(stage)}</span>
                          {isCurrent && <Badge variant="default" className="text-xs py-0">Current</Badge>}
                          {isApproved && <Badge variant="outline" className="text-xs py-0 border-primary/40 text-primary">Approved</Badge>}
                          {isRejected && <Badge variant="destructive" className="text-xs py-0">Rejected</Badge>}
                          {isPending && !isBlocked && <Badge variant="secondary" className="text-xs py-0">Pending</Badge>}
                          {isBlocked && <span className="text-xs text-muted-foreground italic">Blocked</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ─── 15. PRODUCTION NOTES ─── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">15 · Production Change Notes</CardTitle>
          </CardHeader>
          <CardContent>
            {design.productionNotes && design.productionNotes.length > 0 ? (
              <div className="space-y-2">
                {design.productionNotes.map(note => (
                  <div key={note.id} className="p-3 rounded-md border border-border bg-muted/10 text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs">{note.department}</Badge>
                      <span className="text-xs text-muted-foreground">{note.addedBy} · {format(parseISO(note.addedAt), 'dd MMM yyyy')}</span>
                    </div>
                    <p className="whitespace-pre-wrap">{note.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No production notes.</p>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

// ─── Helper components ─────────────────────────────────────
const Field = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
    <p className="font-medium">{value || '—'}</p>
  </div>
);

const HeaderRow = ({ label, value }: { label: string; value: string }) => (
  <tr className="border-b border-border last:border-b-0">
    <td className="px-4 py-2 text-muted-foreground font-medium w-1/3 bg-muted/30">{label}</td>
    <td className="px-4 py-2 font-medium">{value || '—'}</td>
  </tr>
);

const SketchQuadrant = ({ label, src }: { label: string; src?: string }) => (
  <div className="border border-border rounded-lg overflow-hidden">
    <div className="bg-muted/30 px-3 py-1.5 border-b border-border">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
    </div>
    <div className="aspect-square flex items-center justify-center p-4 bg-background">
      {src ? (
        <img src={src} alt={label} className="max-w-full max-h-full object-contain" />
      ) : (
        <div className="text-center space-y-2">
          <ImageIcon className="h-8 w-8 text-muted-foreground/30 mx-auto" />
          <p className="text-xs text-muted-foreground/50">Not uploaded</p>
        </div>
      )}
    </div>
  </div>
);

export default TechpackPreviewPage;
