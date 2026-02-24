// Library data for silhouettes, necklines, sleeves, etc.

import { SilhouetteCategory } from '@/data/silhouetteStore';

export interface SilhouetteItem {
  id: string;
  name: string;
  code: string;
  category: 'kurta' | 'shirt' | 'dress' | 'pants' | 'dupatta';
  technicalDrawing?: string;
}

export interface NecklineItem {
  id: string;
  name: string;
  code: string;
}

export interface SleeveItem {
  id: string;
  name: string;
  code: string;
}

export interface SeamFinishItem {
  id: string;
  name: string;
  type: string;
}

export interface FabricItem {
  id: string;
  name: string;
  composition: string;
}

export const silhouetteLibrary: SilhouetteItem[] = [
  { id: '1', name: 'Long Kurta', code: 'W-LNG-001', category: 'kurta', technicalDrawing: '/src/assets/silhouettes/long-kurta.png' },
  { id: '2', name: 'Short Kurta', code: 'W-SRT-002', category: 'kurta', technicalDrawing: '/src/assets/silhouettes/short-kurta.png' },
  { id: '3', name: 'A-Line Shirt', code: 'C-SRT-012', category: 'shirt', technicalDrawing: '/src/assets/silhouettes/aline-shirt.png' },
  { id: '4', name: 'Straight Shirt', code: 'F-STR-008', category: 'shirt', technicalDrawing: '/src/assets/silhouettes/straight-shirt.png' },
  { id: '5', name: 'Tailored Blazer', code: 'F-BLZ-008', category: 'dress', technicalDrawing: '/src/assets/silhouettes/tailored-blazer.png' },
  { id: '6', name: 'Wide Leg Pants', code: 'W-PNT-015', category: 'pants', technicalDrawing: '/src/assets/silhouettes/wide-leg-pants.png' },
];

export const necklineLibrary: NecklineItem[] = [
  { id: '1', name: 'Round Neck', code: 'NK-RND-001' },
  { id: '2', name: 'V-Neck', code: 'NK-VNK-002' },
  { id: '3', name: 'Square Neck', code: 'NK-SQR-003' },
  { id: '4', name: 'Boat Neck', code: 'NK-BOT-004' },
  { id: '5', name: 'Sweetheart Neck', code: 'NK-SWT-005' },
  { id: '6', name: 'Chinese Collar', code: 'NK-CHN-006' },
];

export const sleeveLibrary: SleeveItem[] = [
  { id: '1', name: 'Full Sleeve', code: 'SL-FLL-001' },
  { id: '2', name: 'Three Quarter', code: 'SL-3QT-002' },
  { id: '3', name: 'Short Sleeve', code: 'SL-SRT-003' },
  { id: '4', name: 'Sleeveless', code: 'SL-NON-004' },
  { id: '5', name: 'Bell Sleeve', code: 'SL-BLL-005' },
  { id: '6', name: 'Cape Sleeve', code: 'SL-CPE-006' },
];

export const seamFinishLibrary: SeamFinishItem[] = [
  { id: '1', name: 'French Seam', type: 'Enclosed' },
  { id: '2', name: 'Flat Fell Seam', type: 'Enclosed' },
  { id: '3', name: 'Overlock', type: 'Edge Finish' },
  { id: '4', name: 'Bias Binding', type: 'Edge Finish' },
  { id: '5', name: 'Hong Kong Finish', type: 'Edge Finish' },
];

export const fabricLibrary: FabricItem[] = [
  { id: '1', name: 'Slub x Slub Voile', composition: '100% Cotton' },
  { id: '2', name: 'Pure Cotton Lawn', composition: '100% Cotton' },
  { id: '3', name: 'Premium Suiting', composition: '70% Wool, 30% Polyester' },
  { id: '4', name: 'Silk Organza', composition: '100% Silk' },
  { id: '5', name: 'Linen Blend', composition: '55% Linen, 45% Cotton' },
];

// Base fabric library for fabric induction
export interface BaseFabricItem {
  id: string;
  name: string;
  defaultComposition: string;
  type: 'jacquard' | 'dobby' | 'yarn-dyed' | 'greige' | 'solid-dyed' | 'other';
}

