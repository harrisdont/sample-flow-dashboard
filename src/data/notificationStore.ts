import { create } from 'zustand';
import { Alert, AlertType, AlertSeverity } from '@/types/notification';
import { UserRole } from '@/types/user';
import { subHours, subDays } from 'date-fns';

interface NotificationStore {
  notifications: Record<string, Alert>;
  
  // CRUD operations
  addNotification: (notification: Omit<Alert, 'id' | 'createdAt' | 'readBy' | 'dismissedBy'>) => string;
  markAsRead: (notificationId: string, userId: string) => void;
  markAllAsRead: (userId: string) => void;
  dismissNotification: (notificationId: string, userId: string) => void;
  deleteNotification: (id: string) => void;
  
  // Queries
  getNotificationById: (id: string) => Alert | undefined;
  getNotificationsForUser: (userId: string, role: UserRole) => Alert[];
  getUnreadCount: (userId: string, role: UserRole) => number;
  getNotificationsByType: (type: AlertType) => Alert[];
  getNotificationsBySeverity: (severity: AlertSeverity) => Alert[];
}

// Generate unique ID
const generateId = () => `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Sample notifications for development
const now = new Date();
const sampleNotifications: Alert[] = [
  {
    id: 'notif-1',
    type: 'deadline-overdue',
    severity: 'critical',
    title: 'Fabric Sourcing Overdue',
    message: 'Silk Organza sourcing for Formals collection is 1 day overdue. This may delay sampling.',
    relatedEntityId: 'task-3',
    relatedEntityType: 'task',
    actionUrl: '/sourcing',
    actionLabel: 'View Task',
    recipientRoles: ['sourcing-manager', 'director'],
    createdAt: subHours(now, 2),
    readBy: [],
    dismissedBy: [],
  },
  {
    id: 'notif-2',
    type: 'deadline-approaching',
    severity: 'warning',
    title: 'Motif Development Due Tomorrow',
    message: 'Floral motifs for Woman Line collection are due tomorrow. 60% complete.',
    relatedEntityId: 'task-2',
    relatedEntityType: 'task',
    actionUrl: '/design-hub',
    actionLabel: 'View Progress',
    recipientRoles: ['design-lead', 'design-coordinator'],
    recipientUserIds: ['user-design-lead-woman'],
    createdAt: subHours(now, 4),
    readBy: [],
    dismissedBy: [],
  },
  {
    id: 'notif-3',
    type: 'bottleneck-detected',
    severity: 'critical',
    title: 'Stitching Stage Bottleneck',
    message: 'Stitching queue has 12 samples with only 3 operators available. Estimated clear time: 4 days.',
    relatedEntityType: 'task',
    actionUrl: '/sampling-floor',
    actionLabel: 'Manage Operators',
    recipientRoles: ['sampling-incharge', 'director'],
    createdAt: subHours(now, 1),
    readBy: [],
    dismissedBy: [],
  },
  {
    id: 'notif-4',
    type: 'approval-needed',
    severity: 'info',
    title: 'Sample Ready for Approval',
    message: 'Sample WS2046 (Long Kurta) has completed all stages and is ready for final approval.',
    relatedEntityId: 'WS2046',
    relatedEntityType: 'sample',
    actionUrl: '/sampling',
    actionLabel: 'Review Sample',
    recipientRoles: ['design-lead', 'sampling-incharge'],
    createdAt: subHours(now, 6),
    readBy: ['user-sampling-incharge-1'],
    dismissedBy: [],
  },
  {
    id: 'notif-5',
    type: 'fabric-ready',
    severity: 'info',
    title: 'Fabric Inducted',
    message: 'Cotton Lawn for Cottage Festive collection has been inducted and is ready for sampling.',
    relatedEntityId: 'fabric-cotton-lawn-1',
    relatedEntityType: 'fabric',
    actionUrl: '/fabric-induction',
    actionLabel: 'View Fabric',
    recipientRoles: ['design-lead', 'design-coordinator', 'sampling-incharge'],
    createdAt: subDays(now, 1),
    readBy: ['user-design-coord-cottage'],
    dismissedBy: [],
  },
  {
    id: 'notif-6',
    type: 'capacity-warning',
    severity: 'warning',
    title: 'Design Team at 95% Capacity',
    message: 'Cottage design team is nearing full capacity. Consider redistributing tasks or adjusting deadlines.',
    recipientRoles: ['design-lead', 'category-manager', 'director'],
    createdAt: subHours(now, 8),
    readBy: [],
    dismissedBy: [],
  },
  {
    id: 'notif-7',
    type: 'task-assigned',
    severity: 'info',
    title: 'New Task Assigned',
    message: 'You have been assigned: "Submit Festive Collection Designs" - Due in 3 days.',
    relatedEntityId: 'task-1',
    relatedEntityType: 'task',
    actionUrl: '/design-hub',
    actionLabel: 'View Task',
    recipientRoles: ['design-coordinator'],
    recipientUserIds: ['user-design-coord-cottage'],
    createdAt: subDays(now, 5),
    readBy: ['user-design-coord-cottage'],
    dismissedBy: [],
  },
];

// Convert array to record
const initialNotifications = sampleNotifications.reduce((acc, notif) => {
  acc[notif.id] = notif;
  return acc;
}, {} as Record<string, Alert>);

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: initialNotifications,

  addNotification: (notificationData) => {
    const id = generateId();
    const notification: Alert = {
      ...notificationData,
      id,
      createdAt: new Date(),
      readBy: [],
      dismissedBy: [],
    };
    set(state => ({
      notifications: { ...state.notifications, [id]: notification },
    }));
    return id;
  },

  markAsRead: (notificationId, userId) => {
    set(state => {
      const notification = state.notifications[notificationId];
      if (!notification || notification.readBy.includes(userId)) return state;
      return {
        notifications: {
          ...state.notifications,
          [notificationId]: {
            ...notification,
            readBy: [...notification.readBy, userId],
          },
        },
      };
    });
  },

  markAllAsRead: (userId) => {
    set(state => {
      const updated = { ...state.notifications };
      Object.keys(updated).forEach(id => {
        if (!updated[id].readBy.includes(userId)) {
          updated[id] = {
            ...updated[id],
            readBy: [...updated[id].readBy, userId],
          };
        }
      });
      return { notifications: updated };
    });
  },

  dismissNotification: (notificationId, userId) => {
    set(state => {
      const notification = state.notifications[notificationId];
      if (!notification || notification.dismissedBy.includes(userId)) return state;
      return {
        notifications: {
          ...state.notifications,
          [notificationId]: {
            ...notification,
            dismissedBy: [...notification.dismissedBy, userId],
          },
        },
      };
    });
  },

  deleteNotification: (id) => {
    set(state => {
      const { [id]: _, ...rest } = state.notifications;
      return { notifications: rest };
    });
  },

  getNotificationById: (id) => get().notifications[id],

  getNotificationsForUser: (userId, role) => {
    return Object.values(get().notifications)
      .filter(n => {
        // Check if notification is for this user specifically or their role
        const isForUser = n.recipientUserIds?.includes(userId);
        const isForRole = n.recipientRoles.includes(role);
        const notDismissed = !n.dismissedBy.includes(userId);
        const notExpired = !n.expiresAt || n.expiresAt > new Date();
        
        return (isForUser || isForRole) && notDismissed && notExpired;
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  getUnreadCount: (userId, role) => {
    const notifications = get().getNotificationsForUser(userId, role);
    return notifications.filter(n => !n.readBy.includes(userId)).length;
  },

  getNotificationsByType: (type) => {
    return Object.values(get().notifications).filter(n => n.type === type);
  },

  getNotificationsBySeverity: (severity) => {
    return Object.values(get().notifications).filter(n => n.severity === severity);
  },
}));
