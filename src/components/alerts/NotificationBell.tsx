import { useCurrentUser } from '@/contexts/UserContext';
import { useNotificationStore } from '@/data/notificationStore';
import { SEVERITY_CONFIG, ALERT_TYPE_CONFIG } from '@/types/notification';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  X, 
  Clock, 
  AlertTriangle, 
  AlertOctagon,
  TrendingUp,
  GitBranch,
  CheckCircle2,
  UserPlus,
  Package,
  RefreshCw,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useState } from 'react';

// Icon mapping for alert types
const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Clock,
  AlertTriangle,
  AlertOctagon,
  TrendingUp,
  GitBranch,
  CheckCircle2,
  UserPlus,
  CheckCheck,
  Package,
  RefreshCw,
};

export const NotificationBell = () => {
  const { currentUser } = useCurrentUser();
  const { 
    getNotificationsForUser, 
    getUnreadCount, 
    markAsRead, 
    markAllAsRead,
    dismissNotification 
  } = useNotificationStore();
  const [isOpen, setIsOpen] = useState(false);

  if (!currentUser) return null;

  const notifications = getNotificationsForUser(currentUser.id, currentUser.role);
  const unreadCount = getUnreadCount(currentUser.id, currentUser.role);

  const handleMarkAllRead = () => {
    markAllAsRead(currentUser.id);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              variant="destructive"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h4 className="font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-7"
              onClick={handleMarkAllRead}
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map(notification => {
                const severityConfig = SEVERITY_CONFIG[notification.severity];
                const typeConfig = ALERT_TYPE_CONFIG[notification.type];
                const IconComponent = ICON_MAP[typeConfig.icon] || Bell;
                const isRead = notification.readBy.includes(currentUser.id);

                return (
                  <div
                    key={notification.id}
                    className={cn(
                      'px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer',
                      !isRead && 'bg-accent/30'
                    )}
                    onClick={() => {
                      if (!isRead) {
                        markAsRead(notification.id, currentUser.id);
                      }
                    }}
                  >
                    <div className="flex gap-3">
                      <div 
                        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: severityConfig.bgColor }}
                      >
                        <IconComponent 
                          className="h-4 w-4" 
                          style={{ color: severityConfig.color }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={cn(
                            'text-sm',
                            !isRead && 'font-medium'
                          )}>
                            {notification.title}
                          </p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              dismissNotification(notification.id, currentUser.id);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                          </span>
                          {notification.actionLabel && notification.actionUrl && (
                            <>
                              <span className="text-muted-foreground">•</span>
                              <a 
                                href={notification.actionUrl}
                                className="text-xs text-primary hover:underline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsOpen(false);
                                }}
                              >
                                {notification.actionLabel}
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
