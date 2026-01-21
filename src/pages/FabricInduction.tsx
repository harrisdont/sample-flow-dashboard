import { useState, useMemo } from 'react';
import { Plus, Filter, Search, ChevronDown, ChevronRight, Layers, CheckCircle2, Clock, AlertTriangle, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useFabricStore, FABRIC_STATUS_CONFIG, COMPONENT_TYPE_LABELS, FABRIC_TYPE_LABELS, FabricStatus, FabricEntry } from '@/data/fabricStore';
import { FabricInductionForm } from '@/components/FabricInductionForm';
import { FabricStatusBoard } from '@/components/FabricStatusBoard';
import { AccessoriesManager } from '@/components/AccessoriesManager';
import { MainNav } from '@/components/MainNav';
import { differenceInDays } from 'date-fns';

const PRODUCT_LINES = [
  { id: 'woman', name: 'Woman', color: 'bg-pink-500' },
  { id: 'classic', name: 'Classic', color: 'bg-orange-500' },
  { id: 'cottage', name: 'Cottage', color: 'bg-yellow-500' },
  { id: 'formals', name: 'Formals', color: 'bg-purple-500' },
  { id: 'ming', name: 'Ming', color: 'bg-green-500' },
  { id: 'basic', name: 'Basic', color: 'bg-sky-500' },
  { id: 'semi-bridals', name: 'Semi Bridals', color: 'bg-rose-500' },
];

