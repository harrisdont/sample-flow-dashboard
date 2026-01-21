import { create } from 'zustand';

// Trim categories and placement options
export type TrimCategory = 'piping' | 'lace' | 'gota' | 'pin-tucks' | 'pleating' | 'stitching-detail' | 'embroidery-border' | 'custom';

export type TrimPlacement = 'neckline' | 'hem' | 'ghera' | 'sleeves' | 'cuffs' | 'all-edges' | 'side-slits' | 'back' | 'front-placket' | 'custom';

export interface TrimType {
  id: string;
  name: string;
  category: TrimCategory;
  referenceImage?: string;
  description?: string;
}

export interface TrimApplication {
  id: string;
  trimId: string;
  trimType: TrimType;
  placements: TrimPlacement[];
  customPlacement?: string;
  referencePhoto?: string;
  specifications?: string;
  fabricNumber?: number; // For multi-fabric blocking
}

// Predefined trim library
export const TRIM_LIBRARY: TrimType[] = [
  { id: 'piping-basic', name: 'Basic Piping', category: 'piping', description: 'Simple fabric piping' },
  { id: 'piping-contrast', name: 'Contrast Piping', category: 'piping', description: 'Piping in contrasting color' },
  { id: 'piping-metallic', name: 'Metallic Piping', category: 'piping', description: 'Gold/Silver metallic piping' },
  { id: 'lace-crochet', name: 'Crochet Lace', category: 'lace', description: 'Delicate crochet lace trim' },
  { id: 'lace-organza', name: 'Organza Lace', category: 'lace', description: 'Sheer organza lace border' },
  { id: 'lace-net', name: 'Net Lace', category: 'lace', description: 'Net fabric lace trim' },
  { id: 'gota-kinari', name: 'Gota Kinari', category: 'gota', description: 'Traditional gota border' },
  { id: 'gota-patti', name: 'Gota Patti', category: 'gota', description: 'Gota patti applique' },
  { id: 'pintucks-fine', name: 'Fine Pin Tucks', category: 'pin-tucks', description: '1/8 inch pin tucks' },
  { id: 'pintucks-wide', name: 'Wide Pin Tucks', category: 'pin-tucks', description: '1/4 inch pin tucks' },
  { id: 'pleating-knife', name: 'Knife Pleats', category: 'pleating', description: 'Uniform knife pleats' },
  { id: 'pleating-box', name: 'Box Pleats', category: 'pleating', description: 'Symmetric box pleats' },
  { id: 'pleating-accordion', name: 'Accordion Pleats', category: 'pleating', description: 'Narrow accordion pleats' },
  { id: 'stitch-fagoting', name: 'Fagoting', category: 'stitching-detail', description: 'Decorative joining stitch' },
  { id: 'stitch-topstitch', name: 'Decorative Topstitch', category: 'stitching-detail', description: 'Visible contrast topstitching' },
  { id: 'stitch-quilting', name: 'Quilting Lines', category: 'stitching-detail', description: 'Quilted stitching pattern' },
  { id: 'border-embroidered', name: 'Embroidered Border', category: 'embroidery-border', description: 'Machine embroidered border' },
  { id: 'border-handwork', name: 'Handwork Border', category: 'embroidery-border', description: 'Hand embroidered border' },
];

export const TRIM_CATEGORY_LABELS: Record<TrimCategory, string> = {
  'piping': 'Piping',
  'lace': 'Lace',
  'gota': 'Gota',
  'pin-tucks': 'Pin Tucks',
  'pleating': 'Pleating',
  'stitching-detail': 'Stitching Detail',
  'embroidery-border': 'Embroidery Border',
  'custom': 'Custom',
};

export const TRIM_PLACEMENT_LABELS: Record<TrimPlacement, string> = {
  'neckline': 'Neckline',
  'hem': 'Hem',
  'ghera': 'Ghera',
  'sleeves': 'Sleeves',
  'cuffs': 'Cuffs',
  'all-edges': 'All Edges',
  'side-slits': 'Side Slits',
  'back': 'Back Panel',
  'front-placket': 'Front Placket',
  'custom': 'Custom Location',
};

interface TrimsStore {
  customTrims: TrimType[];
  addCustomTrim: (trim: Omit<TrimType, 'id'>) => string;
  removeCustomTrim: (id: string) => void;
  getAllTrims: () => TrimType[];
  getTrimById: (id: string) => TrimType | undefined;
}

export const useTrimsStore = create<TrimsStore>((set, get) => ({
  customTrims: [],
  
  addCustomTrim: (trim) => {
    const id = `custom-trim-${Date.now()}`;
    const newTrim: TrimType = { ...trim, id };
    set((state) => ({
      customTrims: [...state.customTrims, newTrim]
    }));
    return id;
  },
  
  removeCustomTrim: (id) => set((state) => ({
    customTrims: state.customTrims.filter(t => t.id !== id)
  })),
  
  getAllTrims: () => {
    return [...TRIM_LIBRARY, ...get().customTrims];
  },
  
  getTrimById: (id) => {
    const allTrims = get().getAllTrims();
    return allTrims.find(t => t.id === id);
  },
}));
