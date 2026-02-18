import { useState } from 'react';
import { Sample } from '@/types/sample';
import { CapsuleCollection } from '@/data/capsuleCollectionData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, FileText, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const STAGE_LABELS: Record<string, string> = {
  design: 'Design',
  pattern: 'Pattern',
  'semi-stitching': 'Semi Stitch',
  'complete-stitching': 'Complete Stitch',
  'hand-finishes': 'Hand Finishes',
  approval: 'Approval',
  multihead: 'Multihead',
  'hand-embroidery': 'Hand Emb.',
  'screen-print': 'Screen Print',
  'motif-assignment': 'Motif Assign',
  'motif-in-progress': 'Motif W.I.P.',
  'motif-review': 'Motif Review',
  'multihead-punching': 'M/H Punching',
  'decoration-approval': 'Deco Approval',
  'hand-block-printing': 'Block Print',
};

interface ProductionCollectionViewProps {
  collectionName: string;
  capsule?: CapsuleCollection;
  samples: Sample[];
  onBack: () => void;
  onOpenTechpack: (sample: Sample) => void;
}

export const ProductionCollectionView = ({
  collectionName,
  capsule,
  samples,
  onBack,
  onOpenTechpack,
}: ProductionCollectionViewProps) => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const approved = samples.filter(s => s.approvalStatus === 'approved').length;
  const total = samples.length;
  const progress = total > 0 ? Math.round((approved / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card border-b border-border px-6 py-3 flex items-center gap-4 shadow-sm">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 shrink-0">
          <ChevronLeft className="h-4 w-4" />
          Production
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-semibold truncate">{collectionName}</h1>
          {capsule && (
            <p className="text-xs text-muted-foreground">
              {capsule.lineName} · Target: {format(capsule.targetInStoreDate, 'dd MMM yyyy')}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0 text-sm">
          <span className="text-muted-foreground">{approved}/{total} approved</span>
          <Progress value={progress} className="w-24 h-2" />
          <span className="font-medium">{progress}%</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {total === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium">No samples in this collection</p>
            <p className="text-sm">Designs must be approved in the Design Hub to generate samples.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_1fr_100px_110px_120px_auto] gap-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <span>Style / Silhouette</span>
              <span>Fabric</span>
              <span>Combination</span>
              <span>Current Stage</span>
              <span>Status</span>
              <span />
            </div>

            {samples.map(sample => {
              const isApproved = sample.approvalStatus === 'approved';
              const isRejected = sample.approvalStatus === 'rejected';
              const isOverdue = sample.stageDeadline < today && !isApproved;

              return (
                <Card
                  key={sample.id}
                  className={cn(
                    'cursor-pointer hover:shadow-md transition-shadow',
                    isOverdue && 'border-destructive/30',
                    isApproved && 'border-primary/20',
                  )}
                  onClick={() => onOpenTechpack(sample)}
                >
                  <CardContent className="p-4">
                    <div className="grid grid-cols-[1fr_1fr_100px_110px_120px_auto] gap-3 items-center text-sm">
                      {/* Style */}
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{sample.sampleNumber}</p>
                        <p className="text-xs text-muted-foreground truncate">{sample.silhouetteName}</p>
                      </div>

                      {/* Fabric */}
                      <div className="min-w-0">
                        <p className="truncate text-sm">{sample.fabricName}</p>
                        <p className="text-xs text-muted-foreground">{sample.colour}</p>
                      </div>

                      {/* Combination */}
                      <Badge variant="outline" className="text-xs w-fit">
                        {sample.combination}
                      </Badge>

                      {/* Current Stage */}
                      <Badge variant="secondary" className="text-xs truncate">
                        {STAGE_LABELS[sample.currentStage] || sample.currentStage}
                      </Badge>

                      {/* Status */}
                      <div className="flex items-center gap-1.5">
                        {isApproved ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                            <span className="text-xs text-primary font-medium">Approved</span>
                          </>
                        ) : isOverdue ? (
                          <>
                            <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                            <span className="text-xs text-destructive font-medium">Overdue</span>
                          </>
                        ) : (
                          <>
                            <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="text-xs text-muted-foreground">On Track</span>
                          </>
                        )}
                      </div>

                      {/* Action */}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-1.5 text-xs shrink-0"
                        onClick={e => { e.stopPropagation(); onOpenTechpack(sample); }}
                      >
                        <FileText className="h-3.5 w-3.5" />
                        Techpack
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
