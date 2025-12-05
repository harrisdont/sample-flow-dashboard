import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProductLine {
  id: string;
  name: string;
  color: string;
  assignedDesigns: number;
  status: 'planning' | 'in-progress' | 'completed';
}

const productLines: ProductLine[] = [
  { id: 'cottage', name: 'Cottage', color: 'bg-fashion-cottage', assignedDesigns: 0, status: 'planning' },
  { id: 'classic', name: 'Classic', color: 'bg-fashion-classic', assignedDesigns: 0, status: 'planning' },
  { id: 'formals', name: 'Formals', color: 'bg-fashion-formals', assignedDesigns: 0, status: 'planning' },
  { id: 'woman', name: 'Woman', color: 'bg-fashion-woman', assignedDesigns: 0, status: 'planning' },
  { id: 'ming', name: 'Ming', color: 'bg-fashion-ming', assignedDesigns: 0, status: 'planning' },
  { id: 'leather', name: 'Leather', color: 'bg-muted', assignedDesigns: 0, status: 'planning' },
  { id: 'regen', name: 'Regen', color: 'bg-muted', assignedDesigns: 0, status: 'planning' },
];

const getStatusVariant = (status: ProductLine['status']) => {
  switch (status) {
    case 'planning':
      return 'secondary';
    case 'in-progress':
      return 'default';
    case 'completed':
      return 'outline';
    default:
      return 'secondary';
  }
};

const getStatusLabel = (status: ProductLine['status']) => {
  switch (status) {
    case 'planning':
      return 'Planning';
    case 'in-progress':
      return 'In Progress';
    case 'completed':
      return 'Completed';
    default:
      return status;
  }
};

const SeasonalCollectionPlanning = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Seasonal Collection Planning</h1>
          <p className="text-muted-foreground mt-2">
            Manage and track designs across all product lines
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productLines.map((line) => (
            <Card
              key={line.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${line.color}`} />
                    <CardTitle className="text-lg">{line.name}</CardTitle>
                  </div>
                  <Badge variant={getStatusVariant(line.status)}>
                    {getStatusLabel(line.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Assigned Designs</span>
                    <span className="text-lg font-semibold text-foreground">
                      {line.assignedDesigns}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${line.color} opacity-60`}
                      style={{ width: '0%' }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    No designs assigned yet
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeasonalCollectionPlanning;
