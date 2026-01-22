import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User, UserRole, ProductLineAssignment } from '@/types/user';

// Mock users for development and testing
export const MOCK_USERS: User[] = [
  {
    id: 'user-director-1',
    name: 'Amir Hussain',
    email: 'amir.hussain@company.com',
    role: 'director',
    department: 'management',
  },
  {
    id: 'user-cat-mgr-1',
    name: 'Sana Malik',
    email: 'sana.malik@company.com',
    role: 'category-manager',
    department: 'management',
  },
  {
    id: 'user-design-lead-woman',
    name: 'Ayesha Khan',
    email: 'ayesha.khan@company.com',
    role: 'design-lead',
    department: 'design',
    assignedLines: ['woman', 'basic'],
  },
  {
    id: 'user-design-lead-formals',
    name: 'Sara Malik',
    email: 'sara.malik@company.com',
    role: 'design-lead',
    department: 'design',
    assignedLines: ['formals', 'semi-bridals'],
  },
  {
    id: 'user-design-coord-cottage',
    name: 'Fatima Ahmed',
    email: 'fatima.ahmed@company.com',
    role: 'design-coordinator',
    department: 'design',
    assignedLines: ['cottage', 'ming'],
  },
  {
    id: 'user-design-coord-classic',
    name: 'Hira Shah',
    email: 'hira.shah@company.com',
    role: 'design-coordinator',
    department: 'design',
    assignedLines: ['classic'],
  },
  {
    id: 'user-sourcing-mgr-1',
    name: 'Bilal Ahmed',
    email: 'bilal.ahmed@company.com',
    role: 'sourcing-manager',
    department: 'sourcing',
  },
  {
    id: 'user-sampling-incharge-1',
    name: 'Usman Ali',
    email: 'usman.ali@company.com',
    role: 'sampling-incharge',
    department: 'sampling',
  },
];

// Context type
interface UserContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  switchRole: (role: UserRole) => void;
  isRoleSwitcherOpen: boolean;
  setIsRoleSwitcherOpen: (open: boolean) => void;
  getUsersByRole: (role: UserRole) => User[];
  getUsersByDepartment: (department: User['department']) => User[];
  getUsersByLine: (line: ProductLineAssignment) => User[];
  allUsers: User[];
}

// Create context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider props
interface UserProviderProps {
  children: ReactNode;
  initialUser?: User;
}

// Provider component
export const UserProvider: React.FC<UserProviderProps> = ({ children, initialUser }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(initialUser || MOCK_USERS[0]);
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);

  // Switch to a user with the specified role
  const switchRole = useCallback((role: UserRole) => {
    const user = MOCK_USERS.find(u => u.role === role);
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  // Get all users with a specific role
  const getUsersByRole = useCallback((role: UserRole): User[] => {
    return MOCK_USERS.filter(u => u.role === role);
  }, []);

  // Get all users in a department
  const getUsersByDepartment = useCallback((department: User['department']): User[] => {
    return MOCK_USERS.filter(u => u.department === department);
  }, []);

  // Get all users assigned to a product line
  const getUsersByLine = useCallback((line: ProductLineAssignment): User[] => {
    return MOCK_USERS.filter(u => u.assignedLines?.includes(line));
  }, []);

  const value: UserContextType = {
    currentUser,
    setCurrentUser,
    switchRole,
    isRoleSwitcherOpen,
    setIsRoleSwitcherOpen,
    getUsersByRole,
    getUsersByDepartment,
    getUsersByLine,
    allUsers: MOCK_USERS,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

// Hook to use user context
export const useCurrentUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useCurrentUser must be used within a UserProvider');
  }
  return context;
};

// Hook to check permissions
export const usePermissions = () => {
  const { currentUser } = useCurrentUser();
  
  const canViewAllCollections = currentUser?.role === 'director' || 
    currentUser?.role === 'category-manager' || 
    currentUser?.role === 'sourcing-manager' ||
    currentUser?.role === 'sampling-incharge';
  
  const canEditSeasonalPlanning = currentUser?.role === 'category-manager';
  
  const canSubmitCollectionPlans = currentUser?.role === 'design-lead' || 
    currentUser?.role === 'design-coordinator';
  
  const canAssignDesignTasks = currentUser?.role === 'design-lead' || 
    currentUser?.role === 'design-coordinator';
  
  const canManageFabricPipeline = currentUser?.role === 'sourcing-manager';
  
  const canAssignSamplingOperators = currentUser?.role === 'sampling-incharge';
  
  const canApproveSamples = currentUser?.role === 'design-lead' || 
    currentUser?.role === 'sampling-incharge';
  
  const canViewReports = currentUser?.role === 'director' || 
    currentUser?.role === 'category-manager' ||
    currentUser?.role === 'sourcing-manager' ||
    currentUser?.role === 'sampling-incharge';

  return {
    canViewAllCollections,
    canEditSeasonalPlanning,
    canSubmitCollectionPlans,
    canAssignDesignTasks,
    canManageFabricPipeline,
    canAssignSamplingOperators,
    canApproveSamples,
    canViewReports,
  };
};
