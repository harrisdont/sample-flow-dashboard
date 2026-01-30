import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, LayoutGrid, Columns, Plus, Filter, Scissors } from 'lucide-react';
import { useSilhouetteStore, SILHOUETTE_STATUS_CONFIG, SILHOUETTE_CATEGORY_LABELS, SilhouetteStatus, SilhouetteCategory } from '@/data/silhouetteStore';
import { SilhouetteCard } from '@/components/SilhouetteCard';
import { SilhouetteStatusBoard } from '@/components/SilhouetteStatusBoard';
import { EmptyState } from '@/components/ui/empty-state';

interface SilhouetteLibraryProps {
  onAddNew: () => void;
}

export const SilhouetteLibrary = ({ onAddNew }: SilhouetteLibraryProps) => {
  const { silhouettes } = useSilhouetteStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<SilhouetteCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<SilhouetteStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'board'>('grid');

  const allSilhouettes = useMemo(() => Object.values(silhouettes), [silhouettes]);

  const filteredSilhouettes = useMemo(() => {
    return allSilhouettes.filter((silhouette) => {
      const matchesSearch =
        searchQuery === '' ||
        silhouette.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        silhouette.code.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory =
        categoryFilter === 'all' || silhouette.category === categoryFilter;
      
      const matchesStatus =
        statusFilter === 'all' || silhouette.status === statusFilter;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [allSilhouettes, searchQuery, categoryFilter, statusFilter]);

  // Summary stats
  const stats = useMemo(() => {
    const byStatus: Record<SilhouetteStatus, number> = {
      'sketch-submitted': 0,
      'in-pattern': 0,
      'sample-ready': 0,
      'approved': 0,
      'rejected': 0,
    };
    
    allSilhouettes.forEach((s) => {
      byStatus[s.status]++;
    });
    
    return {
      total: allSilhouettes.length,
      byStatus,
    };
  }, [allSilhouettes]);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {(Object.keys(SILHOUETTE_STATUS_CONFIG) as SilhouetteStatus[]).map((status) => (
          <Card key={status} className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {SILHOUETTE_STATUS_CONFIG[status].label}
                </span>
                <Badge
                  variant="outline"
                  style={{ 
                    borderColor: SILHOUETTE_STATUS_CONFIG[status].color,
                    color: SILHOUETTE_STATUS_CONFIG[status].color,
                  }}
                >
                  {stats.byStatus[status]}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and View Toggle */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-4 items-center w-full md:w-auto">
              <div className="relative flex-1 md:max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search silhouettes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as SilhouetteCategory | 'all')}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {(Object.keys(SILHOUETTE_CATEGORY_LABELS) as SilhouetteCategory[]).map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {SILHOUETTE_CATEGORY_LABELS[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as SilhouetteStatus | 'all')}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {(Object.keys(SILHOUETTE_STATUS_CONFIG) as SilhouetteStatus[]).map((status) => (
                    <SelectItem key={status} value={status}>
                      {SILHOUETTE_STATUS_CONFIG[status].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'board' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('board')}
              >
                <Columns className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {viewMode === 'grid' ? (
        filteredSilhouettes.length === 0 ? (
          <Card>
            <CardContent className="p-0">
              <EmptyState
                icon={Scissors}
                title={searchQuery ? 'No matching silhouettes' : 'No silhouettes yet'}
                description={
                  searchQuery
                    ? 'Try adjusting your search or filters to find what you\'re looking for.'
                    : 'Start building your silhouette library by adding your first design.'
                }
                actions={
                  searchQuery
                    ? [
                        { label: 'Clear Filters', onClick: () => { setSearchQuery(''); setCategoryFilter('all'); setStatusFilter('all'); }, variant: 'outline' },
                        { label: 'Add Silhouette', onClick: onAddNew },
                      ]
                    : [{ label: 'Add First Silhouette', onClick: onAddNew }]
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredSilhouettes.map((silhouette) => (
              <SilhouetteCard key={silhouette.id} silhouette={silhouette} />
            ))}
          </div>
        )
      ) : (
        <SilhouetteStatusBoard silhouettes={filteredSilhouettes} />
      )}
    </div>
  );
};
