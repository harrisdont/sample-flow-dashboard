import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ArrowLeft, Settings2, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CapsuleCollectionPlanForm from '@/components/CapsuleCollectionPlanForm';
import MasterCalendar from '@/components/MasterCalendar';
import { cn } from '@/lib/utils';

interface ProductLine {
  id: string;
  name: string;
  color: string;
  status: 'planning' | 'in-progress' | 'completed';
  type: 'fashion' | 'accessories';
}

// Season launches breakdown
interface Launch {
  id: string;
  name: string;
  period: string;
}

const SEASON_LAUNCHES: Launch[] = [
  { id: 'spring', name: 'Spring', period: 'Feb 15 - Mar 31' },
  { id: 'choti-eid', name: 'Choti Eid', period: 'Apr 1 - Apr 20' },
  { id: 'summer', name: 'Summer', period: 'May 1 - Jun 30' },
  { id: 'barri-eid', name: 'Barri Eid', period: 'Jun 1 - Jun 15' },
  { id: 'resort', name: 'Resort', period: 'Jul 1 - Aug 31' },
];

// Fashion category breakdown
const FASHION_CATEGORIES = ['1pc', '2pc', '3pc', 'dupattas', 'lowers'] as const;
type FashionCategory = typeof FASHION_CATEGORIES[number];

// Accessories category breakdown (for Leather & Regen)
const ACCESSORIES_CATEGORIES = ['shoes', 'bags', 'scrunchies', 'jewellery', 'parandas', 'misc', 'stationery'] as const;
type AccessoriesCategory = typeof ACCESSORIES_CATEGORIES[number];

const CATEGORY_LABELS: Record<string, string> = {
  '1pc': '1 Piece',
  '2pc': '2 Piece',
  '3pc': '3 Piece',
  'dupattas': 'Dupattas',
  'lowers': 'Lowers',
  'shoes': 'Shoes',
  'bags': 'Bags',
  'scrunchies': 'Scrunchies',
  'jewellery': 'Jewellery',
  'parandas': 'Parandas',
  'misc': 'Misc Items',
  'stationery': 'Stationery',
};

interface CategoryAllocation {
  [category: string]: number;
}

interface LaunchAllocation {
  [launchId: string]: number;
}

const initialProductLines: ProductLine[] = [
  { id: 'cottage', name: 'Cottage', color: 'bg-fashion-cottage', status: 'planning', type: 'fashion' },
  { id: 'classic', name: 'Classic', color: 'bg-fashion-classic', status: 'planning', type: 'fashion' },
  { id: 'formals', name: 'Formals', color: 'bg-fashion-formals', status: 'planning', type: 'fashion' },
  { id: 'woman', name: 'Woman', color: 'bg-fashion-woman', status: 'planning', type: 'fashion' },
  { id: 'ming', name: 'Ming', color: 'bg-fashion-ming', status: 'planning', type: 'fashion' },
  { id: 'leather', name: 'Leather', color: 'bg-amber-600', status: 'planning', type: 'accessories' },
  { id: 'regen', name: 'Regen', color: 'bg-emerald-600', status: 'planning', type: 'accessories' },
];

const getStatusVariant = (status: ProductLine['status']) => {
  switch (status) {
    case 'planning':
      return 'secondary';
    case 'in-progress':
      return 'default';
    case 'completed':
      return 'outline';
    default:
      return 'secondary';
  }
};

const getStatusLabel = (status: ProductLine['status']) => {
  switch (status) {
    case 'planning':
      return 'Planning';
    case 'in-progress':
      return 'In Progress';
    case 'completed':
      return 'Completed';
    default:
      return status;
  }
};

