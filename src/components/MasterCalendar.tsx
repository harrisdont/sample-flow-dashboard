import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, addDays, differenceInDays, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameMonth } from 'date-fns';
import { Calendar } from 'lucide-react';
import { DEFAULT_LEAD_TIMES } from '@/data/leadTimeSettings';
import { cn } from '@/lib/utils';

interface ProductLine {
  id: string;
  name: string;
  color: string;
  inStoreDate?: Date;
  techniqueBuffer?: number;
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

interface TimelinePhase {
  type: 'sampling' | 'production' | 'inStore';
  startDate: Date;
  endDate: Date;
}

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

const MasterCalendar = ({ productLines }: MasterCalendarProps) => {
  // Calculate date range for the calendar (3 months from now)
  const calendarRange = useMemo(() => {
    const start = startOfMonth(new Date());
    const end = endOfMonth(addDays(start, 120)); // ~4 months
    return { start, end };
  }, []);

  // Generate all days in range
  const allDays = useMemo(() => {
    return eachDayOfInterval({ start: calendarRange.start, end: calendarRange.end });
  }, [calendarRange]);

  // Get month labels
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

  // Calculate phases for each line with mock in-store dates
  const lineTimelines = useMemo(() => {
    return productLines.map((line, index) => {
      // Generate staggered mock in-store dates if not provided
      const inStoreDate = line.inStoreDate || addDays(new Date(), 60 + index * 15);
      const phases = calculatePhases(inStoreDate, line.techniqueBuffer || 0);
      return { line, phases, inStoreDate };
    });
  }, [productLines]);

  const totalDays = allDays.length;
  const dayWidth = 100 / totalDays; // percentage width per day

  const getPhasePosition = (phase: TimelinePhase) => {
    const startDiff = differenceInDays(phase.startDate, calendarRange.start);
    const duration = differenceInDays(phase.endDate, phase.startDate) + 1;
    
    const left = Math.max(0, (startDiff / totalDays) * 100);
    const width = Math.min((duration / totalDays) * 100, 100 - left);
    
    return { left: `${left}%`, width: `${width}%` };
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle>Master Calendar</CardTitle>
          </div>
          <div className="flex items-center gap-4">
            {Object.entries(PHASE_COLORS).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <div className={cn('h-3 w-6 rounded', value.bg)} />
                <span className="text-sm text-muted-foreground">{value.label}</span>
              </div>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Month Headers */}
            <div className="flex border-b mb-2">
              <div className="w-28 shrink-0" /> {/* Line name column */}
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

            {/* Day markers (simplified - show week numbers) */}
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
                {/* Today marker */}
                {allDays.findIndex(d => isToday(d)) !== -1 && (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-primary z-10"
                    style={{ left: `${(allDays.findIndex(d => isToday(d)) / totalDays) * 100}%` }}
                  />
                )}
              </div>
            </div>

            {/* Timeline rows for each line */}
            <div className="space-y-3">
              {lineTimelines.map(({ line, phases, inStoreDate }) => (
                <div key={line.id} className="flex items-center">
                  {/* Line name */}
                  <div className="w-28 shrink-0 flex items-center gap-2 pr-2">
                    <div className={cn('w-3 h-3 rounded-full', line.color)} />
                    <span className="text-sm font-medium truncate">{line.name}</span>
                  </div>
                  
                  {/* Timeline bar */}
                  <div className="flex-1 relative h-8 bg-muted/30 rounded">
                    {phases.map((phase, idx) => {
                      const pos = getPhasePosition(phase);
                      return (
                        <div
                          key={idx}
                          className={cn(
                            'absolute top-1 bottom-1 rounded transition-all',
                            PHASE_COLORS[phase.type].bg,
                            'opacity-80 hover:opacity-100'
                          )}
                          style={{ left: pos.left, width: pos.width }}
                          title={`${PHASE_COLORS[phase.type].label}: ${format(phase.startDate, 'MMM d')} - ${format(phase.endDate, 'MMM d')}`}
                        >
                          {parseFloat(pos.width) > 8 && (
                            <span className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-medium">
                              {PHASE_COLORS[phase.type].label}
                            </span>
                          )}
                        </div>
                      );
                    })}
                    
                    {/* In-store date marker */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-green-600"
                      style={{ left: `${(differenceInDays(inStoreDate, calendarRange.start) / totalDays) * 100}%` }}
                      title={`In-Store: ${format(inStoreDate, 'MMM d, yyyy')}`}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Today indicator label */}
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-3 h-3 bg-primary rounded" />
              <span>Today: {format(new Date(), 'MMM d, yyyy')}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MasterCalendar;
