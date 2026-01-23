import { ProcessStage } from '@/types/sample';

// Thresholds for bottleneck detection
const BOTTLENECK_THRESHOLDS = {
  critical: 95,      // >= 95% utilization = critical bottleneck
  warning: 85,       // >= 85% utilization = warning bottleneck
  healthy: 70,       // <= 70% utilization = healthy
};

const QUEUE_DEPTH_THRESHOLDS = {
  critical: 3,       // Queue depth > 3x capacity = critical
  warning: 2,        // Queue depth > 2x capacity = warning
};

export type BottleneckSeverity = 'critical' | 'warning' | 'healthy';

export interface StageAnalysis {
  stageId: ProcessStage;
  stageName: string;
  queueSize: number;
  operatorCount: number;
  totalCapacity: number;
  utilization: number;
  queueDepthRatio: number;
  severity: BottleneckSeverity;
  estimatedClearDays: number;
  throughputPerDay: number;
  isBottleneck: boolean;
  upstreamPressure: number;      // Samples about to arrive
  downstreamCapacity: number;    // Available capacity downstream
}

export interface RedistributionSuggestion {
  id: string;
  type: 'redistribute' | 'parallelize' | 'prioritize' | 'add-capacity' | 'cross-train';
  severity: BottleneckSeverity;
  title: string;
  description: string;
  fromStage?: ProcessStage;
  toStage?: ProcessStage;
  samplesAffected: number;
  estimatedImpact: string;
  actionable: boolean;
  priority: number; // 1-10, higher = more urgent
}

export interface BottleneckReport {
  timestamp: Date;
  overallHealth: BottleneckSeverity;
  stages: StageAnalysis[];
  bottlenecks: StageAnalysis[];
  suggestions: RedistributionSuggestion[];
  projectedClearTime: number;     // Days to clear entire pipeline
  criticalPathStages: ProcessStage[];
}

export interface OperatorData {
  id: string;
  name: string;
  skill: string;
  capacity: number;
  currentLoad?: number;
  crossTrainedSkills?: string[];
}

export interface SampleData {
  id: string;
  code: string;
  currentStage: ProcessStage;
  targetDate: Date;
  priority?: 'critical' | 'high' | 'normal' | 'low';
  isDelayed?: boolean;
}

export interface StageConfig {
  id: ProcessStage;
  label: string;
  operatorType: string;
  canParallelize?: ProcessStage[]; // Stages that can run in parallel
  dependsOn?: ProcessStage[];      // Upstream stages
}

/**
 * Analyzes a single stage for bottleneck indicators
 */
function analyzeStage(
  stage: StageConfig,
  samples: SampleData[],
  operators: OperatorData[],
  allSamples: SampleData[],
  allStages: StageConfig[],
  allOperators: OperatorData[]
): StageAnalysis {
  const stageOperators = operators.filter(o => o.skill === stage.id);
  const totalCapacity = stageOperators.reduce((sum, o) => sum + o.capacity, 0);
  const queueSize = samples.length;
  
  const utilization = totalCapacity > 0 
    ? Math.min(100, Math.round((queueSize / totalCapacity) * 100)) 
    : queueSize > 0 ? 100 : 0;
  
  const queueDepthRatio = totalCapacity > 0 ? queueSize / totalCapacity : queueSize;
  
  // Determine severity
  let severity: BottleneckSeverity = 'healthy';
  if (utilization >= BOTTLENECK_THRESHOLDS.critical || queueDepthRatio >= QUEUE_DEPTH_THRESHOLDS.critical) {
    severity = 'critical';
  } else if (utilization >= BOTTLENECK_THRESHOLDS.warning || queueDepthRatio >= QUEUE_DEPTH_THRESHOLDS.warning) {
    severity = 'warning';
  }
  
  // Calculate throughput and clear time
  const throughputPerDay = totalCapacity;
  const estimatedClearDays = throughputPerDay > 0 ? Math.ceil(queueSize / throughputPerDay) : 0;
  
  // Calculate upstream pressure (samples in previous stage)
  const stageIndex = allStages.findIndex(s => s.id === stage.id);
  const previousStage = stageIndex > 0 ? allStages[stageIndex - 1] : null;
  const upstreamPressure = previousStage 
    ? allSamples.filter(s => s.currentStage === previousStage.id).length 
    : 0;
  
  // Calculate downstream capacity
  const nextStage = stageIndex < allStages.length - 1 ? allStages[stageIndex + 1] : null;
  const downstreamOperators = nextStage 
    ? allOperators.filter(o => o.skill === nextStage.id)
    : [];
  const downstreamCapacity = downstreamOperators.reduce((sum, o) => sum + o.capacity, 0);
  
  return {
    stageId: stage.id,
    stageName: stage.label,
    queueSize,
    operatorCount: stageOperators.length,
    totalCapacity,
    utilization,
    queueDepthRatio,
    severity,
    estimatedClearDays,
    throughputPerDay,
    isBottleneck: severity !== 'healthy',
    upstreamPressure,
    downstreamCapacity,
  };
}

