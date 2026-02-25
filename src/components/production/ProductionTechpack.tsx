import { useState } from 'react';
import { Sample } from '@/types/sample';
import { useDesignStore, Design, ProductionNote, GGTFile } from '@/data/designStore';
import { useFabricStore, IRONING_INSTRUCTION_LABELS, COMPONENT_TYPE_LABELS } from '@/data/fabricStore';
import { getFullProductionPath, DECORATION_STAGE_LABELS, getTechniqueLabel } from '@/lib/embroideryWorkflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, parseISO } from 'date-fns';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Lock,
  ChevronLeft,
  FileText,
  Link2,
  Plus,
  ExternalLink,
  AlertTriangle,
  Zap,
  ImageIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Stage label map for production stages
const PRODUCTION_STAGE_LABELS: Record<string, string> = {
  design: 'Design',
  pattern: 'Pattern Making',
  'semi-stitching': 'Semi Stitching',
  'complete-stitching': 'Complete Stitching',
  'hand-finishes': 'Hand Finishes',
  approval: 'Final Approval',
  multihead: 'Multihead Embroidery',
  'hand-embroidery': 'Hand Embroidery',
  'screen-print': 'Screen Print',
  'hand-block-printing': 'Hand Block Printing',
  ...DECORATION_STAGE_LABELS,
};

const getStageLabel = (stage: string) =>
  PRODUCTION_STAGE_LABELS[stage] || stage;

const SIZES = ['0', '2', '4', '6', '8', '10', '12', '14'];

interface ProductionTechpackProps {
  sample: Sample;
  onBack: () => void;
}

