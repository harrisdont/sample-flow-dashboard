import { create } from 'zustand';
import { TrimApplication } from './trimsStore';
import { ClosureSpecification } from './accessoryStore';
import { LiningConfig, SlipConfig } from '@/components/design/LiningConfigurator';

// Production change note
export interface ProductionNote {
  id: string;
  text: string;
  department: 'design' | 'fabric' | 'stitching' | 'embroidery' | 'trims' | 'qc' | 'other';
  addedBy: string;
  addedAt: string; // ISO date string
}

// GGT (Graded Garment Template) file link
export interface GGTFile {
  id: string;
  label: string;   // e.g. "Pattern v2 - All Sizes"
  url: string;     // Google Drive, Dropbox, shared drive URL, etc.
  addedBy: string;
  addedAt: string; // ISO date string
}

// Component specification for multi-piece designs
export interface ComponentSpec {
  silhouetteId: string;
  fabricId: string;
  inductedFabricId?: string;
  trims: TrimApplication[];
  closures: ClosureSpecification[];
  customModifications?: {
    neckline?: string;
    sleeve?: string;
    seamFinish?: string;
  };
}

// Fabric assignment for multi-fabric blocking
export interface FabricAssignment {
  fabricId: string;
  fabricNumber: number;
  componentType: string;
  sections?: string[];
}

export interface TechpackAnnotations {
  dataUrl: string;  // Base64 PNG of the annotated canvas
  fabricLegend?: {
    number: number;
    fabricName: string;
    color: string;
    componentType: string;
  }[];
  createdAt: Date;
}

export interface Design {
  id: string;
  collectionId: string;
  silhouetteId: string;
  fabricId: string;
  inductedFabricId?: string;
  category: 'onePiece' | 'twoPiece' | 'threePiece' | 'dupattas' | 'lowers' | 'lehenga-set' | 'saree-set';
  
  // Multi-piece components (new)
  components?: {
    shirt?: ComponentSpec;
    lowers?: ComponentSpec;
    dupatta?: ComponentSpec;
    slip?: ComponentSpec;
    lining?: ComponentSpec;
    lehenga?: ComponentSpec;
    choli?: ComponentSpec;
    saree?: ComponentSpec;
    blouse?: ComponentSpec;
  };
  
  // Fabric assignments for color/print blocking
  fabricAssignments?: FabricAssignment[];
  
  // Techpack canvas annotations
  techpackAnnotations?: TechpackAnnotations;
  
  // Trims & closures (for single-piece or overall)
  trims?: TrimApplication[];
  closures?: ClosureSpecification[];
  
  // Lining and slip config
  liningConfig?: LiningConfig;
  slipConfig?: SlipConfig;
  
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

  // Production additions
  productionNotes?: ProductionNote[];
  ggtFiles?: GGTFile[];
}

interface DesignStore {
  designs: Record<string, Design>;
  addDesign: (design: Design) => void;
  updateDesign: (id: string, updates: Partial<Design>) => void;
  removeDesign: (id: string) => void;
  getDesignsByCollection: (collectionId: string) => Design[];
  getDesignCountByCategory: (collectionId: string) => Record<string, number>;
  addProductionNote: (designId: string, note: Omit<ProductionNote, 'id' | 'addedAt'>) => void;
  addGGTFile: (designId: string, file: Omit<GGTFile, 'id' | 'addedAt'>) => void;
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
      'lehenga-set': 0,
      'saree-set': 0,
    };
    
    collectionDesigns.forEach(design => {
      if (counts[design.category] !== undefined) {
        counts[design.category]++;
      }
    });
    
    return counts;
  },

  addProductionNote: (designId, note) => set((state) => {
    const design = state.designs[designId];
    if (!design) return state;
    const newNote: ProductionNote = {
      ...note,
      id: `pnote-${Date.now()}`,
      addedAt: new Date().toISOString(),
    };
    return {
      designs: {
        ...state.designs,
        [designId]: {
          ...design,
          productionNotes: [...(design.productionNotes || []), newNote],
        },
      },
    };
  }),

  addGGTFile: (designId, file) => set((state) => {
    const design = state.designs[designId];
    if (!design) return state;
    const newFile: GGTFile = {
      ...file,
      id: `ggt-${Date.now()}`,
      addedAt: new Date().toISOString(),
    };
    return {
      designs: {
        ...state.designs,
        [designId]: {
          ...design,
          ggtFiles: [...(design.ggtFiles || []), newFile],
        },
      },
    };
  }),
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