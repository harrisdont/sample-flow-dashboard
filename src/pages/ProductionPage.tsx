import { useState } from 'react';
import { MainNav } from '@/components/MainNav';
import { ProductionTab } from '@/components/production/ProductionTab';
import { ProductionCollectionView } from '@/components/production/ProductionCollectionView';
import { ProductionTechpack } from '@/components/production/ProductionTechpack';
import { useSampleStore } from '@/data/sampleStore';
import { useCapsuleStore } from '@/data/capsuleCollectionData';
import { Sample } from '@/types/sample';

type View = 'list' | 'collection' | 'techpack';

const ProductionPage = () => {
  const [view, setView] = useState<View>('list');
  const [selectedCollectionName, setSelectedCollectionName] = useState<string | null>(null);
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);

  const samples = useSampleStore(s => s.samples);
  const capsules = useCapsuleStore(s => s.capsules);

  const handleCollectionClick = (collectionName: string) => {
    setSelectedCollectionName(collectionName);
    setView('collection');
  };

  const handleOpenTechpack = (sample: Sample) => {
    setSelectedSample(sample);
    setView('techpack');
  };

  if (view === 'techpack' && selectedSample) {
    return (
      <div className="min-h-screen bg-background">
        <MainNav />
        <ProductionTechpack
          sample={selectedSample}
          onBack={() => {
            setSelectedSample(null);
            setView('collection');
          }}
        />
      </div>
    );
  }

  if (view === 'collection' && selectedCollectionName) {
    const capsule = Object.values(capsules).find(c => c.collectionName === selectedCollectionName);
    const collSamples = samples.filter(s => s.collectionName === selectedCollectionName);
    return (
      <div className="min-h-screen bg-background">
        <MainNav />
        <ProductionCollectionView
          collectionName={selectedCollectionName}
          capsule={capsule}
          samples={collSamples}
          onBack={() => {
            setSelectedCollectionName(null);
            setView('list');
          }}
          onOpenTechpack={handleOpenTechpack}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <ProductionTab onCollectionClick={handleCollectionClick} />
    </div>
  );
};

export default ProductionPage;
