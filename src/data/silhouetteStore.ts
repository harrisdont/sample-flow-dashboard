import { create } from 'zustand';

export type SilhouetteStatus = 
  | 'sketch-submitted' 
  | 'in-pattern' 
  | 'sample-ready' 
  | 'approved' 
  | 'rejected';

export type SilhouetteCategory = 'top' | 'bottom' | 'dupatta' | 'dress' | 'outerwear' | 'slip' | 'accessories';

export interface Silhouette {
  id: string;
  code: string;
  name: string;
  category: SilhouetteCategory;
  subType?: string;
  
  // Line & Designer
  lineId?: string;
  designerName?: string;
  
  // Workflow status
  status: SilhouetteStatus;
  
  // Design input
  sketchFile?: string;             // Legacy — maps to frontSketch
  frontSketch?: string;
  backSketch?: string;
  referenceImages?: string[];
  designerNotes?: string;
  
  // Measurements (category-specific)
  measurements?: Record<string, string>;
  
  // Seam finish
  seamFinish?: string;
  
  // Pattern & Sample
  ggtFileLink?: string;
  gradingComplete: boolean;
  gradingSizes: string[];
  
  // Cost data (added on approval)
  fabricConsumption?: number;
  stitchingCost?: number;
  linkedFabricId?: string;
  
  // Technical drawing
  technicalDrawing?: string;
  
  // Tracking
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
  rejectedReason?: string;
}

export const SILHOUETTE_STATUS_CONFIG: Record<SilhouetteStatus, { label: string; color: string }> = {
  'sketch-submitted': { label: 'Sketch Submitted', color: 'hsl(var(--status-pending))' },
  'in-pattern': { label: 'In Pattern', color: 'hsl(var(--status-in-progress))' },
  'sample-ready': { label: 'Sample Ready', color: 'hsl(var(--chart-4))' },
  'approved': { label: 'Approved', color: 'hsl(var(--status-complete))' },
  'rejected': { label: 'Rejected', color: 'hsl(var(--status-delayed))' },
};

export const SILHOUETTE_CATEGORY_LABELS: Record<SilhouetteCategory, string> = {
  'top': 'Top',
  'bottom': 'Bottom',
  'dupatta': 'Dupatta',
  'dress': 'Dress',
  'outerwear': 'Outerwear',
  'slip': 'Slip',
  'accessories': 'Accessories',
};

export const GRADING_SIZE_OPTIONS = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

interface SilhouetteStore {
  silhouettes: Record<string, Silhouette>;
  
