import { MainNav } from '@/components/MainNav';
import { ScanSampleTab } from '@/components/scan/ScanSampleTab';

const ScanPage = () => (
  <div className="min-h-screen bg-background">
    <MainNav />
    <ScanSampleTab />
  </div>
);

export default ScanPage;
