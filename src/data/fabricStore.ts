import { create } from 'zustand';

// Fabric Types
export type FabricType = 'jacquard' | 'dobby' | 'yarn-dyed' | 'greige' | 'solid-dyed' | 'other';
export type PrintType = 'digital' | 'rotary' | 'sublimation' | 'base-screen' | 'none';
export type SurfaceTreatment = 'multihead' | 'block-print' | 'screen-print';
export type BaseTreatmentType = 'dyeing' | 'printing' | 'none';

export type FabricStatus = 
  | 'pending-artwork'
  | 'pending-dye-plan'
  | 'pending-print-plan'
  | 'in-base-treatment'
  | 'pending-surface-treatment'
  | 'in-surface-treatment'
  | 'ready-for-induction'
  | 'inducted';

export type ComponentType = 
  | 'shirt'
  | 'lowers'
  | 'dupatta'
  | 'lehenga'
  | 'choli'
  | 'saree'
  | 'blouse'
  | 'lining'
  | 'slip'
  | 'petticoat'
  | 'trims';

// Ironing instructions type
export type IroningInstruction = 
  | 'high-heat'
  | 'medium-heat'
  | 'low-heat'
  | 'iron-reverse'
  | 'steam-only'
  | 'do-not-iron';

// Print classification types
export type PrintCategory = 
  | 'floral'
  | 'geometric'
  | 'conversational'
  | 'abstract'
  | 'tribal'
  | 'paisley'
  | 'stripes'
  | 'checks'
  | 'animal'
  | 'botanical'
  | 'ethnic'
  | 'other';

export type PrintColorScheme = 'monotone' | 'multicolor';
export type PrintScale = 'macro' | 'micro';

export interface PrintClassification {
  category: PrintCategory;
  colorScheme: PrintColorScheme;
  scale: PrintScale;
}

export interface TechnicalSpecs {
  construction: string;
  fabricWidth: string;
  gsm?: number;
  costPerMeter: number;
  shrinkageMargin: string;
  stitchingSpecs: string;
  careInstructions?: string;
  // New fields
  recommendedSPI?: number;
  ironingInstructions?: IroningInstruction;
  handlingNotes?: string;
}

export interface FabricEntry {
  id: string;
  collectionId: string;
  collectionName: string;
  lineId: string;
  lineName: string;
  lineColor: string;
  componentType: ComponentType;
  
  // Basic Info
  fabricName: string;
  fabricComposition: string;
  fabricType: FabricType;
  
  // Color (from internal palette)
  colorId?: string;
  
  // Workflow status
  status: FabricStatus;
  
  // Artwork (for Jacquard/Dobby/Yarn Dyed)
  artworkSubmitted: boolean;
  artworkFile?: string;
  artworkApprovalDate?: Date;
  
  // Base Treatment
  baseTreatmentType: BaseTreatmentType;
  printType?: PrintType;
  dyePlan?: string;
  printPlan?: string;
  baseTreatmentComplete: boolean;
  
  // Print Classification (for printed fabrics)
  printClassification?: PrintClassification;
  
  // Surface Treatment (pre-cut)
  surfaceTreatments: SurfaceTreatment[];
  surfaceTreatmentComplete: boolean;
  
  // Technical Specifications
  technicalSpecs?: TechnicalSpecs;
  
  // Tracking
  createdAt: Date;
  updatedAt: Date;
  inductedAt?: Date;
  fabricDeadline?: Date;
}

// Status labels and colors
export const FABRIC_STATUS_CONFIG: Record<FabricStatus, { label: string; color: string }> = {
  'pending-artwork': { label: 'Pending Artwork', color: 'bg-amber-500/20 text-amber-700 dark:text-amber-400' },
  'pending-dye-plan': { label: 'Pending Dye Plan', color: 'bg-blue-500/20 text-blue-700 dark:text-blue-400' },
  'pending-print-plan': { label: 'Pending Print Plan', color: 'bg-purple-500/20 text-purple-700 dark:text-purple-400' },
  'in-base-treatment': { label: 'In Base Treatment', color: 'bg-orange-500/20 text-orange-700 dark:text-orange-400' },
  'pending-surface-treatment': { label: 'Pending Surface', color: 'bg-rose-500/20 text-rose-700 dark:text-rose-400' },
  'in-surface-treatment': { label: 'In Surface Treatment', color: 'bg-pink-500/20 text-pink-700 dark:text-pink-400' },
  'ready-for-induction': { label: 'Ready for Induction', color: 'bg-teal-500/20 text-teal-700 dark:text-teal-400' },
  'inducted': { label: 'Inducted', color: 'bg-green-500/20 text-green-700 dark:text-green-400' },
};

