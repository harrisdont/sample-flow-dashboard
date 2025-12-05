// Standard Lead Times Configuration (in days)
// These values serve as defaults and can be modified via settings

export interface LeadTimeSettings {
  // Main Phase Lead Times
  fabricDesign: number;
  fabricOrdering: number;
  sampling: number;
  collectionSubmission: number;
  production: number;
  
  // Process-Specific Durations
  multihead: number;
  cutting: number;
  embroidery: number;
  stitching: number;
  finishing: number;
  qc: number;
  dispatch: number;
}

// Default Lead Time Values (in days)
export const DEFAULT_LEAD_TIMES: LeadTimeSettings = {
  // Main Phase Lead Times
  fabricDesign: 14,
  fabricOrdering: 21,
  sampling: 10,
  collectionSubmission: 7,
  production: 30,
  
  // Process-Specific Durations
  multihead: 3,
  cutting: 2,
  embroidery: 5,
  stitching: 4,
  finishing: 2,
  qc: 1,
  dispatch: 1,
};

// Human-readable labels for display
export const LEAD_TIME_LABELS: Record<keyof LeadTimeSettings, string> = {
  fabricDesign: 'Fabric Design',
  fabricOrdering: 'Fabric Ordering',
  sampling: 'Sampling',
  collectionSubmission: 'Collection Submission',
  production: 'Production',
  multihead: 'Multihead',
  cutting: 'Cutting',
  embroidery: 'Embroidery',
  stitching: 'Stitching',
  finishing: 'Finishing',
  qc: 'QC',
  dispatch: 'Dispatch',
};

// Grouped categories for UI display
export const LEAD_TIME_CATEGORIES = {
  phases: ['fabricDesign', 'fabricOrdering', 'sampling', 'collectionSubmission', 'production'] as const,
  processes: ['multihead', 'cutting', 'embroidery', 'stitching', 'finishing', 'qc', 'dispatch'] as const,
};

// Helper function to calculate total lead time
export const calculateTotalLeadTime = (settings: LeadTimeSettings): number => {
  return Object.values(settings).reduce((sum, val) => sum + val, 0);
};

// Helper function to calculate phase total
export const calculatePhaseTotal = (settings: LeadTimeSettings): number => {
  return LEAD_TIME_CATEGORIES.phases.reduce((sum, key) => sum + settings[key], 0);
};

// Helper function to calculate process total
export const calculateProcessTotal = (settings: LeadTimeSettings): number => {
  return LEAD_TIME_CATEGORIES.processes.reduce((sum, key) => sum + settings[key], 0);
};
