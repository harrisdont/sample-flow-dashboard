import { useState, useMemo, useEffect } from 'react';
import { LoadingScreen } from '@/components/LoadingScreen';
import { LiveDashboard } from '@/components/LiveDashboard';
import { EJobCard } from '@/components/EJobCard';
import { SamplingBoard } from '@/components/SamplingBoard';
import { AddNewMenu } from '@/components/AddNewMenu';
import { MainNav } from '@/components/MainNav';
import { useSampleStore } from '@/data/sampleStore';
import { useCapsuleStore } from '@/data/capsuleCollectionData';
import { detectBottlenecks, StageConfig, OperatorData } from '@/lib/bottleneckDetector';
import { Collection, Sample, WorkloadMetrics } from '@/types/sample';
import { SampleStageCard } from '@/components/sampling/SampleStageCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LayoutGrid, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useCurrentUser } from '@/contexts/UserContext';
import { DirectorDashboardPanel } from '@/components/dashboard/DirectorDashboardPanel';
import { SeasonOverviewPanel } from '@/components/dashboard/SeasonOverviewPanel';
import { DesignLeadDashboardPanel } from '@/components/dashboard/DesignLeadDashboardPanel';
import { SamplingDashboardPanel } from '@/components/dashboard/SamplingDashboardPanel';
import { ROLE_CONFIG } from '@/types/user';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';

// Reuse stage/operator configs for bottleneck detection (same as SamplingFloorDashboard)
const SAMPLING_STAGES: StageConfig[] = [
  { id: 'pattern', label: 'Pattern Making', operatorType: 'Pattern Maker' },
  { id: 'semi-stitching', label: 'Semi Stitching', operatorType: 'Stitcher' },
  { id: 'complete-stitching', label: 'Complete Stitching', operatorType: 'Master Tailor' },
  { id: 'pakki', label: 'Pakki', operatorType: 'Pakki Operator' },
  { id: 'ari-dori', label: 'Ari/Dori', operatorType: 'Ari/Dori Operator' },
  { id: 'cottage-work', label: 'Cottage Work', operatorType: 'Cottage Worker' },
  { id: 'hand-finishes', label: 'Hand Finishes', operatorType: 'Finisher' },
  { id: 'multihead', label: 'Multihead', operatorType: 'Machine Operator' },
];

const MOCK_OPERATORS: OperatorData[] = [
  { id: 'op-1', name: 'Rashid Ali', skill: 'pattern', capacity: 8 },
  { id: 'op-2', name: 'Imran Khan', skill: 'semi-stitching', capacity: 10 },
  { id: 'op-3', name: 'Saleem Ahmed', skill: 'semi-stitching', capacity: 6 },
  { id: 'op-4', name: 'Farhan Malik', skill: 'complete-stitching', capacity: 4 },
  { id: 'op-5', name: 'Tariq Hassan', skill: 'multihead', capacity: 12 },
  { id: 'op-6', name: 'Naveed Shah', skill: 'pakki', capacity: 5 },
  { id: 'op-7', name: 'Waseem Akhtar', skill: 'ari-dori', capacity: 4 },
  { id: 'op-8', name: 'Jameel Bhatti', skill: 'cottage-work', capacity: 3 },
  { id: 'op-9', name: 'Kamran Yousuf', skill: 'hand-finishes', capacity: 6 },
];

type View = 'loading' | 'dashboard' | 'board' | 'ejob' | 'collection-detail';

