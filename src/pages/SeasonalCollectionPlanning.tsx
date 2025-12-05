import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ArrowLeft, Settings2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CapsuleCollectionPlanForm from '@/components/CapsuleCollectionPlanForm';
import MasterCalendar from '@/components/MasterCalendar';

interface ProductLine {
  id: string;
  name: string;
  color: string;
  status: 'planning' | 'in-progress' | 'completed';
}

const initialProductLines: ProductLine[] = [
  { id: 'cottage', name: 'Cottage', color: 'bg-fashion-cottage', status: 'planning' },
  { id: 'classic', name: 'Classic', color: 'bg-fashion-classic', status: 'planning' },
  { id: 'formals', name: 'Formals', color: 'bg-fashion-formals', status: 'planning' },
  { id: 'woman', name: 'Woman', color: 'bg-fashion-woman', status: 'planning' },
  { id: 'ming', name: 'Ming', color: 'bg-fashion-ming', status: 'planning' },
  { id: 'leather', name: 'Leather', color: 'bg-muted', status: 'planning' },
  { id: 'regen', name: 'Regen', color: 'bg-muted', status: 'planning' },
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
  const [totalDesignCount, setTotalDesignCount] = useState<number>(100);
  const [lineAllocations, setLineAllocations] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    initialProductLines.forEach(line => {
      initial[line.id] = 0;
    });
    return initial;
  });
  const [selectedLine, setSelectedLine] = useState<ProductLine | null>(null);

  const totalAllocated = useMemo(() => {
    return Object.values(lineAllocations).reduce((sum, val) => sum + val, 0);
  }, [lineAllocations]);

  const remaining = totalDesignCount - totalAllocated;

  const handleTotalChange = (value: string) => {
    const num = parseInt(value) || 0;
    setTotalDesignCount(Math.max(0, Math.min(1000, num)));
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
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Total Design Count */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalDesigns" className="text-base font-medium">
                  Total Design Count for Season
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
                  <p className="text-2xl font-bold text-primary">{totalAllocated}</p>
                  <p className="text-xs text-muted-foreground">Allocated</p>
                </div>
                <div className="text-center">
                  <p className={`text-2xl font-bold ${remaining < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {remaining}
                  </p>
                  <p className="text-xs text-muted-foreground">Remaining</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Line Distribution */}
            <div>
              <Label className="text-base font-medium mb-4 block">
                Distribute Designs by Line
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {initialProductLines.map((line) => (
                  <div key={line.id} className="space-y-2 p-3 rounded-lg border bg-card">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${line.color}`} />
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
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Line Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {initialProductLines.map((line) => {
            const allocated = lineAllocations[line.id];
            const progressPercent = getProgressPercentage(allocated);
            
            return (
              <Card
                key={line.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedLine(line)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${line.color}`} />
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
                        className={`h-full ${line.color} transition-all duration-300`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
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
