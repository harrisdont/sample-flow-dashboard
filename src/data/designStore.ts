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

// 4-View sketches
export interface SketchViews {
  front?: string;
  back?: string;
  left?: string;
  right?: string;
}

export interface ConstructionCallout {
  label: string;
  description: string;
}

export interface GradedMeasurement {
  label: string;
  pointOfMeasurement: string;
  grade: number;
  tolMinus: number;
  tolPlus: number;
  values: Record<string, number>;
}

export interface GradedSpecSheet {
  sampleSize: string;
  sizeRange: string;
  measurements: GradedMeasurement[];
}

export interface BodySizeEntry {
  label: string;
  measurement: string;
  values: Record<string, number>;
}

export interface PatternLayout {
  pieceName: string;
  imageUrl?: string;
}

export interface ArtworkPlacement {
  artworkType: string;
  width: string;
  height: string;
  angle: string;
  notes?: string;
  placementView?: 'front' | 'back' | 'left' | 'right';
}

export interface BOMItem {
  item: string;
  description: string;
  supplier?: string;
  unitCost?: number;
  quantity?: number;
  unit?: string;
  totalCost?: number;
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

  // Professional techpack fields
  sketchViews?: SketchViews;
  constructionCallouts?: ConstructionCallout[];
  gradedSpecSheet?: GradedSpecSheet;
  bodySizeChart?: BodySizeEntry[];
  patternLayouts?: PatternLayout[];
  artworkPlacements?: ArtworkPlacement[];
  billOfMaterials?: BOMItem[];
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
  approveDesign: (id: string) => void;
}

