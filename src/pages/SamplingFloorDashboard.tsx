import { useState, useMemo } from 'react';
import { MainNav } from '@/components/MainNav';
import { RoleSwitcher } from '@/components/RoleSwitcher';
import { NotificationBell } from '@/components/alerts/NotificationBell';
import { useCurrentUser, MOCK_USERS } from '@/contexts/UserContext';
import { useTaskStore } from '@/data/taskStore';
import { mockSamples } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { SampleStageCard } from '@/components/sampling/SampleStageCard';
import { 
  Scissors, 
  Users, 
  Clock, 
  AlertTriangle,
  CheckCircle2,
  Search,
  AlertOctagon,
  TrendingUp,
  Zap,
  Layers,
  Target,
  BarChart3,
  ArrowRight,
} from 'lucide-react';
import { format, differenceInDays, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { ProcessStage } from '@/types/sample';
import { detectBottlenecks, StageConfig, OperatorData, SampleData } from '@/lib/bottleneckDetector';
import { BottleneckAnalysisPanel } from '@/components/sampling/BottleneckAnalysisPanel';
import { isDecorationStage, DECORATION_STAGE_LABELS, getNextStage } from '@/lib/embroideryWorkflow';

// Production stages
const PRODUCTION_STAGES: StageConfig[] = [
  { id: 'pattern', label: 'Pattern Making', operatorType: 'Pattern Maker' },
  { id: 'semi-stitching', label: 'Semi Stitching', operatorType: 'Stitcher', dependsOn: ['pattern'] },
  { id: 'complete-stitching', label: 'Complete Stitching', operatorType: 'Master Tailor', dependsOn: ['semi-stitching'] },
  { id: 'pakki', label: 'Pakki', operatorType: 'Pakki Operator', canParallelize: ['multihead', 'ari-dori'] },
  { id: 'ari-dori', label: 'Ari/Dori', operatorType: 'Ari/Dori Operator', canParallelize: ['pakki', 'cottage-work'] },
  { id: 'cottage-work', label: 'Cottage Work', operatorType: 'Cottage Worker', canParallelize: ['ari-dori'] },
  { id: 'hand-finishes', label: 'Hand Finishes', operatorType: 'Finisher', dependsOn: ['cottage-work'] },
];

// Decoration stages
const DECORATION_STAGES: StageConfig[] = [
  { id: 'motif-assignment', label: 'Motif Assignment', operatorType: 'Motif Developer' },
  { id: 'motif-in-progress', label: 'Motif In Progress', operatorType: 'Motif Developer', dependsOn: ['motif-assignment'] },
  { id: 'motif-review', label: 'Motif Review', operatorType: 'Designer', dependsOn: ['motif-in-progress'] },
  { id: 'multihead-punching', label: 'Multihead Punching', operatorType: 'Punching Operator', dependsOn: ['motif-review'] },
  { id: 'multihead', label: 'Multihead', operatorType: 'Machine Operator', dependsOn: ['multihead-punching'] },
  { id: 'pinning', label: 'Pinning', operatorType: 'Sampling Incharge', dependsOn: ['motif-review'] },
  { id: 'stencil-transfer', label: 'Stencil Transfer', operatorType: 'Sampling Incharge', dependsOn: ['pinning'] },
  { id: 'hand-embroidery', label: 'Hand Embroidery', operatorType: 'Embroidery Technician', dependsOn: ['stencil-transfer'] },
  { id: 'screen-print-execution', label: 'Screen Print Exec', operatorType: 'Screen Printer', dependsOn: ['motif-review'] },
  { id: 'hand-block-printing', label: 'Hand Block Print', operatorType: 'Block Print Coordinator', dependsOn: ['motif-review'] },
  { id: 'decoration-approval', label: 'Decoration Approval', operatorType: 'Designer' },
];

const SAMPLING_STAGES: StageConfig[] = [...PRODUCTION_STAGES, ...DECORATION_STAGES];

// Mock operators for each stage with cross-training capabilities
const MOCK_OPERATORS: OperatorData[] = [
  { id: 'op-1', name: 'Rashid Ali', skill: 'pattern', capacity: 8 },
  { id: 'op-2', name: 'Imran Khan', skill: 'semi-stitching', capacity: 10 },
  { id: 'op-3', name: 'Saleem Ahmed', skill: 'semi-stitching', capacity: 6, crossTrainedSkills: ['complete-stitching'] },
  { id: 'op-4', name: 'Farhan Malik', skill: 'complete-stitching', capacity: 4 },
  { id: 'op-5', name: 'Tariq Hassan', skill: 'multihead', capacity: 12 },
  { id: 'op-6', name: 'Naveed Shah', skill: 'pakki', capacity: 5, crossTrainedSkills: ['ari-dori'] },
  { id: 'op-7', name: 'Waseem Akhtar', skill: 'ari-dori', capacity: 4, crossTrainedSkills: ['pakki'] },
  { id: 'op-8', name: 'Jameel Bhatti', skill: 'cottage-work', capacity: 3 },
  { id: 'op-9', name: 'Kamran Yousuf', skill: 'hand-finishes', capacity: 6, crossTrainedSkills: ['cottage-work'] },
  { id: 'op-10', name: 'Asif Raza', skill: 'semi-stitching', capacity: 6 },
  { id: 'op-11', name: 'Bilal Hussain', skill: 'pakki', capacity: 5 },
  // Decoration operators
  { id: 'op-12', name: 'Usman Qureshi', skill: 'motif-assignment', capacity: 6 },
  { id: 'op-13', name: 'Ali Haider', skill: 'motif-in-progress', capacity: 4 },
  { id: 'op-14', name: 'Zubair Khan', skill: 'multihead-punching', capacity: 5 },
  { id: 'op-15', name: 'Hamza Riaz', skill: 'screen-print-execution', capacity: 6 },
  { id: 'op-16', name: 'Shahbaz Gill', skill: 'hand-block-printing', capacity: 3 },
  { id: 'op-17', name: 'Danish Malik', skill: 'hand-embroidery', capacity: 4 },
  { id: 'op-18', name: 'Faizan Ahmed', skill: 'pinning', capacity: 8 },
];

const SamplingFloorDashboard = () => {
  const { currentUser } = useCurrentUser();
  const { tasks, getTasksByDepartment } = useTaskStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedStage, setSelectedStage] = useState<ProcessStage | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Get samples grouped by stage
  const samplesByStage = useMemo(() => {
    const grouped: Record<ProcessStage, typeof mockSamples> = {} as any;
    SAMPLING_STAGES.forEach(stage => {
      grouped[stage.id] = mockSamples.filter(s => s.currentStage === stage.id);
    });
    return grouped;
  }, []);

  // Calculate stage workloads
  const stageWorkloads = useMemo(() => {
    return SAMPLING_STAGES.map(stage => {
      const samples = samplesByStage[stage.id] || [];
      const operators = MOCK_OPERATORS.filter(o => o.skill === stage.id);
      const totalCapacity = operators.reduce((sum, o) => sum + o.capacity, 0);
      const queueSize = samples.length;
      const utilization = totalCapacity > 0 ? Math.min(100, Math.round((queueSize / totalCapacity) * 100)) : 0;
      const isBottleneck = utilization > 85;
      const estimatedClearTime = totalCapacity > 0 ? Math.ceil(queueSize / totalCapacity) : 0;

      return {
        stage,
        samples,
        operators,
        queueSize,
        operatorCount: operators.length,
        totalCapacity,
        utilization,
        isBottleneck,
        estimatedClearTime,
      };
    });
  }, [samplesByStage]);

  // Detect bottlenecks using the analysis engine
  const bottleneckReport = useMemo(() => {
    const sampleData: SampleData[] = mockSamples.map(s => ({
      id: s.id,
      code: s.sampleNumber,
      currentStage: s.currentStage,
      targetDate: new Date(s.targetDate),
      isDelayed: s.isDelayed,
    }));
    
    return detectBottlenecks(sampleData, MOCK_OPERATORS, SAMPLING_STAGES);
  }, []);

  // Legacy bottleneck reference for backward compatibility
  const bottlenecks = useMemo(() => {
    return stageWorkloads.filter(s => s.isBottleneck);
  }, [stageWorkloads]);

  // Get sampling tasks
  const samplingTasks = useMemo(() => {
    return getTasksByDepartment('sampling').sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  }, [tasks]);

  // Get urgent items
  const urgentItems = useMemo(() => {
    const overdueSamples = mockSamples.filter(s => 
      new Date(s.targetDate) < new Date() && s.approvalStatus !== 'approved'
    );
    return overdueSamples.slice(0, 5);
  }, []);

  // Overall stats
  const stats = useMemo(() => {
    const totalSamples = mockSamples.length;
    const inProgress = mockSamples.filter(s => s.approvalStatus === 'pending').length;
    const completed = mockSamples.filter(s => s.approvalStatus === 'approved').length;
    const delayed = mockSamples.filter(s => s.isDelayed).length;
    const totalOperators = MOCK_OPERATORS.length;

    return { totalSamples, inProgress, completed, delayed, totalOperators };
  }, []);

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
            <h1 className="text-2xl font-bold">Sampling Floor</h1>
            <p className="text-muted-foreground">
              Production floor management • {format(new Date(), 'EEEE, MMMM d')}
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[hsl(var(--primary))]/10 flex items-center justify-center">
                  <Layers className="h-5 w-5 text-[hsl(var(--primary))]" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalSamples}</p>
                  <p className="text-xs text-muted-foreground">Total Samples</p>
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
                  <p className="text-2xl font-bold">{stats.inProgress}</p>
                  <p className="text-xs text-muted-foreground">In Progress</p>
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
                  <p className="text-2xl font-bold">{stats.completed}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
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
                  <p className="text-2xl font-bold text-destructive">{stats.delayed}</p>
                  <p className="text-xs text-muted-foreground">Delayed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[hsl(var(--chart-2))]/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-[hsl(var(--chart-2))]" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalOperators}</p>
                  <p className="text-xs text-muted-foreground">Operators</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottleneck Alert */}
        {bottlenecks.length > 0 && (
          <Card className="border-destructive bg-destructive/5">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <AlertOctagon className="h-5 w-5 text-destructive" />
                <div className="flex-1">
                  <p className="font-medium text-destructive">Bottleneck Detected</p>
                  <p className="text-sm text-muted-foreground">
                    {bottlenecks.map(b => b.stage.label).join(', ')} {bottlenecks.length === 1 ? 'is' : 'are'} at high capacity. 
                    Consider redistributing workload or adding operators.
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="overview">Floor Overview</TabsTrigger>
                <TabsTrigger value="operators">Operator Workload</TabsTrigger>
                <TabsTrigger value="stages">Stage Management</TabsTrigger>
                <TabsTrigger value="bottlenecks" className="flex items-center gap-1">
                  <BarChart3 className="h-3 w-3" />
                  Bottleneck Analysis
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                {/* Production Stages */}
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">Production Stages</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {stageWorkloads.filter(sw => !isDecorationStage(sw.stage.id)).map(({ stage, queueSize, operatorCount, utilization, isBottleneck, estimatedClearTime }) => (
                    <Card 
                      key={stage.id}
                      className={cn(
                        'cursor-pointer transition-colors hover:border-primary',
                        isBottleneck && 'border-destructive'
                      )}
                      onClick={() => {
                        setSelectedStage(stage.id);
                        setActiveTab('stages');
                      }}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-medium">{stage.label}</CardTitle>
                          {isBottleneck && (
                            <Badge variant="destructive" className="text-xs">
                              <Zap className="h-3 w-3 mr-1" />
                              Bottleneck
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Queue</span>
                            <span className="font-medium">{queueSize} samples</span>
                          </div>
                          <Progress 
                            value={utilization} 
                            className={cn('h-2', isBottleneck && '[&>div]:bg-destructive')}
                          />
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{operatorCount} operators</span>
                            <span>{utilization}% capacity</span>
                          </div>
                          {estimatedClearTime > 0 && (
                            <p className="text-xs text-muted-foreground">
                              Est. clear time: {estimatedClearTime}d
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Decoration Stages */}
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">Decoration Processes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stageWorkloads.filter(sw => isDecorationStage(sw.stage.id)).map(({ stage, queueSize, operatorCount, utilization, isBottleneck, estimatedClearTime, samples }) => {
                    // Calculate deadline pressure
                    const overdueSamples = samples.filter(s => new Date(s.stageDeadline) < new Date());
                    
                    return (
                      <Card 
                        key={stage.id}
                        className={cn(
                          'cursor-pointer transition-colors hover:border-primary',
                          isBottleneck && 'border-destructive',
                          overdueSamples.length > 0 && !isBottleneck && 'border-[hsl(var(--status-delayed))]'
                        )}
                        onClick={() => {
                          setSelectedStage(stage.id);
                          setActiveTab('stages');
                        }}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium">{stage.label}</CardTitle>
                            <div className="flex gap-1">
                              {overdueSamples.length > 0 && (
                                <Badge variant="destructive" className="text-xs">
                                  {overdueSamples.length} late
                                </Badge>
                              )}
                              {isBottleneck && (
                                <Badge variant="destructive" className="text-xs">
                                  <Zap className="h-3 w-3 mr-1" />
                                  Bottleneck
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Queue</span>
                              <span className="font-medium">{queueSize} samples</span>
                            </div>
                            <Progress 
                              value={utilization} 
                              className={cn('h-2', isBottleneck && '[&>div]:bg-destructive')}
                            />
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{operatorCount} operators</span>
                              <span>{utilization}% capacity</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="operators" className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search operators..." 
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  {MOCK_OPERATORS
                    .filter(o => !searchQuery || o.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(operator => {
                      const stage = SAMPLING_STAGES.find(s => s.id === operator.skill);
                      const assignedSamples = samplesByStage[operator.skill]?.length || 0;
                      const utilization = Math.min(100, Math.round((assignedSamples / operator.capacity) * 100));

                      return (
                        <Card key={operator.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-[hsl(var(--primary))]">
                                  {operator.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="font-medium">{operator.name}</h4>
                                    <p className="text-xs text-muted-foreground">
                                      {stage?.label} • Capacity: {operator.capacity}/day
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-medium">{utilization}%</p>
                                    <p className="text-xs text-muted-foreground">load</p>
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
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              </TabsContent>

              <TabsContent value="stages" className="space-y-4">
                {/* Stage filter buttons - grouped */}
                <div className="space-y-2 mb-4">
                  <p className="text-xs text-muted-foreground font-medium">Production</p>
                  <div className="flex gap-2 flex-wrap">
                    {PRODUCTION_STAGES.map(stage => (
                      <Button
                        key={stage.id}
                        variant={selectedStage === stage.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedStage(stage.id)}
                      >
                        {stage.label}
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground font-medium mt-2">Decoration</p>
                  <div className="flex gap-2 flex-wrap">
                    {DECORATION_STAGES.map(stage => (
                      <Button
                        key={stage.id}
                        variant={selectedStage === stage.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedStage(stage.id)}
                      >
                        {stage.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {selectedStage && (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">
                          {SAMPLING_STAGES.find(s => s.id === selectedStage)?.label} Queue
                        </CardTitle>
                        <CardDescription>
                          {samplesByStage[selectedStage]?.length || 0} samples in this stage
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {(samplesByStage[selectedStage]?.length || 0) === 0 ? (
                          <div className="py-8 text-center text-muted-foreground">
                            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-[hsl(var(--status-completed))]" />
                            <p className="text-sm">No samples in this stage</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {samplesByStage[selectedStage]?.map(sample => {
                              const nextStage = sample.decorationTechnique 
                                ? getNextStage(sample.decorationTechnique, sample.currentStage) 
                                : null;
                              
                              return (
                                <div key={sample.id} className="space-y-2">
                                  <SampleStageCard sample={sample} />
                                  {nextStage && (
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="w-full gap-2"
                                      onClick={() => {
                                        console.log(`Advance ${sample.sampleNumber} to ${nextStage}`);
                                      }}
                                    >
                                      <ArrowRight className="h-3 w-3" />
                                      Advance to {SAMPLING_STAGES.find(s => s.id === nextStage)?.label || nextStage}
                                    </Button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="bottlenecks">
                <BottleneckAnalysisPanel 
                  report={bottleneckReport}
                  onSuggestionAction={(suggestion) => {
                    console.log('Apply suggestion:', suggestion);
                    // Future: implement suggestion application logic
                  }}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Compact Bottleneck Panel */}
            <BottleneckAnalysisPanel report={bottleneckReport} compact />

            {/* Urgent Items */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[hsl(var(--status-delayed))]" />
                  Overdue Samples
                </CardTitle>
                <CardDescription>Samples past their target date</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[250px]">
                  {urgentItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                      <CheckCircle2 className="h-8 w-8 mb-2 text-[hsl(var(--status-completed))]" />
                      <p className="text-sm">All on track!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {urgentItems.map(sample => (
                        <SampleStageCard key={sample.id} sample={sample} compact />
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Users className="h-4 w-4" />
                  Assign Operators
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <TrendingUp className="h-4 w-4" />
                  View Analytics
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Scissors className="h-4 w-4" />
                  Priority Queue
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SamplingFloorDashboard;
