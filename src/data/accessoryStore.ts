import { create } from 'zustand';

export type AccessoryType = 'button' | 'zipper' | 'hook' | 'snap' | 'tassel' | 'drawstring' | 'dori' | 'other';

export type ClosureType = 'buttons' | 'hooks' | 'zipper' | 'drawstring' | 'snap-buttons' | 'dori' | 'none';

export interface Accessory {
  id: string;
  name: string;
  type: AccessoryType;
  photo?: string;
  quantityAvailable: number;
  supplier?: string;
  costPerUnit: number;
  color?: string;
  size?: string;
  material?: string;
  createdAt: Date;
}

export interface ClosureSpecification {
  id: string;
  type: ClosureType;
  accessoryId?: string;
  quantity: number;
  placement: string;
  specifications?: string;
}

export const ACCESSORY_TYPE_LABELS: Record<AccessoryType, string> = {
  'button': 'Buttons',
  'zipper': 'Zippers',
  'hook': 'Hooks & Eyes',
  'snap': 'Snap Buttons',
  'tassel': 'Tassels',
  'drawstring': 'Drawstrings',
  'dori': 'Dori/Cord',
  'other': 'Other',
};

export const CLOSURE_TYPE_LABELS: Record<ClosureType, string> = {
  'buttons': 'Buttons',
  'hooks': 'Hooks & Eyes',
  'zipper': 'Zipper',
  'drawstring': 'Drawstring',
  'snap-buttons': 'Snap Buttons',
  'dori': 'Dori/Cord',
  'none': 'No Closure',
};

export const CLOSURE_PLACEMENT_OPTIONS = [
  { id: 'front-placket', label: 'Front Placket' },
  { id: 'back-opening', label: 'Back Opening' },
  { id: 'side-seam', label: 'Side Seam' },
  { id: 'neckline', label: 'Neckline' },
  { id: 'waistband', label: 'Waistband' },
  { id: 'cuffs', label: 'Cuffs' },
  { id: 'sleeve-slit', label: 'Sleeve Slit' },
];

// Sample accessories for demonstration
const sampleAccessories: Accessory[] = [
  {
    id: 'btn-pearl-white',
    name: 'Pearl White Buttons',
    type: 'button',
    quantityAvailable: 500,
    costPerUnit: 15,
    color: 'White',
    size: '12mm',
    material: 'Pearl',
    createdAt: new Date(),
  },
  {
    id: 'btn-gold-metal',
    name: 'Gold Metal Buttons',
    type: 'button',
    quantityAvailable: 300,
    costPerUnit: 25,
    color: 'Gold',
    size: '15mm',
    material: 'Metal',
    createdAt: new Date(),
  },
  {
    id: 'btn-shell-natural',
    name: 'Natural Shell Buttons',
    type: 'button',
    quantityAvailable: 200,
    costPerUnit: 20,
    color: 'Natural',
    size: '14mm',
    material: 'Shell',
    createdAt: new Date(),
  },
  {
    id: 'zip-invisible',
    name: 'Invisible Zipper',
    type: 'zipper',
    quantityAvailable: 150,
    costPerUnit: 45,
    size: '22 inch',
    material: 'Nylon',
    createdAt: new Date(),
  },
  {
    id: 'hook-metal',
    name: 'Metal Hooks & Eyes',
    type: 'hook',
    quantityAvailable: 400,
    costPerUnit: 8,
    size: 'Medium',
    material: 'Metal',
    createdAt: new Date(),
  },
  {
    id: 'tassel-silk',
    name: 'Silk Tassels',
    type: 'tassel',
    quantityAvailable: 100,
    costPerUnit: 35,
    material: 'Silk',
    createdAt: new Date(),
  },
  {
    id: 'dori-cotton',
    name: 'Cotton Dori',
    type: 'dori',
    quantityAvailable: 200,
    costPerUnit: 12,
    material: 'Cotton',
    createdAt: new Date(),
  },
];

interface AccessoryStore {
  accessories: Accessory[];
  addAccessory: (accessory: Omit<Accessory, 'id' | 'createdAt'>) => string;
  updateAccessory: (id: string, updates: Partial<Accessory>) => void;
  removeAccessory: (id: string) => void;
  getAccessoryById: (id: string) => Accessory | undefined;
  getAccessoriesByType: (type: AccessoryType) => Accessory[];
  updateQuantity: (id: string, quantityChange: number) => void;
}

export const useAccessoryStore = create<AccessoryStore>((set, get) => ({
  accessories: sampleAccessories,
  
  addAccessory: (accessory) => {
    const id = `acc-${Date.now()}`;
    const newAccessory: Accessory = {
      ...accessory,
      id,
      createdAt: new Date(),
    };
    set((state) => ({
      accessories: [...state.accessories, newAccessory]
    }));
    return id;
  },
  
  updateAccessory: (id, updates) => set((state) => ({
    accessories: state.accessories.map(a => 
      a.id === id ? { ...a, ...updates } : a
    )
  })),
  
  removeAccessory: (id) => set((state) => ({
    accessories: state.accessories.filter(a => a.id !== id)
  })),
  
  getAccessoryById: (id) => {
    return get().accessories.find(a => a.id === id);
  },
  
  getAccessoriesByType: (type) => {
    return get().accessories.filter(a => a.type === type);
  },
  
  updateQuantity: (id, quantityChange) => set((state) => ({
    accessories: state.accessories.map(a => 
      a.id === id ? { ...a, quantityAvailable: Math.max(0, a.quantityAvailable + quantityChange) } : a
    )
  })),
}));
