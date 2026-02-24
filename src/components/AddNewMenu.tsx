import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, FileText, Layout, FolderOpen } from 'lucide-react';
import { NewDesignForm } from './NewDesignForm';
import { SilhouetteInductionForm } from './SilhouetteInductionForm';
import { NewCollectionForm } from './NewCollectionForm';

export const AddNewMenu = () => {
  const [designFormOpen, setDesignFormOpen] = useState(false);
  const [silhouetteFormOpen, setSilhouetteFormOpen] = useState(false);
  const [collectionFormOpen, setCollectionFormOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            Add New
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-card border-border">
          <DropdownMenuItem onClick={() => setDesignFormOpen(true)} className="gap-2 cursor-pointer">
            <FileText className="h-4 w-4" />
            New Design
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSilhouetteFormOpen(true)} className="gap-2 cursor-pointer">
            <Layout className="h-4 w-4" />
            New Silhouette
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setCollectionFormOpen(true)} className="gap-2 cursor-pointer">
            <FolderOpen className="h-4 w-4" />
            New Collection
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <NewDesignForm open={designFormOpen} onOpenChange={setDesignFormOpen} />
      <SilhouetteInductionForm open={silhouetteFormOpen} onOpenChange={setSilhouetteFormOpen} />
      <NewCollectionForm open={collectionFormOpen} onOpenChange={setCollectionFormOpen} />
    </>
  );
};