export const baseFabricLibrary: BaseFabricItem[] = [
  { id: 'lawn', name: 'Cotton Lawn', defaultComposition: '100% Cotton', type: 'greige' },
  { id: 'cambric', name: 'Cambric', defaultComposition: '100% Cotton', type: 'greige' },
  { id: 'voile', name: 'Cotton Voile', defaultComposition: '100% Cotton', type: 'greige' },
  { id: 'slub-lawn', name: 'Slub Lawn', defaultComposition: '100% Cotton', type: 'greige' },
  { id: 'jacquard-lawn', name: 'Jacquard Lawn', defaultComposition: '100% Cotton', type: 'jacquard' },
  { id: 'jacquard-cambric', name: 'Jacquard Cambric', defaultComposition: '100% Cotton', type: 'jacquard' },
  { id: 'dobby-cotton', name: 'Dobby Cotton', defaultComposition: '100% Cotton', type: 'dobby' },
  { id: 'yarn-dyed-chambray', name: 'Yarn Dyed Chambray', defaultComposition: '100% Cotton', type: 'yarn-dyed' },
  { id: 'yarn-dyed-check', name: 'Yarn Dyed Check', defaultComposition: '100% Cotton', type: 'yarn-dyed' },
  { id: 'silk-organza', name: 'Silk Organza', defaultComposition: '100% Silk', type: 'greige' },
  { id: 'chiffon', name: 'Chiffon', defaultComposition: '100% Polyester', type: 'greige' },
  { id: 'georgette', name: 'Georgette', defaultComposition: '100% Polyester', type: 'greige' },
  { id: 'net', name: 'Net Fabric', defaultComposition: '100% Nylon', type: 'greige' },
  { id: 'velvet', name: 'Velvet', defaultComposition: '100% Polyester', type: 'solid-dyed' },
  { id: 'linen', name: 'Pure Linen', defaultComposition: '100% Linen', type: 'greige' },
  { id: 'linen-blend', name: 'Linen Blend', defaultComposition: '55% Linen, 45% Cotton', type: 'greige' },
];

// ── Silhouette Sub-Types per Category ────────────────────────────────────────

export const SILHOUETTE_SUB_TYPES: Record<SilhouetteCategory, { id: string; label: string }[]> = {
  top: [
    { id: 'kurta', label: 'Kurta' },
    { id: 'kameez', label: 'Kameez' },
    { id: 'tunic', label: 'Tunic' },
    { id: 'choli-blouse', label: 'Choli/Blouse' },
  ],
  bottom: [
    { id: 'shalwar', label: 'Shalwar' },
    { id: 'trousers', label: 'Trousers' },
    { id: 'lehenga', label: 'Lehenga' },
    { id: 'saree', label: 'Saree' },
    { id: 'gharara-sharara', label: 'Gharara/Sharara' },
    { id: 'skirt', label: 'Skirt' },
    { id: 'dhoti', label: 'Dhoti' },
    { id: 'sarong', label: 'Sarong' },
  ],
  dress: [
    { id: 'anarkali-angarkha', label: 'Anarkali/Angarkha' },
    { id: 'kaftan', label: 'Kaftan' },
  ],
  outerwear: [
    { id: 'koti', label: 'Koti' },
    { id: 'jacket', label: 'Jacket' },
    { id: 'coat', label: 'Coat' },
  ],
  dupatta: [
    { id: 'regular', label: 'Regular' },
    { id: 'stole', label: 'Stole' },
    { id: 'scarf', label: 'Scarf' },
    { id: 'experimental', label: 'Experimental' },
  ],
  accessories: [
    { id: 'bag', label: 'Bag' },
    { id: 'wallet', label: 'Wallet' },
    { id: 'scrunchie', label: 'Scrunchie' },
    { id: 'special-edition', label: 'Special Edition' },
  ],
  slip: [
    { id: 'slip', label: 'Slip' },
  ],
};

// ── Category-Specific Measurements ───────────────────────────────────────────

export interface MeasurementField {
  id: string;
  label: string;
  unit: string;
}

