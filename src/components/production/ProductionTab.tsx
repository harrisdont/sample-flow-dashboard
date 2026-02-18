import { useMemo } from 'react';
import { useSampleStore } from '@/data/sampleStore';
import { useCapsuleStore, CapsuleCollection } from '@/data/capsuleCollectionData';
import { Sample } from '@/types/sample';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { ChevronRight, AlertTriangle, CheckCircle2, Clock, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

// Stage groupings for the chart
const CHART_STAGE_GROUPS = [
  { key: 'design-pattern', label: 'Design / Pattern', stages: ['design', 'pattern'] },
  { key: 'decoration', label: 'Decoration', stages: ['motif-assignment', 'motif-in-progress', 'motif-review', 'multihead-punching', 'multihead', 'decoration-approval', 'pinning', 'stencil-transfer', 'hand-embroidery', 'screen-print-execution', 'hand-block-printing'] },
  { key: 'stitching', label: 'Stitching', stages: ['semi-stitching', 'complete-stitching', 'hand-finishes'] },
  { key: 'approved', label: 'Approved', stages: [] }, // Special: approvalStatus === 'approved'
];

const LINE_ORDER = ['woman', 'classic', 'formals', 'cottage', 'ming', 'leather', 'regen'];

interface ProductionTabProps {
  onCollectionClick: (collectionName: string) => void;
}

export const ProductionTab = ({ onCollectionClick }: ProductionTabProps) => {
  const samples = useSampleStore(s => s.samples);
  const capsules = useCapsuleStore(s => s.capsules);
  const today = format(new Date(), 'yyyy-MM-dd');

  // Build chart data: one row per collection
  const chartData = useMemo(() => {
    return Object.values(capsules).map(capsule => {
      const collSamples = samples.filter(s => s.collectionName === capsule.collectionName);
      const approved = collSamples.filter(s => s.approvalStatus === 'approved').length;
      const stitching = collSamples.filter(s =>
        !['design', 'pattern'].includes(s.currentStage) &&
        ['semi-stitching', 'complete-stitching', 'hand-finishes'].includes(s.currentStage) &&
        s.approvalStatus !== 'approved'
      ).length;
      const decoration = collSamples.filter(s =>
        !['design', 'pattern', 'semi-stitching', 'complete-stitching', 'hand-finishes'].includes(s.currentStage) &&
        s.approvalStatus !== 'approved'
      ).length;
      const designPattern = collSamples.filter(s =>
        ['design', 'pattern'].includes(s.currentStage) && s.approvalStatus !== 'approved'
      ).length;

      return {
        name: capsule.collectionName.length > 16
          ? capsule.collectionName.slice(0, 14) + '…'
          : capsule.collectionName,
        fullName: capsule.collectionName,
        'Design / Pattern': designPattern,
        'Decoration': decoration,
        'Stitching': stitching,
        'Approved': approved,
      };
    }).filter(d => d['Design / Pattern'] + d['Decoration'] + d['Stitching'] + d['Approved'] > 0);
  }, [capsules, samples]);

  // Group capsules by line
  const byLine = useMemo(() => {
    const result: Record<string, CapsuleCollection[]> = {};
    Object.values(capsules).forEach(cap => {
      if (!result[cap.lineId]) result[cap.lineId] = [];
      result[cap.lineId].push(cap);
    });
    return result;
  }, [capsules]);

  const getCollectionHealth = (capsule: CapsuleCollection) => {
    const collSamples = samples.filter(s => s.collectionName === capsule.collectionName);
    if (collSamples.length === 0) return 'planning';
    const overdue = collSamples.filter(s => s.stageDeadline < today && s.approvalStatus !== 'approved').length;
    const approved = collSamples.filter(s => s.approvalStatus === 'approved').length;
    if (approved === collSamples.length) return 'complete';
    if (overdue > collSamples.length * 0.3) return 'at-risk';
    if (overdue > 0) return 'amber';
    return 'on-track';
  };

  const healthConfig = {
    planning: { label: 'Planning', color: 'text-muted-foreground', border: 'border-muted' },
    'on-track': { label: 'On Track', color: 'text-primary', border: 'border-primary/20' },
    amber: { label: 'Minor Delays', color: 'text-amber-600 dark:text-amber-400', border: 'border-amber-400/30' },
    'at-risk': { label: 'At Risk', color: 'text-destructive', border: 'border-destructive/30' },
    complete: { label: 'Complete', color: 'text-primary', border: 'border-primary/30' },
  };

  const CHART_COLORS = {
    'Design / Pattern': 'hsl(var(--muted-foreground))',
    'Decoration': 'hsl(var(--chart-3))',
    'Stitching': 'hsl(var(--chart-2))',
    'Approved': 'hsl(var(--primary))',
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Production Status</h1>
        <p className="text-muted-foreground text-sm">Season-wide pipeline view — click a collection to see style-level detail</p>
      </div>

      {/* Stacked Bar Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Styles by Pipeline Stage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 0, right: 24, left: 12, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={110}
                  tick={{ fontSize: 11 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  labelFormatter={label => {
                    const d = chartData.find(c => c.name === label);
                    return d?.fullName || label;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {Object.entries(CHART_COLORS).map(([key, color]) => (
                  <Bar key={key} dataKey={key} stackId="a" fill={color} radius={key === 'Approved' ? [0, 4, 4, 0] : undefined} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Collections by Line */}
      {LINE_ORDER.filter(l => byLine[l]).map(lineId => {
        const lineCapsules = byLine[lineId];
        return (
          <div key={lineId}>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              {lineCapsules[0].lineName}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lineCapsules.map(capsule => {
                const collSamples = samples.filter(s => s.collectionName === capsule.collectionName);
                const approved = collSamples.filter(s => s.approvalStatus === 'approved').length;
                const total = collSamples.length;
                const progress = total > 0 ? Math.round((approved / total) * 100) : 0;
                const health = getCollectionHealth(capsule);
                const config = healthConfig[health];

                return (
                  <Card
                    key={capsule.id}
                    className={cn(
                      'cursor-pointer hover:shadow-md transition-all border',
                      config.border,
                    )}
                    onClick={() => onCollectionClick(capsule.collectionName)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm truncate">{capsule.collectionName}</h3>
                          <p className="text-xs text-muted-foreground">
                            In-store: {format(capsule.targetInStoreDate, 'dd MMM yyyy')}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{approved}/{total} approved</span>
                          <span className={cn('font-medium', config.color)}>{config.label}</span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                      </div>

                      {total > 0 && (
                        <div className="mt-3 flex gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-primary" />
                            {approved} done
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {total - approved} in progress
                          </span>
                        </div>
                      )}

                      {total === 0 && (
                        <p className="mt-2 text-xs text-muted-foreground italic">No samples yet</p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}

      {Object.keys(capsules).length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No collections planned</p>
          <p className="text-sm">Create collections in the Seasonal Planning page first.</p>
        </div>
      )}
    </div>
  );
};
