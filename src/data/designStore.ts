import { create } from 'zustand';

export interface Design {
  id: string;
  collectionId: string;
  silhouetteId: string;
  fabricId: string;
  category: 'onePiece' | 'twoPiece' | 'threePiece' | 'dupattas' | 'lowers';
  processes: string[];
  isCustom: boolean;
  neckline?: string;
  sleeve?: string;
  seamFinish?: string;
  sampleType: string;
  fastTrack: boolean;
  fastTrackReason?: string;
  additionalNotes?: string;
  createdAt: Date;
  status: 'pending' | 'approved' | 'rejected' | 'in-progress';
}

interface DesignStore {
  designs: Record<string, Design>;
  addDesign: (design: Design) => void;
  updateDesign: (id: string, updates: Partial<Design>) => void;
  removeDesign: (id: string) => void;
  getDesignsByCollection: (collectionId: string) => Design[];
  getDesignCountByCategory: (collectionId: string) => Record<string, number>;
}

export const useDesignStore = create<DesignStore>((set, get) => ({
  designs: {},
  
  addDesign: (design) => set((state) => ({
    designs: { ...state.designs, [design.id]: design }
  })),
  
  updateDesign: (id, updates) => set((state) => ({
    designs: {
      ...state.designs,
      [id]: { ...state.designs[id], ...updates }
    }
  })),
  
  removeDesign: (id) => set((state) => {
    const { [id]: removed, ...rest } = state.designs;
    return { designs: rest };
  }),
  
  getDesignsByCollection: (collectionId) => {
    const designs = get().designs;
    return Object.values(designs).filter(d => d.collectionId === collectionId);
  },
  
  getDesignCountByCategory: (collectionId) => {
    const designs = get().designs;
    const collectionDesigns = Object.values(designs).filter(d => d.collectionId === collectionId);
    
    const counts: Record<string, number> = {
      onePiece: 0,
      twoPiece: 0,
      threePiece: 0,
      dupattas: 0,
      lowers: 0,
    };
    
    collectionDesigns.forEach(design => {
      if (counts[design.category] !== undefined) {
        counts[design.category]++;
      }
    });
    
    return counts;
  },
}));

// Helper to map silhouette category to design category
export const mapSilhouetteToCategory = (silhouetteCategory: string): Design['category'] => {
  const categoryMap: Record<string, Design['category']> = {
    'tops': 'onePiece',
    'dresses': 'onePiece',
    'outerwear': 'onePiece',
    'bottoms': 'lowers',
    'accessories': 'dupattas',
  };
  return categoryMap[silhouetteCategory] || 'onePiece';
};
