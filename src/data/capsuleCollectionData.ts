import { create } from 'zustand';

// Category design breakdown for fashion lines
export interface CategoryDesigns {
  onePiece: number;
  twoPiece: number;
  threePiece: number;
  dupattas: number;
  lowers: number;
}

// Composition options for 2-piece and 3-piece categories
export type TwoPieceComposition = 'shirt-lowers' | 'shirt-dupatta';
export type ThreePieceComposition = 'shirt-lowers-dupatta';
export type SpecializedCategory = 'lehenga-set' | 'saree-set' | 'none';

// Additional garment options
export interface GarmentExtras {
  hasLining: boolean;
  hasSlip: boolean;
  hasPetticoat: boolean; // For sarees
}

// Category composition settings
export interface CategoryComposition {
  twoPieceType: TwoPieceComposition;
  threePieceType: ThreePieceComposition;
  specializedCategory: SpecializedCategory;
  specializedCount: number;
  garmentExtras: GarmentExtras;
}

// Auto-generated fabric requirements based on composition
export interface FabricRequirements {
  shirtFabric: string;
  lowersFabric: string;
  dupattaFabric: string;
  lehengaFabric: string;
  choliFabric: string;
  sareeFabric: string;
  blouseFabric: string;
  liningFabric: string;
  slipFabric: string;
  petticoatFabric: string;
  trimsFabric: string;
}

export interface CapsuleCollection {
  id: string;
  lineId: string;
  lineName: string;
  collectionName: string;
  gtmStrategy: string;
  targetInStoreDate: Date;
  productMix: {
    onePiece: number;
    twoPiece: number;
    threePiece: number;
  };
  categoryDesigns: CategoryDesigns;
  categoryComposition: CategoryComposition;
  fabricRequirements: FabricRequirements;
  selectedTechniques: string[];
  fabrics: string[];
  description: string;
  moodboardCount: number;
  pinterestBoardLink: string;
  createdAt: Date;
  updatedAt: Date;
}

// Designs per collection capacity for each line
export const LINE_COLLECTION_CAPACITY: Record<string, number> = {
  cottage: 12,
  classic: 10,
  formals: 9,
  woman: 10,
  ming: 8,
  basic: 15,
  'semi-bridals': 6,
  leather: 20,
  regen: 12,
};

interface CapsuleStore {
  capsules: Record<string, CapsuleCollection>;
  addCapsule: (capsule: CapsuleCollection) => void;
  updateCapsule: (id: string, updates: Partial<CapsuleCollection>) => void;
  getCapsulesByLine: (lineId: string) => CapsuleCollection[];
  getCapsuleByLine: (lineId: string) => CapsuleCollection | undefined;
  removeCapsule: (id: string) => void;
}

// Default empty category designs
const defaultCategoryDesigns: CategoryDesigns = {
  onePiece: 0,
  twoPiece: 0,
  threePiece: 0,
  dupattas: 0,
  lowers: 0,
};

// Default category composition
export const defaultCategoryComposition: CategoryComposition = {
  twoPieceType: 'shirt-lowers',
  threePieceType: 'shirt-lowers-dupatta',
  specializedCategory: 'none',
  specializedCount: 0,
  garmentExtras: {
    hasLining: false,
    hasSlip: false,
    hasPetticoat: false,
  },
};

// Default fabric requirements
export const defaultFabricRequirements: FabricRequirements = {
  shirtFabric: '',
  lowersFabric: '',
  dupattaFabric: '',
  lehengaFabric: '',
  choliFabric: '',
  sareeFabric: '',
  blouseFabric: '',
  liningFabric: '',
  slipFabric: '',
  petticoatFabric: '',
  trimsFabric: '',
};

