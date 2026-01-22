// User roles in the organizational hierarchy
export type UserRole = 
  | 'director'
  | 'category-manager'
  | 'design-lead'
  | 'design-coordinator'
  | 'sourcing-manager'
  | 'sampling-incharge';

// Product lines that design leads/coordinators can be assigned to
export type ProductLineAssignment = 
  | 'woman' 
  | 'cottage' 
  | 'formals' 
  | 'classic' 
  | 'ming' 
  | 'basic' 
  | 'semi-bridals'
  | 'leather'
  | 'regen';

// Departments in the organization
export type Department = 'design' | 'sourcing' | 'sampling' | 'management';

// User interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  assignedLines?: ProductLineAssignment[];
  department: Department;
  avatar?: string;
  phone?: string;
}

// Role metadata for UI display
export interface RoleMetadata {
  label: string;
  description: string;
  department: Department;
  color: string;
  permissions: Permission[];
}

// Permissions for role-based access control
export type Permission = 
  | 'view-all-collections'
  | 'edit-seasonal-planning'
  | 'submit-collection-plans'
  | 'assign-design-tasks'
  | 'manage-fabric-pipeline'
  | 'assign-sampling-operators'
  | 'approve-samples'
  | 'view-reports'
  | 'manage-team';

// Role configuration map
export const ROLE_CONFIG: Record<UserRole, RoleMetadata> = {
  'director': {
    label: 'Director',
    description: 'Executive overview of all operations',
    department: 'management',
    color: 'hsl(var(--chart-5))',
    permissions: ['view-all-collections', 'view-reports'],
  },
  'category-manager': {
    label: 'Category Manager',
    description: 'Strategic planning and design allocation',
    department: 'management',
    color: 'hsl(var(--chart-4))',
    permissions: ['view-all-collections', 'edit-seasonal-planning', 'view-reports'],
  },
  'design-lead': {
    label: 'Design Lead',
    description: 'Lead designer for product line(s)',
    department: 'design',
    color: 'hsl(var(--chart-1))',
    permissions: ['submit-collection-plans', 'assign-design-tasks', 'manage-team', 'approve-samples'],
  },
  'design-coordinator': {
    label: 'Design Coordinator',
    description: 'Coordinates design submissions and team tasks',
    department: 'design',
    color: 'hsl(var(--chart-2))',
    permissions: ['submit-collection-plans', 'assign-design-tasks'],
  },
  'sourcing-manager': {
    label: 'Sourcing Manager',
    description: 'Manages fabric procurement and treatments',
    department: 'sourcing',
    color: 'hsl(var(--chart-3))',
    permissions: ['view-all-collections', 'manage-fabric-pipeline', 'view-reports'],
  },
  'sampling-incharge': {
    label: 'Sampling Incharge',
    description: 'Manages sampling floor operations',
    department: 'sampling',
    color: 'hsl(var(--primary))',
    permissions: ['view-all-collections', 'assign-sampling-operators', 'approve-samples', 'view-reports'],
  },
};

// Helper to check if user has a specific permission
export const hasPermission = (user: User, permission: Permission): boolean => {
  const roleConfig = ROLE_CONFIG[user.role];
  return roleConfig.permissions.includes(permission);
};

// Helper to get role display info
export const getRoleInfo = (role: UserRole): RoleMetadata => {
  return ROLE_CONFIG[role];
};