// ─── Mock design data seeded for development ───────────────────────────────
const mockDesigns: Record<string, Design> = {
  'design-ws2046': {
    id: 'design-ws2046',
    collectionId: 'luxe-basics',
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
    // Professional techpack data
    constructionCallouts: [
      { label: 'A', description: 'CF closure — 4 hole sew-through buttons, self-fabric covered, 18mm' },
      { label: 'B', description: 'Back yoke — flat-felled seam, double needle topstitch at 3mm' },
      { label: 'C', description: 'Side hem vent — 15cm split with gota kinari trim on inner edge' },
      { label: 'D', description: 'Sleeve cuff — 2 inch organza lace, roll-hemmed edge, gathered into band' },
      { label: 'E', description: 'Neckline — round neck with 1.5 inch gota kinari border, bias-cut facing' },
      { label: 'F', description: 'Shoulder drop — 2cm extended shoulder, reinforced with cotton tape' },
      { label: 'G', description: 'Bottom hem — 1 inch blind hem stitch, French seam finish on inner' },
    ],
    gradedSpecSheet: {
      sampleSize: '6',
      sizeRange: '0 – 14',
      measurements: [
        { label: 'A', pointOfMeasurement: '1/2 Chest width 2cm below armhole', grade: 2.5, tolMinus: 1, tolPlus: 1, values: { '0': 50.3, '2': 52.8, '4': 55.3, '6': 57.8, '8': 60.3, '10': 62.8, '12': 65.3, '14': 67.8 } },
        { label: 'B', pointOfMeasurement: '1/2 Waist width (seam to seam)', grade: 2.5, tolMinus: 1, tolPlus: 1, values: { '0': 44.5, '2': 47.0, '4': 49.5, '6': 52.0, '8': 54.5, '10': 57.0, '12': 59.5, '14': 62.0 } },
        { label: 'C', pointOfMeasurement: '1/2 Hip width 20cm below waist', grade: 2.5, tolMinus: 1, tolPlus: 1, values: { '0': 52.0, '2': 54.5, '4': 57.0, '6': 59.5, '8': 62.0, '10': 64.5, '12': 67.0, '14': 69.5 } },
        { label: 'D', pointOfMeasurement: 'CB length from nape to hem', grade: 1.0, tolMinus: 0.5, tolPlus: 0.5, values: { '0': 98.0, '2': 99.0, '4': 100.0, '6': 101.0, '8': 102.0, '10': 103.0, '12': 104.0, '14': 105.0 } },
        { label: 'E', pointOfMeasurement: 'Shoulder width (seam to seam)', grade: 1.0, tolMinus: 0.5, tolPlus: 0.5, values: { '0': 37.0, '2': 38.0, '4': 39.0, '6': 40.0, '8': 41.0, '10': 42.0, '12': 43.0, '14': 44.0 } },
        { label: 'F', pointOfMeasurement: 'Sleeve length from shoulder point', grade: 1.0, tolMinus: 0.5, tolPlus: 0.5, values: { '0': 42.0, '2': 42.5, '4': 43.0, '6': 43.5, '8': 44.0, '10': 44.5, '12': 45.0, '14': 45.5 } },
        { label: 'G', pointOfMeasurement: '1/2 Armhole depth (straight)', grade: 0.5, tolMinus: 0.5, tolPlus: 0.5, values: { '0': 21.0, '2': 21.5, '4': 22.0, '6': 22.5, '8': 23.0, '10': 23.5, '12': 24.0, '14': 24.5 } },
        { label: 'H', pointOfMeasurement: '1/2 Upper arm width (bicep level)', grade: 1.5, tolMinus: 0.5, tolPlus: 0.5, values: { '0': 16.5, '2': 18.0, '4': 19.5, '6': 21.0, '8': 22.5, '10': 24.0, '12': 25.5, '14': 27.0 } },
        { label: 'I', pointOfMeasurement: 'Neck opening width (straight across)', grade: 0.5, tolMinus: 0.3, tolPlus: 0.3, values: { '0': 17.0, '2': 17.5, '4': 18.0, '6': 18.5, '8': 19.0, '10': 19.5, '12': 20.0, '14': 20.5 } },
        { label: 'J', pointOfMeasurement: 'Front neck drop from HPS', grade: 0.3, tolMinus: 0.3, tolPlus: 0.3, values: { '0': 9.0, '2': 9.3, '4': 9.6, '6': 9.9, '8': 10.2, '10': 10.5, '12': 10.8, '14': 11.1 } },
        { label: 'K', pointOfMeasurement: 'Hem circumference (full)', grade: 5.0, tolMinus: 1.5, tolPlus: 1.5, values: { '0': 120.0, '2': 125.0, '4': 130.0, '6': 135.0, '8': 140.0, '10': 145.0, '12': 150.0, '14': 155.0 } },
        { label: 'L', pointOfMeasurement: 'Slit length from hem', grade: 0, tolMinus: 0.5, tolPlus: 0.5, values: { '0': 15.0, '2': 15.0, '4': 15.0, '6': 15.0, '8': 15.0, '10': 15.0, '12': 15.0, '14': 15.0 } },
      ],
    },
    bodySizeChart: [
      { label: 'A', measurement: 'Bust', values: { '0': 79, '2': 84, '4': 89, '6': 94, '8': 99, '10': 104, '12': 109, '14': 114 } },
      { label: 'B', measurement: 'Waist', values: { '0': 61, '2': 66, '4': 71, '6': 76, '8': 81, '10': 86, '12': 91, '14': 96 } },
      { label: 'C', measurement: 'Hip', values: { '0': 86, '2': 91, '4': 96, '6': 101, '8': 106, '10': 111, '12': 116, '14': 121 } },
      { label: 'D', measurement: 'Bicep', values: { '0': 25.5, '2': 27, '4': 28.5, '6': 30, '8': 31.5, '10': 33, '12': 34.5, '14': 36 } },
      { label: 'E', measurement: 'Shoulder Width', values: { '0': 37, '2': 38, '4': 39, '6': 40, '8': 41, '10': 42, '12': 43, '14': 44 } },
      { label: 'F', measurement: 'Neck Circumference', values: { '0': 34, '2': 35, '4': 36, '6': 37, '8': 38, '10': 39, '12': 40, '14': 41 } },
      { label: 'G', measurement: 'Arm Length', values: { '0': 55, '2': 55.5, '4': 56, '6': 56.5, '8': 57, '10': 57.5, '12': 58, '14': 58.5 } },
      { label: 'H', measurement: 'Back Length (Nape to Waist)', values: { '0': 38, '2': 38.5, '4': 39, '6': 39.5, '8': 40, '10': 40.5, '12': 41, '14': 41.5 } },
      { label: 'I', measurement: 'Torso Length', values: { '0': 72, '2': 73, '4': 74, '6': 75, '8': 76, '10': 77, '12': 78, '14': 79 } },
    ],
    patternLayouts: [
      { pieceName: 'Front panel — main body' },
      { pieceName: 'Back panel — main body' },
      { pieceName: 'Left sleeve long (3/4)' },
      { pieceName: 'Right sleeve long (3/4)' },
      { pieceName: 'Sleeve cuff band (×2)' },
      { pieceName: 'Neckline facing — bias cut' },
      { pieceName: 'Side panel (×2)' },
      { pieceName: 'Back yoke' },
      { pieceName: 'Hem vent reinforcement (×2)' },
      { pieceName: 'Collar band — self fabric' },
    ],
    artworkPlacements: [
      { artworkType: 'Multihead Embroidery', width: '41cm', height: '52.3cm', angle: '0°', placementView: 'front', notes: 'Center front panel, 8cm below neckline' },
      { artworkType: 'Multihead Embroidery', width: '15cm', height: '38cm', angle: '0°', placementView: 'back', notes: 'Center back yoke, aligned with shoulder seam' },
      { artworkType: 'Gota Kinari Border', width: '1.5 inch strip', height: 'Full perimeter', angle: '0°', placementView: 'front', notes: 'Neckline and bottom hem' },
    ],
    billOfMaterials: [
      { item: 'Main Fabric', description: 'Cotton Lawn 60s — Ivory', supplier: 'Nishat Mills', unitCost: 850, quantity: 3.5, unit: 'meters', totalCost: 2975 },
      { item: 'Lining Fabric', description: 'Cotton Cambric — Ivory', supplier: 'Nishat Mills', unitCost: 420, quantity: 2.0, unit: 'meters', totalCost: 840 },
      { item: 'Gota Kinari', description: '1.5 inch Gold Gota Border — ref GK-22', supplier: 'Karachi Trim House', unitCost: 180, quantity: 4.5, unit: 'meters', totalCost: 810 },
      { item: 'Organza Lace', description: '2 inch Organza Lace — Ivory', supplier: 'Karachi Trim House', unitCost: 120, quantity: 1.5, unit: 'meters', totalCost: 180 },
      { item: 'Invisible Zipper', description: '7cm YKK Invisible Zip — Ivory', supplier: 'YKK Pakistan', unitCost: 65, quantity: 1, unit: 'pieces', totalCost: 65 },
      { item: 'Embroidery Thread', description: 'Ivory Gold — ref #EMB-042', supplier: 'Anchor Threads', unitCost: 45, quantity: 6, unit: 'spools', totalCost: 270 },
    ],
  },
  'design-cs3024': {
    id: 'design-cs3024',
    collectionId: 'festive-heritage',
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
    collectionId: 'corporate-elite',
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
    collectionId: 'luxe-basics',
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

  approveDesign: (id) => set((state) => {
    const design = state.designs[id];
    if (!design) return state;
    const approvalNote: ProductionNote = {
      id: `pnote-approve-${Date.now()}`,
      text: 'Design approved for production',
      department: 'design',
      addedBy: 'System',
      addedAt: new Date().toISOString(),
    };
    return {
      designs: {
        ...state.designs,
        [id]: {
          ...design,
          status: 'approved',
          productionNotes: [...(design.productionNotes || []), approvalNote],
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