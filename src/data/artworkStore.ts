import { create } from 'zustand';

export type ArtworkType = 'print' | 'motif';

export type PrintTechnique = 'digital' | 'rotary' | 'screen';
export type MotifTechnique = 'multihead' | 'pakki' | 'ari-dori' | 'adda' | 'cottage';
export type ArtworkLayout = 'running' | 'engineered' | 'borders';

export type ArtworkComponent = 'shirt' | 'dupatta' | 'lowers';

export const SHIRT_PLACEMENTS = ['front', 'back', 'sleeve'] as const;
export const LOWERS_PLACEMENTS = ['trousers-shalwar', 'panels-skirt', 'circle-skirt', 'saree', 'gharara'] as const;
export const DUPATTA_PLACEMENTS = ['stole', 'square-scarf', '2.5M', '2.75M'] as const;

export const PLACEMENT_LABELS: Record<string, string> = {
  'front': 'Front',
  'back': 'Back',
  'sleeve': 'Sleeve',
  'trousers-shalwar': 'Trousers / Shalwar',
  'panels-skirt': 'Panels Skirt',
  'circle-skirt': 'Circle Skirt',
  'saree': 'Saree',
  'gharara': 'Gharara',
  'stole': 'Stole',
  'square-scarf': 'Square Scarf',
  '2.5M': '2.5M',
  '2.75M': '2.75M',
};

export interface Colourway {
  id: string;
  name: string;
  fileLink: string;
}

export interface Artwork {
  id: string;
  type: ArtworkType;
  collectionId: string;
  designerName: string;
  lineId: string;
  technique: string;
  layout: string;
  components: string[];
  placements: string[];
  artworkFileLink: string;
  colourways: Colourway[];
  butterPaperId?: string;
  autoFilledDetails?: {
    silhouetteName: string;
    componentName: string;
    code: string;
    category: string;
    subType: string;
  };
  status: 'draft' | 'submitted' | 'approved';
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ArtworkStore {
  artworks: Record<string, Artwork>;
  addArtwork: (artwork: Omit<Artwork, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateArtwork: (id: string, updates: Partial<Artwork>) => void;
  removeArtwork: (id: string) => void;
  getArtworkByCollection: (collectionId: string) => Artwork[];
  getArtworkByType: (type: ArtworkType) => Artwork[];
}

const sampleArtworks: Record<string, Artwork> = {
  'art-001': {
    id: 'art-001',
    type: 'print',
    collectionId: 'luxe-basics',
    designerName: 'Ayesha Khan',
    lineId: 'woman',
    technique: 'digital',
    layout: 'running',
    components: ['shirt', 'dupatta'],
    placements: [],
    artworkFileLink: '\\\\server\\artwork\\digital-floral-001.psd',
    colourways: [
      { id: 'cw-1', name: 'Blush Pink', fileLink: '\\\\server\\artwork\\digital-floral-001-blush.psd' },
      { id: 'cw-2', name: 'Sage Green', fileLink: '\\\\server\\artwork\\digital-floral-001-sage.psd' },
    ],
    status: 'submitted',
    notes: 'Tonal floral with watercolour effect',
    createdAt: new Date('2025-11-01'),
    updatedAt: new Date('2025-11-05'),
  },
  'art-002': {
    id: 'art-002',
    type: 'motif',
    collectionId: 'festive-heritage',
    designerName: 'Usman Ali',
    lineId: 'cottage',
    technique: 'multihead',
    layout: 'engineered',
    components: ['shirt'],
    placements: ['front', 'sleeve'],
    artworkFileLink: '\\\\server\\motifs\\multihead-heritage-002.dst',
    colourways: [
      { id: 'cw-3', name: 'Gold Thread', fileLink: '\\\\server\\motifs\\multihead-heritage-002-gold.dst' },
    ],
    butterPaperId: 'sil-001',
    autoFilledDetails: {
      silhouetteName: 'Long Kurta Classic',
      componentName: 'Shirt',
      code: 'W-LNG-001',
      category: 'top',
      subType: 'kurta',
    },
    status: 'submitted',
    notes: 'Heritage panel with geometric borders',
    createdAt: new Date('2025-11-10'),
    updatedAt: new Date('2025-11-12'),
  },
  'art-003': {
    id: 'art-003',
    type: 'motif',
    collectionId: 'luxe-basics',
    designerName: 'Ayesha Khan',
    lineId: 'woman',
    technique: 'pakki',
    layout: '',
    components: ['shirt'],
    placements: ['front'],
    artworkFileLink: '\\\\server\\motifs\\pakki-floral-003.cdr',
    colourways: [],
    status: 'draft',
    notes: 'Delicate pakki work on neckline area',
    createdAt: new Date('2025-11-15'),
    updatedAt: new Date('2025-11-15'),
  },
};

export const useArtworkStore = create<ArtworkStore>((set, get) => ({
  artworks: sampleArtworks,

  addArtwork: (artwork) => {
    const id = `art-${Date.now()}`;
    const now = new Date();
    set((state) => ({
      artworks: {
        ...state.artworks,
        [id]: { ...artwork, id, createdAt: now, updatedAt: now },
      },
    }));
    return id;
  },

  updateArtwork: (id, updates) => {
    set((state) => ({
      artworks: {
        ...state.artworks,
        [id]: { ...state.artworks[id], ...updates, updatedAt: new Date() },
      },
    }));
  },

  removeArtwork: (id) => {
    set((state) => {
      const { [id]: _, ...rest } = state.artworks;
      return { artworks: rest };
    });
  },

  getArtworkByCollection: (collectionId) =>
    Object.values(get().artworks).filter((a) => a.collectionId === collectionId),

  getArtworkByType: (type) =>
    Object.values(get().artworks).filter((a) => a.type === type),
}));
