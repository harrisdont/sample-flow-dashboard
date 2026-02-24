import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import CapsuleCollectionPlanForm from './CapsuleCollectionPlanForm';

interface NewCollectionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PRODUCT_LINES = [
  { id: 'cottage', name: 'Cottage', color: 'bg-fashion-cottage' },
  { id: 'classic', name: 'Classic', color: 'bg-fashion-classic' },
  { id: 'formals', name: 'Formals', color: 'bg-fashion-formals' },
  { id: 'woman', name: 'Woman', color: 'bg-fashion-woman' },
  { id: 'ming', name: 'Ming', color: 'bg-fashion-ming' },
  { id: 'basic', name: 'Basic', color: 'bg-sky-500' },
  { id: 'semi-bridals', name: 'Semi Bridals', color: 'bg-rose-400' },
  { id: 'leather', name: 'Leather', color: 'bg-amber-600' },
  { id: 'regen', name: 'Regen', color: 'bg-emerald-600' },
];

export const NewCollectionForm = ({ open, onOpenChange }: NewCollectionFormProps) => {
  const [selectedLine, setSelectedLine] = useState<typeof PRODUCT_LINES[number] | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleLineSelect = (line: typeof PRODUCT_LINES[number]) => {
    setSelectedLine(line);
    onOpenChange(false);
    setSheetOpen(true);
  };

  const handleSheetClose = () => {
    setSheetOpen(false);
    setSelectedLine(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Collection — Select Product Line</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-3 py-4">
            {PRODUCT_LINES.map((line) => (
              <Button
                key={line.id}
                variant="outline"
                className="h-20 flex flex-col gap-1"
                onClick={() => handleLineSelect(line)}
              >
                <div className={`w-4 h-4 rounded-full ${line.color}`} />
                <span className="text-sm font-medium">{line.name}</span>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Plan Collection — {selectedLine?.name}</SheetTitle>
          </SheetHeader>
          {selectedLine && (
            <CapsuleCollectionPlanForm
              lineId={selectedLine.id}
              lineName={selectedLine.name}
              lineColor={selectedLine.color}
              allocatedDesigns={0}
              onClose={handleSheetClose}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
