/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { ExpenseType, SplitType } from '../services/expense.model';
import type { Participant, BillItem } from '../services/expense.model';
import { recalculateSplits, calculateTotalAmount, recalculateGlobalSplitsFromItems } from '../utils/splitCalculator';
interface ExpenseState {
  type: ExpenseType;
  description: string;
  totalAmount: number;
  payerId: string;
  items: BillItem[];
  participants: Participant[];
  beforeDiscountTotal?: number;
  actualTotal?: number;

  // Actions
  setType: (type: ExpenseType) => void;
  setDescription: (desc: string) => void;
  setTotalAmount: (amount: number) => void; // for NOTE
  setBillTotal: (amount: number) => void; // override total for BILL (e.g. after scan)
  setDiscountInfo: (beforeDiscountTotal: number, actualTotal: number) => void;

  // Items (for BILL)
  addItem: (item: Omit<BillItem, 'id' | 'splits'>) => void;
  updateItem: (id: string, updates: Partial<BillItem>) => void;
  removeItem: (id: string) => void;
  toggleItemParticipant: (itemId: string, userId: string) => void;

  // Participants
  setParticipants: (participants: Participant[]) => void;
  addParticipant: (name: string, avatarUrl?: string) => void;
  removeParticipant: (userId: string) => void;
  updateParticipantSplit: (userId: string, splitType: SplitType, splitValue?: number) => void;
  setPayer: (userId: string) => void;
  reset: () => void;
}

const mockFriends: Participant[] = [
  { userId: 'u1', name: '(You)', avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=You', splitType: SplitType.EVEN, splitValue: 0, calculatedAmount: 0 },
];

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  type: ExpenseType.NOTE,
  description: '',
  totalAmount: 0,
  payerId: 'u1', // Default payer is you
  items: [],
  participants: mockFriends,

  reset: () => set({
    type: ExpenseType.NOTE,
    description: '',
    totalAmount: 0,
    payerId: 'u1',
    items: [],
    participants: mockFriends,
    beforeDiscountTotal: undefined,
    actualTotal: undefined,
  }),

  setType: (type) => set({ type, items: type === ExpenseType.NOTE ? [] : get().items }),

  setDescription: (description) => set({ description }),

  setTotalAmount: (amount) => {
    // Only applies to NOTE. For BILL, total is calculated from items
    if (get().type === ExpenseType.NOTE) {
      set({ totalAmount: amount });
      const newParticipants = recalculateSplits(amount, get().participants);
      set({ participants: newParticipants });
    }
  },

  setBillTotal: (amount) => set({ totalAmount: amount }),

  setDiscountInfo: (beforeDiscountTotal, actualTotal) => set({ beforeDiscountTotal, actualTotal }),

  addItem: (item) => {
    const itemTotal = item.price * item.quantity;
    const initialSplits = get().participants.map(p => ({
      userId: p.userId,
      splitType: SplitType.EVEN,
      splitValue: 0,
      calculatedAmount: 0
    }));
    const finalSplits = recalculateSplits(itemTotal, initialSplits);

    const newItem: BillItem = { ...item, id: Math.random().toString(36).substring(7), splits: finalSplits };
    const newItems = [...get().items, newItem];
    const newTotal = calculateTotalAmount(newItems);

    // If we are in BILL mode, total participants splits = sum of item splits
    const newParticipants = recalculateGlobalSplitsFromItems(newItems, get().participants);

    set({ items: newItems, totalAmount: newTotal, participants: newParticipants });
  },

  updateItem: (id, updates) => {
    const newItems = get().items.map(i => i.id === id ? { ...i, ...updates } : i);
    const newTotal = calculateTotalAmount(newItems);

    const newParticipants = recalculateGlobalSplitsFromItems(newItems, get().participants);

    set({ items: newItems, totalAmount: newTotal, participants: newParticipants });
  },

  removeItem: (id) => {
    const newItems = get().items.filter(i => i.id !== id);
    const newTotal = calculateTotalAmount(newItems);

    const newParticipants = recalculateGlobalSplitsFromItems(newItems, get().participants);

    set({ items: newItems, totalAmount: newTotal, participants: newParticipants });
  },

  setParticipants: (participants) => {
    const newParticipants = recalculateSplits(get().totalAmount, participants);
    set({ participants: newParticipants });
  },

  addParticipant: (name, avatarUrl) => {
    const id = `u_${Date.now()}`;
    const newP: Participant = {
      userId: id,
      name,
      avatarUrl: avatarUrl || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=ff7da1`,
      splitType: SplitType.EVEN,
      splitValue: 0,
      calculatedAmount: 0
    };
    const newParticipants = recalculateSplits(get().totalAmount, [...get().participants, newP]);

    // Automatically add new participant to all existing items' splits
    const newItems = get().items.map(item => ({
      ...item,
      splits: recalculateSplits(item.price * item.quantity, [...item.splits, { ...newP }])
    }));

    const finalParticipants = get().type === ExpenseType.BILL ? recalculateGlobalSplitsFromItems(newItems, newParticipants) : newParticipants;

    set({ items: newItems as any, participants: finalParticipants });
  },

  removeParticipant: (userId) => {
    // You can't remove yourself
    if (userId === 'u1') return;

    const newParticipants = recalculateSplits(get().totalAmount, get().participants.filter(p => p.userId !== userId));

    const newItems = get().items.map(item => ({
      ...item,
      splits: recalculateSplits(item.price * item.quantity, item.splits.filter(s => s.userId !== userId))
    }));

    const finalParticipants = get().type === ExpenseType.BILL ? recalculateGlobalSplitsFromItems(newItems, newParticipants) : newParticipants;

    let newPayerId = get().payerId;
    if (newPayerId === userId) {
      newPayerId = finalParticipants[0]?.userId || 'u1';
    }

    set({ items: newItems as any, participants: finalParticipants, payerId: newPayerId });
  },

  updateParticipantSplit: (userId, splitType, splitValue = 0) => {
    const participants = get().participants.map(p =>
      p.userId === userId ? { ...p, splitType, splitValue } : p
    );
    const newParticipants = recalculateSplits(get().totalAmount, participants);
    set({ participants: newParticipants });
  },

  toggleItemParticipant: (itemId, userId) => {
    const newItems = get().items.map(item => {
      if (item.id !== itemId) return item;

      const exists = item.splits.find(s => s.userId === userId);
      let newSplits = [];
      if (exists) {
        newSplits = item.splits.filter(s => s.userId !== userId);
      } else {
        newSplits = [...item.splits, { userId, splitType: SplitType.EVEN, splitValue: 0, calculatedAmount: 0 }];
      }

      const itemTotal = item.price * item.quantity;
      const finalSplits = recalculateSplits(itemTotal, newSplits);

      return { ...item, splits: finalSplits as any };
    });

    const newTotal = calculateTotalAmount(newItems);
    const newParticipants = recalculateGlobalSplitsFromItems(newItems, get().participants);

    set({ items: newItems, totalAmount: newTotal, participants: newParticipants });
  },

  setPayer: (userId) => {
    set({ payerId: userId });
  }
}));
