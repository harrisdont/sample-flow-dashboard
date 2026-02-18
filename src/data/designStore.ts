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

// ─── Mock design data seeded for development ───────────────────────────────
const mockDesigns: Record<string, Design> = {
  'design-ws2046': {
    id: 'design-ws2046',
    collectionId: 'Luxe Basics',
    silhouetteId: 'W-LNG-001',
    fabricId: 'fab-luxe-shirt',
    category: 'twoPiece',
    processes: ['multihead'],
    isCustom: false,
    neckline: 'Round neck with gota border',
    sleeve: '3/4 sleeve with cuff detail',
    seamFinish: 'French seam throughout, flat-felled on dupatta',
    sampleType: 'Bulk Sample',
    fastTrack: false,
    additionalNotes: 'Priority for Spring SS26 launch window. Director review required.',
    createdAt: new Date('2025-11-25'),
    status: 'in-progress',
    trims: [
      {
        id: 'ta-001',
        trimId: 'gota-kinari',
        trimType: { id: 'gota-kinari', name: 'Gota Kinari', category: 'gota', description: 'Traditional gota border' },
        placements: ['neckline', 'hem'],
        specifications: '1.5 inch gold gota kinari — replicate reference board GK-22',
      },
      {
        id: 'ta-002',
        trimId: 'lace-organza',
        trimType: { id: 'lace-organza', name: 'Organza Lace', category: 'lace', description: 'Sheer organza lace border' },
        placements: ['sleeves'],
        specifications: '2 inch organza lace on sleeve hem — ivory colourway',
      },
    ],
    closures: [
      { id: 'cl-001', type: 'zipper', quantity: 1, placement: 'side', specifications: 'Invisible zip 7cm, ivory, YKK — colour matched to fabric' },
    ],
    ggtFiles: [
      { id: 'ggt-001', label: 'WS2046 — Long Kurta Graded (All Sizes)', url: 'https://drive.google.com/file/d/1BxiMVmTgt5bG-AlHhE2sW1GgtUfkBzId', addedBy: 'Pattern Room', addedAt: '2025-12-01T09:30:00Z' },
      { id: 'ggt-002', label: 'WS2046 — Trouser Pattern v2', url: 'https://drive.google.com/file/d/1CyiNVmUgt6cH-BmJjF3tW2HhuVgkCzJe', addedBy: 'Pattern Room', addedAt: '2025-12-02T11:00:00Z' },
    ],
    productionNotes: [
      { id: 'pn-001', text: 'Neckline depth reduced by 1cm per director review on Dec 3. Update pattern accordingly.', department: 'design', addedBy: 'Ayesha Khan', addedAt: '2025-12-03T14:22:00Z' },
      { id: 'pn-002', text: 'Confirm multihead thread colour before bulk run — reference swatch #EMB-042 Ivory Gold.', department: 'embroidery', addedBy: 'Embroidery Lead', addedAt: '2025-12-10T10:05:00Z' },
    ],
  },
  'design-cs3024': {
    id: 'design-cs3024',
    collectionId: 'Festive Heritage',
    silhouetteId: 'C-SRT-012',
    fabricId: 'fab-festive-shirt',
    category: 'threePiece',
    processes: ['hand-embroidery'],
    isCustom: false,
    neckline: 'Boat neck with embroidered collar',
    sleeve: 'Full sleeve with embroidered cuff',
    seamFinish: 'Overlock seam, hand-catch stitched hem',
    sampleType: 'Salesman Sample',
    fastTrack: false,
    additionalNotes: 'Heritage line — hand embroidery must follow traditional motif sheet M-HE-07.',
    createdAt: new Date('2025-11-10'),
    status: 'in-progress',
    trims: [
      {
        id: 'ta-003',
        trimId: 'border-handwork',
        trimType: { id: 'border-handwork', name: 'Handwork Border', category: 'embroidery-border', description: 'Hand embroidered border' },
        placements: ['neckline', 'cuffs', 'hem'],
        specifications: '3 inch hand embroidery border — Rust Orange thread on Cotton Lawn, ref. sheet M-HE-07',
      },
    ],
    closures: [
      { id: 'cl-002', type: 'buttons', quantity: 5, placement: 'Front placket', specifications: '5 fabric-covered buttons, 18mm — Rust Orange colourway, Local supplier' },
    ],
    ggtFiles: [
      { id: 'ggt-003', label: 'CS3024 — A-Line Shirt Pattern (S/M/L)', url: 'https://drive.google.com/file/d/2DzjOwn Vhu7dI-CnKkG4uX3IivWhlDaKf', addedBy: 'Pattern Room', addedAt: '2025-11-18T09:00:00Z' },
    ],
    productionNotes: [
      { id: 'pn-003', text: 'Embroidery border width increased to 3 inch per designer instruction. Previous sample had 2 inch — discard.', department: 'embroidery', addedBy: 'Fatima Ahmed', addedAt: '2025-11-30T16:45:00Z' },
      { id: 'pn-004', text: 'Dupatta needs colour matching with shirt — send swatch to dye house before cutting dupatta fabric.', department: 'fabric', addedBy: 'Fabric Incharge', addedAt: '2025-12-05T08:30:00Z' },
    ],
  },
  'design-fs1089': {
    id: 'design-fs1089',
    collectionId: 'Corporate Elite',
    silhouetteId: 'F-BLZ-008',
    fabricId: 'fab-corporate-shirt',
    category: 'onePiece',
    processes: [],
    isCustom: false,
    neckline: 'Notched lapel',
    sleeve: 'Full sleeve with single button cuff',
    seamFinish: 'Taped seams, canvas-fused chest piece',
    sampleType: 'Proto Sample',
    fastTrack: true,
    fastTrackReason: 'Buyer order confirmed for Jan delivery — fast track approved by Director.',
    additionalNotes: 'Full canvassing required. Lapel width revised to 6.5cm per buyer spec.',
    createdAt: new Date('2025-12-01'),
    status: 'in-progress',
    trims: [
      {
        id: 'ta-004',
        trimId: 'stitch-topstitch',
        trimType: { id: 'stitch-topstitch', name: 'Decorative Topstitch', category: 'stitching-detail', description: 'Visible contrast topstitching' },
        placements: ['front-placket', 'back'],
        specifications: '3mm topstitch in charcoal thread throughout',
      },
    ],
    closures: [
      { id: 'cl-003', type: 'buttons', quantity: 3, placement: 'Front placket', specifications: '3 natural horn buttons, 23mm — ref. BUT-107, Premium supplier' },
    ],
    ggtFiles: [
      { id: 'ggt-004', label: 'FS1089 — Tailored Blazer Full Grade', url: 'https://drive.google.com/file/d/3EakPxo Wiv8eJ-DoLlH5vY4JjwXimEbLg', addedBy: 'Pattern Room', addedAt: '2025-12-06T10:15:00Z' },
    ],
    productionNotes: [
      { id: 'pn-005', text: 'Lapel width adjusted to 6.5cm — update pattern and recut before sending to stitching.', department: 'design', addedBy: 'Sara Malik', addedAt: '2025-12-07T13:00:00Z' },
    ],
  },
  'design-ws2050': {
    id: 'design-ws2050',
    collectionId: 'Luxe Basics',
    silhouetteId: 'W-SRT-003',
    fabricId: 'fab-luxe-shirt',
    category: 'twoPiece',
    processes: ['screen-print'],
    isCustom: false,
    neckline: 'V-neck with self-fabric placket',
    sleeve: 'Sleeveless with armhole binding',
    seamFinish: 'French seam, hand-rolled hem on organza',
    sampleType: 'Bulk Sample',
    fastTrack: false,
    additionalNotes: 'Screen print placement center front — confirm ink type suitable for Organza Silk.',
    createdAt: new Date('2025-11-27'),
    status: 'in-progress',
    trims: [
      {
        id: 'ta-005',
        trimId: 'piping-metallic',
        trimType: { id: 'piping-metallic', name: 'Metallic Piping', category: 'piping', description: 'Gold/Silver metallic piping' },
        placements: ['neckline', 'all-edges'],
        specifications: '4mm rose gold metallic piping — colour match to Champagne base fabric',
      },
    ],
    closures: [
      { id: 'cl-004', type: 'zipper', quantity: 1, placement: 'Back', specifications: 'Concealed back zip 22cm, Champagne, YKK — colour matched' },
    ],
    ggtFiles: [
      { id: 'ggt-005', label: 'WS2050 — Straight Shirt Pattern v1', url: 'https://drive.google.com/file/d/4FblQypXjw9fK-EpMmI6wZ5KkxYjnFcMh', addedBy: 'Pattern Room', addedAt: '2025-12-01T14:30:00Z' },
    ],
    productionNotes: [
      { id: 'pn-006', text: 'Screen print ink — use water-based ink only on Organza Silk. Oil-based causes bleed. Confirmed with print unit.', department: 'fabric', addedBy: 'Fabric Incharge', addedAt: '2025-12-09T09:20:00Z' },
    ],
  },
};

export const useDesignStore = create<DesignStore>((set, get) => ({
  designs: mockDesigns,
  
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