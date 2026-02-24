import { useState, useMemo } from 'react';
import { MainNav } from '@/components/MainNav';
import { RoleSwitcher } from '@/components/RoleSwitcher';
import { NotificationBell } from '@/components/alerts/NotificationBell';
import { useCurrentUser } from '@/contexts/UserContext';
import { useTaskStore } from '@/data/taskStore';
import { useDesignStore } from '@/data/designStore';
import { useCapsuleStore, CapsuleCollection } from '@/data/capsuleCollectionData';
import { useSampleStore } from '@/data/sampleStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';

import { SilhouetteLibrary } from '@/components/SilhouetteLibrary';
import { SilhouetteInductionForm } from '@/components/SilhouetteInductionForm';
import { FabricInbox } from '@/components/FabricInbox';
import { FabricInductionForm } from '@/components/FabricInductionForm';
import { FabricStatusBoard } from '@/components/FabricStatusBoard';
import { AccessoriesManager } from '@/components/AccessoriesManager';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useFabricStore } from '@/data/fabricStore';
import { 
  Palette, 
  Users, 
  Clock, 
  AlertTriangle,
  CheckCircle2,
  Plus,
  Search,
  Filter,
  ArrowRight,
  Folder,
  Target,
  Zap,
  Scissors,
  Layers,
  Package,
} from 'lucide-react';
import { format, differenceInDays, isToday, isTomorrow } from 'date-fns';
import { STATUS_CONFIG, PRIORITY_CONFIG } from '@/types/task';
import { MOCK_USERS } from '@/contexts/UserContext';
import { cn } from '@/lib/utils';
import { isDecorationStage, getTechniqueLabel } from '@/lib/embroideryWorkflow';
import { SampleStageCard } from '@/components/sampling/SampleStageCard';
import { EmbroideryTechnique } from '@/types/sample';

