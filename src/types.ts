import type { Participant } from './services/expense.model';

export interface Trip {
  id: string;
  name: string;
  status: 'active' | 'completed';
  spent: number;
  budget: number;
  imageUrl: string;
  emoji: string;
  participants: Participant[];
}

export interface Activity {
  id: string;
  user: string;
  action: string;
  tripName: string;
  time: string;
  amount: number;
  userOwes?: number;
  type: 'expense' | 'payment';
  category: 'food' | 'transport' | 'settle' | 'other';
}

export type NavigationTab = 'Home' | 'Trips' | 'Friends' | 'Profile';

export const NavigationTabs = {
  Home: 'Home',
  Trips: 'Trips',
  Friends: 'Friends',
  Profile: 'Profile'
} as const;
