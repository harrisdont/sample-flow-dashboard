import { addDays, format, differenceInDays, isPast, isToday } from 'date-fns';
import { DEFAULT_LEAD_TIMES, LeadTimeSettings } from '@/data/leadTimeSettings';
import { ProcessStage } from '@/types/sample';

// Map process stages to lead time keys
const stageToLeadTimeKey: Partial<Record<ProcessStage, keyof LeadTimeSettings>> = {
  'multihead': 'multihead',
  'complete-stitching': 'stitching',
  'semi-stitching': 'stitching',
  'hand-finishes': 'finishing',
};

// Default duration for stages not in lead times (in days)
const DEFAULT_STAGE_DURATION = 2;

// Get duration for a specific stage
export const getStageDuration = (
  stage: ProcessStage,
  settings: LeadTimeSettings = DEFAULT_LEAD_TIMES
): number => {
  const key = stageToLeadTimeKey[stage];
  if (key) {
    return settings[key];
  }
  return DEFAULT_STAGE_DURATION;
};

// Calculate estimated completion date from a start date through remaining stages
export const calculateEstimatedCompletion = (
  startDate: Date | string,
  currentStage: ProcessStage,
  allStages: ProcessStage[],
  settings: LeadTimeSettings = DEFAULT_LEAD_TIMES
): Date => {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const currentIndex = allStages.indexOf(currentStage);
  
  if (currentIndex === -1) return start;
  
  let totalDays = 0;
  for (let i = currentIndex; i < allStages.length; i++) {
    totalDays += getStageDuration(allStages[i], settings);
  }
  
  return addDays(start, totalDays);
};

// Calculate stage-wise dates starting from a given date
export const calculateStageDates = (
  startDate: Date | string,
  stages: ProcessStage[],
  settings: LeadTimeSettings = DEFAULT_LEAD_TIMES
): { stage: ProcessStage; startDate: Date; endDate: Date }[] => {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  let currentDate = start;
  
  return stages.map(stage => {
    const duration = getStageDuration(stage, settings);
    const stageStart = currentDate;
    const stageEnd = addDays(currentDate, duration);
    currentDate = stageEnd;
    
    return {
      stage,
      startDate: stageStart,
      endDate: stageEnd,
    };
  });
};

// Get days remaining until target date
export const getDaysRemaining = (targetDate: Date | string): number => {
  const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
  return differenceInDays(target, new Date());
};

// Get status based on days remaining
export type DateStatus = 'overdue' | 'due-today' | 'due-soon' | 'on-track';

export const getDateStatus = (targetDate: Date | string): DateStatus => {
  const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
  
  if (isPast(target) && !isToday(target)) return 'overdue';
  if (isToday(target)) return 'due-today';
  
  const daysRemaining = getDaysRemaining(target);
  if (daysRemaining <= 3) return 'due-soon';
  
  return 'on-track';
};

// Format date with days remaining
export const formatDateWithRemaining = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const days = getDaysRemaining(d);
  const formatted = format(d, 'MMM d');
  
  if (days < 0) return `${formatted} (${Math.abs(days)}d overdue)`;
  if (days === 0) return `${formatted} (Today)`;
  if (days === 1) return `${formatted} (Tomorrow)`;
  return `${formatted} (${days}d)`;
};

// Short format for compact display
export const formatShortDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMM d');
};

// Calculate total production time
export const calculateTotalProductionTime = (
  settings: LeadTimeSettings = DEFAULT_LEAD_TIMES
): number => {
  return settings.cutting + settings.embroidery + settings.stitching + 
         settings.finishing + settings.qc + settings.dispatch + settings.multihead;
};
