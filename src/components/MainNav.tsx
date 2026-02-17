import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Calendar, Layers, Scissors, Users, Package, Gauge, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/director', label: 'Director', icon: Gauge },
  { path: '/design-hub', label: 'Design Hub', icon: Palette },
  { path: '/sourcing', label: 'Sourcing', icon: Package },
  { path: '/sampling-floor', label: 'Sampling Floor', icon: Users },
  { path: '/seasonal-planning', label: 'Planning', icon: Calendar },
];

interface MainNavProps {
  children?: React.ReactNode;
}

export const MainNav = ({ children }: MainNavProps) => {
  const location = useLocation();
  
  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-1 overflow-x-auto">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    className={cn(
                      'gap-1.5 text-xs',
                      isActive && 'pointer-events-none'
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="hidden md:inline">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
          
          {children && (
            <div className="flex items-center gap-2">
              {children}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
