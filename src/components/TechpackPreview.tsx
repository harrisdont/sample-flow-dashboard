import { forwardRef } from 'react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ImageIcon } from 'lucide-react';
import {
  silhouetteLibrary,
  necklineLibrary,
  sleeveLibrary,
  seamFinishLibrary,
  fabricLibrary,
} from '@/data/libraryData';
import { useColorPaletteStore } from '@/data/colorPaletteStore';
import {
  PRINT_CATEGORY_LABELS,
  PRINT_COLOR_SCHEME_LABELS,
  PRINT_SCALE_LABELS,
  IRONING_INSTRUCTION_LABELS,
  PrintClassification,
  IroningInstruction,
} from '@/data/fabricStore';

interface TechpackPreviewProps {
  selectedCollection: string;
  selectedSilhouette: string;
  selectedFabric: string;
  selectedProcesses?: string[];
  isCustom: boolean;
  selectedNeckline: string;
  selectedSleeve: string;
  selectedSeamFinish: string;
  sampleType: string;
  additionalNotes: string;
  fastTrack: boolean;
  fastTrackReason: string;
  colorId?: string;
  printClassification?: PrintClassification;
  recommendedSPI?: number;
  ironingInstructions?: IroningInstruction;
  handlingNotes?: string;
  annotatedDrawingUrl?: string;
  fabricLegend?: {
    number: number;
    fabricName: string;
    color: string;
    componentType: string;
  }[];
  // New professional techpack fields
  sketchViews?: { front?: string; back?: string; left?: string; right?: string };
  constructionCallouts?: { label: string; description: string }[];
}

