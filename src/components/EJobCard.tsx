import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sample } from '@/types/sample';
import { ArrowLeft, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

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

export const EJobCard = ({ sample, onBack, onApprove, onReject }: EJobCardProps) => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack} size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{sample.sampleNumber}</h1>
              <div className={cn('h-1 w-20 rounded-full', lineColors[sample.line])} />
            </div>
            <p className="text-muted-foreground">{sample.collectionName}</p>
          </div>
        </div>

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
                  <div className="font-medium">{new Date(sample.targetDate).toLocaleDateString()}</div>
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
                {sample.processes.map((process, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 rounded-lg border">
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
                      <div className="font-medium capitalize">{process.stage.replace('-', ' ')}</div>
                      <div className="text-sm text-muted-foreground">
                        Target: {new Date(process.targetDate).toLocaleDateString()}
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
                ))}
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

        <div className="flex gap-4">
          <Button onClick={onApprove} className="flex-1 gap-2 bg-[hsl(var(--status-approved))] hover:bg-[hsl(var(--status-approved))]/90">
            <CheckCircle2 className="h-5 w-5" />
            Approve Sample
          </Button>
          <Button onClick={onReject} variant="destructive" className="flex-1 gap-2">
            <XCircle className="h-5 w-5" />
            Request Redo
          </Button>
        </div>
      </div>
    </div>
  );
};