import { useCurrentUser, MOCK_USERS } from '@/contexts/UserContext';
import { ROLE_CONFIG, UserRole } from '@/types/user';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChevronDown, User, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

export const RoleSwitcher = () => {
  const { currentUser, setCurrentUser } = useCurrentUser();

  if (!currentUser) return null;

  const roleConfig = ROLE_CONFIG[currentUser.role];
  const initials = currentUser.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  // Group users by role for the dropdown
  const usersByRole = MOCK_USERS.reduce((acc, user) => {
    if (!acc[user.role]) {
      acc[user.role] = [];
    }
    acc[user.role].push(user);
    return acc;
  }, {} as Record<UserRole, typeof MOCK_USERS>);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2 h-9 px-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback 
              className="text-xs"
              style={{ backgroundColor: roleConfig.color, color: 'white' }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start text-left">
            <span className="text-sm font-medium leading-none">{currentUser.name}</span>
            <span className="text-xs text-muted-foreground leading-none mt-0.5">
              {roleConfig.label}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Switch Role (Dev Mode)
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {(Object.entries(usersByRole) as [UserRole, typeof MOCK_USERS][]).map(([role, users]) => {
          const config = ROLE_CONFIG[role];
          return (
            <div key={role}>
              <DropdownMenuLabel className="text-xs text-muted-foreground py-1">
                {config.label}
              </DropdownMenuLabel>
              {users.map(user => (
                <DropdownMenuItem
                  key={user.id}
                  onClick={() => setCurrentUser(user)}
                  className={cn(
                    'cursor-pointer',
                    currentUser.id === user.id && 'bg-accent'
                  )}
                >
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarFallback 
                      className="text-xs"
                      style={{ backgroundColor: config.color, color: 'white' }}
                    >
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm">{user.name}</span>
                    {user.assignedLines && (
                      <span className="text-xs text-muted-foreground">
                        {user.assignedLines.map(l => l.charAt(0).toUpperCase() + l.slice(1)).join(', ')}
                      </span>
                    )}
                  </div>
                  {currentUser.id === user.id && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      Active
                    </Badge>
                  )}
                </DropdownMenuItem>
              ))}
            </div>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
