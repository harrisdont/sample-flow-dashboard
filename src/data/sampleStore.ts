import { create } from 'zustand';
import { Sample, ProcessStage, ApprovalStatus, EmbroideryTechnique } from '@/types/sample';
import { mockSamples } from '@/data/mockData';
import { getFullProductionPath, getNextStage as getWorkflowNextStage } from '@/lib/embroideryWorkflow';
import { calculateStageDeadline, getStageDuration } from '@/lib/leadTimeCalculator';
import { addDays, format } from 'date-fns';

interface SampleStore {
  samples: Sample[];

  // Queries
  getSampleById: (id: string) => Sample | undefined;
  getSamplesByCollection: (collectionName: string) => Sample[];
  getSamplesByStage: (stage: ProcessStage) => Sample[];
  getSamplesByDesigner: (designerName: string) => Sample[];

  // Mutations
  addSample: (sample: Sample) => void;
  advanceStage: (sampleId: string) => void;
  approveSample: (sampleId: string, approvedBy: string) => void;
  rejectSample: (sampleId: string, approvedBy: string) => void;
  requestRedo: (sampleId: string, approvedBy: string, changes: string) => void;
  updateSample: (sampleId: string, updates: Partial<Sample>) => void;
}

// Helper: determine next production stage for non-decoration samples
const PRODUCTION_SEQUENCE: ProcessStage[] = [
  'design', 'pattern', 'semi-stitching', 'complete-stitching', 'hand-finishes', 'approval',
];

const getNextProductionStage = (
  currentStage: ProcessStage,
  decorationTechnique?: EmbroideryTechnique
): ProcessStage | null => {
  // If sample has a decoration technique and is in a decoration stage, use workflow engine
  if (decorationTechnique) {
    const next = getWorkflowNextStage(decorationTechnique, currentStage);
    if (next) return next as ProcessStage;
  }

  // For production stages
  const fullPath = getFullProductionPath(decorationTechnique);
  const idx = fullPath.indexOf(currentStage);
  if (idx === -1 || idx === fullPath.length - 1) return null;
  return fullPath[idx + 1];
};

export const useSampleStore = create<SampleStore>((set, get) => ({
  samples: [...mockSamples],

  getSampleById: (id) => get().samples.find(s => s.id === id),

  getSamplesByCollection: (collectionName) =>
    get().samples.filter(s => s.collectionName === collectionName),

  getSamplesByStage: (stage) =>
    get().samples.filter(s => s.currentStage === stage),

  getSamplesByDesigner: (designerName) =>
    get().samples.filter(s => s.designerName === designerName),

  addSample: (sample) =>
    set((state) => ({ samples: [...state.samples, sample] })),

  advanceStage: (sampleId) =>
    set((state) => {
      const sample = state.samples.find(s => s.id === sampleId);
      if (!sample) return state;

      const nextStage = getNextProductionStage(sample.currentStage, sample.decorationTechnique);
      if (!nextStage) return state;

      const now = new Date();
      const nowStr = format(now, 'yyyy-MM-dd');

      // Calculate deadline for the next stage
      const fullPath = getFullProductionPath(sample.decorationTechnique);
      const nextDeadline = calculateStageDeadline(sample.targetDate, nextStage, fullPath);

      // Update current process as approved
      const updatedProcesses = sample.processes.map(p =>
        p.stage === sample.currentStage
          ? { ...p, approvalStatus: 'approved' as ApprovalStatus, approvedBy: 'System' }
          : p
      );

      // Add new process entry for next stage
      updatedProcesses.push({
        stage: nextStage,
        targetDate: format(nextDeadline, 'yyyy-MM-dd'),
        entryDate: nowStr,
        approvalStatus: 'pending' as ApprovalStatus,
      });

      return {
        samples: state.samples.map(s =>
          s.id === sampleId
            ? {
                ...s,
                currentStage: nextStage,
                stageEntryDate: nowStr,
                stageDeadline: format(nextDeadline, 'yyyy-MM-dd'),
                processes: updatedProcesses,
              }
            : s
        ),
      };
    }),

  approveSample: (sampleId, approvedBy) =>
    set((state) => ({
      samples: state.samples.map(s =>
        s.id === sampleId
          ? {
              ...s,
              approvalStatus: 'approved' as ApprovalStatus,
              approvedBy,
              processes: s.processes.map(p =>
                p.stage === s.currentStage
                  ? { ...p, approvalStatus: 'approved' as ApprovalStatus, approvedBy }
                  : p
              ),
            }
          : s
      ),
    })),

  rejectSample: (sampleId, approvedBy) =>
    set((state) => ({
      samples: state.samples.map(s =>
        s.id === sampleId
          ? {
              ...s,
              approvalStatus: 'rejected' as ApprovalStatus,
              approvedBy,
              processes: s.processes.map(p =>
                p.stage === s.currentStage
                  ? { ...p, approvalStatus: 'rejected' as ApprovalStatus, approvedBy }
                  : p
              ),
            }
          : s
      ),
    })),

  requestRedo: (sampleId, approvedBy, changes) =>
    set((state) => ({
      samples: state.samples.map(s =>
        s.id === sampleId
          ? {
              ...s,
              approvalStatus: 'redo' as ApprovalStatus,
              approvedBy,
              changes: `${s.changes}\n[REDO] ${changes}`,
              processes: s.processes.map(p =>
                p.stage === s.currentStage
                  ? { ...p, approvalStatus: 'rejected' as ApprovalStatus, approvedBy }
                  : p
              ),
            }
          : s
      ),
    })),

  updateSample: (sampleId, updates) =>
    set((state) => ({
      samples: state.samples.map(s =>
        s.id === sampleId ? { ...s, ...updates } : s
      ),
    })),
}));

