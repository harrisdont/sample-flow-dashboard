import { UserRole } from './user';

// Alert severity levels
export type AlertSeverity = 'info' | 'warning' | 'critical';

// Alert types for different scenarios
export type AlertType = 
  | 'deadline-approaching'
  | 'deadline-overdue'
  | 'bottleneck-detected'
  | 'capacity-warning'
  | 'delay-propagation'
  | 'approval-needed'
  | 'task-assigned'
  | 'task-completed'
  | 'fabric-ready'
  | 'sample-status-change';

// Related entity types
export type RelatedEntityType = 'sample' | 'collection' | 'task' | 'fabric' | 'design';

// Alert/Notification interface
export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  relatedEntityId?: string;
  relatedEntityType?: RelatedEntityType;
  actionUrl?: string;
  actionLabel?: string;
  recipientRoles: UserRole[];
  recipientUserIds?: string[]; // Specific users if not role-based
  createdAt: Date;
  expiresAt?: Date;
  readBy: string[]; // User IDs who have read this
  dismissedBy: string[]; // User IDs who have dismissed this
}

// Notification preferences per user
export interface NotificationPreferences {
  userId: string;
  emailEnabled: boolean;
  emailFrequency: 'immediate' | 'hourly' | 'daily';
  alertTypes: {
    [key in AlertType]: {
      inApp: boolean;
      email: boolean;
    };
  };
}

// Alert type configuration for UI
export const ALERT_TYPE_CONFIG: Record<AlertType, { 
  label: string; 
  icon: string; 
  defaultSeverity: AlertSeverity;
}> = {
  'deadline-approaching': {
    label: 'Deadline Approaching',
    icon: 'Clock',
    defaultSeverity: 'warning',
  },
  'deadline-overdue': {
    label: 'Deadline Overdue',
    icon: 'AlertTriangle',
    defaultSeverity: 'critical',
  },
  'bottleneck-detected': {
    label: 'Bottleneck Detected',
    icon: 'AlertOctagon',
    defaultSeverity: 'critical',
  },
  'capacity-warning': {
    label: 'Capacity Warning',
    icon: 'TrendingUp',
    defaultSeverity: 'warning',
  },
  'delay-propagation': {
    label: 'Delay Impact',
    icon: 'GitBranch',
    defaultSeverity: 'warning',
  },
  'approval-needed': {
    label: 'Approval Needed',
    icon: 'CheckCircle2',
    defaultSeverity: 'info',
  },
  'task-assigned': {
    label: 'Task Assigned',
    icon: 'UserPlus',
    defaultSeverity: 'info',
  },
  'task-completed': {
    label: 'Task Completed',
    icon: 'CheckCheck',
    defaultSeverity: 'info',
  },
  'fabric-ready': {
    label: 'Fabric Ready',
    icon: 'Package',
    defaultSeverity: 'info',
  },
  'sample-status-change': {
    label: 'Sample Status Update',
    icon: 'RefreshCw',
    defaultSeverity: 'info',
  },
};

// Severity configuration
export const SEVERITY_CONFIG: Record<AlertSeverity, { label: string; color: string; bgColor: string }> = {
  info: { 
    label: 'Info', 
    color: 'hsl(var(--primary))', 
    bgColor: 'hsl(var(--primary) / 0.1)' 
  },
  warning: { 
    label: 'Warning', 
    color: 'hsl(var(--status-delayed))', 
    bgColor: 'hsl(var(--status-delayed) / 0.1)' 
  },
  critical: { 
    label: 'Critical', 
    color: 'hsl(var(--destructive))', 
    bgColor: 'hsl(var(--destructive) / 0.1)' 
  },
};