export const TechpackPreview = forwardRef<HTMLDivElement, TechpackPreviewProps>(
  (
    {
      selectedCollection,
      selectedSilhouette,
      selectedFabric,
      selectedProcesses = [],
      isCustom,
      selectedNeckline,
      selectedSleeve,
      selectedSeamFinish,
      sampleType,
      additionalNotes,
      fastTrack,
      fastTrackReason,
      colorId,
      printClassification,
      recommendedSPI,
      ironingInstructions,
      handlingNotes,
      annotatedDrawingUrl,
      fabricLegend,
      sketchViews,
      constructionCallouts,
    },
    ref
  ) => {
    const silhouetteData = silhouetteLibrary.find((s) => s.id === selectedSilhouette);
    const fabricData = fabricLibrary.find((f) => f.id === selectedFabric);
    const necklineData = necklineLibrary.find((n) => n.id === selectedNeckline);
    const sleeveData = sleeveLibrary.find((s) => s.id === selectedSeamFinish);
    const seamFinishData = seamFinishLibrary.find((s) => s.id === selectedSeamFinish);
    
    // Get color from palette
    const { getColorById } = useColorPaletteStore();
    const selectedColor = colorId ? getColorById(colorId) : undefined;

    return (
      <Card ref={ref} className="p-6 bg-card border-border">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Technical Package</h2>
            <p className="text-sm text-muted-foreground">
              Generated on {new Date().toLocaleDateString()}
            </p>
            {fastTrack && (
              <Badge variant="destructive" className="mt-2">
                FAST TRACK REQUEST
              </Badge>
            )}
          </div>

          <Separator />

          {/* Collection Info */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Collection Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Collection:</span>
                <p className="font-medium text-foreground">{selectedCollection}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Sample Type:</span>
                <p className="font-medium text-foreground capitalize">
                  {sampleType.replace('-', ' ')}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Silhouette Details */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Silhouette Specifications</h3>
            <div className="space-y-4">
              <div className="flex-1 space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Code:</span>
                  <p className="font-medium font-mono text-foreground">
                    {silhouetteData?.code}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Name:</span>
                  <p className="font-medium text-foreground">{silhouetteData?.name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Category:</span>
                  <p className="font-medium text-foreground capitalize">
                    {silhouetteData?.category}
                  </p>
                </div>
              </div>
              
              {/* Technical Drawings - 4-view grid or annotated or fallback */}
              {sketchViews ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">4-View Technical Sketch</p>
                  <div className="grid grid-cols-2 gap-3">
                    {(['front', 'back', 'left', 'right'] as const).map(view => (
                      <div key={view} className="border border-border rounded-lg overflow-hidden">
                        <div className="bg-muted/30 px-2 py-1 border-b border-border">
                          <p className="text-xs font-medium text-muted-foreground capitalize">{view} View</p>
                        </div>
                        <div className="aspect-square flex items-center justify-center p-3 bg-background/50">
                          {sketchViews[view] ? (
                            <img src={sketchViews[view]} alt={`${view} view`} className="max-w-full max-h-full object-contain" />
                          ) : (
                            <ImageIcon className="h-6 w-6 text-muted-foreground/30" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (annotatedDrawingUrl || silhouetteData?.technicalDrawing) ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {annotatedDrawingUrl ? 'Annotated Technical Drawing' : 'Technical Drawings'}
                  </p>
                  
                  {annotatedDrawingUrl ? (
                    <div className="space-y-3">
                      <div className="bg-background/50 rounded border border-border p-4">
                        <img src={annotatedDrawingUrl} alt="Annotated Technical Drawing" className="w-full h-auto object-contain" />
                      </div>
                      {fabricLegend && fabricLegend.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">Fabric Placement Legend</p>
                          <div className="flex flex-wrap gap-2">
                            {fabricLegend.map((item) => (
                              <div key={item.number} className="flex items-center gap-2 px-2 py-1 bg-muted/50 rounded text-xs">
                                <div className="w-5 h-5 rounded-full flex items-center justify-center text-white font-bold text-xs" style={{ backgroundColor: item.color }}>
                                  {item.number}
                                </div>
                                <span className="font-medium">{item.fabricName}</span>
                                <span className="text-muted-foreground">({item.componentType})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-xs text-center text-muted-foreground font-medium">Front View</p>
                        <div className="aspect-square bg-background/50 rounded border border-border p-4 flex items-center justify-center">
                          <img src={silhouetteData?.technicalDrawing} alt={`${silhouetteData?.name} - Front`} className="w-full h-full object-contain" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs text-center text-muted-foreground font-medium">Back View</p>
                        <div className="aspect-square bg-background/50 rounded border border-border p-4 flex items-center justify-center">
                          <img src={silhouetteData?.technicalDrawing} alt={`${silhouetteData?.name} - Back`} className="w-full h-full object-contain" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Construction Callouts */}
              {constructionCallouts && constructionCallouts.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Construction Callouts</p>
                  <div className="border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left px-3 py-1.5 font-semibold w-12 border-b border-border">Label</th>
                          <th className="text-left px-3 py-1.5 font-semibold border-b border-border">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {constructionCallouts.map((c, i) => (
                          <tr key={i} className={i % 2 === 0 ? '' : 'bg-muted/20'}>
                            <td className="px-3 py-1.5 font-bold text-primary border-b border-border">{c.label}</td>
                            <td className="px-3 py-1.5 border-b border-border">{c.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Fabric & Materials */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Fabric & Materials</h3>
            <div className="text-sm space-y-2">
              <div>
                <span className="text-muted-foreground">Base Fabric:</span>
                <p className="font-medium text-foreground">{fabricData?.name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Composition:</span>
                <p className="font-medium text-foreground">{fabricData?.composition}</p>
              </div>
              
              {/* Color Details */}
              {selectedColor && (
                <div>
                  <span className="text-muted-foreground">Color:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div 
                      className="w-6 h-6 rounded border border-border"
                      style={{ backgroundColor: selectedColor.hexCode }}
                    />
                    <span className="font-medium text-foreground">{selectedColor.name}</span>
                    <span className="text-xs text-muted-foreground">({selectedColor.hexCode})</span>
                    {selectedColor.pantoneCode && (
                      <Badge variant="outline" className="text-xs">
                        {selectedColor.pantoneCode}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              
              {/* Print Classification */}
              {printClassification && (
                <div>
                  <span className="text-muted-foreground">Print Classification:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {PRINT_CATEGORY_LABELS[printClassification.category]}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {PRINT_COLOR_SCHEME_LABELS[printClassification.colorScheme]}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {PRINT_SCALE_LABELS[printClassification.scale]}
                    </Badge>
                  </div>
                </div>
              )}
              
              {selectedProcesses.length > 0 && (
                <div>
                  <span className="text-muted-foreground">Production Processes:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedProcesses.map(processId => (
                      <Badge
                        key={processId}
                        variant="secondary"
                        className="text-xs"
                      >
                        {processId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Care & Handling Specifications */}
          {(recommendedSPI || ironingInstructions || handlingNotes) && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">Care & Handling</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {recommendedSPI && (
                    <div>
                      <span className="text-muted-foreground">Recommended SPI:</span>
                      <p className="font-medium text-foreground">{recommendedSPI} stitches/inch</p>
                    </div>
                  )}
                  {ironingInstructions && (
                    <div>
                      <span className="text-muted-foreground">Ironing:</span>
                      <p className="font-medium text-foreground">
                        {IRONING_INSTRUCTION_LABELS[ironingInstructions]}
                      </p>
                    </div>
                  )}
                  {handlingNotes && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Handling Notes:</span>
                      <div className="mt-1 bg-background/50 p-2 rounded border border-border">
                        <p className="text-foreground whitespace-pre-wrap">{handlingNotes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Custom Modifications */}
          {isCustom && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  Custom Modifications
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Neckline:</span>
                    <p className="font-medium text-foreground">
                      {necklineData?.code} - {necklineData?.name}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Sleeve:</span>
                    <p className="font-medium text-foreground">
                      {sleeveData?.code} - {sleeveData?.name}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Seam Finish:</span>
                    <p className="font-medium text-foreground">
                      {seamFinishData?.name} - {seamFinishData?.type}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Additional Instructions */}
          {additionalNotes && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  Additional Instructions
                </h3>
                <div className="text-sm bg-background/50 p-3 rounded border border-border">
                  <p className="text-foreground whitespace-pre-wrap">{additionalNotes}</p>
                </div>
              </div>
            </>
          )}

          {/* Fast Track Details */}
          {fastTrack && fastTrackReason && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  Fast Track Justification
                </h3>
                <div className="text-sm bg-destructive/10 p-3 rounded border border-destructive/20">
                  <p className="text-foreground whitespace-pre-wrap">{fastTrackReason}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </Card>
    );
  }
);

TechpackPreview.displayName = 'TechpackPreview';