const Index = () => {
  const [currentView, setCurrentView] = useState<View>('loading');
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);
  const [selectedCollectionName, setSelectedCollectionName] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  const samples = useSampleStore(state => state.samples);
  const capsules = useCapsuleStore(state => state.capsules);
  const { currentUser } = useCurrentUser();
  const userRole = currentUser?.role || 'director';

  // Ctrl+K to open search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen(open => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Compute live metrics
  const metrics: WorkloadMetrics = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const sampleData = samples.map(s => ({
      id: s.id,
      code: s.sampleNumber,
      currentStage: s.currentStage,
      targetDate: new Date(s.targetDate),
    }));
    const report = detectBottlenecks(sampleData, MOCK_OPERATORS, SAMPLING_STAGES);
    return {
      totalSamples: samples.length,
      dueToday: samples.filter(s => s.stageDeadline === today).length,
      overdue: samples.filter(s => s.stageDeadline < today && s.approvalStatus === 'pending').length,
      bottleneckAlert: report.bottlenecks[0]?.stageName || 'No bottlenecks',
    };
  }, [samples]);

  // Compute live collections from capsule store + sample store
  const collections: Collection[] = useMemo(() => {
    return Object.values(capsules).map(capsule => {
      const collSamples = samples.filter(s => s.collectionName === capsule.collectionName);
      const completed = collSamples.filter(s => s.approvalStatus === 'approved').length;
      const today = format(new Date(), 'yyyy-MM-dd');
      const hasOverdue = collSamples.some(s => s.stageDeadline < today && s.approvalStatus === 'pending');
      const latestSample = collSamples.reduce<Sample | null>((latest, s) => {
        if (!latest || s.stageEntryDate > latest.stageEntryDate) return s;
        return latest;
      }, null);

      return {
        name: capsule.collectionName,
        slot: capsule.lineId,
        totalSamples: collSamples.length,
        samplesCompleted: completed,
        status: collSamples.length === 0 ? 'Planning' : completed === collSamples.length ? 'Completed' : 'In Progress',
        location: latestSample?.currentStage || 'N/A',
        lastUpdate: latestSample?.stageEntryDate || 'N/A',
        delay: hasOverdue ? 1 : undefined,
      };
    });
  }, [capsules, samples]);

  const handleLoadingComplete = () => setCurrentView('dashboard');

  const handleScanSample = () => setSearchOpen(true);

  const handleCollectionClick = (collection: Collection) => {
    setSelectedCollectionName(collection.name);
    setCurrentView('collection-detail');
  };

  const handleSampleClick = (sample: Sample) => {
    setSelectedSample(sample);
    setCurrentView('ejob');
  };

  const handleBack = () => {
    setCurrentView('dashboard');
    setSelectedSample(null);
    setSelectedCollectionName(null);
  };

  if (currentView === 'loading') {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  if (currentView === 'ejob' && selectedSample) {
    return (
      <EJobCard
        sample={selectedSample}
        onBack={handleBack}
      />
    );
  }

  if (currentView === 'collection-detail' && selectedCollectionName) {
    const capsule = Object.values(capsules).find(c => c.collectionName === selectedCollectionName);
    const collSamples = samples.filter(s => s.collectionName === selectedCollectionName);
    const completed = collSamples.filter(s => s.approvalStatus === 'approved').length;
    const total = collSamples.length;

    return (
      <div className="min-h-screen bg-background">
        <MainNav />
        <div className="p-6">
          <Button variant="ghost" onClick={handleBack} className="mb-6 gap-2">
            ← Back to Dashboard
          </Button>
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <h1 className="text-2xl font-bold">{selectedCollectionName}</h1>
              {capsule && <Badge variant="outline">{capsule.lineName}</Badge>}
              <Badge
                className={cn(
                  total > 0 && completed === total
                    ? 'bg-[hsl(var(--status-completed))]'
                    : 'bg-[hsl(var(--status-in-progress))]',
                  'text-background'
                )}
              >
                {total === 0 ? 'Planning' : completed === total ? 'Completed' : 'In Progress'}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                {capsule && (
                  <div>
                    <p className="text-sm text-muted-foreground">Target In-Store Date</p>
                    <p className="font-medium">{format(capsule.targetInStoreDate, 'dd MMM yyyy')}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Total Samples</p>
                  <p className="text-3xl font-bold">{completed}/{total}</p>
                </div>
                {total > 0 && (
                  <>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {total > 0 ? Math.round((completed / total) * 100) : 0}% Complete
                    </p>
                  </>
                )}
              </div>
            </div>

            {collSamples.length > 0 ? (
              <div>
                <h2 className="text-lg font-semibold mb-3">Samples</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {collSamples.map(sample => (
                    <SampleStageCard
                      key={sample.id}
                      sample={sample}
                      onClick={() => handleSampleClick(sample)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No samples in this collection yet. Create designs to generate samples.</p>
            )}
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav>
        <AddNewMenu />
        <Button
          variant={currentView === 'board' ? 'default' : 'outline'}
          onClick={() => setCurrentView(currentView === 'board' ? 'dashboard' : 'board')}
          size="sm"
          className="gap-2"
        >
          <LayoutGrid className="h-4 w-4" />
          Heat Map
        </Button>
      </MainNav>

      {/* Sample Search Dialog */}
      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput placeholder="Search by sample number, designer, or collection..." />
        <CommandList>
          <CommandEmpty>No samples found.</CommandEmpty>
          <CommandGroup heading="Samples">
            {samples.map(sample => (
              <CommandItem
                key={sample.id}
                value={`${sample.sampleNumber} ${sample.designerName} ${sample.collectionName}`}
                onSelect={() => {
                  setSearchOpen(false);
                  handleSampleClick(sample);
                }}
              >
                <div className="flex items-center justify-between w-full">
                  <div>
                    <span className="font-medium">{sample.sampleNumber}</span>
                    <span className="text-muted-foreground ml-2 text-xs">{sample.designerName}</span>
                    <span className="text-muted-foreground ml-2 text-xs">· {sample.collectionName}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs ml-2">
                    {sample.currentStage}
                  </Badge>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      {currentView === 'dashboard' && (
        <div className="p-6 space-y-8">
          <header className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                {userRole === 'director' || userRole === 'category-manager'
                  ? 'Executive Dashboard'
                  : userRole === 'design-lead' || userRole === 'design-coordinator'
                  ? 'Design Pipeline'
                  : userRole === 'sampling-incharge'
                  ? 'Sampling Floor Dashboard'
                  : 'Live Dashboard'}
              </h1>
              <p className="text-muted-foreground">
                {currentUser ? `${ROLE_CONFIG[currentUser.role].label} · ${currentUser.name}` : 'Real-time production status'}
              </p>
            </div>
            <Button onClick={handleScanSample} size="lg" className="gap-2">
              <Search className="h-5 w-5" />
              Scan Sample
            </Button>
          </header>

          {/* Season-wide overview — visible to all roles */}
          <SeasonOverviewPanel />

          {(userRole === 'director' || userRole === 'category-manager') && (
            <DirectorDashboardPanel
              collections={collections}
              metrics={metrics}
              samples={samples}
              capsules={capsules}
              onCollectionClick={handleCollectionClick}
            />
          )}

          {(userRole === 'design-lead' || userRole === 'design-coordinator') && currentUser && (
            <DesignLeadDashboardPanel
              currentUser={currentUser}
              samples={samples}
              collections={collections}
              metrics={metrics}
              onSampleClick={handleSampleClick}
              onCollectionClick={handleCollectionClick}
            />
          )}

          {userRole === 'sampling-incharge' && (
            <SamplingDashboardPanel
              samples={samples}
              metrics={metrics}
              onSampleClick={handleSampleClick}
            />
          )}

          {userRole === 'sourcing-manager' && (
            <LiveDashboard
              collections={collections}
              metrics={metrics}
              onScanSample={handleScanSample}
              onCollectionClick={handleCollectionClick}
            />
          )}
        </div>
      )}

      {currentView === 'board' && (
        <SamplingBoard samples={samples} onSampleClick={handleSampleClick} />
      )}
    </div>
  );
};

export default Index;