const SeasonalCollectionPlanning = () => {
  const navigate = useNavigate();
  const [seasonName] = useState<string>('SS26');
  const [totalDesignCount, setTotalDesignCount] = useState<number>(100);
  const [launchAllocations, setLaunchAllocations] = useState<LaunchAllocation>(() => {
    const initial: LaunchAllocation = {};
    SEASON_LAUNCHES.forEach(launch => {
      initial[launch.id] = 0;
    });
    return initial;
  });
  const [lineAllocations, setLineAllocations] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    initialProductLines.forEach(line => {
      initial[line.id] = 0;
    });
    return initial;
  });
  const [categoryAllocations, setCategoryAllocations] = useState<Record<string, CategoryAllocation>>(() => {
    const initial: Record<string, CategoryAllocation> = {};
    initialProductLines.forEach(line => {
      const categories = line.type === 'fashion' ? FASHION_CATEGORIES : ACCESSORIES_CATEGORIES;
      initial[line.id] = {};
      categories.forEach(cat => {
        initial[line.id][cat] = 0;
      });
    });
    return initial;
  });
  const [selectedLine, setSelectedLine] = useState<ProductLine | null>(null);
  const [expandedLines, setExpandedLines] = useState<Record<string, boolean>>({});

  const totalLaunchAllocated = useMemo(() => {
    return Object.values(launchAllocations).reduce((sum, val) => sum + val, 0);
  }, [launchAllocations]);

  const launchRemaining = totalDesignCount - totalLaunchAllocated;

  const totalAllocated = useMemo(() => {
    return Object.values(lineAllocations).reduce((sum, val) => sum + val, 0);
  }, [lineAllocations]);

  const remaining = totalDesignCount - totalAllocated;

  const handleTotalChange = (value: string) => {
    const num = parseInt(value) || 0;
    setTotalDesignCount(Math.max(0, Math.min(1000, num)));
  };

  const getLineCategoryTotal = (lineId: string) => {
    return Object.values(categoryAllocations[lineId] || {}).reduce((sum, val) => sum + val, 0);
  };

  const handleCategoryChange = (lineId: string, category: string, value: number) => {
    const line = initialProductLines.find(l => l.id === lineId);
    if (!line) return;
    
    const currentTotal = getLineCategoryTotal(lineId);
    const currentCatValue = categoryAllocations[lineId]?.[category] || 0;
    const lineTotal = lineAllocations[lineId] || 0;
    const maxAllowable = lineTotal - currentTotal + currentCatValue;
    const newValue = Math.max(0, Math.min(maxAllowable, value));
    
    setCategoryAllocations(prev => ({
      ...prev,
      [lineId]: {
        ...prev[lineId],
        [category]: newValue
      }
    }));
  };

  const toggleLineExpand = (lineId: string) => {
    setExpandedLines(prev => ({
      ...prev,
      [lineId]: !prev[lineId]
    }));
  };

  const handleAllocationChange = (lineId: string, value: number) => {
    const maxAllowable = remaining + (lineAllocations[lineId] || 0);
    const newValue = Math.max(0, Math.min(maxAllowable, value));
    setLineAllocations(prev => ({
      ...prev,
      [lineId]: newValue
    }));
  };

  const handleSliderChange = (lineId: string, values: number[]) => {
    handleAllocationChange(lineId, values[0]);
  };

  const handleInputChange = (lineId: string, value: string) => {
    const num = parseInt(value) || 0;
    handleAllocationChange(lineId, num);
  };

  const getProgressPercentage = (allocated: number) => {
    if (totalDesignCount === 0) return 0;
    return (allocated / totalDesignCount) * 100;
  };

  const handleLaunchAllocationChange = (launchId: string, value: number) => {
    const maxAllowable = launchRemaining + (launchAllocations[launchId] || 0);
    const newValue = Math.max(0, Math.min(maxAllowable, value));
    setLaunchAllocations(prev => ({
      ...prev,
      [launchId]: newValue
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Seasonal Collection Planning</h1>
          <p className="text-muted-foreground mt-2">
            Manage and track designs across all product lines
          </p>
        </div>

        {/* Main Category Plan Control Panel */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-primary" />
              <CardTitle>Main Category Plan</CardTitle>
              <Badge variant="outline" className="ml-2">{seasonName}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Total Design Count */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalDesigns" className="text-base font-medium">
                  Total Design Count for Season ({seasonName})
                </Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="totalDesigns"
                    type="number"
                    value={totalDesignCount}
                    onChange={(e) => handleTotalChange(e.target.value)}
                    className="w-32"
                    min={0}
                    max={1000}
                  />
                  <span className="text-sm text-muted-foreground">designs</span>
                </div>
              </div>
              <div className="sm:ml-auto flex items-center gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{totalLaunchAllocated}</p>
                  <p className="text-xs text-muted-foreground">Allocated to Launches</p>
                </div>
                <div className="text-center">
                  <p className={`text-2xl font-bold ${launchRemaining < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {launchRemaining}
                  </p>
                  <p className="text-xs text-muted-foreground">Unallocated</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Season Launches */}
            <div>
              <Label className="text-base font-medium mb-4 block flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Season Launches
              </Label>
              <p className="text-sm text-muted-foreground mb-4">
                Allocate total design count across different launches within {seasonName}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {SEASON_LAUNCHES.map((launch) => {
                  const allocated = launchAllocations[launch.id] || 0;
                  const percent = totalDesignCount > 0 ? (allocated / totalDesignCount) * 100 : 0;
                  
                  return (
                    <div key={launch.id} className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                      <div className="text-center mb-3">
                        <h4 className="font-semibold text-sm">{launch.name}</h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{launch.period}</p>
                      </div>
                      <Input
                        type="number"
                        value={allocated}
                        onChange={(e) => handleLaunchAllocationChange(launch.id, parseInt(e.target.value) || 0)}
                        className="w-full text-center h-9 mb-2"
                        min={0}
                        max={totalDesignCount}
                      />
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground text-center mt-1">
                        {percent.toFixed(0)}% of season
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Line Distribution */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                <Label className="text-base font-medium">
                  Distribute Designs by Line
                </Label>
                <div className="sm:ml-auto flex items-center gap-4 text-sm">
                  <div className="text-center">
                    <p className="font-semibold text-primary">{totalAllocated}</p>
                    <p className="text-[10px] text-muted-foreground">To Lines</p>
                  </div>
                  <span className="text-muted-foreground">/</span>
                  <div className="text-center">
                    <p className="font-semibold">{totalLaunchAllocated}</p>
                    <p className="text-[10px] text-muted-foreground">From Launches</p>
                  </div>
                  {totalAllocated > totalLaunchAllocated && (
                    <Badge variant="destructive" className="text-[10px]">Over-allocated</Badge>
                  )}
                </div>
              </div>
              
              {/* Fashion Lines */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Fashion Lines</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {initialProductLines.filter(l => l.type === 'fashion').map((line) => {
                    const categoryTotal = getLineCategoryTotal(line.id);
                    const unallocated = lineAllocations[line.id] - categoryTotal;
                    
                    return (
                      <Collapsible
                        key={line.id}
                        open={expandedLines[line.id]}
                        onOpenChange={() => toggleLineExpand(line.id)}
                      >
                        <div className="p-3 rounded-lg border bg-card">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className={cn('w-3 h-3 rounded-full', line.color)} />
                              <span className="font-medium text-sm">{line.name}</span>
                            </div>
                            <Input
                              type="number"
                              value={lineAllocations[line.id]}
                              onChange={(e) => handleInputChange(line.id, e.target.value)}
                              className="w-20 h-8 text-right"
                              min={0}
                              max={totalDesignCount}
                            />
                          </div>
                          <Slider
                            value={[lineAllocations[line.id]]}
                            onValueChange={(values) => handleSliderChange(line.id, values)}
                            max={totalDesignCount}
                            step={1}
                            className="w-full mb-2"
                          />
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="w-full h-7 text-xs">
                              {expandedLines[line.id] ? (
                                <>Hide Categories <ChevronUp className="h-3 w-3 ml-1" /></>
                              ) : (
                                <>Show Categories <ChevronDown className="h-3 w-3 ml-1" /></>
                              )}
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="pt-2 space-y-2">
                            {unallocated > 0 && (
                              <p className="text-xs text-amber-600">{unallocated} unassigned to categories</p>
                            )}
                            {FASHION_CATEGORIES.map(cat => (
                              <div key={cat} className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">{CATEGORY_LABELS[cat]}</span>
                                <Input
                                  type="number"
                                  value={categoryAllocations[line.id]?.[cat] || 0}
                                  onChange={(e) => handleCategoryChange(line.id, cat, parseInt(e.target.value) || 0)}
                                  className="w-16 h-6 text-right text-xs"
                                  min={0}
                                />
                              </div>
                            ))}
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    );
                  })}
                </div>
              </div>

              {/* Accessories Lines (Leather & Regen) */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Accessories Lines</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {initialProductLines.filter(l => l.type === 'accessories').map((line) => {
                    const categoryTotal = getLineCategoryTotal(line.id);
                    const unallocated = lineAllocations[line.id] - categoryTotal;
                    
                    return (
                      <Collapsible
                        key={line.id}
                        open={expandedLines[line.id]}
                        onOpenChange={() => toggleLineExpand(line.id)}
                      >
                        <div className="p-3 rounded-lg border bg-card">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className={cn('w-3 h-3 rounded-full', line.color)} />
                              <span className="font-medium text-sm">{line.name}</span>
                              <Badge variant="outline" className="text-[10px]">Accessories</Badge>
                            </div>
                            <Input
                              type="number"
                              value={lineAllocations[line.id]}
                              onChange={(e) => handleInputChange(line.id, e.target.value)}
                              className="w-20 h-8 text-right"
                              min={0}
                              max={totalDesignCount}
                            />
                          </div>
                          <Slider
                            value={[lineAllocations[line.id]]}
                            onValueChange={(values) => handleSliderChange(line.id, values)}
                            max={totalDesignCount}
                            step={1}
                            className="w-full mb-2"
                          />
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="w-full h-7 text-xs">
                              {expandedLines[line.id] ? (
                                <>Hide Categories <ChevronUp className="h-3 w-3 ml-1" /></>
                              ) : (
                                <>Show Categories <ChevronDown className="h-3 w-3 ml-1" /></>
                              )}
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="pt-2 space-y-2">
                            {unallocated > 0 && (
                              <p className="text-xs text-amber-600">{unallocated} unassigned to categories</p>
                            )}
                            <div className="grid grid-cols-2 gap-2">
                              {ACCESSORIES_CATEGORIES.map(cat => (
                                <div key={cat} className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground">{CATEGORY_LABELS[cat]}</span>
                                  <Input
                                    type="number"
                                    value={categoryAllocations[line.id]?.[cat] || 0}
                                    onChange={(e) => handleCategoryChange(line.id, cat, parseInt(e.target.value) || 0)}
                                    className="w-14 h-6 text-right text-xs"
                                    min={0}
                                  />
                                </div>
                              ))}
                            </div>
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    );
                  })}
                </div>
              </div>
            </div>
        </CardContent>
        </Card>

        {/* Category Summary Dashboard */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Category Summary</CardTitle>
            <p className="text-sm text-muted-foreground">Total designs by category across all lines</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Fashion Categories Summary */}
              <div>
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  Fashion Categories
                </h4>
                <div className="space-y-2">
                  {FASHION_CATEGORIES.map(cat => {
                    const total = initialProductLines
                      .filter(l => l.type === 'fashion')
                      .reduce((sum, line) => sum + (categoryAllocations[line.id]?.[cat] || 0), 0);
                    return (
                      <div key={cat} className="flex items-center justify-between p-2 rounded bg-muted/50">
                        <span className="text-sm">{CATEGORY_LABELS[cat]}</span>
                        <span className="font-semibold">{total}</span>
                      </div>
                    );
                  })}
                  <Separator className="my-2" />
                  <div className="flex items-center justify-between p-2 rounded bg-primary/10">
                    <span className="text-sm font-medium">Total Fashion</span>
                    <span className="font-bold text-primary">
                      {initialProductLines
                        .filter(l => l.type === 'fashion')
                        .reduce((sum, line) => sum + getLineCategoryTotal(line.id), 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Accessories Categories Summary */}
              <div>
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Accessories Categories
                </h4>
                <div className="space-y-2">
                  {ACCESSORIES_CATEGORIES.map(cat => {
                    const total = initialProductLines
                      .filter(l => l.type === 'accessories')
                      .reduce((sum, line) => sum + (categoryAllocations[line.id]?.[cat] || 0), 0);
                    return (
                      <div key={cat} className="flex items-center justify-between p-2 rounded bg-muted/50">
                        <span className="text-sm">{CATEGORY_LABELS[cat]}</span>
                        <span className="font-semibold">{total}</span>
                      </div>
                    );
                  })}
                  <Separator className="my-2" />
                  <div className="flex items-center justify-between p-2 rounded bg-amber-500/10">
                    <span className="text-sm font-medium">Total Accessories</span>
                    <span className="font-bold text-amber-600">
                      {initialProductLines
                        .filter(l => l.type === 'accessories')
                        .reduce((sum, line) => sum + getLineCategoryTotal(line.id), 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Line Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {initialProductLines.map((line) => {
            const allocated = lineAllocations[line.id];
            const progressPercent = getProgressPercentage(allocated);
            const categories = line.type === 'fashion' ? FASHION_CATEGORIES : ACCESSORIES_CATEGORIES;
            const catAllocs = categoryAllocations[line.id] || {};
            const categoryTotal = getLineCategoryTotal(line.id);
            
            return (
              <Card
                key={line.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedLine(line)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn('w-4 h-4 rounded-full', line.color)} />
                      <CardTitle className="text-lg">{line.name}</CardTitle>
                    </div>
                    <Badge variant={getStatusVariant(line.status)}>
                      {getStatusLabel(line.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Allocated Designs</span>
                      <span className="text-lg font-semibold text-foreground">
                        {allocated}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn('h-full transition-all duration-300', line.color)}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    
                    {/* Category breakdown summary */}
                    {allocated > 0 && (
                      <div className="pt-2 border-t">
                        <p className="text-[10px] text-muted-foreground mb-1.5">Category Breakdown:</p>
                        <div className="flex flex-wrap gap-1">
                          {categories.map(cat => {
                            const count = catAllocs[cat] || 0;
                            if (count === 0) return null;
                            return (
                              <Badge key={cat} variant="secondary" className="text-[9px] h-5">
                                {CATEGORY_LABELS[cat]}: {count}
                              </Badge>
                            );
                          })}
                          {categoryTotal === 0 && (
                            <span className="text-[10px] text-muted-foreground italic">Not broken down yet</span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <p className="text-xs text-muted-foreground">
                      {allocated > 0 
                        ? `${progressPercent.toFixed(1)}% of total season designs`
                        : 'No designs allocated yet'
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Master Calendar */}
        <div className="mt-8">
          <MasterCalendar 
            productLines={initialProductLines.map((line) => ({
              id: line.id,
              name: line.name,
              color: line.color,
            }))}
          />
        </div>

        {/* Capsule Collection Plan Sheet */}
        <Sheet open={!!selectedLine} onOpenChange={(open) => !open && setSelectedLine(null)}>
          <SheetContent className="sm:max-w-xl overflow-y-auto">
            <SheetHeader className="sr-only">
              <SheetTitle>Capsule Collection Plan</SheetTitle>
            </SheetHeader>
            {selectedLine && (
              <CapsuleCollectionPlanForm
                lineId={selectedLine.id}
                lineName={selectedLine.name}
                lineColor={selectedLine.color}
                allocatedDesigns={lineAllocations[selectedLine.id]}
                onClose={() => setSelectedLine(null)}
              />
            )}
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default SeasonalCollectionPlanning;
