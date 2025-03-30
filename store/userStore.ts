import { create } from 'zustand';

// Define user store types
interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
}

interface UserStore {
  user: User;
  updateUser: (user: Partial<User>) => void;
}

// Create user store with initial data
export const useUserStore = create<UserStore>((set) => ({
  user: {
    id: 1,
    name: 'Alex Morgan',
    email: 'alex.morgan@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=256&q=80',
  },
  updateUser: (userData) => set((state) => ({ user: { ...state.user, ...userData } })),
}));