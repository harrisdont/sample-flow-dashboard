import { create } from 'zustand';
import { Task, TaskStatus, TaskPriority, TaskType, TaskDepartment, WorkloadSummary } from '@/types/task';
import { ProductLineAssignment } from '@/types/user';
import { addDays, subDays } from 'date-fns';

interface TaskStore {
  tasks: Record<string, Task>;
  
  // CRUD operations
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  
  // Status updates
  assignTask: (taskId: string, userId: string) => void;
  startTask: (taskId: string) => void;
  completeTask: (taskId: string) => void;
  blockTask: (taskId: string, blockedByIds: string[]) => void;
  
  // Queries
  getTaskById: (id: string) => Task | undefined;
  getTasksByAssignee: (userId: string) => Task[];
  getTasksByDepartment: (department: TaskDepartment) => Task[];
  getTasksByStatus: (status: TaskStatus) => Task[];
  getTasksByCollection: (collectionId: string) => Task[];
  getTasksBySample: (sampleId: string) => Task[];
  getOverdueTasks: () => Task[];
  getDueTodayTasks: () => Task[];
  
  // Workload calculations
  getWorkloadSummary: (userId: string) => WorkloadSummary | null;
  getDepartmentWorkload: (department: TaskDepartment) => {
    total: number;
    pending: number;
    inProgress: number;
    overdue: number;
  };
}

