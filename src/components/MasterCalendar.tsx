import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  HoverCard, 
  HoverCardContent, 
  HoverCardTrigger 
} from '@/components/ui/hover-card';
import { Badge } from '@/components/ui/badge';
import { format, addDays, differenceInDays, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from 'date-fns';
import { Calendar, Flag, ArrowRight, CheckCircle2 } from 'lucide-react';
import { DEFAULT_LEAD_TIMES } from '@/data/leadTimeSettings';
import { cn } from '@/lib/utils';

interface ProductLine {
  id: string;
  name: string;
  color: string;
  inStoreDate?: Date;
  techniqueBuffer?: number;
  selectedProcesses?: string[];
}

interface MasterCalendarProps {
  productLines: ProductLine[];
}

// Phase colors
const PHASE_COLORS = {
  sampling: {
    bg: 'bg-blue-500',
    text: 'text-blue-500',
    label: 'Sampling',
  },
  production: {
    bg: 'bg-red-500',
    text: 'text-red-500',
    label: 'Production',
  },
  inStore: {
    bg: 'bg-green-500',
    text: 'text-green-500',
    label: 'In-Store',
  },
};

// Production flow steps with durations
interface FlowStep {
  id: string;
  label: string;
  duration: number;
  isOptional?: boolean;
}

const BASE_PRODUCTION_FLOW: FlowStep[] = [
  { id: 'sampling', label: 'Sampling', duration: DEFAULT_LEAD_TIMES.sampling },
  { id: 'fabric-receiving', label: 'Fabric Receiving', duration: 5 },
  { id: 'cutting', label: 'Cutting', duration: DEFAULT_LEAD_TIMES.cutting },
];

const OPTIONAL_PROCESSES: FlowStep[] = [
  { id: 'embroidery', label: 'Embroidery', duration: DEFAULT_LEAD_TIMES.embroidery, isOptional: true },
  { id: 'multihead', label: 'Multihead', duration: DEFAULT_LEAD_TIMES.multihead, isOptional: true },
  { id: 'handwork', label: 'Handwork', duration: 10, isOptional: true },
  { id: 'block-printing', label: 'Block Printing', duration: 7, isOptional: true },
];

const END_PRODUCTION_FLOW: FlowStep[] = [
  { id: 'stitching', label: 'Stitching', duration: DEFAULT_LEAD_TIMES.stitching },
  { id: 'qc', label: 'QC', duration: DEFAULT_LEAD_TIMES.qc },
  { id: 'dispatch', label: 'Dispatch', duration: DEFAULT_LEAD_TIMES.dispatch },
];

interface TimelinePhase {
  type: 'sampling' | 'production' | 'inStore';
  startDate: Date;
  endDate: Date;
}

interface Milestone {
  date: Date;
  label: string;
  type: 'start' | 'end' | 'key';
}

interface ProductionFlowItem {
  step: FlowStep;
  startDate: Date;
  endDate: Date;
}

const calculateProductionFlow = (
  inStoreDate: Date, 
  selectedProcesses: string[] = []
): ProductionFlowItem[] => {
  // Build the flow with selected optional processes
  const selectedOptional = OPTIONAL_PROCESSES.filter(p => 
    selectedProcesses.includes(p.id) || selectedProcesses.includes(p.label.toLowerCase())
  );
  
  const fullFlow = [
    ...BASE_PRODUCTION_FLOW,
    ...selectedOptional,
    ...END_PRODUCTION_FLOW,
  ];

  // Calculate dates backwards from in-store date
  const flowWithDates: ProductionFlowItem[] = [];
  let currentDate = addDays(inStoreDate, -1); // Day before in-store

  // Reverse to calculate from end
  const reversedFlow = [...fullFlow].reverse();
  
  for (const step of reversedFlow) {
    const endDate = currentDate;
    const startDate = addDays(currentDate, -(step.duration - 1));
    flowWithDates.unshift({ step, startDate, endDate });
    currentDate = addDays(startDate, -1);
  }

  return flowWithDates;
};

const calculatePhases = (inStoreDate: Date, techniqueBuffer: number = 0): TimelinePhase[] => {
  const productionDays = DEFAULT_LEAD_TIMES.production + techniqueBuffer;
  const samplingDays = DEFAULT_LEAD_TIMES.sampling;
  
  const productionEnd = addDays(inStoreDate, -1);
  const productionStart = addDays(inStoreDate, -productionDays);
  const samplingEnd = addDays(productionStart, -1);
  const samplingStart = addDays(samplingEnd, -samplingDays);
  
  return [
    { type: 'sampling', startDate: samplingStart, endDate: samplingEnd },
    { type: 'production', startDate: productionStart, endDate: productionEnd },
    { type: 'inStore', startDate: inStoreDate, endDate: addDays(inStoreDate, 7) },
  ];
};

const calculateMilestones = (phases: TimelinePhase[], inStoreDate: Date): Milestone[] => {
  return [
    { date: phases[0].startDate, label: 'Sampling Start', type: 'start' },
    { date: phases[1].startDate, label: 'Production Start', type: 'key' },
    { date: inStoreDate, label: 'In-Store', type: 'end' },
  ];
};

const MasterCalendar = ({ productLines }: MasterCalendarProps) => {
  const calendarRange = useMemo(() => {
    const start = startOfMonth(new Date());
    const end = endOfMonth(addDays(start, 120));
    return { start, end };
  }, []);

  const allDays = useMemo(() => {
    return eachDayOfInterval({ start: calendarRange.start, end: calendarRange.end });
  }, [calendarRange]);

  const months = useMemo(() => {
    const monthMap = new Map<string, { label: string; startIndex: number; days: number }>();
    allDays.forEach((day, index) => {
      const monthKey = format(day, 'yyyy-MM');
      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, {
          label: format(day, 'MMM yyyy'),
          startIndex: index,
          days: 0,
        });
      }
      monthMap.get(monthKey)!.days++;
    });
    return Array.from(monthMap.values());
  }, [allDays]);

  const lineTimelines = useMemo(() => {
    return productLines.map((line, index) => {
      const inStoreDate = line.inStoreDate || addDays(new Date(), 60 + index * 15);
      const phases = calculatePhases(inStoreDate, line.techniqueBuffer || 0);
      const milestones = calculateMilestones(phases, inStoreDate);
      const productionFlow = calculateProductionFlow(
        inStoreDate, 
        line.selectedProcesses || (index % 2 === 0 ? ['embroidery'] : ['multihead', 'handwork'])
      );
      return { line, phases, inStoreDate, milestones, productionFlow };
    });
  }, [productLines]);

  const totalDays = allDays.length;

  const getPhasePosition = (phase: TimelinePhase) => {
    const startDiff = differenceInDays(phase.startDate, calendarRange.start);
    const duration = differenceInDays(phase.endDate, phase.startDate) + 1;
    
    const left = Math.max(0, (startDiff / totalDays) * 100);
    const width = Math.min((duration / totalDays) * 100, 100 - left);
    
    return { left: `${left}%`, width: `${width}%` };
  };

  const getMilestonePosition = (date: Date) => {
    const diff = differenceInDays(date, calendarRange.start);
    return `${(diff / totalDays) * 100}%`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle>Master Calendar</CardTitle>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            {Object.entries(PHASE_COLORS).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <div className={cn('h-3 w-6 rounded', value.bg)} />
                <span className="text-sm text-muted-foreground">{value.label}</span>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <Flag className="h-3 w-3 text-amber-500" />
              <span className="text-sm text-muted-foreground">Milestone</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Month Headers */}
            <div className="flex border-b mb-2">
              <div className="w-28 shrink-0" />
              <div className="flex-1 flex">
                {months.map((month, idx) => (
                  <div
                    key={idx}
                    className="text-center text-sm font-medium text-muted-foreground py-2 border-l first:border-l-0"
                    style={{ width: `${(month.days / totalDays) * 100}%` }}
                  >
                    {month.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Day markers */}
            <div className="flex border-b mb-4">
              <div className="w-28 shrink-0" />
              <div className="flex-1 relative h-6">
                {allDays.map((day, idx) => {
                  const showMarker = day.getDate() === 1 || day.getDate() === 15;
                  return showMarker ? (
                    <div
                      key={idx}
                      className="absolute text-[10px] text-muted-foreground"
                      style={{ left: `${(idx / totalDays) * 100}%` }}
                    >
                      {format(day, 'd')}
                    </div>
                  ) : null;
                })}
                {allDays.findIndex(d => isToday(d)) !== -1 && (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-primary z-10"
                    style={{ left: `${(allDays.findIndex(d => isToday(d)) / totalDays) * 100}%` }}
                  />
                )}
              </div>
            </div>

            {/* Timeline rows for each line */}
            <div className="space-y-4">
              {lineTimelines.map(({ line, phases, inStoreDate, milestones, productionFlow }) => (
                <div key={line.id} className="flex items-center group">
                  {/* Line name */}
                  <div className="w-28 shrink-0 flex items-center gap-2 pr-2">
                    <div className={cn('w-3 h-3 rounded-full', line.color)} />
                    <span className="text-sm font-medium truncate">{line.name}</span>
                  </div>
                  
                  {/* Timeline bar */}
                  <div className="flex-1 relative h-10 bg-muted/30 rounded">
                    {phases.map((phase, idx) => {
                      const pos = getPhasePosition(phase);
                      return (
                        <HoverCard key={idx} openDelay={100} closeDelay={50}>
                          <HoverCardTrigger asChild>
                            <div
                              className={cn(
                                'absolute top-1.5 bottom-1.5 rounded cursor-pointer transition-all',
                                PHASE_COLORS[phase.type].bg,
                                'opacity-80 hover:opacity-100 hover:shadow-lg hover:scale-y-110'
                              )}
                              style={{ left: pos.left, width: pos.width }}
                            >
                              {parseFloat(pos.width) > 8 && (
                                <span className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-medium">
                                  {PHASE_COLORS[phase.type].label}
                                </span>
                              )}
                            </div>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-80 p-0" side="top" align="start">
                            <div className="p-3 border-b bg-muted/50">
                              <div className="flex items-center gap-2">
                                <div className={cn('w-3 h-3 rounded-full', line.color)} />
                                <span className="font-semibold">{line.name}</span>
                                <Badge variant="outline" className="ml-auto text-xs">
                                  {PHASE_COLORS[phase.type].label}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {format(phase.startDate, 'MMM d')} - {format(phase.endDate, 'MMM d, yyyy')}
                              </p>
                            </div>
                            <div className="p-3">
                              <p className="text-xs font-medium text-muted-foreground mb-2">
                                Production Flow Breakdown
                              </p>
                              <div className="space-y-1.5">
                                {productionFlow.map((item, flowIdx) => (
                                  <div key={item.step.id} className="flex items-center text-xs">
                                    <div className="flex items-center gap-1.5 flex-1">
                                      {flowIdx > 0 && (
                                        <ArrowRight className="h-3 w-3 text-muted-foreground/50 -ml-1 mr-0.5" />
                                      )}
                                      <CheckCircle2 className={cn(
                                        'h-3 w-3',
                                        item.step.isOptional ? 'text-amber-500' : 'text-muted-foreground'
                                      )} />
                                      <span className={cn(
                                        item.step.isOptional && 'text-amber-600 font-medium'
                                      )}>
                                        {item.step.label}
                                      </span>
                                    </div>
                                    <span className="text-muted-foreground">
                                      {format(item.startDate, 'MMM d')}
                                    </span>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-3 pt-2 border-t flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">In-Store Target</span>
                                <span className="font-semibold text-green-600">
                                  {format(inStoreDate, 'MMM d, yyyy')}
                                </span>
                              </div>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      );
                    })}
                    
                    {/* Milestone markers */}
                    {milestones.map((milestone, idx) => (
                      <HoverCard key={idx} openDelay={50}>
                        <HoverCardTrigger asChild>
                          <div
                            className={cn(
                              'absolute top-0 -translate-x-1/2 cursor-pointer transition-transform hover:scale-125',
                              milestone.type === 'end' ? 'text-green-500' : 
                              milestone.type === 'key' ? 'text-amber-500' : 'text-blue-500'
                            )}
                            style={{ left: getMilestonePosition(milestone.date) }}
                          >
                            <Flag className="h-3 w-3" />
                          </div>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-auto p-2" side="top">
                          <div className="text-xs">
                            <p className="font-medium">{milestone.label}</p>
                            <p className="text-muted-foreground">{format(milestone.date, 'MMM d, yyyy')}</p>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t flex items-center gap-6 text-sm text-muted-foreground flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded" />
                <span>Today: {format(new Date(), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Flag className="h-3 w-3 text-blue-500" />
                <span>Start</span>
              </div>
              <div className="flex items-center gap-2">
                <Flag className="h-3 w-3 text-amber-500" />
                <span>Key Milestone</span>
              </div>
              <div className="flex items-center gap-2">
                <Flag className="h-3 w-3 text-green-500" />
                <span>In-Store</span>
              </div>
              <div className="text-xs italic">
                Hover over timeline bars for production flow details
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MasterCalendar;