export const CATEGORY_MEASUREMENTS: Record<SilhouetteCategory, MeasurementField[]> = {
  top: [
    { id: 'length', label: 'Length', unit: 'in' },
    { id: 'chest', label: 'Chest', unit: 'in' },
    { id: 'shoulder', label: 'Shoulder', unit: 'in' },
    { id: 'sleeve-length', label: 'Sleeve Length', unit: 'in' },
    { id: 'armhole', label: 'Armhole', unit: 'in' },
    { id: 'hem-width', label: 'Hem Width', unit: 'in' },
    { id: 'neck-depth-front', label: 'Neck Depth (Front)', unit: 'in' },
    { id: 'neck-depth-back', label: 'Neck Depth (Back)', unit: 'in' },
    { id: 'sleeve-opening', label: 'Sleeve Opening', unit: 'in' },
  ],
  bottom: [
    { id: 'length', label: 'Length', unit: 'in' },
    { id: 'waist', label: 'Waist', unit: 'in' },
    { id: 'hip', label: 'Hip', unit: 'in' },
    { id: 'inseam', label: 'Inseam', unit: 'in' },
    { id: 'thigh', label: 'Thigh', unit: 'in' },
    { id: 'knee', label: 'Knee', unit: 'in' },
    { id: 'hem-opening', label: 'Hem Opening', unit: 'in' },
    { id: 'rise', label: 'Rise', unit: 'in' },
  ],
  dupatta: [
    { id: 'length', label: 'Length', unit: 'in' },
    { id: 'width', label: 'Width', unit: 'in' },
  ],
  dress: [
    { id: 'length', label: 'Length', unit: 'in' },
    { id: 'chest', label: 'Chest', unit: 'in' },
    { id: 'shoulder', label: 'Shoulder', unit: 'in' },
    { id: 'sleeve-length', label: 'Sleeve Length', unit: 'in' },
    { id: 'armhole', label: 'Armhole', unit: 'in' },
    { id: 'waist', label: 'Waist', unit: 'in' },
    { id: 'hip', label: 'Hip', unit: 'in' },
    { id: 'hem-width', label: 'Hem Width', unit: 'in' },
    { id: 'neck-depth-front', label: 'Neck Depth (Front)', unit: 'in' },
    { id: 'neck-depth-back', label: 'Neck Depth (Back)', unit: 'in' },
  ],
  outerwear: [
    { id: 'length', label: 'Length', unit: 'in' },
    { id: 'chest', label: 'Chest', unit: 'in' },
    { id: 'shoulder', label: 'Shoulder', unit: 'in' },
    { id: 'sleeve-length', label: 'Sleeve Length', unit: 'in' },
    { id: 'armhole', label: 'Armhole', unit: 'in' },
    { id: 'hem-width', label: 'Hem Width', unit: 'in' },
    { id: 'overlap-closure', label: 'Overlap/Closure Width', unit: 'in' },
  ],
  slip: [
    { id: 'length', label: 'Length', unit: 'in' },
    { id: 'chest', label: 'Chest', unit: 'in' },
    { id: 'hip', label: 'Hip', unit: 'in' },
    { id: 'hem-width', label: 'Hem Width', unit: 'in' },
  ],
  accessories: [
    { id: 'length', label: 'Length', unit: 'in' },
    { id: 'width', label: 'Width', unit: 'in' },
    { id: 'depth-gusset', label: 'Depth/Gusset', unit: 'in' },
  ],
};

// ── Product Lines (shared constant) ──────────────────────────────────────────

export interface ProductLine {
  id: string;
  name: string;
  prefix: string;
}

export const PRODUCT_LINES: ProductLine[] = [
  { id: 'cottage', name: 'Cottage', prefix: 'COT' },
  { id: 'classic', name: 'Classic', prefix: 'CLS' },
  { id: 'formals', name: 'Formals', prefix: 'FRM' },
  { id: 'woman', name: 'Woman', prefix: 'WMN' },
  { id: 'ming', name: 'Ming', prefix: 'MNG' },
  { id: 'basic', name: 'Basic', prefix: 'BSC' },
  { id: 'semi-bridals', name: 'Semi Bridals', prefix: 'SBR' },
  { id: 'leather', name: 'Leather', prefix: 'LTH' },
  { id: 'regen', name: 'Regen', prefix: 'RGN' },
];

// Category prefix mapping for code generation
export const CATEGORY_PREFIXES: Record<SilhouetteCategory, string> = {
  top: 'TOP',
  bottom: 'BTM',
  dupatta: 'DUP',
  dress: 'DRS',
  outerwear: 'OTW',
  slip: 'SLP',
  accessories: 'ACC',
};
