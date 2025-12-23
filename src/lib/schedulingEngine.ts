import { addDays, subDays, format } from 'date-fns';
import { DEFAULT_LEAD_TIMES, TECHNIQUE_BUFFERS, calculateTechniqueBuffer } from '@/data/leadTimeSettings';

// Complete milestone structure for the critical path
export interface Milestone {
  id: string;
  label: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  phase: 'planning' | 'sampling' | 'production';
  isCritical: boolean;
}

export interface ScheduleResult {
  inStoreDate: Date;
  collectionReadyDate: Date; // The actual date when production is complete
  milestones: Milestone[];
  totalDays: number;
  criticalPathDays: number;
  techniqueBuffer: number;
  productionStartDate: Date;
  fabricDesignStartDate: Date;
}

// The complete critical path phases in order
export const CRITICAL_PATH_PHASES = [
  { id: 'fabric-design', label: 'Fabric Design', phase: 'planning' as const, baseKey: 'fabricDesign' },
  { id: 'fabric-ordering', label: 'Fabric Ordering', phase: 'planning' as const, baseKey: 'fabricOrdering' },
  { id: 'sampling', label: 'Sampling', phase: 'sampling' as const, baseKey: 'sampling' },
  { id: 'collection-submission', label: 'Collection Submission', phase: 'sampling' as const, baseKey: 'collectionSubmission' },
  { id: 'cutting', label: 'Cutting', phase: 'production' as const, baseKey: 'cutting' },
  { id: 'stitching', label: 'Stitching', phase: 'production' as const, baseKey: 'stitching' },
  { id: 'finishing', label: 'Finishing', phase: 'production' as const, baseKey: 'finishing' },
  { id: 'qc', label: 'QC', phase: 'production' as const, baseKey: 'qc' },
  { id: 'dispatch', label: 'Dispatch', phase: 'production' as const, baseKey: 'dispatch' },
] as const;

// Technique-specific phases that get inserted into production
export const TECHNIQUE_PHASES = [
  { id: 'jacquards', label: 'Jacquards', insertAfter: 'cutting' },
  { id: 'yarn-dyed', label: 'Yarn Dyed', insertAfter: 'cutting' },
  { id: 'embroidery', label: 'Embroidery', insertAfter: 'cutting' },
  { id: 'handwork', label: 'Handwork', insertAfter: 'embroidery' },
  { id: 'block-printing', label: 'Block Printing', insertAfter: 'cutting' },
  { id: 'multihead', label: 'Multihead', insertAfter: 'cutting' },
];

/**
 * Calculate the complete production schedule using backwards scheduling
 * Starting from the In-store Date and working backwards to determine all milestone dates
 */
export function calculateBackwardsSchedule(
  inStoreDate: Date,
  selectedTechniques: string[] = []
): ScheduleResult {
  const techniqueBuffer = calculateTechniqueBuffer(selectedTechniques);
  
  // Build the complete phase list with technique-specific phases
  const phases = buildPhaseList(selectedTechniques);
  
  // Calculate total duration
  let totalDuration = 0;
  const durations: Record<string, number> = {};
  
  phases.forEach(phase => {
    const baseDuration = DEFAULT_LEAD_TIMES[phase.baseKey as keyof typeof DEFAULT_LEAD_TIMES] || 0;
    const techniqueDuration = TECHNIQUE_BUFFERS.find(t => t.id === phase.id)?.bufferDays || 0;
    const duration = baseDuration || techniqueDuration || 2; // Default 2 days for technique phases
    durations[phase.id] = duration;
    totalDuration += duration;
  });

  // Calculate milestones backwards from in-store date
  const milestones: Milestone[] = [];
  let currentEndDate = inStoreDate; // End of last milestone aligns with in-store date

  // Reverse the phases to calculate backwards
  const reversedPhases = [...phases].reverse();
  
  for (const phase of reversedPhases) {
    const duration = durations[phase.id];
    const endDate = currentEndDate;
    const startDate = subDays(endDate, duration - 1);
    
    milestones.unshift({
      id: phase.id,
      label: phase.label,
      startDate,
      endDate,
      duration,
      phase: phase.phase,
      isCritical: true,
    });
    
    currentEndDate = subDays(startDate, 1);
  }

  const fabricDesignStartDate = milestones[0]?.startDate || subDays(inStoreDate, totalDuration);
  const productionMilestone = milestones.find(m => m.phase === 'production');
  const productionStartDate = productionMilestone?.startDate || subDays(inStoreDate, 30);
  
  // The collection ready date is when the last milestone ends
  const lastMilestone = milestones[milestones.length - 1];
  const collectionReadyDate = lastMilestone?.endDate || inStoreDate;

  return {
    inStoreDate,
    collectionReadyDate,
    milestones,
    totalDays: totalDuration,
    criticalPathDays: totalDuration,
    techniqueBuffer,
    productionStartDate,
    fabricDesignStartDate,
  };
}

/**
 * Build the complete phase list including technique-specific phases
 */
function buildPhaseList(selectedTechniques: string[]) {
  const basePhases = [...CRITICAL_PATH_PHASES];
  const result: Array<{ id: string; label: string; phase: 'planning' | 'sampling' | 'production'; baseKey?: string }> = [];
  
  for (const phase of basePhases) {
    result.push({ ...phase });
    
    // Insert technique phases after cutting
    if (phase.id === 'cutting') {
      const techniquePhases = TECHNIQUE_PHASES.filter(t => 
        selectedTechniques.includes(t.id)
      );
      
      for (const tech of techniquePhases) {
        result.push({
          id: tech.id,
          label: tech.label,
          phase: 'production',
        });
      }
    }
  }
  
  return result;
}

/**
 * Get phase color based on phase type
 */
export function getPhaseColor(phase: 'planning' | 'sampling' | 'production'): string {
  switch (phase) {
    case 'planning': return 'bg-purple-500';
    case 'sampling': return 'bg-blue-500';
    case 'production': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
}

/**
 * Format milestone for display
 */
export function formatMilestone(milestone: Milestone): string {
  return `${milestone.label}: ${format(milestone.startDate, 'MMM d')} - ${format(milestone.endDate, 'MMM d')} (${milestone.duration}d)`;
}

/**
 * Calculate if a milestone is on track, at risk, or delayed
 */
export function getMilestoneStatus(milestone: Milestone): 'on-track' | 'at-risk' | 'delayed' {
  const today = new Date();
  const daysUntilStart = Math.ceil((milestone.startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilStart < 0 && today > milestone.endDate) return 'delayed';
  if (daysUntilStart <= 3) return 'at-risk';
  return 'on-track';
}
