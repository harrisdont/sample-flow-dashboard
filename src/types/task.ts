import { UserRole, ProductLineAssignment } from './user';

// Task status in workflow
export type TaskStatus = 'pending' | 'assigned' | 'in-progress' | 'blocked' | 'completed' | 'cancelled';

// Task priority levels
export type TaskPriority = 'critical' | 'high' | 'normal' | 'low';

// Task types across departments
export type TaskType = 
  // Design tasks
  | 'design-submission'
  | 'motif-development'
  | 'punching'
  | 'design-review'
  // Sourcing tasks
  | 'fabric-sourcing'
  | 'fabric-treatment'
  | 'vendor-coordination'
  // Sampling tasks
  | 'pattern-making'
  | 'cutting'
  | 'stitching'
  | 'embroidery'
  | 'finishing'
  | 'quality-check';

// Department assignment
export type TaskDepartment = 'design' | 'sourcing' | 'sampling';

// Task interface
export interface Task {
  id: string;
  type: TaskType;
  title: string;
  description?: string;
  assignedTo?: string; // User ID
  assignedBy: string; // User ID
  sampleId?: string;
  collectionId?: string;
  fabricId?: string;
  dueDate: Date;
  startDate?: Date;
  completedAt?: Date;
  status: TaskStatus;
  priority: TaskPriority;
  estimatedHours?: number;
  actualHours?: number;
  blockedBy?: string[]; // Task IDs that must complete first
  blocking?: string[]; // Task IDs that depend on this
  department: TaskDepartment;
  productLine?: ProductLineAssignment;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Workload summary for a team member
export interface WorkloadSummary {
  userId: string;
  userName: string;
  role: UserRole;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  dueTodayCount: number;
  overdueCount: number;
  blockedCount: number;
  totalEstimatedHours: number;
  capacityUtilization: number; // percentage 0-100
}

// Department workload for bottleneck detection
export interface DepartmentWorkload {
  department: TaskDepartment;
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  overdueCount: number;
  averageWaitTime: number; // in hours
  capacityUtilization: number;
  bottleneckRisk: 'low' | 'medium' | 'high' | 'critical';
}

// Stage workload for sampling floor
export interface StageWorkload {
  stageId: string;
  stageName: string;
  samplesInQueue: number;
  operatorsAssigned: number;
  averageProcessingTime: number; // in hours
  estimatedClearTime: number; // in hours
  capacityUtilization: number;
  isBottleneck: boolean;
}

// Task type configuration
export const TASK_TYPE_CONFIG: Record<TaskType, { label: string; department: TaskDepartment; icon: string }> = {
  'design-submission': { label: 'Design Submission', department: 'design', icon: 'Palette' },
  'motif-development': { label: 'Motif Development', department: 'design', icon: 'Flower2' },
  'punching': { label: 'Punching', department: 'design', icon: 'Target' },
  'design-review': { label: 'Design Review', department: 'design', icon: 'CheckCircle' },
  'fabric-sourcing': { label: 'Fabric Sourcing', department: 'sourcing', icon: 'Package' },
  'fabric-treatment': { label: 'Fabric Treatment', department: 'sourcing', icon: 'Droplets' },
  'vendor-coordination': { label: 'Vendor Coordination', department: 'sourcing', icon: 'Users' },
  'pattern-making': { label: 'Pattern Making', department: 'sampling', icon: 'Ruler' },
  'cutting': { label: 'Cutting', department: 'sampling', icon: 'Scissors' },
  'stitching': { label: 'Stitching', department: 'sampling', icon: 'Needle' },
  'embroidery': { label: 'Embroidery', department: 'sampling', icon: 'Sparkles' },
  'finishing': { label: 'Finishing', department: 'sampling', icon: 'Wand2' },
  'quality-check': { label: 'Quality Check', department: 'sampling', icon: 'ClipboardCheck' },
};

// Priority configuration
export const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string }> = {
  critical: { label: 'Critical', color: 'hsl(var(--destructive))' },
  high: { label: 'High', color: 'hsl(var(--status-delayed))' },
  normal: { label: 'Normal', color: 'hsl(var(--primary))' },
  low: { label: 'Low', color: 'hsl(var(--muted-foreground))' },
};

// Status configuration
export const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'hsl(var(--muted-foreground))' },
  assigned: { label: 'Assigned', color: 'hsl(var(--chart-2))' },
  'in-progress': { label: 'In Progress', color: 'hsl(var(--status-in-progress))' },
  blocked: { label: 'Blocked', color: 'hsl(var(--destructive))' },
  completed: { label: 'Completed', color: 'hsl(var(--status-completed))' },
  cancelled: { label: 'Cancelled', color: 'hsl(var(--muted))' },
};
