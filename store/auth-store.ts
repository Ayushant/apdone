import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL: string;
  phoneNumber?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  login: (user: User | null) => void;
  logout: () => void;
  completeOnboarding: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  hasCompletedOnboarding: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
  completeOnboarding: () => set({ hasCompletedOnboarding: true }),
}));
