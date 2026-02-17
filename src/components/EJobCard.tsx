import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Sample, ProcessStage } from '@/types/sample';
import { ArrowLeft, CheckCircle2, XCircle, Clock, CalendarClock, Calendar, RotateCcw } from 'lucide-react';
import { useSampleStore } from '@/data/sampleStore';
import { useCurrentUser } from '@/contexts/UserContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { MainNav } from '@/components/MainNav';
import { 
  calculateEstimatedCompletion,
  getDateStatus,
  formatDateWithRemaining,
  formatShortDate,
  getDaysRemaining
} from '@/lib/leadTimeCalculator';
import { getTechniqueLabel, getFullProductionPath, DECORATION_STAGE_LABELS } from '@/lib/embroideryWorkflow';

const lineColors: Record<string, string> = {
  woman: 'bg-[hsl(var(--line-woman))]',
  cottage: 'bg-[hsl(var(--line-cottage))]',
  formals: 'bg-[hsl(var(--line-formals))]',
  classic: 'bg-[hsl(var(--line-classic))]',
  ming: 'bg-[hsl(var(--line-ming))]',
};

interface EJobCardProps {
  sample: Sample;
  onBack: () => void;
  onApprove: () => void;
  onReject: () => void;
}

const STAGE_LABELS: Record<ProcessStage, string> = {
  'design': 'Design',
  'pattern': 'Pattern',
  'motif': 'Motif Dev',
  'punching': 'Punching',
  'semi-stitching': 'Semi Stitching',
  'complete-stitching': 'Complete Stitching',
  'screen-print': 'Screen Print',
  'multihead': 'Multihead',
  'pakki': 'Pakki',
  'ari-dori': 'Ari/Dori',
  'adda': 'Adda',
  'cottage-work': 'Cottage Work',
  'hand-finishes': 'Hand Finishes',
  'approval': 'Approval',
  'motif-assignment': 'Motif Assignment',
  'motif-in-progress': 'Motif In Progress',
  'motif-review': 'Motif Review',
  'multihead-punching': 'Multihead Punching',
  'pinning': 'Pinning',
  'stencil-transfer': 'Stencil Transfer',
  'hand-embroidery': 'Hand Embroidery',
  'screen-print-execution': 'Screen Print Exec',
  'hand-block-printing': 'Hand Block Print',
  'decoration-approval': 'Decoration Approval',
};

