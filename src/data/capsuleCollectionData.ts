import { create } from 'zustand';

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
  selectedTechniques: string[];
  fabrics: string[];
  description: string;
  moodboardCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface CapsuleStore {
  capsules: Record<string, CapsuleCollection>;
  addCapsule: (capsule: CapsuleCollection) => void;
  updateCapsule: (id: string, updates: Partial<CapsuleCollection>) => void;
  getCapsuleByLine: (lineId: string) => CapsuleCollection | undefined;
  removeCapsule: (id: string) => void;
}

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
    selectedTechniques: ['embroidery', 'handwork'],
    fabrics: ['Cotton Lawn', 'Cambric'],
    description: 'Traditional cottage collection with hand embroidery',
    moodboardCount: 3,
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
    selectedTechniques: ['multihead', 'jacquards'],
    fabrics: ['Lawn', 'Chiffon'],
    description: 'Classic summer styles with machine embroidery',
    moodboardCount: 2,
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
    selectedTechniques: ['embroidery', 'handwork', 'block-printing'],
    fabrics: ['Organza', 'Net', 'Velvet'],
    description: 'Premium festive formals with intricate handwork',
    moodboardCount: 5,
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
    selectedTechniques: ['yarn-dyed', 'multihead'],
    fabrics: ['Khaddar', 'Karandi'],
    description: 'Winter collection with warm fabrics',
    moodboardCount: 2,
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
    selectedTechniques: ['block-printing'],
    fabrics: ['Silk', 'Satin'],
    description: 'Ming-inspired prints and silhouettes',
    moodboardCount: 4,
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
    selectedTechniques: [],
    fabrics: ['Genuine Leather', 'Faux Leather'],
    description: 'Contemporary leather accessories and jackets',
    moodboardCount: 2,
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
    selectedTechniques: ['embroidery'],
    fabrics: ['Recycled Cotton', 'Organic Linen'],
    description: 'Eco-friendly sustainable fashion',
    moodboardCount: 3,
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
  
  getCapsuleByLine: (lineId) => {
    const capsules = get().capsules;
    return Object.values(capsules).find(c => c.lineId === lineId);
  },
  
  removeCapsule: (id) => set((state) => {
    const { [id]: removed, ...rest } = state.capsules;
    return { capsules: rest };
  }),
}));
