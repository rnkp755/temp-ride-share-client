import { create } from 'zustand';

// Define trip store types
interface Route {
  from: string;
  to: string;
  via: string[];
}

interface User {
  id: number;
  name: string;
  avatar: string;
}

export interface Trip {
  id: number;
  user: User;
  route: Route;
  date: string;
  time: string;
  transportation: string;
  notes?: string;
  createdAt: string;
}

interface TripStore {
  trips: Trip[];
  addTrip: (trip: Trip) => void;
  removeTrip: (id: number) => void;
}

// Create trip store with initial data
export const useTripStore = create<TripStore>((set) => ({
  trips: [
    {
      id: 1,
      user: {
        id: 2,
        name: 'Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=256&q=80',
      },
      route: {
        from: 'New York',
        to: 'Boston',
        via: ['Hartford', 'Providence'],
      },
      date: '2025-06-15',
      time: '09:00',
      transportation: 'Car',
      notes: "I have space for 2 passengers. Let me know if you need a ride!",
      createdAt: '2025-06-01T12:00:00Z',
    },
    {
      id: 2,
      user: {
        id: 3,
        name: 'Michael Chen',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=256&q=80',
      },
      route: {
        from: 'San Francisco',
        to: 'Los Angeles',
        via: ['San Jose', 'Bakersfield'],
      },
      date: '2025-06-18',
      time: '10:30',
      transportation: 'Train',
      notes: 'Will be bringing a small suitcase. Happy to share snacks!',
      createdAt: '2025-06-02T15:30:00Z',
    },
    {
      id: 3,
      user: {
        id: 4,
        name: 'Emily Rodriguez',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=256&q=80',
      },
      route: {
        from: 'Chicago',
        to: 'Detroit',
        via: ['Gary', 'Ann Arbor'],
      },
      date: '2025-06-20',
      time: '08:15',
      transportation: 'Car',
      createdAt: '2025-06-03T09:45:00Z',
    },
  ],
  addTrip: (trip) => set((state) => ({ trips: [trip, ...state.trips] })),
  removeTrip: (id) => set((state) => ({ trips: state.trips.filter((trip) => trip.id !== id) })),
}));