export const FABRIC_TYPE_LABELS: Record<FabricType, string> = {
  'jacquard': 'Jacquard',
  'dobby': 'Dobby',
  'yarn-dyed': 'Yarn Dyed',
  'greige': 'Greige',
  'solid-dyed': 'Solid Dyed',
  'other': 'Other',
};

export const PRINT_TYPE_LABELS: Record<PrintType, string> = {
  'digital': 'Digital Print',
  'rotary': 'Rotary Print',
  'sublimation': 'Sublimation',
  'base-screen': 'Base Screen Print',
  'none': 'None',
};

export const SURFACE_TREATMENT_LABELS: Record<SurfaceTreatment, string> = {
  'multihead': 'Multihead Embroidery',
  'block-print': 'Block Print',
  'screen-print': 'Screen Print',
};

export const COMPONENT_TYPE_LABELS: Record<ComponentType, string> = {
  'shirt': 'Shirt',
  'lowers': 'Lowers',
  'dupatta': 'Dupatta',
  'lehenga': 'Lehenga',
  'choli': 'Choli',
  'saree': 'Saree',
  'blouse': 'Blouse',
  'lining': 'Lining',
  'slip': 'Slip',
  'petticoat': 'Petticoat',
  'trims': 'Trims',
};

export const IRONING_INSTRUCTION_LABELS: Record<IroningInstruction, string> = {
  'high-heat': 'Iron on High Heat (200°C)',
  'medium-heat': 'Iron on Medium Heat (150°C)',
  'low-heat': 'Iron on Low Heat (110°C)',
  'iron-reverse': 'Iron on Reverse Side Only',
  'steam-only': 'Steam Only',
  'do-not-iron': 'Do Not Iron',
};

export const PRINT_CATEGORY_LABELS: Record<PrintCategory, string> = {
  'floral': 'Floral',
  'geometric': 'Geometric',
  'conversational': 'Conversational',
  'abstract': 'Abstract',
  'tribal': 'Tribal',
  'paisley': 'Paisley',
  'stripes': 'Stripes',
  'checks': 'Checks',
  'animal': 'Animal Print',
  'botanical': 'Botanical',
  'ethnic': 'Ethnic/Traditional',
  'other': 'Other',
};

export const PRINT_COLOR_SCHEME_LABELS: Record<PrintColorScheme, string> = {
  'monotone': 'Monotone',
  'multicolor': 'Multicolor',
};

export const PRINT_SCALE_LABELS: Record<PrintScale, string> = {
  'macro': 'Macro Print',
  'micro': 'Micro Print',
};

// Helper to determine initial status based on fabric type
export const getInitialStatus = (fabricType: FabricType, baseTreatmentType: BaseTreatmentType): FabricStatus => {
  if (fabricType === 'jacquard' || fabricType === 'dobby' || fabricType === 'yarn-dyed') {
    return 'pending-artwork';
  }
  if (baseTreatmentType === 'dyeing') {
    return 'pending-dye-plan';
  }
  if (baseTreatmentType === 'printing') {
    return 'pending-print-plan';
  }
  return 'ready-for-induction';
};

// Store interface
interface FabricStore {
  fabrics: FabricEntry[];
  
