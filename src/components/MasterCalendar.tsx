import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  HoverCard, 
  HoverCardContent, 
  HoverCardTrigger 
} from '@/components/ui/hover-card';
import { Badge } from '@/components/ui/badge';
import { format, addDays, differenceInDays, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from 'date-fns';
import { Calendar, Flag, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { calculateBackwardsSchedule, getPhaseColor, Milestone } from '@/lib/schedulingEngine';

interface ProductLine {
  id: string;
  name: string;
  color: string;
  inStoreDate?: Date;
  selectedTechniques?: string[];
}

interface MasterCalendarProps {
  productLines: ProductLine[];
}

const PHASE_LEGEND = [
  { phase: 'planning', label: 'Planning', color: 'bg-purple-500' },
  { phase: 'sampling', label: 'Sampling', color: 'bg-blue-500' },
  { phase: 'production', label: 'Production', color: 'bg-red-500' },
  { phase: 'inStore', label: 'In-Store', color: 'bg-green-500' },
];

const MasterCalendar = ({ productLines }: MasterCalendarProps) => {
  const calendarRange = useMemo(() => {
    const start = startOfMonth(new Date());
    const end = endOfMonth(addDays(start, 150)); // ~5 months to show full critical path
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

  // Calculate full schedule for each line
  const lineSchedules = useMemo(() => {
    return productLines.map((line, index) => {
      const inStoreDate = line.inStoreDate || addDays(new Date(), 90 + index * 15);
      const techniques = line.selectedTechniques || 
        (index % 3 === 0 ? ['embroidery', 'handwork'] : 
         index % 2 === 0 ? ['multihead'] : ['block-printing']);
      
      const schedule = calculateBackwardsSchedule(inStoreDate, techniques);
      
      return { line, schedule, inStoreDate };
    });
  }, [productLines]);

  const totalDays = allDays.length;

  const getMilestonePosition = (milestone: Milestone) => {
    const startDiff = differenceInDays(milestone.startDate, calendarRange.start);
    const duration = milestone.duration;
    
    const left = Math.max(0, (startDiff / totalDays) * 100);
    const width = Math.max(0.5, Math.min((duration / totalDays) * 100, 100 - left));
    
    return { left: `${left}%`, width: `${width}%` };
  };

  const getDatePosition = (date: Date) => {
    const diff = differenceInDays(date, calendarRange.start);
    return `${(diff / totalDays) * 100}%`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle>Master Calendar - Critical Path View</CardTitle>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {PHASE_LEGEND.map(({ phase, label, color }) => (
              <div key={phase} className="flex items-center gap-1.5">
                <div className={cn('h-3 w-5 rounded', color)} />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5">
              <Flag className="h-3 w-3 text-amber-500" />
              <span className="text-xs text-muted-foreground">Milestone</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[1000px]">
            {/* Month Headers */}
            <div className="flex border-b mb-2">
              <div className="w-32 shrink-0" />
              <div className="flex-1 flex">
                {months.map((month, idx) => (
                  <div
                    key={idx}
                    className="text-center text-xs font-medium text-muted-foreground py-2 border-l first:border-l-0"
                    style={{ width: `${(month.days / totalDays) * 100}%` }}
                  >
                    {month.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Day markers */}
            <div className="flex border-b mb-4">
              <div className="w-32 shrink-0" />
              <div className="flex-1 relative h-5">
                {allDays.map((day, idx) => {
                  const showMarker = day.getDate() === 1 || day.getDate() === 15;
                  return showMarker ? (
                    <div
                      key={idx}
                      className="absolute text-[9px] text-muted-foreground"
                      style={{ left: `${(idx / totalDays) * 100}%` }}
                    >
                      {format(day, 'd')}
                    </div>
                  ) : null;
                })}
                {/* Today marker */}
                {allDays.findIndex(d => isToday(d)) !== -1 && (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-primary z-20"
                    style={{ left: `${(allDays.findIndex(d => isToday(d)) / totalDays) * 100}%` }}
                  />
                )}
              </div>
            </div>

            {/* Timeline rows for each line */}
            <div className="space-y-2">
              {lineSchedules.map(({ line, schedule, inStoreDate }) => (
                <div key={line.id} className="flex items-start group">
                  {/* Line name and summary */}
                  <div className="w-32 shrink-0 pr-2">
                    <div className="flex items-center gap-2">
                      <div className={cn('w-3 h-3 rounded-full shrink-0', line.color)} />
                      <span className="text-sm font-medium truncate">{line.name}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 pl-5">
                      {schedule.totalDays} days total
                    </div>
                  </div>
                  
                  {/* Timeline bar with all milestones */}
                  <div className="flex-1 relative h-12 bg-muted/20 rounded">
                    {/* Render each milestone as a bar */}
                    {schedule.milestones.map((milestone, idx) => {
                      const pos = getMilestonePosition(milestone);
                      const phaseColor = getPhaseColor(milestone.phase);
                      
                      return (
                        <HoverCard key={milestone.id} openDelay={100} closeDelay={50}>
                          <HoverCardTrigger asChild>
                            <div
                              className={cn(
                                'absolute top-2 h-4 rounded cursor-pointer transition-all',
                                phaseColor,
                                'opacity-75 hover:opacity-100 hover:h-5 hover:top-1.5 hover:shadow-md',
                                'border border-white/20'
                              )}
                              style={{ left: pos.left, width: pos.width, minWidth: '4px' }}
                            />
                          </HoverCardTrigger>
                          <HoverCardContent className="w-72 p-0" side="top">
                            <div className="p-3 border-b bg-muted/50">
                              <div className="flex items-center gap-2">
                                <div className={cn('w-3 h-3 rounded', phaseColor)} />
                                <span className="font-semibold text-sm">{milestone.label}</span>
                                <Badge variant="outline" className="ml-auto text-[10px]">
                                  {milestone.duration}d
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {format(milestone.startDate, 'MMM d')} - {format(milestone.endDate, 'MMM d, yyyy')}
                              </p>
                            </div>
                            <div className="p-3">
                              <p className="text-xs font-medium text-muted-foreground mb-2">
                                Full Critical Path
                              </p>
                              <div className="space-y-1 max-h-48 overflow-y-auto">
                                {schedule.milestones.map((m, i) => (
                                  <div 
                                    key={m.id} 
                                    className={cn(
                                      'flex items-center text-[10px] py-0.5 px-1 rounded',
                                      m.id === milestone.id && 'bg-muted'
                                    )}
                                  >
                                    <div className={cn('w-2 h-2 rounded mr-2', getPhaseColor(m.phase))} />
                                    <span className="flex-1">{m.label}</span>
                                    <span className="text-muted-foreground">
                                      {format(m.startDate, 'MMM d')}
                                    </span>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-2 pt-2 border-t flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">In-Store</span>
                                <span className="font-semibold text-green-600">
                                  {format(inStoreDate, 'MMM d, yyyy')}
                                </span>
                              </div>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      );
                    })}
                    
                    {/* Key milestone flags */}
                    <div
                      className="absolute bottom-1 -translate-x-1/2"
                      style={{ left: getDatePosition(schedule.fabricDesignStartDate) }}
                      title={`Start: ${format(schedule.fabricDesignStartDate, 'MMM d')}`}
                    >
                      <Flag className="h-3 w-3 text-purple-500" />
                    </div>
                    <div
                      className="absolute bottom-1 -translate-x-1/2"
                      style={{ left: getDatePosition(schedule.productionStartDate) }}
                      title={`Production: ${format(schedule.productionStartDate, 'MMM d')}`}
                    >
                      <Flag className="h-3 w-3 text-amber-500" />
                    </div>
                    <div
                      className="absolute bottom-1 -translate-x-1/2"
                      style={{ left: getDatePosition(inStoreDate) }}
                      title={`In-Store: ${format(inStoreDate, 'MMM d')}`}
                    >
                      <Flag className="h-3 w-3 text-green-500" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t">
              <div className="flex items-center gap-6 text-xs text-muted-foreground flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary rounded" />
                  <span>Today: {format(new Date(), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Flag className="h-3 w-3 text-purple-500" />
                  <span>Design Start</span>
                </div>
                <div className="flex items-center gap-2">
                  <Flag className="h-3 w-3 text-amber-500" />
                  <span>Production Start</span>
                </div>
                <div className="flex items-center gap-2">
                  <Flag className="h-3 w-3 text-green-500" />
                  <span>In-Store Date</span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 italic">
                Hover over timeline segments to view detailed critical path breakdown from Fabric Design → In-Store Dispatch
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MasterCalendar;
