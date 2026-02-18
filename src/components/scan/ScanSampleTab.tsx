import { useState, useRef, useEffect } from 'react';
import { useSampleStore } from '@/data/sampleStore';
import { Sample } from '@/types/sample';
import { ProductionTechpack } from '@/components/production/ProductionTechpack';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Scan, Search, Clock, History, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const STAGE_LABELS: Record<string, string> = {
  design: 'Design',
  pattern: 'Pattern',
  'semi-stitching': 'Semi Stitch',
  'complete-stitching': 'Complete Stitch',
  'hand-finishes': 'Hand Finishes',
  multihead: 'Multihead',
  'hand-embroidery': 'Hand Emb.',
  'motif-assignment': 'Motif Assign',
  'motif-review': 'Motif Review',
  approval: 'Approval',
};

interface RecentScan {
  sample: Sample;
  scannedAt: number;
}

export const ScanSampleTab = () => {
  const samples = useSampleStore(s => s.samples);

  const [query, setQuery] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [openSample, setOpenSample] = useState<Sample | null>(null);
  const [recentScans, setRecentScans] = useState<RecentScan[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the input on mount (enables immediate barcode scanning)
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleLookup = (code?: string) => {
    const searchCode = (code ?? query).trim().toUpperCase();
    if (!searchCode) return;

    const found = samples.find(
      s => s.sampleNumber.toUpperCase() === searchCode || s.id.toUpperCase() === searchCode
    );

    if (found) {
      setNotFound(false);
      setOpenSample(found);
      // Add to recent scans (deduplicate, max 6)
      setRecentScans(prev => {
        const filtered = prev.filter(r => r.sample.id !== found.id);
        return [{ sample: found, scannedAt: Date.now() }, ...filtered].slice(0, 6);
      });
      setQuery('');
    } else {
      setNotFound(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleLookup();
  };

  if (openSample) {
    return (
      <ProductionTechpack
        sample={openSample}
        onBack={() => {
          setOpenSample(null);
          // Re-focus after returning
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-4 pt-16 pb-8">
      {/* Hero scan area */}
      <div className="w-full max-w-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-primary/10 mb-2">
            <Scan className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Scan Sample</h1>
          <p className="text-muted-foreground text-sm">
            Scan a barcode / RFID tag, or type the sample number manually
          </p>
        </div>

        {/* Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
          <Input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setNotFound(false); }}
            onKeyDown={handleKeyDown}
            placeholder="e.g. WS2046 — press Enter or scan"
            className={cn(
              'pl-10 pr-24 h-14 text-base font-mono tracking-wider',
              notFound && 'border-destructive focus-visible:ring-destructive',
            )}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setNotFound(false); inputRef.current?.focus(); }}
              className="absolute right-16 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <Button
            onClick={() => handleLookup()}
            disabled={!query.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-10"
          >
            Open
          </Button>
        </div>

        {notFound && (
          <p className="text-center text-sm text-destructive">
            No sample found for <span className="font-mono font-semibold">"{query}"</span>.
            Check the number and try again.
          </p>
        )}

        {/* Quick hint */}
        <p className="text-center text-xs text-muted-foreground">
          Barcode / RFID scanners work automatically — they type the code and press Enter.
        </p>
      </div>

      {/* Recent Scans */}
      {recentScans.length > 0 && (
        <div className="w-full max-w-xl mt-12 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <History className="h-4 w-4" />
            Recent Scans (this session)
          </div>
          <div className="space-y-2">
            {recentScans.map(({ sample }) => (
              <Card
                key={sample.id}
                className="cursor-pointer hover:shadow-sm transition-shadow"
                onClick={() => setOpenSample(sample)}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-semibold text-sm">{sample.sampleNumber}</span>
                      <span className="text-xs text-muted-foreground">{sample.silhouetteName}</span>
                      <span className="text-xs text-muted-foreground">· {sample.collectionName}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{sample.designerName}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {STAGE_LABELS[sample.currentStage] || sample.currentStage}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Sample count hint */}
      <div className="mt-8 text-xs text-muted-foreground">
        {samples.length} sample{samples.length !== 1 ? 's' : ''} in the system
      </div>
    </div>
  );
};
