import { useMemo } from 'react';
import { MainNav } from '@/components/MainNav';
import { RoleSwitcher } from '@/components/RoleSwitcher';
import { NotificationBell } from '@/components/alerts/NotificationBell';
import { useCurrentUser } from '@/contexts/UserContext';
import { useTaskStore } from '@/data/taskStore';
import { useNotificationStore } from '@/data/notificationStore';
import { useCapsuleStore } from '@/data/capsuleCollectionData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Users,
  Package,
  Scissors,
  Palette,
  ArrowRight,
  AlertOctagon,
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { SEVERITY_CONFIG } from '@/types/notification';
import { cn } from '@/lib/utils';

const DirectorDashboard = () => {
  const { currentUser } = useCurrentUser();
  const { tasks, getOverdueTasks, getDueTodayTasks, getDepartmentWorkload } = useTaskStore();
  const { getNotificationsForUser } = useNotificationStore();
  const { collections } = useCapsuleStore();

  // Calculate KPIs
  const kpis = useMemo(() => {
    const allTasks = Object.values(tasks);
    const overdue = getOverdueTasks();
    const dueToday = getDueTodayTasks();
    const completed = allTasks.filter(t => t.status === 'completed');
    const inProgress = allTasks.filter(t => t.status === 'in-progress');
    
    const designWorkload = getDepartmentWorkload('design');
    const sourcingWorkload = getDepartmentWorkload('sourcing');
    const samplingWorkload = getDepartmentWorkload('sampling');

    const totalCollections = Object.keys(collections).length;
    const activeCollections = Object.values(collections).filter(c => {
      const daysUntil = differenceInDays(c.targetInStoreDate, new Date());
      return daysUntil > 0 && daysUntil <= 90;
    }).length;

    return {
      totalTasks: allTasks.length,
      overdue: overdue.length,
      dueToday: dueToday.length,
      completed: completed.length,
      inProgress: inProgress.length,
      onTrackPercentage: allTasks.length > 0 
        ? Math.round(((allTasks.length - overdue.length) / allTasks.length) * 100)
        : 100,
      designWorkload,
      sourcingWorkload,
      samplingWorkload,
      totalCollections,
      activeCollections,
    };
  }, [tasks, collections]);

  // Get critical alerts
  const criticalAlerts = useMemo(() => {
    if (!currentUser) return [];
    return getNotificationsForUser(currentUser.id, currentUser.role)
      .filter(n => n.severity === 'critical' || n.severity === 'warning')
      .slice(0, 5);
  }, [currentUser, getNotificationsForUser]);

  // Collection status breakdown
  const collectionStatus = useMemo(() => {
    const cols = Object.values(collections);
    const now = new Date();
    
    return {
      onTrack: cols.filter(c => differenceInDays(c.targetInStoreDate, now) > 14).length,
      atRisk: cols.filter(c => {
        const days = differenceInDays(c.targetInStoreDate, now);
        return days > 0 && days <= 14;
      }).length,
      delayed: cols.filter(c => differenceInDays(c.targetInStoreDate, now) <= 0).length,
    };
  }, [collections]);

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
            <h1 className="text-2xl font-bold">Director Overview</h1>
            <p className="text-muted-foreground">
              Executive summary across all departments • {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
        </div>

        {/* Main KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Pipeline Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{kpis.onTrackPercentage}%</div>
              <p className="text-xs text-muted-foreground">Tasks on track</p>
              <Progress value={kpis.onTrackPercentage} className="mt-2 h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                Overdue Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">{kpis.overdue}</div>
              <p className="text-xs text-muted-foreground">Require immediate attention</p>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  {kpis.dueToday} due today
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Package className="h-4 w-4" />
                Active Collections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{kpis.activeCollections}</div>
              <p className="text-xs text-muted-foreground">of {kpis.totalCollections} total</p>
              <div className="flex gap-2 mt-2">
                <Badge className="text-xs bg-[hsl(var(--status-completed))]">
                  {collectionStatus.onTrack} on track
                </Badge>
                {collectionStatus.atRisk > 0 && (
                  <Badge className="text-xs bg-[hsl(var(--status-delayed))]">
                    {collectionStatus.atRisk} at risk
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                In Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{kpis.inProgress}</div>
              <p className="text-xs text-muted-foreground">Active tasks across teams</p>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  {kpis.completed} completed
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Department Health */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Department Health
              </CardTitle>
              <CardDescription>Workload and bottleneck status by department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Design Department */}
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                  <div className="w-10 h-10 rounded-full bg-[hsl(var(--chart-1))] flex items-center justify-center">
                    <Palette className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Design Team</h4>
                      {kpis.designWorkload.overdue > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {kpis.designWorkload.overdue} overdue
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span>{kpis.designWorkload.inProgress} in progress</span>
                      <span>{kpis.designWorkload.pending} pending</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a href="/design-hub">
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </Button>
                </div>

                {/* Sourcing Department */}
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                  <div className="w-10 h-10 rounded-full bg-[hsl(var(--chart-3))] flex items-center justify-center">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Sourcing Team</h4>
                      {kpis.sourcingWorkload.overdue > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {kpis.sourcingWorkload.overdue} overdue
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span>{kpis.sourcingWorkload.inProgress} in progress</span>
                      <span>{kpis.sourcingWorkload.pending} pending</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a href="/sourcing">
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </Button>
                </div>

                {/* Sampling Department */}
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                  <div className="w-10 h-10 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center">
                    <Scissors className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Sampling Floor</h4>
                      {kpis.samplingWorkload.overdue > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {kpis.samplingWorkload.overdue} overdue
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span>{kpis.samplingWorkload.inProgress} in progress</span>
                      <span>{kpis.samplingWorkload.pending} pending</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a href="/sampling-floor">
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Critical Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertOctagon className="h-5 w-5 text-destructive" />
                Critical Alerts
              </CardTitle>
              <CardDescription>Issues requiring your attention</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[280px]">
                {criticalAlerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 mb-2 text-[hsl(var(--status-completed))]" />
                    <p className="text-sm">No critical alerts</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {criticalAlerts.map(alert => {
                      const severityConfig = SEVERITY_CONFIG[alert.severity];
                      return (
                        <div 
                          key={alert.id}
                          className="p-3 rounded-lg border"
                          style={{ borderColor: severityConfig.color }}
                        >
                          <div className="flex items-start gap-2">
                            <div 
                              className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                              style={{ backgroundColor: severityConfig.color }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">{alert.title}</p>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {alert.message}
                              </p>
                              {alert.actionUrl && (
                                <a 
                                  href={alert.actionUrl}
                                  className="text-xs text-primary hover:underline mt-2 inline-block"
                                >
                                  {alert.actionLabel || 'View'} →
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Collection Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Collection Status Overview</CardTitle>
            <CardDescription>All active collections with RAG status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Object.values(collections).slice(0, 8).map(collection => {
                const daysUntil = differenceInDays(collection.targetInStoreDate, new Date());
                const status = daysUntil <= 0 ? 'delayed' : daysUntil <= 14 ? 'at-risk' : 'on-track';
                
                return (
                  <div 
                    key={collection.id}
                    className={cn(
                      'p-4 rounded-lg border-2',
                      status === 'on-track' && 'border-[hsl(var(--status-completed))] bg-[hsl(var(--status-completed))]/5',
                      status === 'at-risk' && 'border-[hsl(var(--status-delayed))] bg-[hsl(var(--status-delayed))]/5',
                      status === 'delayed' && 'border-destructive bg-destructive/5',
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-sm">{collection.name}</h4>
                        <p className="text-xs text-muted-foreground capitalize">{collection.productLine}</p>
                      </div>
                      <Badge 
                        variant="outline"
                        className={cn(
                          'text-xs',
                          status === 'on-track' && 'border-[hsl(var(--status-completed))] text-[hsl(var(--status-completed))]',
                          status === 'at-risk' && 'border-[hsl(var(--status-delayed))] text-[hsl(var(--status-delayed))]',
                          status === 'delayed' && 'border-destructive text-destructive',
                        )}
                      >
                        {status === 'delayed' ? 'Delayed' : daysUntil + 'd'}
                      </Badge>
                    </div>
                    <div className="mt-3 text-xs text-muted-foreground">
                      In-store: {format(collection.targetInStoreDate, 'MMM d, yyyy')}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DirectorDashboard;