// Helper to get required fabric fields based on composition
export const getRequiredFabricFields = (
  categoryDesigns: CategoryDesigns,
  composition: CategoryComposition
): (keyof FabricRequirements)[] => {
  const fields: (keyof FabricRequirements)[] = [];
  
  // 1-piece always needs shirt fabric
  if (categoryDesigns.onePiece > 0) {
    if (!fields.includes('shirtFabric')) fields.push('shirtFabric');
  }
  
  // 2-piece based on composition
  if (categoryDesigns.twoPiece > 0) {
    if (!fields.includes('shirtFabric')) fields.push('shirtFabric');
    if (composition.twoPieceType === 'shirt-lowers') {
      if (!fields.includes('lowersFabric')) fields.push('lowersFabric');
    } else {
      if (!fields.includes('dupattaFabric')) fields.push('dupattaFabric');
    }
  }
  
  // 3-piece always has shirt, lowers, dupatta
  if (categoryDesigns.threePiece > 0) {
    if (!fields.includes('shirtFabric')) fields.push('shirtFabric');
    if (!fields.includes('lowersFabric')) fields.push('lowersFabric');
    if (!fields.includes('dupattaFabric')) fields.push('dupattaFabric');
  }
  
  // Standalone dupattas/lowers
  if (categoryDesigns.dupattas > 0) {
    if (!fields.includes('dupattaFabric')) fields.push('dupattaFabric');
  }
  if (categoryDesigns.lowers > 0) {
    if (!fields.includes('lowersFabric')) fields.push('lowersFabric');
  }
  
  // Specialized categories
  if (composition.specializedCategory === 'lehenga-set' && composition.specializedCount > 0) {
    fields.push('lehengaFabric', 'choliFabric', 'dupattaFabric');
  }
  if (composition.specializedCategory === 'saree-set' && composition.specializedCount > 0) {
    fields.push('sareeFabric', 'blouseFabric');
    if (composition.garmentExtras.hasPetticoat) {
      fields.push('petticoatFabric');
    }
  }
  
  // Extras
  if (composition.garmentExtras.hasLining) {
    fields.push('liningFabric');
  }
  if (composition.garmentExtras.hasSlip) {
    fields.push('slipFabric');
  }
  
  // Always suggest trims
  fields.push('trimsFabric');
  
  // Remove duplicates
  return [...new Set(fields)];
};

// Fabric field labels
export const FABRIC_FIELD_LABELS: Record<keyof FabricRequirements, string> = {
  shirtFabric: 'Shirt/Kameez Fabric',
  lowersFabric: 'Lowers/Shalwar Fabric',
  dupattaFabric: 'Dupatta Fabric',
  lehengaFabric: 'Lehenga Fabric',
  choliFabric: 'Choli Fabric',
  sareeFabric: 'Saree Fabric',
  blouseFabric: 'Blouse Fabric',
  liningFabric: 'Lining Fabric',
  slipFabric: 'Slip Fabric',
  petticoatFabric: 'Petticoat Fabric',
  trimsFabric: 'Trims & Finishes',
};

