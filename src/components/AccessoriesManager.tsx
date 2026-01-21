import { useState, useMemo } from 'react';
import { Plus, Search, Package, Edit2, Trash2, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  useAccessoryStore,
  Accessory,
  AccessoryType,
  ACCESSORY_TYPE_LABELS,
} from '@/data/accessoryStore';

const LOW_STOCK_THRESHOLD = 50;

interface AccessoryFormData {
  name: string;
  type: AccessoryType;
  quantityAvailable: number;
  costPerUnit: number;
  color: string;
  size: string;
  material: string;
  supplier: string;
  photo: string;
}

const defaultFormData: AccessoryFormData = {
  name: '',
  type: 'button',
  quantityAvailable: 0,
  costPerUnit: 0,
  color: '',
  size: '',
  material: '',
  supplier: '',
  photo: '',
};

export const AccessoriesManager = () => {
  const { accessories, addAccessory, updateAccessory, removeAccessory, updateQuantity } = useAccessoryStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingAccessory, setEditingAccessory] = useState<Accessory | null>(null);
  const [formData, setFormData] = useState<AccessoryFormData>(defaultFormData);
  const [stockAdjustment, setStockAdjustment] = useState<{ id: string; amount: number } | null>(null);

  // Filter and group accessories
  const filteredAccessories = useMemo(() => {
    return accessories.filter((acc) => {
      const matchesSearch =
        acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (acc.material && acc.material.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (acc.color && acc.color.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = filterType === 'all' || acc.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [accessories, searchQuery, filterType]);

  // Summary stats
  const stats = useMemo(() => {
    const total = accessories.length;
    const lowStock = accessories.filter((a) => a.quantityAvailable < LOW_STOCK_THRESHOLD).length;
    const outOfStock = accessories.filter((a) => a.quantityAvailable === 0).length;
    const totalValue = accessories.reduce((sum, a) => sum + a.quantityAvailable * a.costPerUnit, 0);
    return { total, lowStock, outOfStock, totalValue };
  }, [accessories]);

  // Group by type for display
  const groupedByType = useMemo(() => {
    const groups: Record<AccessoryType, Accessory[]> = {
      button: [],
      zipper: [],
      hook: [],
      snap: [],
      tassel: [],
      drawstring: [],
      dori: [],
      other: [],
    };
    filteredAccessories.forEach((acc) => {
      groups[acc.type].push(acc);
    });
    return groups;
  }, [filteredAccessories]);

  const handleAddSubmit = () => {
    if (!formData.name.trim()) {
      toast.error('Accessory name is required');
      return;
    }
    if (formData.costPerUnit <= 0) {
      toast.error('Cost per unit must be greater than 0');
      return;
    }

    addAccessory({
      name: formData.name.trim(),
      type: formData.type,
      quantityAvailable: formData.quantityAvailable,
      costPerUnit: formData.costPerUnit,
      color: formData.color || undefined,
      size: formData.size || undefined,
      material: formData.material || undefined,
      supplier: formData.supplier || undefined,
      photo: formData.photo || undefined,
    });

    toast.success('Accessory added successfully');
    setFormData(defaultFormData);
    setIsAddOpen(false);
  };

  const handleEditSubmit = () => {
    if (!editingAccessory) return;
    if (!formData.name.trim()) {
      toast.error('Accessory name is required');
      return;
    }

    updateAccessory(editingAccessory.id, {
      name: formData.name.trim(),
      type: formData.type,
      quantityAvailable: formData.quantityAvailable,
      costPerUnit: formData.costPerUnit,
      color: formData.color || undefined,
      size: formData.size || undefined,
      material: formData.material || undefined,
      supplier: formData.supplier || undefined,
      photo: formData.photo || undefined,
    });

    toast.success('Accessory updated successfully');
    setFormData(defaultFormData);
    setEditingAccessory(null);
  };

  const handleDelete = (id: string, name: string) => {
    removeAccessory(id);
    toast.success(`${name} removed from inventory`);
  };

  const handleStockAdjustment = () => {
    if (!stockAdjustment) return;
    updateQuantity(stockAdjustment.id, stockAdjustment.amount);
    toast.success('Stock quantity updated');
    setStockAdjustment(null);
  };

  const openEditDialog = (accessory: Accessory) => {
    setFormData({
      name: accessory.name,
      type: accessory.type,
      quantityAvailable: accessory.quantityAvailable,
      costPerUnit: accessory.costPerUnit,
      color: accessory.color || '',
      size: accessory.size || '',
      material: accessory.material || '',
      supplier: accessory.supplier || '',
      photo: accessory.photo || '',
    });
    setEditingAccessory(accessory);
  };

  const AccessoryForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            placeholder="e.g., Pearl White Buttons"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Type *</Label>
          <Select
            value={formData.type}
            onValueChange={(v) => setFormData({ ...formData, type: v as AccessoryType })}
          >
            <SelectTrigger id="type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ACCESSORY_TYPE_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="material">Material</Label>
          <Input
            id="material"
            placeholder="e.g., Pearl, Metal, Silk"
            value={formData.material}
            onChange={(e) => setFormData({ ...formData, material: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="color">Color</Label>
          <Input
            id="color"
            placeholder="e.g., White, Gold"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="size">Size</Label>
          <Input
            id="size"
            placeholder="e.g., 12mm, 22 inch"
            value={formData.size}
            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Initial Quantity</Label>
          <Input
            id="quantity"
            type="number"
            min="0"
            value={formData.quantityAvailable}
            onChange={(e) =>
              setFormData({ ...formData, quantityAvailable: parseInt(e.target.value) || 0 })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cost">Cost per Unit (PKR) *</Label>
          <Input
            id="cost"
            type="number"
            min="0"
            step="0.01"
            value={formData.costPerUnit}
            onChange={(e) =>
              setFormData({ ...formData, costPerUnit: parseFloat(e.target.value) || 0 })
            }
          />
        </div>

        <div className="col-span-2 space-y-2">
          <Label htmlFor="supplier">Supplier</Label>
          <Input
            id="supplier"
            placeholder="Supplier name"
            value={formData.supplier}
            onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
          />
        </div>

        <div className="col-span-2 space-y-2">
          <Label htmlFor="photo">Photo URL</Label>
          <Input
            id="photo"
            placeholder="https://..."
            value={formData.photo}
            onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
          />
        </div>
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button onClick={isEdit ? handleEditSubmit : handleAddSubmit}>
          {isEdit ? 'Save Changes' : 'Add Accessory'}
        </Button>
      </DialogFooter>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-3xl font-bold text-foreground">{stats.total}</p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Low Stock</p>
                <p className="text-3xl font-bold text-amber-600">{stats.lowStock}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-500/50" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Below {LOW_STOCK_THRESHOLD} units</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Out of Stock</p>
                <p className="text-3xl font-bold text-destructive">{stats.outOfStock}</p>
              </div>
              <Package className="h-8 w-8 text-destructive/50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inventory Value</p>
                <p className="text-2xl font-bold text-foreground">
                  PKR {stats.totalValue.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Add Button */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search accessories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {Object.entries(ACCESSORY_TYPE_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setFormData(defaultFormData)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Accessory
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Accessory</DialogTitle>
            </DialogHeader>
            <AccessoryForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Accessories Table */}
      <Card>
        <CardContent className="p-0">
          {filteredAccessories.length === 0 ? (
            <div className="py-12 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground">No accessories found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery || filterType !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Add accessories to your inventory'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Cost/Unit</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAccessories.map((accessory) => {
                  const isLowStock = accessory.quantityAvailable < LOW_STOCK_THRESHOLD;
                  const isOutOfStock = accessory.quantityAvailable === 0;

                  return (
                    <TableRow key={accessory.id}>
                      <TableCell>
                        {accessory.photo ? (
                          <img
                            src={accessory.photo}
                            alt={accessory.name}
                            className="w-10 h-10 rounded object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{accessory.name}</p>
                        {accessory.supplier && (
                          <p className="text-xs text-muted-foreground">{accessory.supplier}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{ACCESSORY_TYPE_LABELS[accessory.type]}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-0.5">
                          {accessory.material && <p>{accessory.material}</p>}
                          {(accessory.color || accessory.size) && (
                            <p className="text-muted-foreground">
                              {[accessory.color, accessory.size].filter(Boolean).join(' • ')}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span
                            className={`font-medium ${
                              isOutOfStock
                                ? 'text-destructive'
                                : isLowStock
                                ? 'text-amber-600'
                                : 'text-foreground'
                            }`}
                          >
                            {accessory.quantityAvailable}
                          </span>
                          {isLowStock && !isOutOfStock && (
                            <Badge variant="outline" className="text-amber-600 border-amber-300">
                              Low
                            </Badge>
                          )}
                          {isOutOfStock && (
                            <Badge variant="destructive">Out</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        PKR {accessory.costPerUnit}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Stock Adjustment Dialog */}
                          <Dialog
                            open={stockAdjustment?.id === accessory.id}
                            onOpenChange={(open) => !open && setStockAdjustment(null)}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setStockAdjustment({ id: accessory.id, amount: 0 })}
                              >
                                <Package className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-sm">
                              <DialogHeader>
                                <DialogTitle>Adjust Stock</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <p className="text-sm text-muted-foreground">
                                  Current stock: <strong>{accessory.quantityAvailable}</strong>
                                </p>
                                <div className="space-y-2">
                                  <Label>Adjustment Amount</Label>
                                  <Input
                                    type="number"
                                    placeholder="e.g., +100 or -50"
                                    value={stockAdjustment?.amount || 0}
                                    onChange={(e) =>
                                      setStockAdjustment({
                                        id: accessory.id,
                                        amount: parseInt(e.target.value) || 0,
                                      })
                                    }
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    Enter positive to add, negative to subtract
                                  </p>
                                </div>
                                <p className="text-sm">
                                  New quantity:{' '}
                                  <strong>
                                    {Math.max(
                                      0,
                                      accessory.quantityAvailable + (stockAdjustment?.amount || 0)
                                    )}
                                  </strong>
                                </p>
                              </div>
                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button onClick={handleStockAdjustment}>Update Stock</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          {/* Edit Dialog */}
                          <Dialog
                            open={editingAccessory?.id === accessory.id}
                            onOpenChange={(open) => !open && setEditingAccessory(null)}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(accessory)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg">
                              <DialogHeader>
                                <DialogTitle>Edit Accessory</DialogTitle>
                              </DialogHeader>
                              <AccessoryForm isEdit />
                            </DialogContent>
                          </Dialog>

                          {/* Delete Confirmation */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Accessory</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove "{accessory.name}" from inventory?
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(accessory.id, accessory.name)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Type Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(groupedByType).map(([type, items]) => {
          if (items.length === 0) return null;
          return (
            <Card key={type} className="bg-card/50">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{ACCESSORY_TYPE_LABELS[type as AccessoryType]}</p>
                  <Badge variant="secondary">{items.length}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {items.reduce((sum, a) => sum + a.quantityAvailable, 0)} units total
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
