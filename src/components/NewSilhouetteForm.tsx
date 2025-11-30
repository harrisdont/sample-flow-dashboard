import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface NewSilhouetteFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewSilhouetteForm = ({ open, onOpenChange }: NewSilhouetteFormProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Silhouette</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-muted-foreground">Silhouette creation form coming soon...</p>
        </div>
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