// Initialize with sample data — collectionName values match mockData.ts samples
const initialCapsules: Record<string, CapsuleCollection> = {
  'luxe-basics': {
    id: 'luxe-basics',
    lineId: 'woman',
    lineName: 'Woman',
    collectionName: 'Luxe Basics',
    gtmStrategy: 'spring-launch',
    targetInStoreDate: new Date(2026, 2, 15),
    productMix: { onePiece: 2, twoPiece: 6, threePiece: 2 },
    categoryDesigns: { onePiece: 2, twoPiece: 6, threePiece: 2, dupattas: 1, lowers: 1 },
    categoryComposition: { ...defaultCategoryComposition },
    fabricRequirements: {
      ...defaultFabricRequirements,
      shirtFabric: 'Slub x Slub Voile',
      lowersFabric: 'Organza Silk',
      dupattaFabric: 'Organza Silk',
    },
    selectedTechniques: ['multihead', 'screen-print'],
    fabrics: ['Slub x Slub Voile', 'Organza Silk', 'Cotton Net'],
    description: 'Clean luxe basics for the SS26 woman line. Focus on tonal embroidery and high-quality fabrication.',
    moodboardCount: 4,
    pinterestBoardLink: 'https://pinterest.com/brand/luxe-basics-ss26',
    createdAt: new Date('2025-10-01'),
    updatedAt: new Date('2025-11-15'),
  },
  'festive-heritage': {
    id: 'festive-heritage',
    lineId: 'cottage',
    lineName: 'Cottage',
    collectionName: 'Festive Heritage',
    gtmStrategy: 'festive-season',
    targetInStoreDate: new Date(2026, 0, 10),
    productMix: { onePiece: 2, twoPiece: 5, threePiece: 8 },
    categoryDesigns: { onePiece: 2, twoPiece: 5, threePiece: 5, dupattas: 2, lowers: 2 },
    categoryComposition: { ...defaultCategoryComposition, threePieceType: 'shirt-lowers-dupatta' },
    fabricRequirements: {
      ...defaultFabricRequirements,
      shirtFabric: 'Pure Cotton Lawn',
      lowersFabric: 'Khaddar',
      dupattaFabric: 'Cambric',
    },
    selectedTechniques: ['hand-embroidery', 'hand-block-print'],
    fabrics: ['Pure Cotton Lawn', 'Khaddar', 'Cambric'],
    description: 'Heritage-inspired cottage collection with hand embroidery and block printing for AW25 festive.',
    moodboardCount: 5,
    pinterestBoardLink: 'https://pinterest.com/brand/festive-heritage-aw25',
    createdAt: new Date('2025-09-15'),
    updatedAt: new Date('2025-10-20'),
  },
  'corporate-elite': {
    id: 'corporate-elite',
    lineId: 'formals',
    lineName: 'Formals',
    collectionName: 'Corporate Elite',
    gtmStrategy: 'spring-launch',
    targetInStoreDate: new Date(2026, 1, 1),
    productMix: { onePiece: 9, twoPiece: 0, threePiece: 0 },
    categoryDesigns: { onePiece: 9, twoPiece: 0, threePiece: 0, dupattas: 0, lowers: 0 },
    categoryComposition: { ...defaultCategoryComposition },
    fabricRequirements: {
      ...defaultFabricRequirements,
      shirtFabric: 'Premium Suiting',
      liningFabric: 'Viscose Bemberg',
    },
    selectedTechniques: [],
    fabrics: ['Premium Suiting', 'Wool Blend', 'Viscose Lining'],
    description: 'Elevated corporate suiting — clean lines, quality fabrication, minimal decoration.',
    moodboardCount: 3,
    pinterestBoardLink: 'https://pinterest.com/brand/corporate-elite-ss26',
    createdAt: new Date('2025-10-10'),
    updatedAt: new Date('2025-11-05'),
  },
  'classic-summer': {
    id: 'classic-summer',
    lineId: 'classic',
    lineName: 'Classic',
    collectionName: 'Classic SS26 Slot 7',
    gtmStrategy: 'summer-collection',
    targetInStoreDate: new Date(2026, 4, 1),
    productMix: { onePiece: 4, twoPiece: 6, threePiece: 4 },
    categoryDesigns: { onePiece: 4, twoPiece: 6, threePiece: 4, dupattas: 2, lowers: 0 },
    categoryComposition: { ...defaultCategoryComposition },
    fabricRequirements: { ...defaultFabricRequirements, shirtFabric: 'Jacquard Lawn', dupattaFabric: 'Chiffon' },
    selectedTechniques: ['multihead', 'jacquards'],
    fabrics: ['Jacquard Lawn', 'Chiffon', 'Cambric'],
    description: 'Classic summer collection with machine embroidery highlights.',
    moodboardCount: 2,
    pinterestBoardLink: '',
    createdAt: new Date('2025-10-01'),
    updatedAt: new Date('2025-11-01'),
  },
  'ming-spring': {
    id: 'ming-spring',
    lineId: 'ming',
    lineName: 'Ming',
    collectionName: 'Eastern Fusion',
    gtmStrategy: 'spring-launch',
    targetInStoreDate: new Date(2026, 3, 1),
    productMix: { onePiece: 12, twoPiece: 4, threePiece: 2 },
    categoryDesigns: { onePiece: 5, twoPiece: 2, threePiece: 1, dupattas: 0, lowers: 0 },
    categoryComposition: { ...defaultCategoryComposition },
    fabricRequirements: { ...defaultFabricRequirements, shirtFabric: 'Silk', lowersFabric: 'Satin' },
    selectedTechniques: ['block-printing'],
    fabrics: ['Silk', 'Satin'],
    description: 'Ming-inspired prints and silhouettes for the Eastern Fusion capsule.',
    moodboardCount: 4,
    pinterestBoardLink: '',
    createdAt: new Date('2025-10-15'),
    updatedAt: new Date('2025-11-01'),
  },
};

export const useCapsuleStore = create<CapsuleStore>((set, get) => ({
  capsules: initialCapsules,
  
  addCapsule: (capsule) => set((state) => ({
    capsules: { ...state.capsules, [capsule.id]: capsule }
  })),
  
  updateCapsule: (id, updates) => set((state) => ({
    capsules: {
      ...state.capsules,
      [id]: { ...state.capsules[id], ...updates, updatedAt: new Date() }
    }
  })),

  getCapsulesByLine: (lineId) => {
    const capsules = get().capsules;
    return Object.values(capsules).filter(c => c.lineId === lineId);
  },
  
  getCapsuleByLine: (lineId) => {
    const capsules = get().capsules;
    return Object.values(capsules).find(c => c.lineId === lineId);
  },
  
  removeCapsule: (id) => set((state) => {
    const { [id]: removed, ...rest } = state.capsules;
    return { capsules: rest };
  }),
}));