// Generate unique ID
const generateId = () => `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Sample tasks for development
const now = new Date();
const sampleTasks: Task[] = [
  {
    id: 'task-1',
    type: 'design-submission',
    title: 'Submit Festive Collection Designs',
    description: 'Complete and submit 8 designs for Cottage Festive collection',
    assignedTo: 'user-design-coord-cottage',
    assignedBy: 'user-design-lead-formals',
    collectionId: 'cottage-festive-aw25',
    dueDate: addDays(now, 3),
    status: 'in-progress',
    priority: 'high',
    estimatedHours: 24,
    department: 'design',
    productLine: 'cottage',
    createdAt: subDays(now, 5),
    updatedAt: now,
  },
  {
    id: 'task-2',
    type: 'motif-development',
    title: 'Develop Floral Motifs for Woman Line',
    assignedTo: 'user-design-lead-woman',
    assignedBy: 'user-design-lead-woman',
    collectionId: 'woman-luxe-ss26',
    dueDate: addDays(now, 1),
    status: 'in-progress',
    priority: 'critical',
    estimatedHours: 16,
    department: 'design',
    productLine: 'woman',
    createdAt: subDays(now, 3),
    updatedAt: now,
  },
  {
    id: 'task-3',
    type: 'fabric-sourcing',
    title: 'Source Silk Organza for Formals',
    assignedTo: 'user-sourcing-mgr-1',
    assignedBy: 'user-sourcing-mgr-1',
    collectionId: 'formals-corporate-ss26',
    dueDate: subDays(now, 1), // Overdue
    status: 'in-progress',
    priority: 'critical',
    estimatedHours: 8,
    department: 'sourcing',
    productLine: 'formals',
    createdAt: subDays(now, 7),
    updatedAt: now,
  },
  {
    id: 'task-4',
    type: 'fabric-treatment',
    title: 'Dyeing batch for Cottage prints',
    assignedTo: 'user-sourcing-mgr-1',
    assignedBy: 'user-sourcing-mgr-1',
    fabricId: 'fabric-cotton-lawn-1',
    dueDate: addDays(now, 5),
    status: 'assigned',
    priority: 'normal',
    estimatedHours: 12,
    department: 'sourcing',
    createdAt: subDays(now, 2),
    updatedAt: now,
  },
  {
    id: 'task-5',
    type: 'pattern-making',
    title: 'Create patterns for Long Kurta samples',
    assignedBy: 'user-sampling-incharge-1',
    sampleId: 'WS2046',
    dueDate: addDays(now, 2),
    status: 'pending',
    priority: 'high',
    estimatedHours: 6,
    department: 'sampling',
    productLine: 'woman',
    createdAt: subDays(now, 1),
    updatedAt: now,
  },
  {
    id: 'task-6',
    type: 'stitching',
    title: 'Complete stitching for Classic samples',
    assignedBy: 'user-sampling-incharge-1',
    sampleId: 'CS3024',
    dueDate: now, // Due today
    status: 'in-progress',
    priority: 'high',
    estimatedHours: 8,
    department: 'sampling',
    productLine: 'classic',
    createdAt: subDays(now, 3),
    updatedAt: now,
  },
  {
    id: 'task-7',
    type: 'punching',
    title: 'Punch multihead designs for Festive',
    assignedTo: 'user-design-coord-cottage',
    assignedBy: 'user-design-lead-formals',
    collectionId: 'cottage-festive-aw25',
    dueDate: addDays(now, 4),
    status: 'pending',
    priority: 'normal',
    blockedBy: ['task-2'],
    estimatedHours: 10,
    department: 'design',
    productLine: 'cottage',
    createdAt: subDays(now, 1),
    updatedAt: now,
  },
  {
    id: 'task-8',
    type: 'quality-check',
    title: 'QC for Blazer samples',
    assignedBy: 'user-sampling-incharge-1',
    sampleId: 'FS1089',
    dueDate: addDays(now, 6),
    status: 'pending',
    priority: 'normal',
    estimatedHours: 3,
    department: 'sampling',
    productLine: 'formals',
    createdAt: now,
    updatedAt: now,
  },
];

// Convert array to record
const initialTasks = sampleTasks.reduce((acc, task) => {
  acc[task.id] = task;
  return acc;
}, {} as Record<string, Task>);

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: initialTasks,

  addTask: (taskData) => {
    const id = generateId();
    const now = new Date();
    const task: Task = {
      ...taskData,
      id,
      createdAt: now,
      updatedAt: now,
    };
    set(state => ({
      tasks: { ...state.tasks, [id]: task },
    }));
    return id;
  },

  updateTask: (id, updates) => {
    set(state => {
      const task = state.tasks[id];
      if (!task) return state;
      return {
        tasks: {
          ...state.tasks,
          [id]: { ...task, ...updates, updatedAt: new Date() },
        },
      };
    });
  },

  deleteTask: (id) => {
    set(state => {
      const { [id]: _, ...rest } = state.tasks;
      return { tasks: rest };
    });
  },

  assignTask: (taskId, userId) => {
    get().updateTask(taskId, { 
      assignedTo: userId, 
      status: 'assigned' 
    });
  },

  startTask: (taskId) => {
    get().updateTask(taskId, { 
      status: 'in-progress',
      startDate: new Date(),
    });
  },

  completeTask: (taskId) => {
    get().updateTask(taskId, { 
      status: 'completed',
      completedAt: new Date(),
    });
  },

  blockTask: (taskId, blockedByIds) => {
    get().updateTask(taskId, { 
      status: 'blocked',
      blockedBy: blockedByIds,
    });
  },

  getTaskById: (id) => get().tasks[id],

  getTasksByAssignee: (userId) => {
    return Object.values(get().tasks).filter(t => t.assignedTo === userId);
  },

  getTasksByDepartment: (department) => {
    return Object.values(get().tasks).filter(t => t.department === department);
  },

  getTasksByStatus: (status) => {
    return Object.values(get().tasks).filter(t => t.status === status);
  },

  getTasksByCollection: (collectionId) => {
    return Object.values(get().tasks).filter(t => t.collectionId === collectionId);
  },

  getTasksBySample: (sampleId) => {
    return Object.values(get().tasks).filter(t => t.sampleId === sampleId);
  },

  getOverdueTasks: () => {
    const now = new Date();
    return Object.values(get().tasks).filter(t => 
      t.dueDate < now && t.status !== 'completed' && t.status !== 'cancelled'
    );
  },

  getDueTodayTasks: () => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    return Object.values(get().tasks).filter(t => 
      t.dueDate >= startOfDay && t.dueDate < endOfDay && 
      t.status !== 'completed' && t.status !== 'cancelled'
    );
  },

  getWorkloadSummary: (userId) => {
    const tasks = get().getTasksByAssignee(userId);
    if (tasks.length === 0) return null;

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const pending = tasks.filter(t => t.status === 'pending' || t.status === 'assigned');
    const inProgress = tasks.filter(t => t.status === 'in-progress');
    const completed = tasks.filter(t => t.status === 'completed');
    const dueToday = tasks.filter(t => t.dueDate >= startOfDay && t.dueDate < endOfDay);
    const overdue = tasks.filter(t => t.dueDate < now && t.status !== 'completed');
    const blocked = tasks.filter(t => t.status === 'blocked');

    const totalEstimatedHours = [...pending, ...inProgress]
      .reduce((sum, t) => sum + (t.estimatedHours || 0), 0);

    // Assume 40 hour work week capacity
    const capacityUtilization = Math.min(100, Math.round((totalEstimatedHours / 40) * 100));

    return {
      userId,
      userName: '', // Would be filled from user context
      role: 'design-coordinator' as const,
      pendingTasks: pending.length,
      inProgressTasks: inProgress.length,
      completedTasks: completed.length,
      dueTodayCount: dueToday.length,
      overdueCount: overdue.length,
      blockedCount: blocked.length,
      totalEstimatedHours,
      capacityUtilization,
    };
  },

  getDepartmentWorkload: (department) => {
    const tasks = get().getTasksByDepartment(department);
    const now = new Date();
    
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending' || t.status === 'assigned').length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      overdue: tasks.filter(t => t.dueDate < now && t.status !== 'completed').length,
    };
  },
}));