// Helper to create a Sample from a submitted design
export const createSampleFromDesign = (params: {
  designId: string;
  collectionName: string;
  collectionId: string;
  line: Sample['line'];
  lineName: string;
  fabricName: string;
  silhouetteCode: string;
  silhouetteName: string;
  designerName: string;
  category: Sample['combination'];
  processes: string[];
  targetDate: string;
  decorationTechnique?: EmbroideryTechnique;
  colour?: string;
  sizes?: string[];
}): Sample => {
  const now = new Date();
  const nowStr = format(now, 'yyyy-MM-dd');
  
  // Determine the decoration technique from processes
  let technique = params.decorationTechnique;
  if (!technique && params.processes.length > 0) {
    const processToTechnique: Record<string, EmbroideryTechnique> = {
      'multihead': 'multihead',
      'block-print': 'hand-block-print',
      'screen-print': 'screen-print',
    };
    for (const proc of params.processes) {
      if (processToTechnique[proc]) {
        technique = processToTechnique[proc];
        break;
      }
    }
  }

  const fullPath = getFullProductionPath(technique);
  const firstStage = fullPath[0]; // 'design'
  const stageDeadline = calculateStageDeadline(params.targetDate, firstStage, fullPath);

  const sampleNumber = `S${Date.now().toString().slice(-6)}`;

  return {
    id: `sample-${params.designId}`,
    sampleNumber,
    season: 'Spring Summer 2026',
    collectionName: params.collectionName,
    line: params.line,
    fabricName: params.fabricName,
    sizes: params.sizes || ['S', 'M', 'L'],
    careInstructions: 'See fabric specifications',
    designerName: params.designerName,
    lineName: params.lineName,
    colour: params.colour || 'TBD',
    furtherColourways: [],
    combination: params.category,
    coordinatingPieces: [],
    silhouetteCode: params.silhouetteCode,
    silhouetteName: params.silhouetteName,
    totalQty: 1,
    changes: '',
    currentStage: firstStage,
    targetDate: params.targetDate,
    approvalStatus: 'pending',
    stageEntryDate: nowStr,
    stageDeadline: format(stageDeadline, 'yyyy-MM-dd'),
    decorationTechnique: technique,
    processes: [
      {
        stage: firstStage,
        targetDate: format(stageDeadline, 'yyyy-MM-dd'),
        entryDate: nowStr,
        approvalStatus: 'pending',
      },
    ],
  };
};
