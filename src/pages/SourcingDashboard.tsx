import { useState, useMemo } from 'react';
import { MainNav } from '@/components/MainNav';
import { RoleSwitcher } from '@/components/RoleSwitcher';
import { NotificationBell } from '@/components/alerts/NotificationBell';
import { useCurrentUser } from '@/contexts/UserContext';
import { useTaskStore } from '@/data/taskStore';
import { useFabricStore, FABRIC_STATUS_CONFIG, FabricStatus } from '@/data/fabricStore';
import { FabricStatusBoard } from '@/components/FabricStatusBoard';
import { FabricInductionForm } from '@/components/FabricInductionForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Package, 
  Truck, 
  Clock, 
  AlertTriangle,
  CheckCircle2,
  Plus,
  Search,
  Droplets,
  Palette,
  Factory,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { format, differenceInDays, isToday } from 'date-fns';
import { cn } from '@/lib/utils';

const SourcingDashboard = () => {
  const { currentUser } = useCurrentUser();
  const { tasks, getTasksByDepartment } = useTaskStore();
  const { fabrics, getSeasonFabricSummary, getFabricsByStatus } = useFabricStore();
  const [activeTab, setActiveTab] = useState('pipeline');
  const [isAddFabricOpen, setIsAddFabricOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Get fabric summary
  const fabricSummary = useMemo(() => getSeasonFabricSummary(), [fabrics]);

  // Get sourcing tasks
  const sourcingTasks = useMemo(() => {
    return getTasksByDepartment('sourcing').sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  }, [tasks]);

  // Get fabrics in treatment stages
  const treatmentFabrics = useMemo(() => {
    return Object.values(fabrics).filter(f => 
      f.status === 'in-base-treatment' || 
      f.status === 'in-surface-treatment' ||
      (f.baseTreatmentType !== 'none' && f.status !== 'inducted')
    );
  }, [fabrics]);

  // Calculate treatment stage counts
  const treatmentCounts = useMemo(() => {
    return {
      dyeing: treatmentFabrics.filter(f => f.baseTreatmentType === 'dyeing').length,
      printing: treatmentFabrics.filter(f => f.baseTreatmentType === 'printing').length,
      multihead: treatmentFabrics.filter(f => f.surfaceTreatments?.includes('multihead')).length,
    };
  }, [treatmentFabrics]);

  // Get urgent items
  const urgentItems = useMemo(() => {
    const overdue = sourcingTasks.filter(t => t.dueDate < new Date() && t.status !== 'completed');
    const dueToday = sourcingTasks.filter(t => isToday(t.dueDate) && t.status !== 'completed');
    return [...overdue, ...dueToday].slice(0, 5);
  }, [sourcingTasks]);

  // Procurement queue (pending fabric requests)
  const procurementQueue = useMemo(() => {
    return getFabricsByStatus('pending-artwork').slice(0, 10);
  }, [fabrics]);

  // Get all fabrics for the status board
  const allFabrics = useMemo(() => Object.values(fabrics), [fabrics]);

  return (
    <div className="min-h-screen bg-background">
      <MainNav>
        <NotificationBell />
        <RoleSwitcher />
      </MainNav>

      <div className="container mx-auto px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Sourcing Dashboard</h1>
            <p className="text-muted-foreground">
              Fabric pipeline and treatment tracking • {format(new Date(), 'EEEE, MMMM d')}
            </p>
          </div>
          <Button onClick={() => setIsAddFabricOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Induct Fabric
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[hsl(var(--chart-3))]/10 flex items-center justify-center">
                  <Package className="h-5 w-5 text-[hsl(var(--chart-3))]" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{fabricSummary.total}</p>
                  <p className="text-xs text-muted-foreground">Total Fabrics</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[hsl(var(--status-completed))]/10 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-[hsl(var(--status-completed))]" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{fabricSummary.inducted}</p>
                  <p className="text-xs text-muted-foreground">Inducted</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[hsl(var(--status-in-progress))]/10 flex items-center justify-center">
                  <Droplets className="h-5 w-5 text-[hsl(var(--status-in-progress))]" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{treatmentCounts.dyeing}</p>
                  <p className="text-xs text-muted-foreground">In Dyeing</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[hsl(var(--chart-1))]/10 flex items-center justify-center">
                  <Palette className="h-5 w-5 text-[hsl(var(--chart-1))]" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{treatmentCounts.printing}</p>
                  <p className="text-xs text-muted-foreground">In Printing</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[hsl(var(--chart-4))]/10 flex items-center justify-center">
                  <Factory className="h-5 w-5 text-[hsl(var(--chart-4))]" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{treatmentCounts.multihead}</p>
                  <p className="text-xs text-muted-foreground">Multihead</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Induction Progress */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Season Induction Progress</p>
                  <p className="text-sm text-muted-foreground">
                    {fabricSummary.inducted} of {fabricSummary.total} fabrics inducted
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-64">
                  <Progress 
                    value={(fabricSummary.inducted / Math.max(fabricSummary.total, 1)) * 100} 
                    className="h-3"
                  />
                </div>
                <span className="font-medium">
                  {Math.round((fabricSummary.inducted / Math.max(fabricSummary.total, 1)) * 100)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="pipeline">Fabric Pipeline</TabsTrigger>
                <TabsTrigger value="treatments">Treatment Tracking</TabsTrigger>
                <TabsTrigger value="procurement">Procurement Queue</TabsTrigger>
              </TabsList>

              <TabsContent value="pipeline">
                <FabricStatusBoard fabrics={allFabrics} />
              </TabsContent>

              <TabsContent value="treatments" className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search fabrics..." 
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {treatmentFabrics.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Droplets className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-medium">No Fabrics in Treatment</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Fabrics undergoing dyeing, printing, or surface treatments will appear here
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {treatmentFabrics
                      .filter(f => !searchQuery || f.fabricName.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map(fabric => {
                        const statusConfig = FABRIC_STATUS_CONFIG[fabric.status];
                        const daysUntil = fabric.updatedAt 
                          ? differenceInDays(new Date(fabric.updatedAt.getTime() + 7 * 24 * 60 * 60 * 1000), new Date())
                          : null;
                        
                        return (
                          <Card key={fabric.id}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-medium">{fabric.fabricName}</h4>
                                  <p className="text-sm text-muted-foreground capitalize">
                                    {fabric.collectionName} • {fabric.lineName}
                                  </p>
                                </div>
                                <Badge 
                                  style={{ 
                                    backgroundColor: statusConfig.color,
                                    color: 'white'
                                  }}
                                >
                                  {statusConfig.label}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 mt-3 text-sm">
                                <Badge variant="outline" className="text-xs">
                                  {fabric.baseTreatmentType}
                                </Badge>
                                {fabric.surfaceTreatments?.map(t => (
                                  <Badge key={t} variant="outline" className="text-xs">
                                    {t}
                                  </Badge>
                                ))}
                                {daysUntil !== null && (
                                  <span className={cn(
                                    'text-xs',
                                    daysUntil < 0 && 'text-destructive',
                                    daysUntil >= 0 && daysUntil <= 3 && 'text-[hsl(var(--status-delayed))]'
                                  )}>
                                    {daysUntil < 0 
                                      ? `${Math.abs(daysUntil)}d overdue`
                                      : `${daysUntil}d until deadline`}
                                  </span>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="procurement" className="space-y-4">
                {procurementQueue.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-medium">No Pending Requests</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        New fabric requests from design teams will appear here
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {procurementQueue.map(fabric => (
                      <Card key={fabric.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{fabric.fabricName}</h4>
                              <p className="text-sm text-muted-foreground">
                                {fabric.collectionName} • Requested {format(fabric.createdAt, 'MMM d')}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{fabric.fabricType}</Badge>
                              <Button size="sm" variant="outline">
                                Review
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Urgent Items */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-[hsl(var(--status-delayed))]" />
                  Urgent Items
                </CardTitle>
                <CardDescription>Tasks needing immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[250px]">
                  {urgentItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                      <CheckCircle2 className="h-8 w-8 mb-2 text-[hsl(var(--status-completed))]" />
                      <p className="text-sm">All caught up!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {urgentItems.map(task => {
                        const isOverdue = task.dueDate < new Date();
                        return (
                          <div 
                            key={task.id}
                            className={cn(
                              'p-3 rounded-lg border',
                              isOverdue && 'border-destructive bg-destructive/5'
                            )}
                          >
                            <p className="text-sm font-medium">{task.title}</p>
                            <p className={cn(
                              'text-xs mt-1',
                              isOverdue ? 'text-destructive' : 'text-[hsl(var(--status-delayed))]'
                            )}>
                              {isOverdue 
                                ? `${Math.abs(differenceInDays(task.dueDate, new Date()))}d overdue`
                                : 'Due today'}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Status Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Status Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(Object.entries(fabricSummary.byStatus) as [FabricStatus, number][])
                    .filter(([_, count]) => count > 0)
                    .map(([status, count]) => {
                      const config = FABRIC_STATUS_CONFIG[status];
                      return (
                        <div key={status} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: config.color }}
                            />
                            <span className="text-sm">{config.label}</span>
                          </div>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={isAddFabricOpen} onOpenChange={setIsAddFabricOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Induct New Fabric</DialogTitle>
          </DialogHeader>
          <FabricInductionForm onClose={() => setIsAddFabricOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SourcingDashboard;
