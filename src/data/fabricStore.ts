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

// Sample data for demonstration
const sampleFabrics: FabricEntry[] = [
  {
    id: 'fab-1',
    collectionId: 'woman-summer-24',
    collectionName: 'Summer Bloom',
    lineId: 'woman',
    lineName: 'Woman',
    lineColor: 'bg-pink-500',
    componentType: 'shirt',
    fabricName: 'Slub Cotton Lawn',
    fabricComposition: '100% Cotton',
    fabricType: 'greige',
    status: 'pending-print-plan',
    artworkSubmitted: false,
    baseTreatmentType: 'printing',
    printType: 'digital',
    baseTreatmentComplete: false,
    surfaceTreatments: ['multihead'],
    surfaceTreatmentComplete: false,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    fabricDeadline: new Date('2024-02-15'),
  },
  {
    id: 'fab-2',
    collectionId: 'woman-summer-24',
    collectionName: 'Summer Bloom',
    lineId: 'woman',
    lineName: 'Woman',
    lineColor: 'bg-pink-500',
    componentType: 'dupatta',
    fabricName: 'Silk Organza',
    fabricComposition: '100% Silk',
    fabricType: 'greige',
    status: 'in-base-treatment',
    artworkSubmitted: false,
    baseTreatmentType: 'dyeing',
    baseTreatmentComplete: false,
    surfaceTreatments: [],
    surfaceTreatmentComplete: false,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-18'),
    fabricDeadline: new Date('2024-02-15'),
  },
  {
    id: 'fab-3',
    collectionId: 'classic-eid-24',
    collectionName: 'Eid Festive',
    lineId: 'classic',
    lineName: 'Classic',
    lineColor: 'bg-orange-500',
    componentType: 'shirt',
    fabricName: 'Jacquard Lawn',
    fabricComposition: '100% Cotton Jacquard',
    fabricType: 'jacquard',
    status: 'pending-artwork',
    artworkSubmitted: false,
    baseTreatmentType: 'none',
    baseTreatmentComplete: false,
    surfaceTreatments: ['block-print'],
    surfaceTreatmentComplete: false,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
    fabricDeadline: new Date('2024-02-01'),
  },
  {
    id: 'fab-4',
    collectionId: 'formals-winter-24',
    collectionName: 'Winter Elegance',
    lineId: 'formals',
    lineName: 'Formals',
    lineColor: 'bg-purple-500',
    componentType: 'shirt',
    fabricName: 'Dobby Cotton',
    fabricComposition: '100% Cotton Dobby',
    fabricType: 'dobby',
    status: 'inducted',
    artworkSubmitted: true,
    artworkApprovalDate: new Date('2024-01-05'),
    baseTreatmentType: 'none',
    baseTreatmentComplete: true,
    surfaceTreatments: [],
    surfaceTreatmentComplete: true,
    technicalSpecs: {
      construction: 'Dobby Weave',
      fabricWidth: '52 inches',
      gsm: 120,
      costPerMeter: 850,
      shrinkageMargin: '3-4%',
      stitchingSpecs: 'Use size 11 needle, 3mm stitch length',
      careInstructions: 'Machine wash cold, tumble dry low',
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-12'),
    inductedAt: new Date('2024-01-12'),
    fabricDeadline: new Date('2024-01-20'),
  },
  {
    id: 'fab-5',
    collectionId: 'cottage-summer-24',
    collectionName: 'Artisan Summer',
    lineId: 'cottage',
    lineName: 'Cottage',
    lineColor: 'bg-yellow-500',
    componentType: 'shirt',
    fabricName: 'Yarn Dyed Chambray',
    fabricComposition: '100% Cotton',
    fabricType: 'yarn-dyed',
    status: 'in-surface-treatment',
    artworkSubmitted: true,
    artworkApprovalDate: new Date('2024-01-08'),
    baseTreatmentType: 'none',
    baseTreatmentComplete: true,
    surfaceTreatments: ['screen-print', 'block-print'],
    surfaceTreatmentComplete: false,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-15'),
    fabricDeadline: new Date('2024-02-10'),
  },
  {
    id: 'fab-6',
    collectionId: 'woman-summer-24',
    collectionName: 'Summer Bloom',
    lineId: 'woman',
    lineName: 'Woman',
    lineColor: 'bg-pink-500',
    componentType: 'lowers',
    fabricName: 'Cambric Cotton',
    fabricComposition: '100% Cotton',
    fabricType: 'greige',
    status: 'ready-for-induction',
    artworkSubmitted: false,
    baseTreatmentType: 'dyeing',
    dyePlan: 'Solid dye - Color #A45C3E',
    baseTreatmentComplete: true,
    surfaceTreatments: [],
    surfaceTreatmentComplete: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    fabricDeadline: new Date('2024-02-15'),
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
