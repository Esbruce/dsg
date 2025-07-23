export interface UserData {
  userEmail: string | null;
  usageCount: number;
  isPaid: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface UserDataContextType extends UserData {
  refreshUserData: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

export interface AuthFormData {
  email: string;
  password: string;
  confirmPassword?: string;
} 