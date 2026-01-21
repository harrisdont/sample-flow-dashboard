import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Plus, Pencil, Trash2, Search, Palette } from 'lucide-react';
import { 
  useColorPaletteStore, 
  InternalColor, 
  ColorCategory,
  COLOR_CATEGORY_LABELS 
} from '@/data/colorPaletteStore';

interface ColorPaletteManagerProps {
  trigger?: React.ReactNode;
}

export const ColorPaletteManager = ({ trigger }: ColorPaletteManagerProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [editingColor, setEditingColor] = useState<InternalColor | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const { colors, addColor, updateColor, deleteColor, searchColors, getColorsByCategory } = useColorPaletteStore();
  
  const filteredColors = search ? searchColors(search) : colors;
  
  const categories: ColorCategory[] = [
    'neutrals',
    'pastels',
    'brights',
    'earth-tones',
    'jewel-tones',
    'metallics',
  ];
  
  const handleDelete = (id: string) => {
    deleteColor(id);
    toast.success('Color deleted');
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Palette className="h-4 w-4 mr-2" />
            Manage Colors
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Internal Color Palette
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex items-center gap-3 py-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search colors by name, hex, or Pantone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button onClick={() => { setShowAddForm(true); setEditingColor(null); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Color
          </Button>
        </div>
        
        {(showAddForm || editingColor) && (
          <ColorForm 
            color={editingColor}
            onSave={(colorData) => {
              if (editingColor) {
                updateColor(editingColor.id, colorData);
                toast.success('Color updated');
              } else {
                addColor(colorData);
                toast.success('Color added');
              }
              setEditingColor(null);
              setShowAddForm(false);
            }}
            onCancel={() => {
              setEditingColor(null);
              setShowAddForm(false);
            }}
          />
        )}
        
        <div className="flex-1 min-h-0">
          {search ? (
            <ScrollArea className="h-[400px]">
              <div className="grid grid-cols-6 gap-3 p-2">
                {filteredColors.map((color) => (
                  <ColorCard 
                    key={color.id} 
                    color={color}
                    onEdit={() => { setEditingColor(color); setShowAddForm(false); }}
                    onDelete={() => handleDelete(color.id)}
                  />
                ))}
              </div>
              {filteredColors.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No colors found matching "{search}"
                </p>
              )}
            </ScrollArea>
          ) : (
            <Tabs defaultValue="neutrals" className="h-full flex flex-col">
              <TabsList className="justify-start flex-wrap h-auto gap-1">
                {categories.map((cat) => (
                  <TabsTrigger key={cat} value={cat} className="text-xs">
                    {COLOR_CATEGORY_LABELS[cat]} ({getColorsByCategory(cat).length})
                  </TabsTrigger>
                ))}
              </TabsList>
              {categories.map((cat) => (
                <TabsContent key={cat} value={cat} className="flex-1 m-0 mt-2">
                  <ScrollArea className="h-[350px]">
                    <div className="grid grid-cols-6 gap-3 p-2">
                      {getColorsByCategory(cat).map((color) => (
                        <ColorCard 
                          key={color.id} 
                          color={color}
                          onEdit={() => { setEditingColor(color); setShowAddForm(false); }}
                          onDelete={() => handleDelete(color.id)}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
        
        <div className="flex justify-between items-center pt-2 border-t border-border text-sm text-muted-foreground">
          <span>{colors.length} colors in palette</span>
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface ColorCardProps {
  color: InternalColor;
  onEdit: () => void;
  onDelete: () => void;
}

const ColorCard = ({ color, onEdit, onDelete }: ColorCardProps) => {
  return (
    <div className="group relative flex flex-col items-center p-2 rounded-lg border border-border hover:bg-muted/50 transition-colors">
      <div 
        className="w-12 h-12 rounded-full border border-border shadow-sm mb-2"
        style={{ backgroundColor: color.hexCode }}
      />
      <p className="text-xs font-medium text-center truncate w-full">{color.name}</p>
      <p className="text-[10px] text-muted-foreground">{color.hexCode}</p>
      {color.pantoneCode && (
        <p className="text-[10px] text-muted-foreground truncate w-full text-center">
          {color.pantoneCode}
        </p>
      )}
      
      <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6"
          onClick={onEdit}
        >
          <Pencil className="h-3 w-3" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 text-destructive hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

interface ColorFormProps {
  color?: InternalColor | null;
  onSave: (color: Omit<InternalColor, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const ColorForm = ({ color, onSave, onCancel }: ColorFormProps) => {
  const [name, setName] = useState(color?.name || '');
  const [hexCode, setHexCode] = useState(color?.hexCode || '#000000');
  const [pantoneCode, setPantoneCode] = useState(color?.pantoneCode || '');
  const [category, setCategory] = useState<ColorCategory>(color?.category || 'neutrals');
  
  const handleSubmit = () => {
    if (!name.trim() || !hexCode) {
      toast.error('Name and hex code are required');
      return;
    }
    onSave({ name: name.trim(), hexCode, pantoneCode: pantoneCode.trim() || undefined, category });
  };
  
  return (
    <div className="p-4 rounded-lg border border-border bg-muted/30 space-y-4">
      <div className="flex items-center gap-4">
        <div className="space-y-2">
          <Label>Preview</Label>
          <div 
            className="w-16 h-16 rounded-lg border border-border shadow-sm"
            style={{ backgroundColor: hexCode }}
          />
        </div>
        
        <div className="flex-1 grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Color Name *</Label>
            <Input 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Dusty Rose"
            />
          </div>
          <div className="space-y-2">
            <Label>Hex Code *</Label>
            <div className="flex gap-2">
              <input 
                type="color"
                value={hexCode}
                onChange={(e) => setHexCode(e.target.value)}
                className="h-9 w-12 rounded border border-input cursor-pointer"
              />
              <Input 
                value={hexCode}
                onChange={(e) => setHexCode(e.target.value)}
                placeholder="#FFFFFF"
                className="flex-1"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Pantone Code</Label>
            <Input 
              value={pantoneCode}
              onChange={(e) => setPantoneCode(e.target.value)}
              placeholder="e.g., 15-1415 TCX"
            />
          </div>
          <div className="space-y-2">
            <Label>Category *</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as ColorCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(COLOR_CATEGORY_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
        <Button size="sm" onClick={handleSubmit}>
          {color ? 'Update' : 'Add'} Color
        </Button>
      </div>
    </div>
  );
};
