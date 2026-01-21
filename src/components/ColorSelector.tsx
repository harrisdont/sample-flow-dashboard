import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Search, Palette, X } from 'lucide-react';
import { 
  useColorPaletteStore, 
  InternalColor, 
  ColorCategory,
  COLOR_CATEGORY_LABELS 
} from '@/data/colorPaletteStore';

interface ColorSelectorProps {
  value?: string;
  onChange: (colorId: string | undefined) => void;
  onManageClick?: () => void;
}

export const ColorSelector = ({ value, onChange, onManageClick }: ColorSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { colors, getColorById, searchColors, getColorsByCategory } = useColorPaletteStore();
  
  const selectedColor = value ? getColorById(value) : undefined;
  const filteredColors = search ? searchColors(search) : colors;
  
  const categories: ColorCategory[] = [
    'neutrals',
    'pastels',
    'brights',
    'earth-tones',
    'jewel-tones',
    'metallics',
  ];
  
  const handleSelect = (color: InternalColor) => {
    onChange(color.id);
    setOpen(false);
    setSearch('');
  };
  
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !selectedColor && "text-muted-foreground"
          )}
        >
          {selectedColor ? (
            <div className="flex items-center gap-2 flex-1">
              <div 
                className="w-5 h-5 rounded-full border border-border shadow-sm"
                style={{ backgroundColor: selectedColor.hexCode }}
              />
              <span className="flex-1 truncate">{selectedColor.name}</span>
              {selectedColor.pantoneCode && (
                <span className="text-xs text-muted-foreground">
                  {selectedColor.pantoneCode}
                </span>
              )}
              <X 
                className="h-4 w-4 text-muted-foreground hover:text-foreground" 
                onClick={handleClear}
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span>Select color from palette</span>
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-popover" align="start">
        <div className="p-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search colors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        
        {search ? (
          <ScrollArea className="h-64">
            <div className="p-2">
              {filteredColors.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No colors found
                </p>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {filteredColors.map((color) => (
                    <ColorSwatch 
                      key={color.id} 
                      color={color} 
                      isSelected={value === color.id}
                      onClick={() => handleSelect(color)}
                    />
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        ) : (
          <Tabs defaultValue="neutrals" className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent p-0 h-auto flex-wrap">
              {categories.map((cat) => (
                <TabsTrigger 
                  key={cat} 
                  value={cat}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-2 py-1.5 text-xs"
                >
                  {COLOR_CATEGORY_LABELS[cat]}
                </TabsTrigger>
              ))}
            </TabsList>
            {categories.map((cat) => (
              <TabsContent key={cat} value={cat} className="m-0">
                <ScrollArea className="h-48">
                  <div className="p-2 grid grid-cols-4 gap-2">
                    {getColorsByCategory(cat).map((color) => (
                      <ColorSwatch 
                        key={color.id} 
                        color={color}
                        isSelected={value === color.id}
                        onClick={() => handleSelect(color)}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        )}
        
        {onManageClick && (
          <div className="p-2 border-t border-border">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-xs"
              onClick={() => {
                setOpen(false);
                onManageClick();
              }}
            >
              <Palette className="h-3 w-3 mr-1" />
              Manage Color Palette
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

interface ColorSwatchProps {
  color: InternalColor;
  isSelected: boolean;
  onClick: () => void;
}

const ColorSwatch = ({ color, isSelected, onClick }: ColorSwatchProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex flex-col items-center gap-1 p-1.5 rounded-lg transition-colors hover:bg-muted",
        isSelected && "ring-2 ring-primary bg-muted"
      )}
      title={`${color.name}${color.pantoneCode ? ` (${color.pantoneCode})` : ''}`}
    >
      <div 
        className={cn(
          "w-8 h-8 rounded-full border shadow-sm transition-transform group-hover:scale-110",
          isSelected ? "border-primary border-2" : "border-border"
        )}
        style={{ backgroundColor: color.hexCode }}
      />
      <span className="text-[10px] text-muted-foreground truncate w-full text-center">
        {color.name}
      </span>
    </button>
  );
};