const DesignHub = () => {
  const { currentUser, getUsersByLine } = useCurrentUser();
  const { tasks, getTasksByAssignee } = useTaskStore();
  const { getDesignCountByCategory } = useDesignStore();
  const { capsules } = useCapsuleStore();
  const { samples } = useSampleStore();
  const { fabrics } = useFabricStore();
  const [activeTab, setActiveTab] = useState('collections');
  
  const [isAddSilhouetteOpen, setIsAddSilhouetteOpen] = useState(false);
  const [isAddFabricOpen, setIsAddFabricOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Get collections for user's assigned lines
  const myCollections = useMemo((): CapsuleCollection[] => {
    if (!currentUser?.assignedLines) return [];
    return Object.values(capsules).filter((c: CapsuleCollection) => 
      currentUser.assignedLines?.includes(c.lineId as any)
    );
  }, [capsules, currentUser]);

  // Get team members for user's lines
  const teamMembers = useMemo(() => {
    if (!currentUser?.assignedLines) return [];
    const members = new Set<string>();
    currentUser.assignedLines.forEach(line => {
      getUsersByLine(line).forEach(u => members.add(u.id));
    });
    return MOCK_USERS.filter(u => members.has(u.id) && u.id !== currentUser.id);
  }, [currentUser, getUsersByLine]);

  // Get tasks assigned by current user or to their team
  const teamTasks = useMemo(() => {
    const allTasks = Object.values(tasks);
    const teamIds = teamMembers.map(m => m.id);
    return allTasks.filter(t => 
      t.assignedBy === currentUser?.id || 
      (t.assignedTo && teamIds.includes(t.assignedTo)) ||
      t.assignedTo === currentUser?.id
    ).sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  }, [tasks, currentUser, teamMembers]);

  // Calculate workload for each team member
  const teamWorkloads = useMemo(() => {
    return teamMembers.map(member => {
      const memberTasks = getTasksByAssignee(member.id);
      const pending = memberTasks.filter(t => t.status === 'pending' || t.status === 'assigned');
      const inProgress = memberTasks.filter(t => t.status === 'in-progress');
      const overdue = memberTasks.filter(t => t.dueDate < new Date() && t.status !== 'completed');
      
      const totalHours = [...pending, ...inProgress].reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
      const utilization = Math.min(100, Math.round((totalHours / 40) * 100));

      return {
        user: member,
        pendingCount: pending.length,
        inProgressCount: inProgress.length,
        overdueCount: overdue.length,
        totalHours,
        utilization,
      };
    }).sort((a, b) => b.utilization - a.utilization);
  }, [teamMembers, getTasksByAssignee]);

  // Get urgent/priority items
  const urgentItems = useMemo(() => {
    return teamTasks
      .filter(t => t.status !== 'completed' && t.status !== 'cancelled')
      .filter(t => {
        const daysUntil = differenceInDays(t.dueDate, new Date());
        return daysUntil <= 2 || t.priority === 'critical';
      })
      .slice(0, 5);
  }, [teamTasks]);

  // Get date label for task
  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    const days = differenceInDays(date, new Date());
    if (days < 0) return `${Math.abs(days)}d overdue`;
    return `${days}d`;
  };

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
            <h1 className="text-2xl font-bold">Design Hub</h1>
            <p className="text-muted-foreground">
              {currentUser?.assignedLines?.map(l => l.charAt(0).toUpperCase() + l.slice(1)).join(', ')} • 
              {' '}{format(new Date(), 'EEEE, MMMM d')}
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[hsl(var(--chart-1))]/10 flex items-center justify-center">
                  <Folder className="h-5 w-5 text-[hsl(var(--chart-1))]" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{myCollections.length}</p>
                  <p className="text-xs text-muted-foreground">Active Collections</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[hsl(var(--status-in-progress))]/10 flex items-center justify-center">
                  <Target className="h-5 w-5 text-[hsl(var(--status-in-progress))]" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {teamTasks.filter(t => t.status === 'in-progress').length}
                  </p>
                  <p className="text-xs text-muted-foreground">Tasks In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[hsl(var(--status-delayed))]/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-[hsl(var(--status-delayed))]" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {teamTasks.filter(t => isToday(t.dueDate) && t.status !== 'completed').length}
                  </p>
                  <p className="text-xs text-muted-foreground">Due Today</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-destructive">
                    {teamTasks.filter(t => t.dueDate < new Date() && t.status !== 'completed').length}
                  </p>
                  <p className="text-xs text-muted-foreground">Overdue</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4 flex-wrap h-auto gap-1">
                <TabsTrigger value="collections">My Collections</TabsTrigger>
                <TabsTrigger value="tasks">Task Board</TabsTrigger>
                <TabsTrigger value="team">Team Workload</TabsTrigger>
                <TabsTrigger value="silhouettes" className="gap-1">
                  <Scissors className="h-3 w-3" />
                  Silhouettes
                </TabsTrigger>
                <TabsTrigger value="fabrics" className="gap-1">
                  <Layers className="h-3 w-3" />
                  Fabrics
                </TabsTrigger>
                <TabsTrigger value="fabric-inbox" className="gap-1">
                  <Package className="h-3 w-3" />
                  Fabric Inbox
                </TabsTrigger>
              </TabsList>

              <TabsContent value="collections" className="space-y-4">
                {myCollections.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Folder className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-medium">No Collections Assigned</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Collections for your lines will appear here
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  myCollections.map(collection => {
                    const designCounts = getDesignCountByCategory(collection.id);
                    const totalDesigns = Object.values(designCounts).reduce((a, b) => a + b, 0);
                    const plannedTotal = collection.categoryDesigns 
                      ? Object.values(collection.categoryDesigns).reduce((a, b) => a + b, 0)
                      : 0;
                    const progress = plannedTotal > 0 ? Math.round((totalDesigns / plannedTotal) * 100) : 0;
                    const daysUntil = differenceInDays(collection.targetInStoreDate, new Date());

                    return (
                      <Card key={collection.id} className="overflow-hidden">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-base">{collection.collectionName}</CardTitle>
                              <CardDescription className="capitalize">
                                {collection.lineName} • In-store {format(collection.targetInStoreDate, 'MMM d')}
                              </CardDescription>
                            </div>
                            <Badge 
                              variant="outline"
                              className={cn(
                                daysUntil <= 14 && 'border-[hsl(var(--status-delayed))] text-[hsl(var(--status-delayed))]',
                                daysUntil <= 0 && 'border-destructive text-destructive'
                              )}
                            >
                              {daysUntil <= 0 ? 'Overdue' : `${daysUntil}d remaining`}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Design Progress</span>
                              <span className="font-medium">{totalDesigns} / {plannedTotal}</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                            
                            <div className="flex flex-wrap gap-2 mt-3">
                              {Object.entries(designCounts).map(([cat, count]) => (
                                <Badge key={cat} variant="secondary" className="text-xs">
                                  {cat}: {count}
                                </Badge>
                              ))}
                            </div>

                            {/* Samples in Decoration */}
                            {(() => {
                              const decorationSamples = samples.filter(
                                s => s.collectionName === collection.collectionName && isDecorationStage(s.currentStage)
                              );
                              if (decorationSamples.length === 0) return null;
                              
                              const byTechnique = decorationSamples.reduce((acc, s) => {
                                const tech = s.decorationTechnique || 'other';
                                acc[tech] = (acc[tech] || 0) + 1;
                                return acc;
                              }, {} as Record<string, number>);

                              return (
                                <div className="mt-3 p-3 rounded-lg bg-muted/50">
                                  <p className="text-xs font-medium text-muted-foreground mb-2">
                                    Samples in Decoration ({decorationSamples.length})
                                  </p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {Object.entries(byTechnique).map(([tech, count]) => (
                                      <Badge key={tech} variant="outline" className="text-xs">
                                        {getTechniqueLabel(tech as EmbroideryTechnique)}: {count}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </TabsContent>

              <TabsContent value="tasks" className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search tasks..." 
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  {teamTasks
                    .filter(t => t.status !== 'completed' && t.status !== 'cancelled')
                    .filter(t => !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(task => {
                      const statusConfig = STATUS_CONFIG[task.status];
                      const priorityConfig = PRIORITY_CONFIG[task.priority];
                      const assignee = MOCK_USERS.find(u => u.id === task.assignedTo);
                      const daysUntil = differenceInDays(task.dueDate, new Date());
                      
                      return (
                        <Card key={task.id} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              {assignee && (
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="text-xs bg-[hsl(var(--chart-1))]">
                                    {assignee.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-sm truncate">{task.title}</h4>
                                  {task.priority === 'critical' && (
                                    <Zap className="h-3 w-3 text-[hsl(var(--status-delayed))]" />
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge 
                                    variant="outline" 
                                    className="text-xs"
                                    style={{ borderColor: statusConfig.color, color: statusConfig.color }}
                                  >
                                    {statusConfig.label}
                                  </Badge>
                                  <span className={cn(
                                    'text-xs',
                                    daysUntil < 0 && 'text-destructive font-medium',
                                    daysUntil === 0 && 'text-[hsl(var(--status-delayed))] font-medium'
                                  )}>
                                    {getDateLabel(task.dueDate)}
                                  </span>
                                  {assignee && (
                                    <span className="text-xs text-muted-foreground">
                                      • {assignee.name}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              </TabsContent>

              <TabsContent value="team" className="space-y-4">
                {teamWorkloads.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-medium">No Team Members</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Team members for your lines will appear here
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  teamWorkloads.map(({ user, pendingCount, inProgressCount, overdueCount, totalHours, utilization }) => (
                    <Card key={user.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-[hsl(var(--chart-2))]">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">{user.name}</h4>
                                <p className="text-xs text-muted-foreground capitalize">
                                  {user.role.replace('-', ' ')}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">{utilization}%</p>
                                <p className="text-xs text-muted-foreground">capacity</p>
                              </div>
                            </div>
                            <div className="mt-2">
                              <Progress 
                                value={utilization} 
                                className={cn(
                                  'h-2',
                                  utilization > 90 && '[&>div]:bg-destructive',
                                  utilization > 75 && utilization <= 90 && '[&>div]:bg-[hsl(var(--status-delayed))]'
                                )}
                              />
                            </div>
                            <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                              <span>{inProgressCount} in progress</span>
                              <span>{pendingCount} pending</span>
                              {overdueCount > 0 && (
                                <span className="text-destructive">{overdueCount} overdue</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              {/* Silhouettes Tab */}
              <TabsContent value="silhouettes">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Silhouette Library</h3>
                  <Button size="sm" className="gap-2" onClick={() => setIsAddSilhouetteOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Add Silhouette
                  </Button>
                </div>
                <SilhouetteLibrary onAddNew={() => setIsAddSilhouetteOpen(true)} />
              </TabsContent>

              {/* Fabrics Tab */}
              <TabsContent value="fabrics">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Fabric Management</h3>
                  <Button size="sm" className="gap-2" onClick={() => setIsAddFabricOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Add Fabric
                  </Button>
                </div>
                <FabricStatusBoard fabrics={fabrics} />
              </TabsContent>

              {/* Fabric Inbox Tab */}
              <TabsContent value="fabric-inbox">
                <FabricInbox />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - Urgent Items */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="h-4 w-4 text-[hsl(var(--status-delayed))]" />
                  Priority Items
                </CardTitle>
                <CardDescription>Tasks needing immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {urgentItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                      <CheckCircle2 className="h-8 w-8 mb-2 text-[hsl(var(--status-completed))]" />
                      <p className="text-sm">All caught up!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {urgentItems.map(task => {
                        const daysUntil = differenceInDays(task.dueDate, new Date());
                        const isOverdue = daysUntil < 0;
                        
                        return (
                          <div 
                            key={task.id}
                            className={cn(
                              'p-3 rounded-lg border',
                              isOverdue && 'border-destructive bg-destructive/5',
                              !isOverdue && task.priority === 'critical' && 'border-[hsl(var(--status-delayed))] bg-[hsl(var(--status-delayed))]/5'
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{task.title}</p>
                                <p className={cn(
                                  'text-xs mt-1',
                                  isOverdue ? 'text-destructive' : 'text-muted-foreground'
                                )}>
                                  {getDateLabel(task.dueDate)}
                                </p>
                              </div>
                              {task.priority === 'critical' && (
                                <Badge variant="destructive" className="text-xs">
                                  Critical
                                </Badge>
                              )}
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
        </div>
      </div>

      <SilhouetteInductionForm open={isAddSilhouetteOpen} onOpenChange={setIsAddSilhouetteOpen} />
      
      <Dialog open={isAddFabricOpen} onOpenChange={setIsAddFabricOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Fabric</DialogTitle>
          </DialogHeader>
          <FabricInductionForm onClose={() => setIsAddFabricOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DesignHub;
