import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  HoverCard, 
  HoverCardContent, 
  HoverCardTrigger 
} from '@/components/ui/hover-card';
import { Badge } from '@/components/ui/badge';
import { format, addDays, differenceInDays, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from 'date-fns';
import { Calendar, Flag, ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { calculateBackwardsSchedule, getPhaseColor, Milestone } from '@/lib/schedulingEngine';
import { useCapsuleStore } from '@/data/capsuleCollectionData';

interface ProductLine {
  id: string;
  name: string;
  color: string;
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
  const { getCapsuleByLine, capsules } = useCapsuleStore();

  const calendarRange = useMemo(() => {
    const start = startOfMonth(new Date());
    const end = endOfMonth(addDays(start, 150));
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

  // Calculate schedule for each line based on their capsule data
  const lineSchedules = useMemo(() => {
    return productLines.map((line) => {
      const capsule = getCapsuleByLine(line.id);
      
      if (capsule) {
        // Use actual capsule data
        const schedule = calculateBackwardsSchedule(
          capsule.targetInStoreDate, 
          capsule.selectedTechniques
        );
        return { 
          line, 
          schedule, 
          inStoreDate: capsule.targetInStoreDate,
          capsuleName: capsule.collectionName,
          techniques: capsule.selectedTechniques,
          hasCapsule: true,
        };
      } else {
        // No capsule defined yet - show placeholder
        const defaultDate = addDays(new Date(), 90);
        const schedule = calculateBackwardsSchedule(defaultDate, []);
        return { 
          line, 
          schedule, 
          inStoreDate: defaultDate,
          capsuleName: 'Not Configured',
          techniques: [],
          hasCapsule: false,
        };
      }
    });
  }, [productLines, capsules, getCapsuleByLine]);

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
              <div className="w-36 shrink-0" />
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
              <div className="w-36 shrink-0" />
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
              {lineSchedules.map(({ line, schedule, inStoreDate, capsuleName, techniques, hasCapsule }) => (
                <div key={line.id} className="flex items-start group">
                  {/* Line name and capsule info */}
                  <div className="w-36 shrink-0 pr-2">
                    <div className="flex items-center gap-2">
                      <div className={cn('w-3 h-3 rounded-full shrink-0', line.color)} />
                      <span className="text-sm font-medium truncate">{line.name}</span>
                    </div>
                    <div className={cn(
                      "text-[10px] mt-0.5 pl-5 truncate",
                      hasCapsule ? "text-muted-foreground" : "text-muted-foreground/50 italic"
                    )}>
                      {capsuleName}
                    </div>
                    {techniques.length > 0 && (
                      <div className="text-[9px] text-muted-foreground/70 pl-5">
                        {techniques.slice(0, 2).join(', ')}
                        {techniques.length > 2 && ` +${techniques.length - 2}`}
                      </div>
                    )}
                  </div>
                  
                  {/* Timeline bar with all milestones */}
                  <div className={cn(
                    "flex-1 relative h-14 rounded",
                    hasCapsule ? "bg-muted/20" : "bg-muted/10 border border-dashed border-muted-foreground/20"
                  )}>
                    {hasCapsule ? (
                      <>
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
                              <HoverCardContent className="w-80 p-0" side="top">
                                <div className="p-3 border-b bg-muted/50">
                                  <div className="flex items-center gap-2">
                                    <div className={cn('w-3 h-3 rounded-full', line.color)} />
                                    <span className="font-semibold text-sm">{line.name}</span>
                                    <span className="text-xs text-muted-foreground">- {capsuleName}</span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <div className={cn('w-2 h-2 rounded', phaseColor)} />
                                    <span className="text-xs font-medium">{milestone.label}</span>
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
                                    Complete Process Breakdown for {capsuleName}
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
                                  {techniques.length > 0 && (
                                    <div className="mt-2 pt-2 border-t">
                                      <p className="text-[10px] text-muted-foreground mb-1">Selected Techniques:</p>
                                      <div className="flex flex-wrap gap-1">
                                        {techniques.map(t => (
                                          <Badge key={t} variant="secondary" className="text-[9px]">
                                            {t}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
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
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground/50 italic">
                        Click line card to configure capsule collection
                      </div>
                    )}
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
                Each line shows its unique process breakdown based on selected techniques. Hover for details.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MasterCalendar;