const FabricInduction = () => {
  const { fabrics, getSeasonFabricSummary } = useFabricStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLine, setSelectedLine] = useState<string>('all');
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set());
  const [isAddFabricOpen, setIsAddFabricOpen] = useState(false);
  const [selectedFabric, setSelectedFabric] = useState<FabricEntry | null>(null);
  
  const summary = useMemo(() => getSeasonFabricSummary(), [fabrics]);
  
  // Group fabrics by collection
  const fabricsByCollection = useMemo(() => {
    const filtered = fabrics.filter((fab) => {
      const matchesSearch = 
        fab.fabricName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fab.collectionName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLine = selectedLine === 'all' || fab.lineId === selectedLine;
      return matchesSearch && matchesLine;
    });
    
    const grouped = new Map<string, { collection: { id: string; name: string; lineId: string; lineName: string; lineColor: string }; fabrics: FabricEntry[] }>();
    
    filtered.forEach((fab) => {
      if (!grouped.has(fab.collectionId)) {
        grouped.set(fab.collectionId, {
          collection: {
            id: fab.collectionId,
            name: fab.collectionName,
            lineId: fab.lineId,
            lineName: fab.lineName,
            lineColor: fab.lineColor,
          },
          fabrics: [],
        });
      }
      grouped.get(fab.collectionId)!.fabrics.push(fab);
    });
    
    return Array.from(grouped.values());
  }, [fabrics, searchQuery, selectedLine]);
  
  const toggleCollection = (collectionId: string) => {
    setExpandedCollections((prev) => {
      const next = new Set(prev);
      if (next.has(collectionId)) {
        next.delete(collectionId);
      } else {
        next.add(collectionId);
      }
      return next;
    });
  };
  
  const getDeadlineStatus = (deadline?: Date) => {
    if (!deadline) return null;
    const daysUntil = differenceInDays(deadline, new Date());
    if (daysUntil < 0) return { status: 'overdue', label: `${Math.abs(daysUntil)}d overdue`, color: 'text-destructive' };
    if (daysUntil === 0) return { status: 'today', label: 'Due today', color: 'text-amber-600' };
    if (daysUntil <= 7) return { status: 'soon', label: `${daysUntil}d left`, color: 'text-amber-500' };
    return { status: 'ok', label: `${daysUntil}d left`, color: 'text-muted-foreground' };
  };
  
  const inductedPercentage = summary.total > 0 ? (summary.inducted / summary.total) * 100 : 0;
  
  return (
    <div className="min-h-screen bg-background">
      <MainNav>
        <Dialog open={isAddFabricOpen} onOpenChange={setIsAddFabricOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Fabric
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Fabric</DialogTitle>
            </DialogHeader>
            <FabricInductionForm onClose={() => setIsAddFabricOpen(false)} />
          </DialogContent>
        </Dialog>
      </MainNav>
      
      <div className="container mx-auto px-6 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Fabric Induction</h1>
          <p className="text-sm text-muted-foreground">Track and induct fabrics for the season</p>
        </div>
        
        <div className="space-y-6">
        {/* Season Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Fabrics</p>
                  <p className="text-3xl font-bold text-foreground">{summary.total}</p>
                </div>
                <Layers className="h-8 w-8 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Inducted</p>
                  <p className="text-3xl font-bold text-green-600">{summary.inducted}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500/50" />
              </div>
              <Progress value={inductedPercentage} className="mt-3 h-2" />
              <p className="text-xs text-muted-foreground mt-1">{inductedPercentage.toFixed(0)}% complete</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-3xl font-bold text-amber-600">
                    {summary.byStatus['in-base-treatment'] + summary.byStatus['in-surface-treatment']}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-amber-500/50" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Action</p>
                  <p className="text-3xl font-bold text-rose-600">
                    {summary.byStatus['pending-artwork'] + summary.byStatus['pending-dye-plan'] + summary.byStatus['pending-print-plan']}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-rose-500/50" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Status Breakdown */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-3">
              {Object.entries(FABRIC_STATUS_CONFIG).map(([status, config]) => (
                <div key={status} className="flex items-center gap-2">
                  <Badge variant="outline" className={config.color}>
                    {summary.byStatus[status as FabricStatus] || 0}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{config.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Main Content Tabs */}
        <Tabs defaultValue="collections" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="collections">By Collection</TabsTrigger>
              <TabsTrigger value="status-board">Status Board</TabsTrigger>
              <TabsTrigger value="accessories" className="gap-2">
                <Package className="h-4 w-4" />
                Accessories
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search fabrics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <Select value={selectedLine} onValueChange={setSelectedLine}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by line" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Lines</SelectItem>
                  {PRODUCT_LINES.map((line) => (
                    <SelectItem key={line.id} value={line.id}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${line.color}`} />
                        {line.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <TabsContent value="collections" className="space-y-4">
            {fabricsByCollection.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Layers className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium text-foreground">No fabrics found</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {searchQuery || selectedLine !== 'all' 
                      ? 'Try adjusting your filters'
                      : 'Add fabrics from your collections to get started'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              fabricsByCollection.map(({ collection, fabrics: collectionFabrics }) => {
                const isExpanded = expandedCollections.has(collection.id);
                const inductedCount = collectionFabrics.filter((f) => f.status === 'inducted').length;
                const progress = (inductedCount / collectionFabrics.length) * 100;
                
                return (
                  <Collapsible
                    key={collection.id}
                    open={isExpanded}
                    onOpenChange={() => toggleCollection(collection.id)}
                  >
                    <Card>
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {isExpanded ? (
                                <ChevronDown className="h-5 w-5 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                              )}
                              <div className={`w-4 h-4 rounded-full ${collection.lineColor}`} />
                              <div>
                                <CardTitle className="text-lg">{collection.name}</CardTitle>
                                <p className="text-sm text-muted-foreground">{collection.lineName}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-sm font-medium text-foreground">
                                  {inductedCount} / {collectionFabrics.length} inducted
                                </p>
                                <Progress value={progress} className="w-32 h-2 mt-1" />
                              </div>
                              
                              <div className="flex gap-1">
                                {Object.entries(FABRIC_STATUS_CONFIG).map(([status, config]) => {
                                  const count = collectionFabrics.filter((f) => f.status === status).length;
                                  if (count === 0) return null;
                                  return (
                                    <Tooltip key={status}>
                                      <TooltipTrigger>
                                        <Badge variant="outline" className={`${config.color} text-xs`}>
                                          {count}
                                        </Badge>
                                      </TooltipTrigger>
                                      <TooltipContent>{config.label}</TooltipContent>
                                    </Tooltip>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent>
                        <CardContent className="pt-0">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Component</TableHead>
                                <TableHead>Fabric</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Deadline</TableHead>
                                <TableHead>Specs</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {collectionFabrics.map((fabric) => {
                                const deadlineStatus = getDeadlineStatus(fabric.fabricDeadline);
                                const hasSpecs = !!fabric.technicalSpecs;
                                
                                return (
                                  <TableRow key={fabric.id}>
                                    <TableCell className="font-medium">
                                      {COMPONENT_TYPE_LABELS[fabric.componentType]}
                                    </TableCell>
                                    <TableCell>
                                      <div>
                                        <p className="font-medium">{fabric.fabricName}</p>
                                        <p className="text-xs text-muted-foreground">{fabric.fabricComposition}</p>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant="outline">
                                        {FABRIC_TYPE_LABELS[fabric.fabricType]}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      <Badge 
                                        variant="outline" 
                                        className={FABRIC_STATUS_CONFIG[fabric.status].color}
                                      >
                                        {FABRIC_STATUS_CONFIG[fabric.status].label}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      {deadlineStatus ? (
                                        <span className={`text-sm ${deadlineStatus.color}`}>
                                          {deadlineStatus.label}
                                        </span>
                                      ) : (
                                        <span className="text-sm text-muted-foreground">—</span>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      {hasSpecs ? (
                                        <Tooltip>
                                          <TooltipTrigger>
                                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                                          </TooltipTrigger>
                                          <TooltipContent className="max-w-xs">
                                            <div className="space-y-1 text-xs">
                                              <p><strong>Width:</strong> {fabric.technicalSpecs?.fabricWidth}</p>
                                              <p><strong>Cost:</strong> PKR {fabric.technicalSpecs?.costPerMeter}/m</p>
                                              <p><strong>Shrinkage:</strong> {fabric.technicalSpecs?.shrinkageMargin}</p>
                                            </div>
                                          </TooltipContent>
                                        </Tooltip>
                                      ) : (
                                        <span className="text-muted-foreground">—</span>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <Dialog>
                                        <DialogTrigger asChild>
                                          <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => setSelectedFabric(fabric)}
                                          >
                                            {fabric.status === 'ready-for-induction' ? 'Induct' : 'View'}
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                          <DialogHeader>
                                            <DialogTitle>
                                              {fabric.status === 'ready-for-induction' 
                                                ? 'Induct Fabric' 
                                                : 'Fabric Details'}
                                            </DialogTitle>
                                          </DialogHeader>
                                          <FabricInductionForm 
                                            fabric={fabric} 
                                            onClose={() => setSelectedFabric(null)} 
                                          />
                                        </DialogContent>
                                      </Dialog>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                );
              })
            )}
          </TabsContent>
          
          <TabsContent value="status-board">
            <FabricStatusBoard 
              fabrics={fabrics.filter((fab) => {
                const matchesSearch = 
                  fab.fabricName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  fab.collectionName.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesLine = selectedLine === 'all' || fab.lineId === selectedLine;
                return matchesSearch && matchesLine;
              })}
            />
          </TabsContent>
          
          <TabsContent value="accessories">
            <AccessoriesManager />
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </div>
  );
};

export default FabricInduction;
