import { create } from 'zustand';
import { NecklineItem, SleeveItem, necklineLibrary, sleeveLibrary } from '@/data/libraryData';

interface ConstructionLibraryStore {
  necklines: NecklineItem[];
  sleeves: SleeveItem[];
  addNeckline: (name: string) => NecklineItem;
  addSleeve: (name: string) => SleeveItem;
}

const generateCode = (prefix: 'NK' | 'SL', name: string, existingCount: number): string => {
  const abbr = name.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase() || 'NEW';
  const num = String(existingCount + 1).padStart(3, '0');
  return `${prefix}-${abbr}-${num}`;
};

export const useConstructionLibraryStore = create<ConstructionLibraryStore>((set, get) => ({
  necklines: [...necklineLibrary],
  sleeves: [...sleeveLibrary],

  addNeckline: (name: string) => {
    const existing = get().necklines;
    const code = generateCode('NK', name, existing.length);
    const newItem: NecklineItem = {
      id: `nk-${Date.now()}`,
      name,
      code,
    };
    set((state) => ({ necklines: [...state.necklines, newItem] }));
    return newItem;
  },

  addSleeve: (name: string) => {
    const existing = get().sleeves;
    const code = generateCode('SL', name, existing.length);
    const newItem: SleeveItem = {
      id: `sl-${Date.now()}`,
      name,
      code,
    };
    set((state) => ({ sleeves: [...state.sleeves, newItem] }));
    return newItem;
  },
}));
