export type Line = 'woman' | 'cottage' | 'formals' | 'classic' | 'ming';

export type ProcessStage = 
  | 'design'
  | 'pattern'
  | 'motif'
  | 'punching'
  | 'semi-stitching'
  | 'complete-stitching'
  | 'screen-print'
  | 'multihead'
  | 'pakki'
  | 'ari-dori'
  | 'adda'
  | 'cottage-work'
  | 'hand-finishes'
  | 'approval'
  | 'motif-assignment'
  | 'motif-in-progress'
  | 'motif-review'
  | 'multihead-punching'
  | 'pinning'
  | 'stencil-transfer'
  | 'hand-embroidery'
  | 'screen-print-execution'
  | 'hand-block-printing'
  | 'decoration-approval';

export type EmbroideryTechnique = 'multihead' | 'hand-embroidery' | 'screen-print' | 'hand-block-print';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'redo';

export interface Sample {
  id: string;
  sampleNumber: string;
  season: string;
  collectionName: string;
  line: Line;
  fabricName: string;
  sizes: string[];
  careInstructions: string;
  designerName: string;
  lineName: string;
  colour: string;
  furtherColourways: string[];
  combination: '1pc' | '2pc' | '3pc' | '4pc';
  coordinatingPieces: string[];
  silhouetteCode: string;
  silhouetteName: string;
  totalQty: number;
  changes: string;
  currentStage: ProcessStage;
  targetDate: string;
  approvalStatus: ApprovalStatus;
  approvedBy?: string;
  isDelayed?: boolean;
  stageEntryDate: string;
  stageDeadline: string;
  decorationTechnique?: EmbroideryTechnique;
  processes: {
    stage: ProcessStage;
    targetDate: string;
    entryDate?: string;
    approvalStatus: ApprovalStatus;
    approvedBy?: string;
  }[];
}

export interface Collection {
  name: string;
  slot: string;
  status: string;
  location: string;
  lastUpdate: string;
  delay?: number;
  totalSamples: number;
  samplesCompleted: number;
}

export interface WorkloadMetrics {
  totalSamples: number;
  dueToday: number;
  overdue: number;
  bottleneckAlert?: string;
}