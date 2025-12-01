import { forwardRef } from 'react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  silhouetteLibrary,
  necklineLibrary,
  sleeveLibrary,
  seamFinishLibrary,
  fabricLibrary,
} from '@/data/libraryData';

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
    },
    ref
  ) => {
    const silhouetteData = silhouetteLibrary.find((s) => s.id === selectedSilhouette);
    const fabricData = fabricLibrary.find((f) => f.id === selectedFabric);
    const necklineData = necklineLibrary.find((n) => n.id === selectedNeckline);
    const sleeveData = sleeveLibrary.find((s) => s.id === selectedSleeve);
    const seamFinishData = seamFinishLibrary.find((s) => s.id === selectedSeamFinish);

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
              
              {/* Technical Drawings */}
              {silhouetteData?.technicalDrawing && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Technical Drawings</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-xs text-center text-muted-foreground font-medium">Front View</p>
                      <div className="aspect-square bg-background/50 rounded border border-border p-4 flex items-center justify-center">
                        <img
                          src={silhouetteData.technicalDrawing}
                          alt={`${silhouetteData.name} - Front`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-center text-muted-foreground font-medium">Back View</p>
                      <div className="aspect-square bg-background/50 rounded border border-border p-4 flex items-center justify-center">
                        <img
                          src={silhouetteData.technicalDrawing}
                          alt={`${silhouetteData.name} - Back`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
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
