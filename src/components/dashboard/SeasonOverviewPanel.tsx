import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useSampleStore } from '@/data/sampleStore';
import { useFabricStore } from '@/data/fabricStore';
import { useCapsuleStore } from '@/data/capsuleCollectionData';
import { useDesignStore } from '@/data/designStore';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  LayoutList,
  Palette,
  Package,
  Factory,
  Scissors,
  ArrowRight,
} from 'lucide-react';

// ─── Stage health colour ─────────────────────────────────────────────────────
type Health = 'good' | 'warn' | 'bad';

const borderColor: Record<Health, string> = {
  good: 'border-l-[hsl(var(--status-approved))]',
  warn: 'border-l-[hsl(var(--status-pending))]',
  bad: 'border-l-[hsl(var(--status-delayed))]',
};

const badgeColor: Record<Health, string> = {
  good: 'bg-[hsl(var(--status-approved))] text-background',
  warn: 'bg-[hsl(var(--status-pending))] text-background',
  bad: 'bg-[hsl(var(--status-delayed))] text-background',
};

function MetricRow({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-semibold tabular-nums">
        {value}
        {sub && <span className="text-muted-foreground font-normal ml-1">{sub}</span>}
      </span>
    </div>
  );
}

// ─── Department stage lists ───────────────────────────────────────────────────
const DESIGN_STAGES = ['design', 'motif-assignment', 'motif-in-progress', 'motif-review'];

