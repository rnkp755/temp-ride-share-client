import { create } from 'zustand';

interface User {
  email: string;
  gender: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isVerified: boolean;
  setUser: (user: User | null) => void;
  setIsAuthenticated: (value: boolean) => void;
  setIsVerified: (value: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isVerified: false,
  setUser: (user) => set({ user }),
  setIsAuthenticated: (value) => set({ isAuthenticated: value }),
  setIsVerified: (value) => set({ isVerified: value }),
  logout: () => set({ user: null, isAuthenticated: false, isVerified: false }),
}));