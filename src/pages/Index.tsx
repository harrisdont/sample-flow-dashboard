import { useState } from 'react';
import { LoadingScreen } from '@/components/LoadingScreen';
import { LiveDashboard } from '@/components/LiveDashboard';
import { EJobCard } from '@/components/EJobCard';
import { SamplingBoard } from '@/components/SamplingBoard';
import { AddNewMenu } from '@/components/AddNewMenu';
import { MainNav } from '@/components/MainNav';
import { mockCollections, mockSamples, mockMetrics } from '@/data/mockData';
import { Collection, Sample } from '@/types/sample';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LayoutDashboard, LayoutGrid } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type View = 'loading' | 'dashboard' | 'board' | 'ejob' | 'collection-detail';

const Index = () => {
  const [currentView, setCurrentView] = useState<View>('loading');
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);

  const handleLoadingComplete = () => {
    setCurrentView('dashboard');
  };

  const handleScanSample = () => {
    toast.success('Sample scanned successfully', {
      description: 'Redirecting to sample details...',
    });
    setSelectedSample(mockSamples[0]);
    setCurrentView('ejob');
  };

  const handleCollectionClick = (collection: Collection) => {
    setSelectedCollection(collection);
    setCurrentView('collection-detail');
  };

  const handleSampleClick = (sample: Sample) => {
    setSelectedSample(sample);
    setCurrentView('ejob');
  };

  const handleApprove = () => {
    toast.success('Sample Approved', {
      description: `${selectedSample?.sampleNumber} has been approved successfully`,
    });
    setCurrentView('dashboard');
  };

  const handleReject = () => {
    toast.error('Sample Rejected', {
      description: `${selectedSample?.sampleNumber} sent back for redo`,
    });
    setCurrentView('dashboard');
  };

  const handleBack = () => {
    setCurrentView('dashboard');
    setSelectedSample(null);
    setSelectedCollection(null);
  };

  if (currentView === 'loading') {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  if (currentView === 'ejob' && selectedSample) {
    return (
      <EJobCard
        sample={selectedSample}
        onBack={handleBack}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    );
  }

  if (currentView === 'collection-detail' && selectedCollection) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Button variant="ghost" onClick={handleBack} className="mb-6 gap-2">
          ← Back to Dashboard
        </Button>
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <h1 className="text-2xl font-bold">{selectedCollection.name}</h1>
            <Badge variant="outline">Slot {selectedCollection.slot}</Badge>
            <Badge 
              className={cn(
                selectedCollection.delay ? 'bg-[hsl(var(--status-delayed))]' : 'bg-[hsl(var(--status-in-progress))]',
                'text-background'
              )}
            >
              {selectedCollection.status}
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">{selectedCollection.location}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Update</p>
                <p className="font-medium">{selectedCollection.lastUpdate}</p>
              </div>
              {selectedCollection.delay && (
                <div>
                  <p className="text-sm text-muted-foreground">Delay</p>
                  <p className="font-medium text-[hsl(var(--status-delayed))]">{selectedCollection.delay} minutes</p>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Samples</p>
                <p className="text-3xl font-bold">{selectedCollection.samplesCompleted}/{selectedCollection.totalSamples}</p>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all"
                  style={{ width: `${(selectedCollection.samplesCompleted / selectedCollection.totalSamples) * 100}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {Math.round((selectedCollection.samplesCompleted / selectedCollection.totalSamples) * 100)}% Complete
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav>
        <AddNewMenu />
        <Button
          variant={currentView === 'dashboard' ? 'default' : 'outline'}
          onClick={() => setCurrentView('dashboard')}
          size="sm"
          className="gap-2"
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Button>
        <Button
          variant={currentView === 'board' ? 'default' : 'outline'}
          onClick={() => setCurrentView('board')}
          size="sm"
          className="gap-2"
        >
          <LayoutGrid className="h-4 w-4" />
          Heat Map
        </Button>
      </MainNav>

      {currentView === 'dashboard' && (
        <LiveDashboard
          collections={mockCollections}
          metrics={mockMetrics}
          onScanSample={handleScanSample}
          onCollectionClick={handleCollectionClick}
        />
      )}

      {currentView === 'board' && (
        <SamplingBoard samples={mockSamples} onSampleClick={handleSampleClick} />
      )}
    </div>
  );
};

export default Index;