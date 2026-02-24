import { forwardRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { SILHOUETTE_CATEGORY_LABELS, SilhouetteCategory } from '@/data/silhouetteStore';
import { SILHOUETTE_SUB_TYPES, CATEGORY_MEASUREMENTS, PRODUCT_LINES, seamFinishLibrary } from '@/data/libraryData';
import { useFabricStore } from '@/data/fabricStore';
import { format } from 'date-fns';

interface SilhouettePreviewSheetProps {
  code: string;
  name: string;
  category: SilhouetteCategory;
  subType: string;
  lineId: string;
  designerName: string;
  frontSketch: string;
  backSketch: string;
  referenceImages: string[];
  measurements: Record<string, string>;
  seamFinish: string;
  linkedFabricId: string;
  designerNotes: string;
}

export const SilhouettePreviewSheet = forwardRef<HTMLDivElement, SilhouettePreviewSheetProps>(
  (
    {
      code,
      name,
      category,
      subType,
      lineId,
      designerName,
      frontSketch,
      backSketch,
      referenceImages,
      measurements,
      seamFinish,
      linkedFabricId,
      designerNotes,
    },
    ref
  ) => {
    const { getFabricById } = useFabricStore();
    const lineName = PRODUCT_LINES.find((l) => l.id === lineId)?.name || lineId;
    const subTypeLabel =
      SILHOUETTE_SUB_TYPES[category]?.find((s) => s.id === subType)?.label || subType;
    const categoryLabel = SILHOUETTE_CATEGORY_LABELS[category] || category;
    const seamFinishItem = seamFinishLibrary.find((s) => s.id === seamFinish);
    const linkedFabric = linkedFabricId ? getFabricById(linkedFabricId) : null;
    const measurementFields = CATEGORY_MEASUREMENTS[category] || [];
    const filledMeasurements = measurementFields.filter(
      (f) => measurements[f.id] && measurements[f.id].trim() !== ''
    );

    return (
      <div
        ref={ref}
        className="bg-background border border-border rounded-lg p-6 space-y-6 text-sm"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Silhouette Induction Sheet
            </h2>
            <p className="text-muted-foreground text-xs">
              {format(new Date(), 'dd MMM yyyy, hh:mm a')}
            </p>
          </div>
          <Badge variant="outline" className="text-sm font-mono">
            {code || '—'}
          </Badge>
        </div>

        <Separator />

        {/* Basic Info */}
        <div>
          <h3 className="font-semibold text-foreground mb-3">Basic Information</h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2">
            <div>
              <span className="text-muted-foreground">Silhouette Name:</span>{' '}
              <span className="font-medium">{name || '—'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Product Line:</span>{' '}
              <span className="font-medium">{lineName}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Designer:</span>{' '}
              <span className="font-medium">{designerName || '—'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Category:</span>{' '}
              <span className="font-medium">{categoryLabel}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Sub-Type:</span>{' '}
              <span className="font-medium">{subTypeLabel}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Sketches */}
        {(frontSketch || backSketch) && (
          <>
            <div>
              <h3 className="font-semibold text-foreground mb-3">Sketches</h3>
              <div className="grid grid-cols-2 gap-4">
                {frontSketch && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Front View</p>
                    <div className="border border-border rounded-lg overflow-hidden bg-muted/30 aspect-[3/4] flex items-center justify-center p-2">
                      <img
                        src={frontSketch}
                        alt="Front sketch"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  </div>
                )}
                {backSketch && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Back View</p>
                    <div className="border border-border rounded-lg overflow-hidden bg-muted/30 aspect-[3/4] flex items-center justify-center p-2">
                      <img
                        src={backSketch}
                        alt="Back sketch"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Reference Images */}
        {referenceImages.length > 0 && (
          <>
            <div>
              <h3 className="font-semibold text-foreground mb-3">Reference Images</h3>
              <div className="grid grid-cols-4 gap-2">
                {referenceImages.map((img, i) => (
                  <div
                    key={i}
                    className="border border-border rounded overflow-hidden bg-muted/30 aspect-square flex items-center justify-center p-1"
                  >
                    <img
                      src={img}
                      alt={`Reference ${i + 1}`}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Measurements */}
        {filledMeasurements.length > 0 && (
          <>
            <div>
              <h3 className="font-semibold text-foreground mb-3">Measurements</h3>
              <div className="grid grid-cols-3 gap-x-6 gap-y-1">
                {filledMeasurements.map((field) => (
                  <div key={field.id} className="flex justify-between">
                    <span className="text-muted-foreground">{field.label}:</span>
                    <span className="font-medium">
                      {measurements[field.id]} {field.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Technical Details */}
        <div>
          <h3 className="font-semibold text-foreground mb-3">Technical Details</h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2">
            <div>
              <span className="text-muted-foreground">Seam Finish:</span>{' '}
              <span className="font-medium">
                {seamFinishItem
                  ? `${seamFinishItem.name} (${seamFinishItem.type})`
                  : '—'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Linked Fabric:</span>{' '}
              <span className="font-medium">
                {linkedFabric ? linkedFabric.fabricName : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Designer Notes */}
        {designerNotes && (
          <>
            <Separator />
            <div>
              <h3 className="font-semibold text-foreground mb-2">Designer Notes</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{designerNotes}</p>
            </div>
          </>
        )}
      </div>
    );
  }
);

SilhouettePreviewSheet.displayName = 'SilhouettePreviewSheet';