/**
 * Generates redistribution suggestions based on stage analysis
 */
function generateSuggestions(
  stages: StageAnalysis[],
  operators: OperatorData[],
  stageConfigs: StageConfig[]
): RedistributionSuggestion[] {
  const suggestions: RedistributionSuggestion[] = [];
  let suggestionId = 0;
  
  // Find bottleneck and underutilized stages
  const bottleneckStages = stages.filter(s => s.severity !== 'healthy');
  const underutilizedStages = stages.filter(s => s.utilization < 50 && s.totalCapacity > 0);
  
  for (const bottleneck of bottleneckStages) {
    const stageConfig = stageConfigs.find(c => c.id === bottleneck.stageId);
    
    // Suggestion 1: Redistribute from underutilized parallel stages
    if (stageConfig?.canParallelize) {
      for (const parallelStageId of stageConfig.canParallelize) {
        const parallelStage = stages.find(s => s.stageId === parallelStageId);
        if (parallelStage && parallelStage.utilization < 60) {
          const availableCapacity = parallelStage.totalCapacity - Math.ceil(parallelStage.queueSize);
          if (availableCapacity > 0) {
            suggestions.push({
              id: `suggestion-${++suggestionId}`,
              type: 'parallelize',
              severity: bottleneck.severity,
              title: `Parallelize with ${parallelStage.stageName}`,
              description: `Move ${Math.min(availableCapacity, bottleneck.queueSize)} samples to ${parallelStage.stageName} which has ${100 - parallelStage.utilization}% spare capacity.`,
              fromStage: bottleneck.stageId,
              toStage: parallelStageId,
              samplesAffected: Math.min(availableCapacity, bottleneck.queueSize),
              estimatedImpact: `Reduce ${bottleneck.stageName} queue by ${Math.round((Math.min(availableCapacity, bottleneck.queueSize) / bottleneck.queueSize) * 100)}%`,
              actionable: true,
              priority: bottleneck.severity === 'critical' ? 9 : 7,
            });
          }
        }
      }
    }
    
    // Suggestion 2: Cross-train operators from underutilized stages
    for (const underutilized of underutilizedStages) {
      if (underutilized.stageId === bottleneck.stageId) continue;
      
      const crossTrainableOperators = operators.filter(o => 
        o.skill === underutilized.stageId && 
        (o.crossTrainedSkills?.includes(bottleneck.stageId) || false)
      );
      
      if (crossTrainableOperators.length > 0) {
        suggestions.push({
          id: `suggestion-${++suggestionId}`,
          type: 'cross-train',
          severity: bottleneck.severity,
          title: `Deploy cross-trained operators`,
          description: `${crossTrainableOperators.length} operator(s) from ${underutilized.stageName} can support ${bottleneck.stageName}. Current ${underutilized.stageName} utilization is only ${underutilized.utilization}%.`,
          fromStage: underutilized.stageId,
          toStage: bottleneck.stageId,
          samplesAffected: bottleneck.queueSize,
          estimatedImpact: `Add ${crossTrainableOperators.reduce((s, o) => s + o.capacity, 0)} daily capacity`,
          actionable: true,
          priority: bottleneck.severity === 'critical' ? 10 : 8,
        });
      }
    }
    
    // Suggestion 3: Prioritize urgent samples
    if (bottleneck.queueSize > bottleneck.totalCapacity) {
      suggestions.push({
        id: `suggestion-${++suggestionId}`,
        type: 'prioritize',
        severity: bottleneck.severity,
        title: `Prioritize urgent samples in ${bottleneck.stageName}`,
        description: `Queue depth exceeds daily capacity. Identify and fast-track samples with imminent deadlines to prevent cascade delays.`,
        fromStage: bottleneck.stageId,
        samplesAffected: bottleneck.queueSize,
        estimatedImpact: `Prevent ${Math.round(bottleneck.queueSize * 0.3)} potential deadline misses`,
        actionable: true,
        priority: bottleneck.severity === 'critical' ? 8 : 6,
      });
    }
    
    // Suggestion 4: Add capacity (hire/overtime)
    if (bottleneck.severity === 'critical' && bottleneck.estimatedClearDays > 2) {
      const additionalCapacityNeeded = Math.ceil((bottleneck.queueSize - bottleneck.totalCapacity) / 2);
      suggestions.push({
        id: `suggestion-${++suggestionId}`,
        type: 'add-capacity',
        severity: 'critical',
        title: `Add capacity to ${bottleneck.stageName}`,
        description: `${bottleneck.estimatedClearDays} days to clear queue. Consider overtime or temporary staff to add ${additionalCapacityNeeded} units/day capacity.`,
        fromStage: bottleneck.stageId,
        samplesAffected: bottleneck.queueSize,
        estimatedImpact: `Reduce clear time from ${bottleneck.estimatedClearDays} to ~${Math.ceil(bottleneck.estimatedClearDays / 2)} days`,
        actionable: true,
        priority: 10,
      });
    }
    
    // Suggestion 5: Redistribute workload within stage
    const stageOperators = operators.filter(o => o.skill === bottleneck.stageId);
    const operatorLoads = stageOperators.map(o => ({
      ...o,
      load: o.currentLoad ?? Math.round(bottleneck.queueSize / stageOperators.length),
    }));
    
    const maxLoad = Math.max(...operatorLoads.map(o => o.load));
    const minLoad = Math.min(...operatorLoads.map(o => o.load));
    
    if (maxLoad - minLoad > 3 && stageOperators.length > 1) {
      suggestions.push({
        id: `suggestion-${++suggestionId}`,
        type: 'redistribute',
        severity: 'warning',
        title: `Rebalance ${bottleneck.stageName} operator loads`,
        description: `Load imbalance detected: highest load is ${maxLoad}, lowest is ${minLoad}. Redistribute for better efficiency.`,
        fromStage: bottleneck.stageId,
        toStage: bottleneck.stageId,
        samplesAffected: maxLoad - minLoad,
        estimatedImpact: `Improve stage efficiency by ~${Math.round(((maxLoad - minLoad) / maxLoad) * 30)}%`,
        actionable: true,
        priority: 5,
      });
    }
  }
  
  // Suggestion for incoming pressure
  for (const stage of stages) {
    if (stage.upstreamPressure > stage.totalCapacity && stage.severity === 'healthy') {
      suggestions.push({
        id: `suggestion-${++suggestionId}`,
        type: 'prioritize',
        severity: 'warning',
        title: `Prepare ${stage.stageName} for incoming volume`,
        description: `${stage.upstreamPressure} samples in upstream stage will arrive soon. Current capacity: ${stage.totalCapacity}/day.`,
        toStage: stage.stageId,
        samplesAffected: stage.upstreamPressure,
        estimatedImpact: `Prevent bottleneck formation in next ${Math.ceil(stage.upstreamPressure / stage.totalCapacity)} days`,
        actionable: true,
        priority: 6,
      });
    }
  }
  
  // Sort by priority (descending)
  return suggestions.sort((a, b) => b.priority - a.priority);
}