export const EJobCard = ({ sample, onBack, onApprove, onReject }: EJobCardProps) => {
  const { approveSample, rejectSample, requestRedo } = useSampleStore();
  const { currentUser } = useCurrentUser();
  const [redoDialogOpen, setRedoDialogOpen] = useState(false);
  const [redoChanges, setRedoChanges] = useState('');
  const fullPath = getFullProductionPath(sample.decorationTechnique);
  const estimatedCompletion = calculateEstimatedCompletion(
    new Date(),
    sample.currentStage,
    fullPath
  );
  const daysRemaining = getDaysRemaining(sample.targetDate);
  const dateStatus = getDateStatus(sample.targetDate);
  const stageDeadlineStatus = getDateStatus(sample.stageDeadline);
  const stageDeadlineDays = getDaysRemaining(sample.stageDeadline);
  
  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack} size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{sample.sampleNumber}</h1>
              <div className={cn('h-1 w-20 rounded-full', lineColors[sample.line])} />
              {sample.decorationTechnique && (
                <Badge variant="secondary">{getTechniqueLabel(sample.decorationTechnique)}</Badge>
              )}
            </div>
            <p className="text-muted-foreground">{sample.collectionName}</p>
          </div>
        </div>

        {/* Current Stage Deadline Card */}
        <Card className={cn(
          'p-4 border-2',
          stageDeadlineStatus === 'overdue' && 'border-destructive bg-destructive/5',
          stageDeadlineStatus === 'due-today' && 'border-[hsl(var(--status-delayed))] bg-[hsl(var(--status-delayed))]/5',
          stageDeadlineStatus === 'due-soon' && 'border-[hsl(var(--status-pending))] bg-[hsl(var(--status-pending))]/5',
          stageDeadlineStatus === 'on-track' && 'border-[hsl(var(--status-approved))]/50 bg-[hsl(var(--status-approved))]/5',
        )}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Current Stage</p>
              <p className="text-lg font-bold">{STAGE_LABELS[sample.currentStage]}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Entered</p>
                  <p className="text-sm font-medium flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatShortDate(sample.stageEntryDate)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Stage Deadline</p>
                  <p className={cn(
                    'text-sm font-bold flex items-center gap-1',
                    stageDeadlineStatus === 'overdue' && 'text-destructive',
                    stageDeadlineStatus === 'due-today' && 'text-[hsl(var(--status-delayed))]',
                    stageDeadlineStatus === 'due-soon' && 'text-[hsl(var(--status-pending))]',
                    stageDeadlineStatus === 'on-track' && 'text-[hsl(var(--status-approved))]',
                  )}>
                    <Clock className="h-3 w-3" />
                    {formatShortDate(sample.stageDeadline)}
                    <span className="text-xs">
                      ({stageDeadlineDays < 0 ? `${Math.abs(stageDeadlineDays)}d late` : stageDeadlineDays === 0 ? 'today' : `${stageDeadlineDays}d`})
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Tabs defaultValue="english" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="english">English</TabsTrigger>
            <TabsTrigger value="urdu">اردو (Urdu)</TabsTrigger>
          </TabsList>

          <TabsContent value="english" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Sample Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Sample Number</div>
                  <div className="font-medium">{sample.sampleNumber}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Season</div>
                  <div className="font-medium">{sample.season}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Collection</div>
                  <div className="font-medium">{sample.collectionName}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Line</div>
                  <Badge className={cn(lineColors[sample.line], 'text-background')}>
                    {sample.lineName}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Fabric</div>
                  <div className="font-medium">{sample.fabricName}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Colour</div>
                  <div className="font-medium">{sample.colour}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Sizes</div>
                  <div className="font-medium">{sample.sizes.join(', ')}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Combination</div>
                  <div className="font-medium">{sample.combination}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Silhouette</div>
                  <div className="font-medium">{sample.silhouetteName} ({sample.silhouetteCode})</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Designer</div>
                  <div className="font-medium">{sample.designerName}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Total Quantity</div>
                  <div className="font-medium">{sample.totalQty} pieces</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Target Date</div>
                  <div className={cn(
                    "font-medium",
                    dateStatus === 'overdue' && 'text-[hsl(var(--status-delayed))]',
                    dateStatus === 'due-today' && 'text-[hsl(var(--status-pending))]'
                  )}>
                    {formatDateWithRemaining(sample.targetDate)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Estimated Completion</div>
                  <div className="font-medium flex items-center gap-1">
                    <CalendarClock className="h-4 w-4 text-muted-foreground" />
                    {formatDateWithRemaining(estimatedCompletion)}
                  </div>
                </div>
                {sample.decorationTechnique && (
                  <div>
                    <div className="text-sm text-muted-foreground">Decoration Technique</div>
                    <Badge variant="secondary">{getTechniqueLabel(sample.decorationTechnique)}</Badge>
                  </div>
                )}
              </div>

              {/* Lead Time Summary Card */}
              <div className="mt-4 p-4 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">Time Status</span>
                    <p className={cn(
                      "text-lg font-bold",
                      dateStatus === 'overdue' && 'text-[hsl(var(--status-delayed))]',
                      dateStatus === 'due-today' && 'text-[hsl(var(--status-pending))]',
                      dateStatus === 'due-soon' && 'text-[hsl(var(--status-pending))]',
                      dateStatus === 'on-track' && 'text-[hsl(var(--status-approved))]'
                    )}>
                      {daysRemaining < 0 
                        ? `${Math.abs(daysRemaining)} days overdue`
                        : daysRemaining === 0 
                          ? 'Due today'
                          : `${daysRemaining} days remaining`
                      }
                    </p>
                  </div>
                  <Badge variant={
                    dateStatus === 'overdue' ? 'destructive' :
                    dateStatus === 'due-today' || dateStatus === 'due-soon' ? 'secondary' :
                    'outline'
                  }>
                    {dateStatus === 'overdue' ? 'Overdue' :
                     dateStatus === 'due-today' ? 'Due Today' :
                     dateStatus === 'due-soon' ? 'Due Soon' : 'On Track'}
                  </Badge>
                </div>
              </div>

              {sample.furtherColourways.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Further Colourways</div>
                    <div className="flex gap-2">
                      {sample.furtherColourways.map((color) => (
                        <Badge key={color} variant="secondary">{color}</Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {sample.coordinatingPieces.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Coordinating Pieces</div>
                    <div className="flex gap-2">
                      {sample.coordinatingPieces.map((piece) => (
                        <Badge key={piece} variant="outline">{piece}</Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <Separator className="my-4" />
              <div>
                <div className="text-sm text-muted-foreground mb-2">Care Instructions</div>
                <div className="text-sm">{sample.careInstructions}</div>
              </div>
            </Card>

            <Card className="p-6 bg-muted/50">
              <h3 className="font-semibold mb-3">Production Instructions (Roman Urdu)</h3>
              <div className="bg-card p-4 rounded-lg border-2 border-dashed">
                <p className="text-sm italic">{sample.changes}</p>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Process Timeline</h3>
              <div className="space-y-3">
                {sample.processes.map((process, index) => {
                  const isCurrentStage = process.stage === sample.currentStage;
                  
                  return (
                    <div key={index} className={cn(
                      'flex items-center gap-4 p-3 rounded-lg border',
                      isCurrentStage && 'bg-primary/5 border-primary/30 ring-1 ring-primary/20'
                    )}>
                      <div className={cn(
                        'h-10 w-10 rounded-full flex items-center justify-center',
                        process.approvalStatus === 'approved' ? 'bg-[hsl(var(--status-approved))]/20' :
                        process.approvalStatus === 'rejected' ? 'bg-[hsl(var(--status-delayed))]/20' :
                        'bg-[hsl(var(--status-pending))]/20'
                      )}>
                        {process.approvalStatus === 'approved' ? (
                          <CheckCircle2 className="h-5 w-5 text-[hsl(var(--status-approved))]" />
                        ) : process.approvalStatus === 'rejected' ? (
                          <XCircle className="h-5 w-5 text-[hsl(var(--status-delayed))]" />
                        ) : (
                          <Clock className="h-5 w-5 text-[hsl(var(--status-pending))]" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={cn('font-medium capitalize', isCurrentStage && 'text-primary')}>
                            {STAGE_LABELS[process.stage] || process.stage.replace('-', ' ')}
                          </span>
                          {isCurrentStage && (
                            <Badge variant="default" className="text-xs">Current</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          {process.entryDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Entry: {formatShortDate(process.entryDate)}
                            </span>
                          )}
                          <span>Target: {formatShortDate(process.targetDate)}</span>
                        </div>
                      </div>
                      <div>
                        <Badge variant={
                          process.approvalStatus === 'approved' ? 'default' :
                          process.approvalStatus === 'rejected' ? 'destructive' :
                          'outline'
                        }>
                          {process.approvalStatus}
                        </Badge>
                        {process.approvedBy && (
                          <div className="text-xs text-muted-foreground mt-1">By: {process.approvedBy}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="urdu" className="space-y-4">
            <Card className="p-6 text-right" dir="rtl">
              <h2 className="text-xl font-bold mb-4">نمونہ کی تفصیلات</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">نمبر</div>
                  <div className="font-medium">{sample.sampleNumber}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">سیزن</div>
                  <div className="font-medium">{sample.season}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">کلیکشن</div>
                  <div className="font-medium">{sample.collectionName}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">لائن</div>
                  <Badge className={cn(lineColors[sample.line], 'text-background')}>
                    {sample.lineName}
                  </Badge>
                </div>
              </div>
              <Separator className="my-4" />
              <div>
                <div className="text-sm text-muted-foreground mb-2">ہدایات</div>
                <div className="bg-card p-4 rounded-lg border-2 border-dashed">
                  <p className="text-sm">{sample.changes}</p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex gap-3">
          <Button 
            onClick={() => {
              approveSample(sample.id, currentUser?.name || 'Unknown');
              toast.success(`Sample ${sample.sampleNumber} approved`);
              onApprove();
            }} 
            className="flex-1 gap-2 bg-[hsl(var(--status-approved))] hover:bg-[hsl(var(--status-approved))]/90"
          >
            <CheckCircle2 className="h-5 w-5" />
            Approve Sample
          </Button>
          <Button 
            onClick={() => {
              rejectSample(sample.id, currentUser?.name || 'Unknown');
              toast.error(`Sample ${sample.sampleNumber} rejected`);
              onReject();
            }} 
            variant="destructive" 
            className="flex-1 gap-2"
          >
            <XCircle className="h-5 w-5" />
            Reject
          </Button>
          <Button 
            onClick={() => setRedoDialogOpen(true)} 
            variant="outline" 
            className="flex-1 gap-2"
          >
            <RotateCcw className="h-5 w-5" />
            Request Redo
          </Button>
        </div>

        {/* Redo Dialog */}
        <Dialog open={redoDialogOpen} onOpenChange={setRedoDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Modifications</DialogTitle>
            </DialogHeader>
            <Textarea
              placeholder="Describe the changes needed..."
              value={redoChanges}
              onChange={(e) => setRedoChanges(e.target.value)}
              rows={4}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setRedoDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => {
                if (redoChanges.trim()) {
                  requestRedo(sample.id, currentUser?.name || 'Unknown', redoChanges);
                  toast.info(`Redo requested for ${sample.sampleNumber}`);
                  setRedoDialogOpen(false);
                  setRedoChanges('');
                  onReject();
                }
              }}>
                Submit Redo Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      </div>
    </div>
  );
};
