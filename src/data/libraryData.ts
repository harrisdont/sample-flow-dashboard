// Library data for silhouettes, necklines, sleeves, etc.

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
  { id: '1', name: 'Long Kurta', code: 'W-LNG-001', category: 'kurta' },
  { id: '2', name: 'Short Kurta', code: 'W-SRT-002', category: 'kurta' },
  { id: '3', name: 'A-Line Shirt', code: 'C-SRT-012', category: 'shirt' },
  { id: '4', name: 'Straight Shirt', code: 'F-STR-008', category: 'shirt' },
  { id: '5', name: 'Tailored Blazer', code: 'F-BLZ-008', category: 'dress' },
  { id: '6', name: 'Wide Leg Pants', code: 'W-PNT-015', category: 'pants' },
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
