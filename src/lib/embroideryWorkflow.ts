import { ProcessStage, EmbroideryTechnique } from '@/types/sample';

// Routing paths per decoration technique
const ROUTING_PATHS: Record<EmbroideryTechnique, ProcessStage[]> = {
  'multihead': [
    'motif-assignment', 'motif-in-progress', 'motif-review',
    'multihead-punching', 'multihead', 'decoration-approval',
  ],
  'hand-embroidery': [
    'motif-assignment', 'motif-in-progress', 'motif-review',
    'pinning', 'stencil-transfer', 'hand-embroidery', 'decoration-approval',
  ],
  'screen-print': [
    'motif-assignment', 'motif-in-progress', 'motif-review',
    'screen-print-execution', 'decoration-approval',
  ],
  'hand-block-print': [
    'motif-assignment', 'motif-in-progress', 'motif-review',
    'hand-block-printing', 'decoration-approval',
  ],
};

// All decoration sub-stages (unique, ordered)
export const ALL_DECORATION_STAGES: ProcessStage[] = [
  'motif-assignment', 'motif-in-progress', 'motif-review',
  'multihead-punching', 'pinning', 'stencil-transfer',
  'hand-embroidery', 'screen-print-execution', 'hand-block-printing',
  'multihead', 'decoration-approval',
];

// Human-readable labels for decoration stages
export const DECORATION_STAGE_LABELS: Record<string, string> = {
  'motif-assignment': 'Motif Assignment',
  'motif-in-progress': 'Motif In Progress',
  'motif-review': 'Motif Review',
  'multihead-punching': 'Multihead Punching',
  'pinning': 'Pinning',
  'stencil-transfer': 'Stencil Transfer',
  'hand-embroidery': 'Hand Embroidery',
  'screen-print-execution': 'Screen Print Exec',
  'hand-block-printing': 'Hand Block Print',
  'decoration-approval': 'Decoration Approval',
};

// Check if a stage is a decoration sub-stage
export const isDecorationStage = (stage: ProcessStage): boolean => {
  return ALL_DECORATION_STAGES.includes(stage);
};

// Get the routing path for a given technique
export const getRoutingPath = (technique: EmbroideryTechnique): ProcessStage[] => {
  return ROUTING_PATHS[technique];
};

// Get the next stage in the routing path
export const getNextStage = (
  technique: EmbroideryTechnique,
  currentStage: ProcessStage
): ProcessStage | 'semi-stitching' | null => {
  const path = ROUTING_PATHS[technique];
  const idx = path.indexOf(currentStage);
  if (idx === -1) return null;
  if (idx === path.length - 1) return 'semi-stitching'; // Exit decoration -> stitching
  return path[idx + 1];
};

// Validate if a transition is allowed
export const canTransition = (
  technique: EmbroideryTechnique,
  fromStage: ProcessStage,
  toStage: ProcessStage
): boolean => {
  const next = getNextStage(technique, fromStage);
  return next === toStage;
};

// Get the full production path including decoration stages for a technique
export const getFullProductionPath = (technique?: EmbroideryTechnique): ProcessStage[] => {
  const preDecoration: ProcessStage[] = ['design', 'pattern'];
  const postDecoration: ProcessStage[] = ['semi-stitching', 'complete-stitching', 'hand-finishes'];
  
  if (!technique) {
    return [...preDecoration, ...postDecoration];
  }
  
  return [...preDecoration, ...ROUTING_PATHS[technique], ...postDecoration];
};

// Get technique label
export const getTechniqueLabel = (technique: EmbroideryTechnique): string => {
  const labels: Record<EmbroideryTechnique, string> = {
    'multihead': 'Multihead',
    'hand-embroidery': 'Hand Embroidery',
    'screen-print': 'Screen Print',
    'hand-block-print': 'Hand Block Print',
  };
  return labels[technique];
};
