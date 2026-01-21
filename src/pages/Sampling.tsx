import { useState } from 'react';
import { MainNav } from '@/components/MainNav';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Scissors, PenTool } from 'lucide-react';
import { SilhouetteLibrary } from '@/components/SilhouetteLibrary';
import { SilhouetteInductionForm } from '@/components/SilhouetteInductionForm';
import { DesignsTab } from '@/components/DesignsTab';

const Sampling = () => {
  const [activeTab, setActiveTab] = useState('silhouettes');
  const [isAddSilhouetteOpen, setIsAddSilhouetteOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <MainNav>
        {activeTab === 'silhouettes' && (
          <Button size="sm" className="gap-2" onClick={() => setIsAddSilhouetteOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Silhouette
          </Button>
        )}
      </MainNav>

      <div className="container mx-auto px-6 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Sampling</h1>
          <p className="text-muted-foreground">
            Manage silhouette induction and design submissions
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="silhouettes" className="gap-2">
              <Scissors className="h-4 w-4" />
              Silhouettes
            </TabsTrigger>
            <TabsTrigger value="designs" className="gap-2">
              <PenTool className="h-4 w-4" />
              Designs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="silhouettes">
            <SilhouetteLibrary onAddNew={() => setIsAddSilhouetteOpen(true)} />
          </TabsContent>

          <TabsContent value="designs">
            <DesignsTab />
          </TabsContent>
        </Tabs>
      </div>

      <SilhouetteInductionForm
        open={isAddSilhouetteOpen}
        onOpenChange={setIsAddSilhouetteOpen}
      />
    </div>
  );
};

export default Sampling;