  // CRUD
  addSilhouette: (silhouette: Omit<Silhouette, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateSilhouette: (id: string, updates: Partial<Silhouette>) => void;
  deleteSilhouette: (id: string) => void;
  
  // Status workflow
  updateStatus: (id: string, status: SilhouetteStatus) => void;
  submitSketch: (id: string, sketchFile: string, designerNotes?: string) => void;
  moveToPattern: (id: string) => void;
  markSampleReady: (id: string) => void;
  approveSilhouette: (id: string, data: {
    ggtFileLink: string;
    gradingSizes: string[];
    fabricConsumption: number;
    stitchingCost: number;
    linkedFabricId?: string;
    technicalDrawing?: string;
  }) => void;
  rejectSilhouette: (id: string, reason: string) => void;
  
  // Queries
  getSilhouetteById: (id: string) => Silhouette | undefined;
  getSilhouettesByStatus: (status: SilhouetteStatus) => Silhouette[];
  getSilhouettesByCategory: (category: SilhouetteCategory) => Silhouette[];
  getApprovedSilhouettes: () => Silhouette[];
  
  // Cost calculation helper
  calculateSilhouetteCost: (silhouetteId: string, fabricCostPerMeter: number) => {
    fabricCost: number;
    stitchingCost: number;
    totalCost: number;
    predictedSellingPrice: number;
  } | null;
}

// Sample silhouettes for development
const sampleSilhouettes: Record<string, Silhouette> = {
  'sil-001': {
    id: 'sil-001',
    code: 'W-LNG-001',
    name: 'Long Kurta Classic',
    category: 'top',
    subType: 'kurta',
    status: 'approved',
    gradingComplete: true,
    gradingSizes: ['XS', 'S', 'M', 'L', 'XL'],
    ggtFileLink: 'https://example.com/patterns/w-lng-001.ggt',
    fabricConsumption: 2.5,
    stitchingCost: 850,
    technicalDrawing: '/src/assets/silhouettes/long-kurta.png',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-15'),
    approvedAt: new Date('2024-01-15'),
  },
  'sil-002': {
    id: 'sil-002',
    code: 'W-SHT-002',
    name: 'Short Kurta Modern',
    category: 'top',
    subType: 'kurta',
    status: 'approved',
    gradingComplete: true,
    gradingSizes: ['S', 'M', 'L', 'XL'],
    ggtFileLink: 'https://example.com/patterns/w-sht-002.ggt',
    fabricConsumption: 1.8,
    stitchingCost: 650,
    technicalDrawing: '/src/assets/silhouettes/short-kurta.png',
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-18'),
    approvedAt: new Date('2024-01-18'),
  },
  'sil-003': {
    id: 'sil-003',
    code: 'W-STR-003',
    name: 'Straight Shirt',
    category: 'top',
    subType: 'kameez',
    status: 'in-pattern',
    gradingComplete: false,
    gradingSizes: [],
    designerNotes: 'Clean lines, minimal detailing. Focus on structure.',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-22'),
  },
  'sil-004': {
    id: 'sil-004',
    code: 'W-ALN-004',
    name: 'A-Line Shirt',
    category: 'top',
    subType: 'tunic',
    status: 'sample-ready',
    gradingComplete: false,
    gradingSizes: [],
    technicalDrawing: '/src/assets/silhouettes/aline-shirt.png',
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-25'),
  },
  'sil-005': {
    id: 'sil-005',
    code: 'W-WLP-005',
    name: 'Wide Leg Pants',
    category: 'bottom',
    subType: 'trousers',
    status: 'sketch-submitted',
    gradingComplete: false,
    gradingSizes: [],
    sketchFile: 'https://example.com/sketches/wide-leg.jpg',
    designerNotes: 'High waist, flowy silhouette. Target casual wear.',
    technicalDrawing: '/src/assets/silhouettes/wide-leg-pants.png',
    createdAt: new Date('2024-01-28'),
    updatedAt: new Date('2024-01-28'),
  },
  'sil-006': {
    id: 'sil-006',
    code: 'W-BLZ-006',
    name: 'Tailored Blazer',
    category: 'outerwear',
    subType: 'jacket',
    status: 'rejected',
    gradingComplete: false,
    gradingSizes: [],
    rejectedReason: 'Shoulder construction needs revision. Too structured for the target aesthetic.',
    technicalDrawing: '/src/assets/silhouettes/tailored-blazer.png',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
  },
};

export const useSilhouetteStore = create<SilhouetteStore>((set, get) => ({
  silhouettes: sampleSilhouettes,
  
  addSilhouette: (silhouette) => {
    const id = `sil-${Date.now()}`;
    const now = new Date();
    set((state) => ({
      silhouettes: {
        ...state.silhouettes,
        [id]: {
          ...silhouette,
          id,
          createdAt: now,
          updatedAt: now,
        },
      },
    }));
    return id;
  },
  
  updateSilhouette: (id, updates) => {
    set((state) => ({
      silhouettes: {
        ...state.silhouettes,
        [id]: {
          ...state.silhouettes[id],
          ...updates,
          updatedAt: new Date(),
        },
      },
    }));
  },
  
  deleteSilhouette: (id) => {
    set((state) => {
      const { [id]: removed, ...rest } = state.silhouettes;
      return { silhouettes: rest };
    });
  },
  
  updateStatus: (id, status) => {
    set((state) => ({
      silhouettes: {
        ...state.silhouettes,
        [id]: {
          ...state.silhouettes[id],
          status,
          updatedAt: new Date(),
        },
      },
    }));
  },
  
  submitSketch: (id, sketchFile, designerNotes) => {
    set((state) => ({
      silhouettes: {
        ...state.silhouettes,
        [id]: {
          ...state.silhouettes[id],
          sketchFile,
          designerNotes,
          status: 'sketch-submitted',
          updatedAt: new Date(),
        },
      },
    }));
  },
  
  moveToPattern: (id) => {
    set((state) => ({
      silhouettes: {
        ...state.silhouettes,
        [id]: {
          ...state.silhouettes[id],
          status: 'in-pattern',
          updatedAt: new Date(),
        },
      },
    }));
  },
  
  markSampleReady: (id) => {
    set((state) => ({
      silhouettes: {
        ...state.silhouettes,
        [id]: {
          ...state.silhouettes[id],
          status: 'sample-ready',
          updatedAt: new Date(),
        },
      },
    }));
  },
  
  approveSilhouette: (id, data) => {
    const now = new Date();
    set((state) => ({
      silhouettes: {
        ...state.silhouettes,
        [id]: {
          ...state.silhouettes[id],
          status: 'approved',
          ggtFileLink: data.ggtFileLink,
          gradingSizes: data.gradingSizes,
          gradingComplete: true,
          fabricConsumption: data.fabricConsumption,
          stitchingCost: data.stitchingCost,
          linkedFabricId: data.linkedFabricId,
          technicalDrawing: data.technicalDrawing,
          approvedAt: now,
          updatedAt: now,
        },
      },
    }));
  },
  
  rejectSilhouette: (id, reason) => {
    set((state) => ({
      silhouettes: {
        ...state.silhouettes,
        [id]: {
          ...state.silhouettes[id],
          status: 'rejected',
          rejectedReason: reason,
          updatedAt: new Date(),
        },
      },
    }));
  },
  
  getSilhouetteById: (id) => get().silhouettes[id],
  
  getSilhouettesByStatus: (status) => 
    Object.values(get().silhouettes).filter((s) => s.status === status),
  
  getSilhouettesByCategory: (category) =>
    Object.values(get().silhouettes).filter((s) => s.category === category),
  
  getApprovedSilhouettes: () =>
    Object.values(get().silhouettes).filter((s) => s.status === 'approved'),
  
  calculateSilhouetteCost: (silhouetteId, fabricCostPerMeter) => {
    const silhouette = get().silhouettes[silhouetteId];
    if (!silhouette || silhouette.status !== 'approved' || !silhouette.fabricConsumption || !silhouette.stitchingCost) {
      return null;
    }
    
    const fabricCost = silhouette.fabricConsumption * fabricCostPerMeter;
    const stitchingCost = silhouette.stitchingCost;
    const totalCost = fabricCost + stitchingCost;
    const predictedSellingPrice = totalCost * 3.2;
    
    return {
      fabricCost,
      stitchingCost,
      totalCost,
      predictedSellingPrice,
    };
  },
}));