/**
 * Main function: Detects bottlenecks and generates a comprehensive report
 */
export function detectBottlenecks(
  samples: SampleData[],
  operators: OperatorData[],
  stageConfigs: StageConfig[]
): BottleneckReport {
  // Analyze each stage
  const stageAnalyses: StageAnalysis[] = stageConfigs.map(config => {
    const stageSamples = samples.filter(s => s.currentStage === config.id);
    return analyzeStage(config, stageSamples, operators, samples, stageConfigs, operators);
  });
  
  // Identify bottlenecks
  const bottlenecks = stageAnalyses.filter(s => s.isBottleneck);
  
  // Generate suggestions
  const suggestions = generateSuggestions(stageAnalyses, operators, stageConfigs);
  
  // Determine overall health
  let overallHealth: BottleneckSeverity = 'healthy';
  if (bottlenecks.some(b => b.severity === 'critical')) {
    overallHealth = 'critical';
  } else if (bottlenecks.length > 0) {
    overallHealth = 'warning';
  }
  
  // Calculate projected clear time (worst case = slowest stage)
  const projectedClearTime = Math.max(...stageAnalyses.map(s => s.estimatedClearDays), 0);
  
  // Identify critical path (stages with longest queues relative to capacity)
  const criticalPathStages = stageAnalyses
    .filter(s => s.queueDepthRatio >= 1)
    .sort((a, b) => b.queueDepthRatio - a.queueDepthRatio)
    .slice(0, 3)
    .map(s => s.stageId);
  
  return {
    timestamp: new Date(),
    overallHealth,
    stages: stageAnalyses,
    bottlenecks,
    suggestions,
    projectedClearTime,
    criticalPathStages,
  };
}

/**
 * Utility: Get severity color class
 */
export function getSeverityColor(severity: BottleneckSeverity): string {
  switch (severity) {
    case 'critical':
      return 'text-destructive';
    case 'warning':
      return 'text-[hsl(var(--status-delayed))]';
    case 'healthy':
      return 'text-[hsl(var(--status-completed))]';
  }
}

/**
 * Utility: Get severity background class
 */
export function getSeverityBgColor(severity: BottleneckSeverity): string {
  switch (severity) {
    case 'critical':
      return 'bg-destructive/10';
    case 'warning':
      return 'bg-[hsl(var(--status-delayed))]/10';
    case 'healthy':
      return 'bg-[hsl(var(--status-completed))]/10';
  }
}

/**
 * Utility: Get suggestion type icon name
 */
export function getSuggestionIcon(type: RedistributionSuggestion['type']): string {
  switch (type) {
    case 'redistribute':
      return 'ArrowLeftRight';
    case 'parallelize':
      return 'GitBranch';
    case 'prioritize':
      return 'AlertTriangle';
    case 'add-capacity':
      return 'UserPlus';
    case 'cross-train':
      return 'Users';
  }
}