  // CRUD operations
  addFabricEntry: (entry: Omit<FabricEntry, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateFabricEntry: (id: string, updates: Partial<FabricEntry>) => void;
  deleteFabricEntry: (id: string) => void;
  
  // Status management
  updateFabricStatus: (id: string, status: FabricStatus) => void;
  markArtworkSubmitted: (id: string, artworkFile?: string) => void;
  markBaseTreatmentComplete: (id: string) => void;
  markSurfaceTreatmentComplete: (id: string) => void;
  inductFabric: (id: string, specs: TechnicalSpecs) => void;
  
  // Queries
  getFabricById: (id: string) => FabricEntry | undefined;
  getFabricsByCollection: (collectionId: string) => FabricEntry[];
  getFabricsByLine: (lineId: string) => FabricEntry[];
  getFabricsByStatus: (status: FabricStatus) => FabricEntry[];
  getSeasonFabricSummary: () => {
    total: number;
    byStatus: Record<FabricStatus, number>;
    byLine: Record<string, number>;
    inducted: number;
    pending: number;
  };
}

// Sample data for demonstration — collections align with mockData sample entries
const sampleFabrics: FabricEntry[] = [
  // ── Luxe Basics (Woman SS26) ──────────────────────────────────────────────
  {
    id: 'fab-luxe-shirt',
    collectionId: 'Luxe Basics',
    collectionName: 'Luxe Basics',
    lineId: 'woman',
    lineName: 'Woman',
    lineColor: 'bg-pink-500',
    componentType: 'shirt',
    fabricName: 'Slub x Slub Voile',
    fabricComposition: '100% Cotton Voile — slub warp & weft',
    fabricType: 'greige',
    status: 'inducted',
    artworkSubmitted: true,
    artworkApprovalDate: new Date('2025-11-20'),
    baseTreatmentType: 'printing',
    printType: 'digital',
    baseTreatmentComplete: true,
    surfaceTreatments: ['multihead'],
    surfaceTreatmentComplete: false,
    printClassification: { category: 'floral', colorScheme: 'multicolor', scale: 'macro' },
    technicalSpecs: {
      construction: 'Plain weave, slub effect yarn both directions',
      fabricWidth: '58 inches',
      gsm: 85,
      costPerMeter: 680,
      shrinkageMargin: '4-5%',
      recommendedSPI: 12,
      stitchingSpecs: 'Size 9 needle, 2.5mm stitch length. French seams on all visible edges.',
      careInstructions: 'Hand wash cold, shade dry, iron on medium heat (150°C) reverse side only',
      ironingInstructions: 'iron-reverse',
      handlingNotes: 'Prone to snagging — handle with care during cutting and stitching.',
    },
    createdAt: new Date('2025-11-01'),
    updatedAt: new Date('2025-11-20'),
    inductedAt: new Date('2025-11-20'),
    fabricDeadline: new Date('2025-12-01'),
  },
  {
    id: 'fab-luxe-dupatta',
    collectionId: 'Luxe Basics',
    collectionName: 'Luxe Basics',
    lineId: 'woman',
    lineName: 'Woman',
    lineColor: 'bg-pink-500',
    componentType: 'dupatta',
    fabricName: 'Organza Silk',
    fabricComposition: '100% Silk Organza',
    fabricType: 'greige',
    status: 'inducted',
    artworkSubmitted: false,
    baseTreatmentType: 'dyeing',
    baseTreatmentComplete: true,
    surfaceTreatments: [],
    surfaceTreatmentComplete: true,
    technicalSpecs: {
      construction: 'Plain weave, sheer',
      fabricWidth: '44 inches',
      gsm: 35,
      costPerMeter: 1200,
      shrinkageMargin: '2-3%',
      recommendedSPI: 14,
      stitchingSpecs: 'Size 8 needle, 2mm stitch. Roll-hem finish or narrow hem with foot.',
      careInstructions: 'Dry clean only. Do not wring or twist.',
      ironingInstructions: 'steam-only',
      handlingNotes: 'Store rolled, not folded. Use tissue paper between layers.',
    },
    createdAt: new Date('2025-11-01'),
    updatedAt: new Date('2025-11-20'),
    inductedAt: new Date('2025-11-22'),
    fabricDeadline: new Date('2025-12-01'),
  },

  // ── Festive Heritage (Cottage AW25) ───────────────────────────────────────
  {
    id: 'fab-festive-shirt',
    collectionId: 'Festive Heritage',
    collectionName: 'Festive Heritage',
    lineId: 'cottage',
    lineName: 'Cottage',
    lineColor: 'bg-yellow-500',
    componentType: 'shirt',
    fabricName: 'Pure Cotton Lawn',
    fabricComposition: '100% Cotton Lawn — combed yarn',
    fabricType: 'greige',
    status: 'inducted',
    artworkSubmitted: false,
    baseTreatmentType: 'dyeing',
    baseTreatmentComplete: true,
    surfaceTreatments: [],
    surfaceTreatmentComplete: true,
    technicalSpecs: {
      construction: 'Plain weave, fine count yarn 80s',
      fabricWidth: '56 inches',
      gsm: 95,
      costPerMeter: 420,
      shrinkageMargin: '3-4%',
      recommendedSPI: 11,
      stitchingSpecs: 'Size 11 needle, 3mm stitch length. Overlock all raw edges.',
      careInstructions: 'Machine wash cold 30°C, tumble dry low, iron medium heat',
      ironingInstructions: 'medium-heat',
      handlingNotes: 'Pre-wash fabric before cutting to account for shrinkage.',
    },
    createdAt: new Date('2025-10-15'),
    updatedAt: new Date('2025-11-05'),
    inductedAt: new Date('2025-11-05'),
    fabricDeadline: new Date('2025-11-20'),
  },
  {
    id: 'fab-festive-khaddar',
    collectionId: 'Festive Heritage',
    collectionName: 'Festive Heritage',
    lineId: 'cottage',
    lineName: 'Cottage',
    lineColor: 'bg-yellow-500',
    componentType: 'lowers',
    fabricName: 'Khaddar',
    fabricComposition: '100% Cotton Khaddar — handspun texture',
    fabricType: 'yarn-dyed',
    status: 'in-surface-treatment',
    artworkSubmitted: true,
    artworkApprovalDate: new Date('2025-11-10'),
    baseTreatmentType: 'none',
    baseTreatmentComplete: true,
    surfaceTreatments: ['block-print'],
    surfaceTreatmentComplete: false,
    technicalSpecs: {
      construction: 'Twill weave, medium weight',
      fabricWidth: '54 inches',
      gsm: 185,
      costPerMeter: 360,
      shrinkageMargin: '5-6%',
      recommendedSPI: 10,
      stitchingSpecs: 'Size 14 needle, 3.5mm stitch. Flat-felled seams on shalwar.',
      careInstructions: 'Hand wash cold, flat dry, iron high heat',
      ironingInstructions: 'high-heat',
      handlingNotes: 'Heavy fabric — use walking foot when stitching multiple layers.',
    },
    createdAt: new Date('2025-10-15'),
    updatedAt: new Date('2025-11-10'),
    fabricDeadline: new Date('2025-11-25'),
  },

  // ── Corporate Elite (Formals SS26) ────────────────────────────────────────
  {
    id: 'fab-corporate-shirt',
    collectionId: 'Corporate Elite',
    collectionName: 'Corporate Elite',
    lineId: 'formals',
    lineName: 'Formals',
    lineColor: 'bg-purple-500',
    componentType: 'shirt',
    fabricName: 'Premium Suiting',
    fabricComposition: '60% Wool / 40% Polyester blended suiting',
    fabricType: 'solid-dyed',
    status: 'inducted',
    artworkSubmitted: false,
    baseTreatmentType: 'dyeing',
    baseTreatmentComplete: true,
    surfaceTreatments: [],
    surfaceTreatmentComplete: true,
    technicalSpecs: {
      construction: 'Twill weave, canvas-fused interlining in chest',
      fabricWidth: '60 inches',
      gsm: 280,
      costPerMeter: 1850,
      shrinkageMargin: '2-3% (pre-shrunk)',
      recommendedSPI: 10,
      stitchingSpecs: 'Size 14 needle, 2.5mm stitch. Pad stitch lapel by hand. All seams pressed open.',
      careInstructions: 'Dry clean recommended. Steam press only.',
      ironingInstructions: 'steam-only',
      handlingNotes: 'Full canvassing required for chest piece. Use tailor\'s ham for pressing curves.',
    },
    createdAt: new Date('2025-11-15'),
    updatedAt: new Date('2025-11-28'),
    inductedAt: new Date('2025-11-28'),
    fabricDeadline: new Date('2025-12-05'),
  },
  {
    id: 'fab-corporate-wool',
    collectionId: 'Corporate Elite',
    collectionName: 'Corporate Elite',
    lineId: 'formals',
    lineName: 'Formals',
    lineColor: 'bg-purple-500',
    componentType: 'lining',
    fabricName: 'Viscose Lining',
    fabricComposition: '100% Viscose Bemberg',
    fabricType: 'solid-dyed',
    status: 'inducted',
    artworkSubmitted: false,
    baseTreatmentType: 'dyeing',
    baseTreatmentComplete: true,
    surfaceTreatments: [],
    surfaceTreatmentComplete: true,
    technicalSpecs: {
      construction: 'Satin weave',
      fabricWidth: '56 inches',
      gsm: 70,
      costPerMeter: 520,
      shrinkageMargin: '3%',
      recommendedSPI: 13,
      stitchingSpecs: 'Size 9 needle, 2mm stitch. Slip-stitch lining hem by hand.',
      careInstructions: 'Dry clean. Do not wash.',
      ironingInstructions: 'low-heat',
      handlingNotes: 'Cut on grain. Avoid stretching on bias.',
    },
    createdAt: new Date('2025-11-15'),
    updatedAt: new Date('2025-11-28'),
    inductedAt: new Date('2025-11-28'),
    fabricDeadline: new Date('2025-12-05'),
  },
];

export const useFabricStore = create<FabricStore>((set, get) => ({
  fabrics: sampleFabrics,
  
  addFabricEntry: (entry) => {
    const id = `fab-${Date.now()}`;
    const now = new Date();
    const newEntry: FabricEntry = {
      ...entry,
      id,
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({ fabrics: [...state.fabrics, newEntry] }));
    return id;
  },
  
  updateFabricEntry: (id, updates) => {
    set((state) => ({
      fabrics: state.fabrics.map((fab) =>
        fab.id === id ? { ...fab, ...updates, updatedAt: new Date() } : fab
      ),
    }));
  },
  
  deleteFabricEntry: (id) => {
    set((state) => ({
      fabrics: state.fabrics.filter((fab) => fab.id !== id),
    }));
  },
  
  updateFabricStatus: (id, status) => {
    set((state) => ({
      fabrics: state.fabrics.map((fab) =>
        fab.id === id ? { ...fab, status, updatedAt: new Date() } : fab
      ),
    }));
  },
  
  markArtworkSubmitted: (id, artworkFile) => {
    const fabric = get().fabrics.find((f) => f.id === id);
    if (!fabric) return;
    
    const nextStatus: FabricStatus = fabric.surfaceTreatments.length > 0
      ? 'pending-surface-treatment'
      : 'ready-for-induction';
    
    set((state) => ({
      fabrics: state.fabrics.map((fab) =>
        fab.id === id
          ? {
              ...fab,
              artworkSubmitted: true,
              artworkFile,
              artworkApprovalDate: new Date(),
              baseTreatmentComplete: true,
              status: nextStatus,
              updatedAt: new Date(),
            }
          : fab
      ),
    }));
  },
  
  markBaseTreatmentComplete: (id) => {
    const fabric = get().fabrics.find((f) => f.id === id);
    if (!fabric) return;
    
    const nextStatus: FabricStatus = fabric.surfaceTreatments.length > 0
      ? 'pending-surface-treatment'
      : 'ready-for-induction';
    
    set((state) => ({
      fabrics: state.fabrics.map((fab) =>
        fab.id === id
          ? {
              ...fab,
              baseTreatmentComplete: true,
              status: nextStatus,
              updatedAt: new Date(),
            }
          : fab
      ),
    }));
  },
  
  markSurfaceTreatmentComplete: (id) => {
    set((state) => ({
      fabrics: state.fabrics.map((fab) =>
        fab.id === id
          ? {
              ...fab,
              surfaceTreatmentComplete: true,
              status: 'ready-for-induction',
              updatedAt: new Date(),
            }
          : fab
      ),
    }));
  },
  
  inductFabric: (id, specs) => {
    set((state) => ({
      fabrics: state.fabrics.map((fab) =>
        fab.id === id
          ? {
              ...fab,
              technicalSpecs: specs,
              status: 'inducted',
              inductedAt: new Date(),
              updatedAt: new Date(),
            }
          : fab
      ),
    }));
  },
  
  getFabricById: (id) => get().fabrics.find((f) => f.id === id),
  
  getFabricsByCollection: (collectionId) =>
    get().fabrics.filter((f) => f.collectionId === collectionId),
  
  getFabricsByLine: (lineId) =>
    get().fabrics.filter((f) => f.lineId === lineId),
  
  getFabricsByStatus: (status) =>
    get().fabrics.filter((f) => f.status === status),
  
  getSeasonFabricSummary: () => {
    const fabrics = get().fabrics;
    const byStatus = {} as Record<FabricStatus, number>;
    const byLine = {} as Record<string, number>;
    
    const allStatuses: FabricStatus[] = [
      'pending-artwork',
      'pending-dye-plan',
      'pending-print-plan',
      'in-base-treatment',
      'pending-surface-treatment',
      'in-surface-treatment',
      'ready-for-induction',
      'inducted',
    ];
    
    allStatuses.forEach((s) => (byStatus[s] = 0));
    
    fabrics.forEach((fab) => {
      byStatus[fab.status] = (byStatus[fab.status] || 0) + 1;
      byLine[fab.lineId] = (byLine[fab.lineId] || 0) + 1;
    });
    
    return {
      total: fabrics.length,
      byStatus,
      byLine,
      inducted: byStatus['inducted'] || 0,
      pending: fabrics.length - (byStatus['inducted'] || 0),
    };
  },
}));