const SAMPLING_STAGE_GROUPS = [
  { label: 'Pattern Making', stages: ['pattern'] },
  { label: 'Motif Design',   stages: ['motif-assignment', 'motif-in-progress', 'motif-review', 'motif'] },
  { label: 'Punching',       stages: ['multihead-punching', 'punching'] },
  { label: 'Stitching',      stages: ['semi-stitching', 'complete-stitching'] },
  { label: 'Multihead',      stages: ['multihead'] },
  { label: 'Pakki',          stages: ['pakki'] },
  { label: 'Ari / Dori',     stages: ['ari-dori'] },
  { label: 'Screen Print',   stages: ['screen-print', 'screen-print-execution', 'stencil-transfer'] },
  { label: 'Hand Work',      stages: ['hand-embroidery', 'pinning', 'cottage-work', 'adda', 'hand-block-printing'] },
  { label: 'Finishing',      stages: ['hand-finishes', 'decoration-approval'] },
];

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const onTime = payload.find((p: any) => p.dataKey === 'onTime')?.value ?? 0;
  const delayed = payload.find((p: any) => p.dataKey === 'delayed')?.value ?? 0;
  const total = onTime + delayed;
  const pct = total > 0 ? Math.round((onTime / total) * 100) : 0;
  return (
    <div className="rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl space-y-1">
      <p className="font-semibold">{label}</p>
      <p className="text-[hsl(var(--status-approved))]">On Time: {onTime}</p>
      <p className="text-[hsl(var(--status-delayed))]">Delayed: {delayed}</p>
      <p className="text-muted-foreground">{pct}% on time</p>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const SeasonOverviewPanel = () => {
  const samples = useSampleStore(s => s.samples);
  const fabrics = useFabricStore(s => s.fabrics);
  const capsules = useCapsuleStore(s => s.capsules);
  const designs = useDesignStore(s => s.designs);

  const today = format(new Date(), 'yyyy-MM-dd');

  // ── Chart data ──────────────────────────────────────────────────────────────
  const chartData = useMemo(() => {
    const categorise = (stages: string[]) => {
      const relevant = samples.flatMap(s => s.processes.filter(p => stages.includes(p.stage)));
      const onTime = relevant.filter(p =>
        p.approvalStatus === 'approved' ? p.entryDate <= p.targetDate : false
      ).length;
      const delayed = relevant.filter(p =>
        p.approvalStatus === 'approved'
          ? p.entryDate > p.targetDate
          : p.approvalStatus === 'pending' && today > p.targetDate
      ).length;
      return { onTime, delayed };
    };

    // Sourcing: fabrics inducted on time vs overdue (past deadline, not inducted)
    const fabricsOnTime = fabrics.filter(f => {
      if (f.status !== 'inducted') return false;
      if (!f.fabricDeadline) return true;
      return f.inductedAt ? f.inductedAt <= f.fabricDeadline : false;
    }).length;
    const fabricsDelayed = fabrics.filter(f => {
      if (f.status === 'inducted') return false;
      if (!f.fabricDeadline) return false;
      return new Date() > f.fabricDeadline;
    }).length;

    return [
      { dept: 'Design',   ...categorise(DESIGN_STAGES) },
      { dept: 'Sourcing', onTime: fabricsOnTime, delayed: fabricsDelayed },
      ...SAMPLING_STAGE_GROUPS.map(g => ({ dept: g.label, ...categorise(g.stages) })),
    ];
  }, [samples, fabrics, today]);

  const totalOnTime = chartData.reduce((a, d) => a + d.onTime, 0);
  const totalDelayed = chartData.reduce((a, d) => a + d.delayed, 0);

  // ── Pipeline card data ──────────────────────────────────────────────────────
  const capsuleList = Object.values(capsules);
  const TOTAL_LINES = 9;
  const collectionCount = capsuleList.length;
  const planningHealth: Health = collectionCount >= TOTAL_LINES ? 'good' : collectionCount > 0 ? 'warn' : 'bad';

  const totalDesigns = Object.values(designs).length;
  const plannedDesigns = capsuleList.reduce((sum, c) => {
    const cd = c.categoryDesigns;
    return sum + cd.onePiece + cd.twoPiece + cd.threePiece + cd.dupattas + cd.lowers;
  }, 0);
  const designsInSampling = samples.length;
  const designHealth: Health = totalDesigns === 0 ? 'warn' : totalDesigns >= plannedDesigns ? 'good' : 'warn';

  const fabricsInducted = fabrics.filter(f => f.status === 'inducted').length;
  const fabricsInTreatment = fabrics.filter(f => ['in-base-treatment', 'in-surface-treatment'].includes(f.status)).length;
  const fabricsNeedingAction = fabrics.filter(f => ['pending-artwork', 'pending-dye-plan', 'pending-print-plan', 'pending-surface-treatment'].includes(f.status)).length;
  const sourcingHealth: Health = fabricsNeedingAction > fabrics.length / 2 ? 'bad' : fabricsNeedingAction > 0 ? 'warn' : 'good';

  const samplesOnFloor = samples.filter(s => !['approval', 'design'].includes(s.currentStage) && s.approvalStatus === 'pending').length;
  const samplesOverdue = samples.filter(s => s.stageDeadline < today && s.approvalStatus === 'pending').length;
  const samplesAwaitingApproval = samples.filter(s => s.currentStage === 'approval' && s.approvalStatus === 'pending').length;
  const samplingHealth: Health = samplesOverdue > samplesOnFloor / 2 ? 'bad' : samplesOverdue > 0 ? 'warn' : 'good';

  const approvedForProduction = samples.filter(s => s.approvalStatus === 'approved').length;
  const productionHealth: Health = approvedForProduction > 0 ? 'good' : 'warn';

  const stages = [
    {
      num: 1, label: 'Planning', icon: LayoutList, health: planningHealth,
      status: collectionCount >= TOTAL_LINES ? 'All Lines Covered' : `${collectionCount} of ${TOTAL_LINES} lines`,
      metrics: [
        { label: 'Collections planned', value: collectionCount, sub: `/ ${TOTAL_LINES} lines` },
      ],
    },
    {
      num: 2, label: 'Design', icon: Palette, health: designHealth,
      status: `${totalDesigns} designs submitted`,
      metrics: [
        { label: 'Designs submitted', value: totalDesigns, sub: plannedDesigns > 0 ? `/ ${plannedDesigns} planned` : '' },
        { label: 'Forwarded to sampling', value: designsInSampling },
      ],
    },
    {
      num: 3, label: 'Sourcing', icon: Package, health: sourcingHealth,
      status: fabricsNeedingAction > 0 ? `${fabricsNeedingAction} need action` : 'On track',
      metrics: [
        { label: 'Fabrics inducted', value: fabricsInducted },
        { label: 'In treatment', value: fabricsInTreatment },
        { label: 'Need action', value: fabricsNeedingAction },
      ],
    },
    {
      num: 4, label: 'Sampling', icon: Scissors, health: samplingHealth,
      status: samplesOverdue > 0 ? `${samplesOverdue} overdue` : 'On track',
      metrics: [
        { label: 'On the floor', value: samplesOnFloor },
        { label: 'Overdue', value: samplesOverdue },
        { label: 'Awaiting approval', value: samplesAwaitingApproval },
      ],
    },
    {
      num: 5, label: 'Production', icon: Factory, health: productionHealth,
      status: `${approvedForProduction} approved`,
      metrics: [
        { label: 'Approved for production', value: approvedForProduction, sub: `/ ${samples.length} total` },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Section A: Season Performance Chart ──────────────────────────────── */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-semibold">Season Performance</h2>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-[hsl(var(--status-approved))]" />
              On Time ({totalOnTime})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-[hsl(var(--status-delayed))]" />
              Delayed ({totalDelayed})
            </span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Processes completed on time vs running late, by department
        </p>
        {totalOnTime + totalDelayed === 0 ? (
          <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
            No completed processes yet — data will appear as samples move through stages.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={420}>
            <BarChart data={chartData} layout="vertical" barGap={3} barCategoryGap="30%" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
              <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                type="number"
                allowDecimals={false}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="dept"
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                width={96}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
              <Bar dataKey="onTime" name="On Time" fill="hsl(var(--status-approved))" radius={[0, 4, 4, 0]} />
              <Bar dataKey="delayed" name="Delayed" fill="hsl(var(--status-delayed))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* ── Section B: 5-Stage Pipeline Overview ──────────────────────────────── */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Pipeline Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            return (
              <div key={stage.num} className="relative flex items-stretch">
                <Card
                  className={cn(
                    'flex-1 p-4 border-l-4',
                    borderColor[stage.health]
                  )}
                >
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground shrink-0">
                      {stage.num}
                    </span>
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm font-semibold leading-tight">{stage.label}</span>
                  </div>

                  {/* Status badge */}
                  <Badge className={cn('text-[10px] px-1.5 py-0.5 mb-3 font-medium', badgeColor[stage.health])}>
                    {stage.status}
                  </Badge>

                  {/* Metrics */}
                  <div className="divide-y divide-border/50">
                    {stage.metrics.map(m => (
                      <MetricRow key={m.label} label={m.label} value={m.value} sub={m.sub} />
                    ))}
                  </div>
                </Card>

                {/* Arrow connector between cards */}
                {idx < stages.length - 1 && (
                  <div className="hidden lg:flex items-center absolute -right-2 top-1/2 -translate-y-1/2 z-10">
                    <ArrowRight className="h-4 w-4 text-muted-foreground/40" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
