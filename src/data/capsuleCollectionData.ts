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

// Initialize with sample data for demonstration
const initialCapsules: Record<string, CapsuleCollection> = {
  'cottage-spring': {
    id: 'cottage-spring',
    lineId: 'cottage',
    lineName: 'Cottage',
    collectionName: 'Spring Heritage',
    gtmStrategy: 'spring-launch',
    targetInStoreDate: new Date(2025, 2, 15),
    productMix: { onePiece: 5, twoPiece: 10, threePiece: 8 },
    categoryDesigns: { onePiece: 2, twoPiece: 5, threePiece: 3, dupattas: 1, lowers: 1 },
    categoryComposition: { ...defaultCategoryComposition },
    fabricRequirements: { ...defaultFabricRequirements },
    selectedTechniques: ['embroidery', 'handwork'],
    fabrics: ['Cotton Lawn', 'Cambric'],
    description: 'Traditional cottage collection with hand embroidery',
    moodboardCount: 3,
    pinterestBoardLink: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  'classic-summer': {
    id: 'classic-summer',
    lineId: 'classic',
    lineName: 'Classic',
    collectionName: 'Summer Essentials',
    gtmStrategy: 'summer-collection',
    targetInStoreDate: new Date(2025, 5, 1),
    productMix: { onePiece: 8, twoPiece: 12, threePiece: 5 },
    categoryDesigns: { onePiece: 3, twoPiece: 4, threePiece: 2, dupattas: 1, lowers: 0 },
    categoryComposition: { ...defaultCategoryComposition },
    fabricRequirements: { ...defaultFabricRequirements },
    selectedTechniques: ['multihead', 'jacquards'],
    fabrics: ['Lawn', 'Chiffon'],
    description: 'Classic summer styles with machine embroidery',
    moodboardCount: 2,
    pinterestBoardLink: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  'formals-festive': {
    id: 'formals-festive',
    lineId: 'formals',
    lineName: 'Formals',
    collectionName: 'Festive Luxe',
    gtmStrategy: 'festive-season',
    targetInStoreDate: new Date(2025, 9, 10),
    productMix: { onePiece: 3, twoPiece: 6, threePiece: 15 },
    categoryDesigns: { onePiece: 1, twoPiece: 3, threePiece: 4, dupattas: 1, lowers: 0 },
    categoryComposition: { ...defaultCategoryComposition, specializedCategory: 'lehenga-set', specializedCount: 2 },
    fabricRequirements: { ...defaultFabricRequirements },
    selectedTechniques: ['embroidery', 'handwork', 'block-printing'],
    fabrics: ['Organza', 'Net', 'Velvet'],
    description: 'Premium festive formals with intricate handwork',
    moodboardCount: 5,
    pinterestBoardLink: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  'woman-winter': {
    id: 'woman-winter',
    lineId: 'woman',
    lineName: 'Woman',
    collectionName: 'Winter Warmth',
    gtmStrategy: 'winter-release',
    targetInStoreDate: new Date(2025, 11, 1),
    productMix: { onePiece: 10, twoPiece: 8, threePiece: 6 },
    categoryDesigns: { onePiece: 4, twoPiece: 3, threePiece: 2, dupattas: 1, lowers: 0 },
    categoryComposition: { ...defaultCategoryComposition, twoPieceType: 'shirt-dupatta' },
    fabricRequirements: { ...defaultFabricRequirements },
    selectedTechniques: ['yarn-dyed', 'multihead'],
    fabrics: ['Khaddar', 'Karandi'],
    description: 'Winter collection with warm fabrics',
    moodboardCount: 2,
    pinterestBoardLink: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  'ming-spring': {
    id: 'ming-spring',
    lineId: 'ming',
    lineName: 'Ming',
    collectionName: 'Eastern Fusion',
    gtmStrategy: 'spring-launch',
    targetInStoreDate: new Date(2025, 3, 1),
    productMix: { onePiece: 12, twoPiece: 4, threePiece: 2 },
    categoryDesigns: { onePiece: 5, twoPiece: 2, threePiece: 1, dupattas: 0, lowers: 0 },
    categoryComposition: { ...defaultCategoryComposition },
    fabricRequirements: { ...defaultFabricRequirements },
    selectedTechniques: ['block-printing'],
    fabrics: ['Silk', 'Satin'],
    description: 'Ming-inspired prints and silhouettes',
    moodboardCount: 4,
    pinterestBoardLink: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  'leather-summer': {
    id: 'leather-summer',
    lineId: 'leather',
    lineName: 'Leather',
    collectionName: 'Urban Edge',
    gtmStrategy: 'summer-collection',
    targetInStoreDate: new Date(2025, 4, 15),
    productMix: { onePiece: 15, twoPiece: 0, threePiece: 0 },
    categoryDesigns: { ...defaultCategoryDesigns },
    categoryComposition: { ...defaultCategoryComposition },
    fabricRequirements: { ...defaultFabricRequirements },
    selectedTechniques: [],
    fabrics: ['Genuine Leather', 'Faux Leather'],
    description: 'Contemporary leather accessories and jackets',
    moodboardCount: 2,
    pinterestBoardLink: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  'regen-festive': {
    id: 'regen-festive',
    lineId: 'regen',
    lineName: 'Regen',
    collectionName: 'Sustainable Chic',
    gtmStrategy: 'festive-season',
    targetInStoreDate: new Date(2025, 8, 20),
    productMix: { onePiece: 6, twoPiece: 8, threePiece: 4 },
    categoryDesigns: { onePiece: 3, twoPiece: 4, threePiece: 2, dupattas: 2, lowers: 1 },
    categoryComposition: { ...defaultCategoryComposition },
    fabricRequirements: { ...defaultFabricRequirements },
    selectedTechniques: ['embroidery'],
    fabrics: ['Recycled Cotton', 'Organic Linen'],
    description: 'Eco-friendly sustainable fashion',
    moodboardCount: 3,
    pinterestBoardLink: '',
    createdAt: new Date(),
    updatedAt: new Date(),
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
