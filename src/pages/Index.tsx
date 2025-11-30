import { useState } from 'react';
import { LoadingScreen } from '@/components/LoadingScreen';
import { LiveDashboard } from '@/components/LiveDashboard';
import { EJobCard } from '@/components/EJobCard';
import { SamplingBoard } from '@/components/SamplingBoard';
import { mockCollections, mockSamples, mockMetrics } from '@/data/mockData';
import { Sample } from '@/types/sample';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, LayoutGrid } from 'lucide-react';
import { toast } from 'sonner';

type View = 'loading' | 'dashboard' | 'board' | 'ejob';

const Index = () => {
  const [currentView, setCurrentView] = useState<View>('loading');
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);

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

  const handleCollectionClick = () => {
    toast.info('Collection Details', {
      description: 'Opening detailed collection view...',
    });
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

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-4 right-4 z-10 flex gap-2">
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
      </div>

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