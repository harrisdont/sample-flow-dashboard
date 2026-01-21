import { create } from 'zustand';

export interface InternalColor {
  id: string;
  name: string;
  hexCode: string;
  pantoneCode?: string;
  category: ColorCategory;
  createdAt: Date;
  updatedAt: Date;
}

export type ColorCategory = 
  | 'neutrals'
  | 'pastels'
  | 'brights'
  | 'earth-tones'
  | 'jewel-tones'
  | 'metallics';

export const COLOR_CATEGORY_LABELS: Record<ColorCategory, string> = {
  'neutrals': 'Neutrals',
  'pastels': 'Pastels',
  'brights': 'Brights',
  'earth-tones': 'Earth Tones',
  'jewel-tones': 'Jewel Tones',
  'metallics': 'Metallics',
};

// Pre-populated internal color palette (60+ colors)
const defaultColors: InternalColor[] = [
  // Neutrals (12 colors)
  { id: 'col-001', name: 'Pure White', hexCode: '#FFFFFF', pantoneCode: '11-0601 TCX', category: 'neutrals', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-002', name: 'Off White', hexCode: '#FAF9F6', pantoneCode: '11-0602 TCX', category: 'neutrals', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-003', name: 'Ivory Cream', hexCode: '#FFFDD0', pantoneCode: '11-0107 TCX', category: 'neutrals', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-004', name: 'Pearl Grey', hexCode: '#E8E8E8', pantoneCode: '13-4103 TCX', category: 'neutrals', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-005', name: 'Silver Mist', hexCode: '#C0C0C0', pantoneCode: '14-4102 TCX', category: 'neutrals', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-006', name: 'Dove Grey', hexCode: '#A9A9A9', pantoneCode: '16-3802 TCX', category: 'neutrals', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-007', name: 'Charcoal', hexCode: '#36454F', pantoneCode: '19-3906 TCX', category: 'neutrals', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-008', name: 'Jet Black', hexCode: '#0A0A0A', pantoneCode: '19-4007 TCX', category: 'neutrals', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-009', name: 'Beige', hexCode: '#F5F5DC', pantoneCode: '13-1008 TCX', category: 'neutrals', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-010', name: 'Taupe', hexCode: '#8B8680', pantoneCode: '17-1311 TCX', category: 'neutrals', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-011', name: 'Mushroom', hexCode: '#C9B8A4', pantoneCode: '14-1212 TCX', category: 'neutrals', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-012', name: 'Stone Grey', hexCode: '#928E85', pantoneCode: '17-1210 TCX', category: 'neutrals', createdAt: new Date(), updatedAt: new Date() },
  
  // Pastels (12 colors)
  { id: 'col-013', name: 'Blush Pink', hexCode: '#FFB6C1', pantoneCode: '13-2010 TCX', category: 'pastels', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-014', name: 'Dusty Rose', hexCode: '#DCAE96', pantoneCode: '15-1415 TCX', category: 'pastels', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-015', name: 'Soft Lavender', hexCode: '#E6E6FA', pantoneCode: '13-3820 TCX', category: 'pastels', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-016', name: 'Powder Blue', hexCode: '#B0E0E6', pantoneCode: '13-4411 TCX', category: 'pastels', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-017', name: 'Sky Blue', hexCode: '#87CEEB', pantoneCode: '14-4318 TCX', category: 'pastels', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-018', name: 'Mint Green', hexCode: '#98FF98', pantoneCode: '13-6110 TCX', category: 'pastels', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-019', name: 'Sage', hexCode: '#B2AC88', pantoneCode: '15-6315 TCX', category: 'pastels', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-020', name: 'Seafoam', hexCode: '#9FE2BF', pantoneCode: '13-5409 TCX', category: 'pastels', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-021', name: 'Peach', hexCode: '#FFCBA4', pantoneCode: '13-1023 TCX', category: 'pastels', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-022', name: 'Buttercream', hexCode: '#FFFDD0', pantoneCode: '11-0618 TCX', category: 'pastels', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-023', name: 'Lilac', hexCode: '#C8A2C8', pantoneCode: '15-3207 TCX', category: 'pastels', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-024', name: 'Coral Blush', hexCode: '#F88379', pantoneCode: '15-1530 TCX', category: 'pastels', createdAt: new Date(), updatedAt: new Date() },
  
  // Brights (12 colors)
  { id: 'col-025', name: 'Fuchsia', hexCode: '#FF00FF', pantoneCode: '17-2435 TCX', category: 'brights', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-026', name: 'Hot Pink', hexCode: '#FF69B4', pantoneCode: '17-2127 TCX', category: 'brights', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-027', name: 'Electric Blue', hexCode: '#007FFF', pantoneCode: '18-4244 TCX', category: 'brights', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-028', name: 'Cobalt', hexCode: '#0047AB', pantoneCode: '19-4057 TCX', category: 'brights', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-029', name: 'Lime Green', hexCode: '#32CD32', pantoneCode: '15-0545 TCX', category: 'brights', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-030', name: 'Tangerine', hexCode: '#FF9966', pantoneCode: '16-1356 TCX', category: 'brights', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-031', name: 'Sunshine Yellow', hexCode: '#FFFF00', pantoneCode: '13-0859 TCX', category: 'brights', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-032', name: 'Turquoise', hexCode: '#40E0D0', pantoneCode: '15-5519 TCX', category: 'brights', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-033', name: 'Scarlet Red', hexCode: '#FF2400', pantoneCode: '18-1664 TCX', category: 'brights', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-034', name: 'Violet', hexCode: '#8B00FF', pantoneCode: '18-3838 TCX', category: 'brights', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-035', name: 'Coral', hexCode: '#FF7F50', pantoneCode: '16-1546 TCX', category: 'brights', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-036', name: 'Aqua', hexCode: '#00FFFF', pantoneCode: '14-4816 TCX', category: 'brights', createdAt: new Date(), updatedAt: new Date() },
  
  // Earth Tones (12 colors)
  { id: 'col-037', name: 'Terracotta', hexCode: '#E2725B', pantoneCode: '17-1340 TCX', category: 'earth-tones', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-038', name: 'Rust', hexCode: '#B7410E', pantoneCode: '18-1248 TCX', category: 'earth-tones', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-039', name: 'Burnt Sienna', hexCode: '#E97451', pantoneCode: '16-1435 TCX', category: 'earth-tones', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-040', name: 'Olive', hexCode: '#808000', pantoneCode: '18-0527 TCX', category: 'earth-tones', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-041', name: 'Moss Green', hexCode: '#8A9A5B', pantoneCode: '17-0535 TCX', category: 'earth-tones', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-042', name: 'Ochre', hexCode: '#CC7722', pantoneCode: '16-1140 TCX', category: 'earth-tones', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-043', name: 'Chocolate Brown', hexCode: '#7B3F00', pantoneCode: '19-1118 TCX', category: 'earth-tones', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-044', name: 'Camel', hexCode: '#C19A6B', pantoneCode: '16-1334 TCX', category: 'earth-tones', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-045', name: 'Khaki', hexCode: '#C3B091', pantoneCode: '15-1217 TCX', category: 'earth-tones', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-046', name: 'Cinnamon', hexCode: '#D2691E', pantoneCode: '17-1340 TCX', category: 'earth-tones', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-047', name: 'Mahogany', hexCode: '#C04000', pantoneCode: '19-1338 TCX', category: 'earth-tones', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-048', name: 'Sand', hexCode: '#C2B280', pantoneCode: '14-1122 TCX', category: 'earth-tones', createdAt: new Date(), updatedAt: new Date() },
  
  // Jewel Tones (12 colors)
  { id: 'col-049', name: 'Emerald', hexCode: '#50C878', pantoneCode: '17-5641 TCX', category: 'jewel-tones', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-050', name: 'Sapphire', hexCode: '#0F52BA', pantoneCode: '19-4052 TCX', category: 'jewel-tones', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-051', name: 'Ruby', hexCode: '#E0115F', pantoneCode: '19-1763 TCX', category: 'jewel-tones', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-052', name: 'Amethyst', hexCode: '#9966CC', pantoneCode: '18-3520 TCX', category: 'jewel-tones', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-053', name: 'Topaz', hexCode: '#FFC87C', pantoneCode: '14-0848 TCX', category: 'jewel-tones', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-054', name: 'Teal', hexCode: '#008080', pantoneCode: '18-4726 TCX', category: 'jewel-tones', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-055', name: 'Burgundy', hexCode: '#800020', pantoneCode: '19-1629 TCX', category: 'jewel-tones', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-056', name: 'Plum', hexCode: '#8E4585', pantoneCode: '19-2520 TCX', category: 'jewel-tones', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-057', name: 'Forest Green', hexCode: '#228B22', pantoneCode: '18-6330 TCX', category: 'jewel-tones', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-058', name: 'Navy', hexCode: '#000080', pantoneCode: '19-4024 TCX', category: 'jewel-tones', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-059', name: 'Garnet', hexCode: '#733635', pantoneCode: '19-1536 TCX', category: 'jewel-tones', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-060', name: 'Jade', hexCode: '#00A86B', pantoneCode: '17-5936 TCX', category: 'jewel-tones', createdAt: new Date(), updatedAt: new Date() },
  
  // Metallics (8 colors)
  { id: 'col-061', name: 'Gold', hexCode: '#FFD700', pantoneCode: '14-0955 TCX', category: 'metallics', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-062', name: 'Rose Gold', hexCode: '#B76E79', pantoneCode: '16-1518 TCX', category: 'metallics', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-063', name: 'Silver', hexCode: '#C0C0C0', pantoneCode: '14-5002 TCX', category: 'metallics', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-064', name: 'Bronze', hexCode: '#CD7F32', pantoneCode: '17-1045 TCX', category: 'metallics', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-065', name: 'Copper', hexCode: '#B87333', pantoneCode: '17-1336 TCX', category: 'metallics', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-066', name: 'Champagne', hexCode: '#F7E7CE', pantoneCode: '13-1013 TCX', category: 'metallics', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-067', name: 'Antique Gold', hexCode: '#CFB53B', pantoneCode: '16-0952 TCX', category: 'metallics', createdAt: new Date(), updatedAt: new Date() },
  { id: 'col-068', name: 'Pewter', hexCode: '#8F8E84', pantoneCode: '16-3802 TCX', category: 'metallics', createdAt: new Date(), updatedAt: new Date() },
];

interface ColorPaletteStore {
  colors: InternalColor[];
  
  // CRUD operations
  addColor: (color: Omit<InternalColor, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateColor: (id: string, updates: Partial<Omit<InternalColor, 'id' | 'createdAt'>>) => void;
  deleteColor: (id: string) => void;
  
  // Queries
  getColorById: (id: string) => InternalColor | undefined;
  getColorsByCategory: (category: ColorCategory) => InternalColor[];
  getAllColors: () => InternalColor[];
  searchColors: (query: string) => InternalColor[];
}

export const useColorPaletteStore = create<ColorPaletteStore>((set, get) => ({
  colors: defaultColors,
  
  addColor: (color) => {
    const id = `col-${Date.now()}`;
    const now = new Date();
    const newColor: InternalColor = {
      ...color,
      id,
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({ colors: [...state.colors, newColor] }));
    return id;
  },
  
  updateColor: (id, updates) => {
    set((state) => ({
      colors: state.colors.map((color) =>
        color.id === id ? { ...color, ...updates, updatedAt: new Date() } : color
      ),
    }));
  },
  
  deleteColor: (id) => {
    set((state) => ({
      colors: state.colors.filter((color) => color.id !== id),
    }));
  },
  
  getColorById: (id) => get().colors.find((c) => c.id === id),
  
  getColorsByCategory: (category) => get().colors.filter((c) => c.category === category),
  
  getAllColors: () => get().colors,
  
  searchColors: (query) => {
    const lowerQuery = query.toLowerCase();
    return get().colors.filter(
      (c) =>
        c.name.toLowerCase().includes(lowerQuery) ||
        c.hexCode.toLowerCase().includes(lowerQuery) ||
        (c.pantoneCode && c.pantoneCode.toLowerCase().includes(lowerQuery))
    );
  },
}));