export const ProductionTechpack = ({ sample, onBack }: ProductionTechpackProps) => {
  const designs = useDesignStore(s => s.designs);
  const addProductionNote = useDesignStore(s => s.addProductionNote);
  const addGGTFile = useDesignStore(s => s.addGGTFile);
  const fabrics = useFabricStore(s => s.fabrics);

  const design: Design | undefined = Object.values(designs).find(
    d => d.collectionId === sample.collectionName || d.silhouetteId === sample.silhouetteCode
  );

  const fabric = fabrics.find(f => f.collectionName === sample.collectionName);
  const specs = fabric?.technicalSpecs;

  // Note form state
  const [noteText, setNoteText] = useState('');
  const [noteDept, setNoteDept] = useState<ProductionNote['department']>('design');
  const [noteBy, setNoteBy] = useState('');

  // GGT form state
  const [ggtLabel, setGgtLabel] = useState('');
  const [ggtUrl, setGgtUrl] = useState('');
  const [ggtBy, setGgtBy] = useState('');

  const handleAddNote = () => {
    if (!design || !noteText.trim()) return;
    addProductionNote(design.id, {
      text: noteText.trim(),
      department: noteDept,
      addedBy: noteBy.trim() || 'Anonymous',
    });
    setNoteText('');
    setNoteBy('');
  };

  const handleAddGGT = () => {
    if (!design || !ggtLabel.trim() || !ggtUrl.trim()) return;
    addGGTFile(design.id, {
      label: ggtLabel.trim(),
      url: ggtUrl.trim(),
      addedBy: ggtBy.trim() || 'Anonymous',
    });
    setGgtLabel('');
    setGgtUrl('');
    setGgtBy('');
  };

  // Build stage gate tracker
  const fullPath = getFullProductionPath(sample.decorationTechnique);
  let foundBlocked = false;
  const stageStatuses = fullPath.map((stage) => {
    const proc = sample.processes.find(p => p.stage === stage);
    if (!proc) {
      const isBlocked = foundBlocked;
      if (!foundBlocked) foundBlocked = true;
      return { stage, proc: null, isBlocked };
    }
    if (!foundBlocked && (proc.approvalStatus === 'pending' || proc.approvalStatus === 'rejected')) {
      const isBlocked = false;
      foundBlocked = true;
      return { stage, proc, isBlocked };
    }
    return { stage, proc, isBlocked: foundBlocked && proc.approvalStatus !== 'approved' };
  });

  const DEPT_LABELS: Record<ProductionNote['department'], string> = {
    design: 'Design', fabric: 'Fabric', stitching: 'Stitching',
    embroidery: 'Embroidery', trims: 'Trims', qc: 'QC', other: 'Other',
  };

  const DEPT_COLORS: Record<ProductionNote['department'], string> = {
    design: 'bg-primary/10 text-primary',
    fabric: 'bg-secondary/60 text-secondary-foreground',
    stitching: 'bg-accent/60 text-accent-foreground',
    embroidery: 'bg-destructive/10 text-destructive',
    trims: 'bg-muted text-muted-foreground',
    qc: 'bg-chart-1/10 text-chart-1',
    other: 'bg-muted text-muted-foreground',
  };

  // BOM total
  const bomTotal = design?.billOfMaterials?.reduce((sum, item) => sum + (item.totalCost || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky header */}
      <div className="sticky top-0 z-40 bg-card border-b border-border px-6 py-3 flex items-center gap-4 shadow-sm">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 shrink-0">
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center gap-3 min-w-0">
          <FileText className="h-5 w-5 text-primary shrink-0" />
          <div className="min-w-0">
            <h1 className="text-base font-semibold leading-tight truncate">
              Production Techpack — {sample.sampleNumber}
            </h1>
            <p className="text-xs text-muted-foreground truncate">
              {sample.collectionName} · {sample.silhouetteName}
            </p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2 shrink-0">
          <Badge
            variant={sample.approvalStatus === 'approved' ? 'default' : sample.approvalStatus === 'rejected' ? 'destructive' : 'secondary'}
          >
            {sample.approvalStatus.toUpperCase()}
          </Badge>
          {design?.fastTrack && (
            <Badge className="bg-destructive/90 text-destructive-foreground gap-1">
              <Zap className="h-3 w-3" /> Fast Track
            </Badge>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

        {/* ─── 1. PRODUCT DETAIL HEADER ─── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              1 · Product Detail
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  <HeaderRow label="Brand" value="Studio Collection" />
                  <HeaderRow label="Style Name" value={sample.silhouetteName} />
                  <HeaderRow label="Style Code" value={sample.silhouetteCode} />
                  <HeaderRow label="Season / Collection" value={`${sample.season} — ${sample.collectionName}`} />
                  <HeaderRow label="Sample Number" value={sample.sampleNumber} />
                  <HeaderRow label="Sample Type" value={design?.sampleType || '—'} />
                  <HeaderRow label="Sample Size" value={design?.gradedSpecSheet?.sampleSize || sample.sizes[0] || '—'} />
                  <HeaderRow label="Size Range" value={design?.gradedSpecSheet?.sizeRange || sample.sizes.join(', ')} />
                  <HeaderRow label="Designer" value={sample.designerName} />
                  <HeaderRow label="Line" value={sample.lineName} />
                  <HeaderRow label="Target Date" value={sample.targetDate} />
                  <HeaderRow label="Colour" value={sample.colour} />
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* ─── 2. 4-VIEW TECHNICAL SKETCH ─── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              2 · Technical Sketch
            </CardTitle>
          </CardHeader>
          <CardContent>
            {design?.sketchViews ? (
              <div className="grid grid-cols-2 gap-4">
                {(['front', 'back', 'left', 'right'] as const).map(view => (
                  <SketchQuadrant key={view} label={`${view.charAt(0).toUpperCase()}${view.slice(1)} View`} src={design.sketchViews?.[view]} />
                ))}
              </div>
            ) : design?.techpackAnnotations?.dataUrl ? (
              <div className="space-y-3">
                <img
                  src={design.techpackAnnotations.dataUrl}
                  alt="Techpack annotation"
                  className="max-w-full rounded-md border border-border"
                />
                {design.techpackAnnotations.fabricLegend && design.techpackAnnotations.fabricLegend.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {design.techpackAnnotations.fabricLegend.map(entry => (
                      <div key={entry.number} className="flex items-center gap-2 text-xs border border-border rounded px-2 py-1">
                        <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                        <span className="font-medium">F{entry.number}</span>
                        <span className="text-muted-foreground">{entry.fabricName}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
        {design?.constructionCallouts && design.constructionCallouts.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                3 · Construction Callouts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left px-4 py-2 font-semibold w-16 border-b border-border">Label</th>
                      <th className="text-left px-4 py-2 font-semibold border-b border-border">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {design.constructionCallouts.map((c, i) => (
                      <tr key={i} className={i % 2 === 0 ? '' : 'bg-muted/20'}>
                        <td className="px-4 py-2 font-bold text-primary border-b border-border">{c.label}</td>
                        <td className="px-4 py-2 border-b border-border">{c.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ─── 4. GRADED SPEC SHEET ─── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              4 · Specification Sheet
            </CardTitle>
          </CardHeader>
          <CardContent>
            {design?.gradedSpecSheet ? (
              <div className="space-y-3">
                <div className="flex gap-4 text-xs text-muted-foreground">
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
                          <th key={s} className={cn(
                            "border border-border px-2 py-1.5 text-center font-semibold w-14",
                            s === design.gradedSpecSheet!.sampleSize && 'bg-primary/10'
                          )}>{s}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {design.gradedSpecSheet.measurements.map((m, i) => (
                        <tr key={i} className={i % 2 === 0 ? '' : 'bg-muted/20'}>
                          <td className="border border-border px-2 py-1.5 font-bold text-primary">{m.label}</td>
                          <td className="border border-border px-2 py-1.5">{m.pointOfMeasurement}</td>
                          <td className="border border-border px-2 py-1.5 text-center">{m.grade}</td>
                          <td className="border border-border px-2 py-1.5 text-center">{m.tolMinus}</td>
                          <td className="border border-border px-2 py-1.5 text-center">{m.tolPlus}</td>
                          {SIZES.map(s => (
                            <td key={s} className={cn(
                              "border border-border px-2 py-1.5 text-center tabular-nums",
                              s === design.gradedSpecSheet!.sampleSize && 'bg-primary/10 font-semibold'
                            )}>
                              {m.values[s] ?? '—'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Fallback: flat spec sheet */
              <div className="bg-muted/30 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                <Field label="Silhouette Code" value={sample.silhouetteCode} />
                <Field label="Silhouette Name" value={sample.silhouetteName} />
                <Field label="Combination" value={sample.combination} />
                <Field label="Sizes" value={sample.sizes.join(', ')} />
                <Field label="Total Quantity (Sample)" value={String(sample.totalQty)} />
                <Field label="Colour" value={sample.colour} />
                {sample.furtherColourways.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Further Colourways</p>
                    <div className="flex flex-wrap gap-1">
                      {sample.furtherColourways.map(c => (
                        <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {design?.seamFinish && <Field label="Seam Finish" value={design.seamFinish} />}
                {specs?.recommendedSPI != null && <Field label="Recommended SPI" value={`${specs.recommendedSPI} SPI`} />}
                {specs?.fabricWidth && <Field label="Fabric Width" value={specs.fabricWidth} />}
                {specs?.gsm != null && <Field label="GSM" value={`${specs.gsm} g/m²`} />}
                {specs?.shrinkageMargin && <Field label="Shrinkage Margin" value={specs.shrinkageMargin} />}
                {specs?.construction && <Field label="Construction" value={specs.construction} />}
                {specs?.stitchingSpecs && <Field label="Stitching Specs" value={specs.stitchingSpecs} />}
                {sample.decorationTechnique && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Decoration Technique</p>
                    <Badge variant="secondary">{getTechniqueLabel(sample.decorationTechnique)}</Badge>
                  </div>
                )}
                {design?.fastTrack && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Fast Track</p>
                    <Badge className="bg-destructive/90 text-destructive-foreground gap-1">
                      <Zap className="h-3 w-3" /> Fast Track
                    </Badge>
                    {design.fastTrackReason && (
                      <p className="text-xs text-muted-foreground mt-1">{design.fastTrackReason}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ─── 5. BODY SIZE CHARTS ─── */}
        {design?.bodySizeChart && design.bodySizeChart.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                5 · Body Size Charts
              </CardTitle>
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
                    {design.bodySizeChart.map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? '' : 'bg-muted/20'}>
                        <td className="border border-border px-2 py-1.5 font-bold text-primary">{row.label}</td>
                        <td className="border border-border px-2 py-1.5">{row.measurement}</td>
                        {SIZES.map(s => (
                          <td key={s} className="border border-border px-2 py-1.5 text-center tabular-nums">
                            {row.values[s] ?? '—'}
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
        {design?.patternLayouts && design.patternLayouts.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                6 · Pattern UV Layouts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
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
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                7 · Fabric Specifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <Field label="Fabric Name" value={fabric.fabricName} />
                <Field label="Composition" value={fabric.fabricComposition} />
                <Field label="Component" value={COMPONENT_TYPE_LABELS[fabric.componentType]} />
                {fabric.printClassification && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Print Classification</p>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs capitalize">{fabric.printClassification.category}</Badge>
                      <Badge variant="outline" className="text-xs capitalize">{fabric.printClassification.colorScheme}</Badge>
                      <Badge variant="outline" className="text-xs capitalize">{fabric.printClassification.scale}</Badge>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ─── 8. TRIMS & CLOSURES ─── */}
        {design && ((design.trims && design.trims.length > 0) || (design.closures && design.closures.length > 0)) && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                8 · Trims & Closures
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {design.trims && design.trims.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Trims</p>
                  <div className="flex flex-wrap gap-2">
                    {design.trims.map((t, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {t.trimType?.name || t.trimId} — {t.placements?.join(', ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {design.closures && design.closures.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Closures</p>
                  <div className="flex flex-wrap gap-2">
                    {design.closures.map((c, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {c.type} — {c.placement}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ─── 9. ARTWORK PLACEMENT ─── */}
        {(sample.decorationTechnique || (design?.artworkPlacements && design.artworkPlacements.length > 0)) && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                9 · Artwork Placement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {sample.decorationTechnique && (
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs text-muted-foreground">Decoration Technique:</span>
                  <Badge variant="secondary" className="text-sm">{getTechniqueLabel(sample.decorationTechnique)}</Badge>
                </div>
              )}
              {design?.artworkPlacements && design.artworkPlacements.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse border border-border">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="border border-border px-3 py-2 text-left font-semibold">Artwork</th>
                        <th className="border border-border px-3 py-2 text-left font-semibold">Type</th>
                        <th className="border border-border px-3 py-2 text-center font-semibold">Width</th>
                        <th className="border border-border px-3 py-2 text-center font-semibold">Height</th>
                        <th className="border border-border px-3 py-2 text-center font-semibold">Angle</th>
                        <th className="border border-border px-3 py-2 text-center font-semibold">View</th>
                        <th className="border border-border px-3 py-2 text-left font-semibold">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {design.artworkPlacements.map((ap, i) => (
                        <tr key={i} className={i % 2 === 0 ? '' : 'bg-muted/20'}>
                          <td className="border border-border px-3 py-2 font-medium">{ap.artworkType}</td>
                          <td className="border border-border px-3 py-2">{ap.artworkType}</td>
                          <td className="border border-border px-3 py-2 text-center">{ap.width}</td>
                          <td className="border border-border px-3 py-2 text-center">{ap.height}</td>
                          <td className="border border-border px-3 py-2 text-center">{ap.angle}</td>
                          <td className="border border-border px-3 py-2 text-center capitalize">{ap.placementView || '—'}</td>
                          <td className="border border-border px-3 py-2 text-muted-foreground">{ap.notes || '—'}</td>
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
        {design?.billOfMaterials && design.billOfMaterials.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                10 · Bill of Materials (BOM)
              </CardTitle>
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
                    {design.billOfMaterials.map((item, i) => (
                      <tr key={i} className={i % 2 === 0 ? '' : 'bg-muted/20'}>
                        <td className="border border-border px-3 py-2 font-medium">{item.item}</td>
                        <td className="border border-border px-3 py-2">{item.description}</td>
                        <td className="border border-border px-3 py-2">{item.supplier || '—'}</td>
                        <td className="border border-border px-3 py-2 text-right tabular-nums">{item.unitCost?.toLocaleString() || '—'}</td>
                        <td className="border border-border px-3 py-2 text-center tabular-nums">{item.quantity || '—'}</td>
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

        {/* ─── 11. LINING & SLIP CONFIG ─── */}
        {design && (design.liningConfig || design.slipConfig) && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                11 · Lining & Slip Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                {design.liningConfig && (
                  <>
                    <Field label="Lining Coverage" value={design.liningConfig.coverage || '—'} />
                    <Field label="Lining Finish" value={design.liningConfig.finish || '—'} />
                    {design.liningConfig.fabricId && <Field label="Lining Fabric ID" value={design.liningConfig.fabricId} />}
                  </>
                )}
                {design.slipConfig && (
                  <>
                    {design.slipConfig.length && <Field label="Slip Length" value={design.slipConfig.length} />}
                    {design.slipConfig.fabricId && <Field label="Slip Fabric ID" value={design.slipConfig.fabricId} />}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ─── 12. GGT FILE LINKS ─── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              12 · GGT / Pattern Files
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {design?.ggtFiles && design.ggtFiles.length > 0 ? (
              <div className="space-y-2">
                {design.ggtFiles.map(file => (
                  <div key={file.id} className="flex items-center gap-3 p-3 rounded-md border border-border bg-muted/20 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.label}</p>
                      <p className="text-xs text-muted-foreground">
                        Added by {file.addedBy} · {format(parseISO(file.addedAt), 'dd MMM yyyy')}
                      </p>
                    </div>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-primary hover:underline shrink-0"
                    >
                      Open <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {design ? 'No GGT files linked yet.' : 'GGT files available once a design record is created for this sample.'}
              </p>
            )}

            {design && (
              <div className="border border-dashed border-border rounded-lg p-4 space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Add GGT / Pattern File Link</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input placeholder='Label (e.g. "WS2046-graded.ggt")' value={ggtLabel} onChange={e => setGgtLabel(e.target.value)} className="text-sm" />
                  <Input placeholder="URL (Google Drive, Dropbox, etc.)" value={ggtUrl} onChange={e => setGgtUrl(e.target.value)} className="text-sm" />
                  <Input placeholder="Added by" value={ggtBy} onChange={e => setGgtBy(e.target.value)} className="text-sm" />
                </div>
                <Button size="sm" onClick={handleAddGGT} disabled={!ggtLabel.trim() || !ggtUrl.trim()} className="gap-2">
                  <Plus className="h-4 w-4" /> Add File Link
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ─── 13. CARE & HANDLING ─── */}
        {(specs?.careInstructions || sample.careInstructions || specs?.ironingInstructions) && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                13 · Care & Handling
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {(specs?.careInstructions || sample.careInstructions) && (
                  <Field label="Care Instructions" value={specs?.careInstructions || sample.careInstructions} />
                )}
                {specs?.ironingInstructions && (
                  <Field label="Ironing" value={IRONING_INSTRUCTION_LABELS[specs.ironingInstructions]} />
                )}
                {specs?.shrinkageMargin && <Field label="Shrinkage Margin" value={specs.shrinkageMargin} />}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ─── 14. STAGE APPROVAL GATE TRACKER ─── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              14 · Stage Approval Gate Tracker
            </CardTitle>
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
                  <div
                    key={stage}
                    className={cn(
                      'flex items-start gap-4 p-4 rounded-lg border transition-colors',
                      isApproved && 'bg-muted/20 border-border',
                      isPending && !isBlocked && 'bg-primary/5 border-primary/30',
                      isRejected && 'bg-destructive/5 border-destructive/30',
                      isBlocked && 'bg-muted/10 border-dashed border-muted opacity-60',
                      isNotStarted && !isBlocked && 'bg-muted/10 border-dashed border-muted',
                    )}
                  >
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
                        <span className={cn('font-medium text-sm', isBlocked && 'text-muted-foreground')}>
                          {getStageLabel(stage)}
                        </span>
                        {isCurrent && <Badge variant="default" className="text-xs py-0">Current</Badge>}
                        {isApproved && <Badge variant="outline" className="text-xs py-0 border-primary/40 text-primary">Approved</Badge>}
                        {isRejected && <Badge variant="destructive" className="text-xs py-0">Rejected</Badge>}
                        {isPending && !isBlocked && <Badge variant="secondary" className="text-xs py-0">Pending Approval</Badge>}
                        {isBlocked && <span className="text-xs text-muted-foreground italic">Blocked — prior stage must be approved first</span>}
                      </div>
                      {proc && (
                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                          {proc.entryDate && <span>Entry: {proc.entryDate}</span>}
                          <span>Target: {proc.targetDate}</span>
                          {proc.approvedBy && <span>By: {proc.approvedBy}</span>}
                          {proc.entryDate && proc.targetDate && proc.entryDate > proc.targetDate && (
                            <span className="text-destructive flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" /> Overdue
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* ─── 15. PRODUCTION CHANGE NOTES ─── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              15 · Production Change Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sample.changes && (
              <div className="p-3 bg-muted/30 rounded-md border border-border text-sm">
                <p className="text-xs font-medium text-muted-foreground mb-1">Sampling Notes</p>
                <p className="whitespace-pre-wrap">{sample.changes}</p>
              </div>
            )}

            {design?.productionNotes && design.productionNotes.length > 0 ? (
              <div className="space-y-2">
                {design.productionNotes.map(note => (
                  <div key={note.id} className="p-3 rounded-md border border-border bg-muted/10 text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn('px-2 py-0.5 rounded text-xs font-medium', DEPT_COLORS[note.department])}>
                        {DEPT_LABELS[note.department]}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {note.addedBy} · {format(parseISO(note.addedAt), 'dd MMM yyyy')}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap">{note.text}</p>
                  </div>
                ))}
              </div>
            ) : design ? (
              <p className="text-sm text-muted-foreground">No production notes yet.</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Production notes available once a design record is created for this sample.
              </p>
            )}

            {design && (
              <div className="border border-dashed border-border rounded-lg p-4 space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Add Production Note</p>
                <Textarea placeholder="Describe the change or instruction..." value={noteText} onChange={e => setNoteText(e.target.value)} className="text-sm min-h-[80px]" />
                <div className="flex gap-3 flex-wrap">
                  <Select value={noteDept} onValueChange={v => setNoteDept(v as ProductionNote['department'])}>
                    <SelectTrigger className="w-40 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(Object.keys(DEPT_LABELS) as ProductionNote['department'][]).map(d => (
                        <SelectItem key={d} value={d}>{DEPT_LABELS[d]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input placeholder="Added by" value={noteBy} onChange={e => setNoteBy(e.target.value)} className="flex-1 min-w-32 text-sm" />
                  <Button size="sm" onClick={handleAddNote} disabled={!noteText.trim()} className="gap-2">
                    <Plus className="h-4 w-4" /> Add Note
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

// ─── Helper components ───────────────────────────────────────────────────────

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
