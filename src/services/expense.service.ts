import { ExpenseType, SplitType } from "./expense.model";
import type { TripInvite } from "./user.model";

export class Participant {
  id: string; // uuid
  name!: string;
  avatarUrl?: string;
  isActive?: boolean; // còn tham gia nhóm hay không
  userId?: string;      // link tới User (nếu có)
  constructor(init: Partial<Participant>) {
    Object.assign(this, init);
    this.id = init.id || crypto.randomUUID();
  }
}

export interface SplitRule {
  type: SplitType;
  // EVEN: không cần data
  // PERCENTAGE: { userId: percent }
  // AMOUNT: { userId: amount }
  values?: Record<string, number>;
}

export class BillItem {
  name!: string;
  price!: number;
  quantity!: number;
  assignedTo?: string; // participantId - người chịu tiền (ăn / dùng)
  paidBy?: string;     // participantId - người đã ứng tiền

  constructor(init: Partial<BillItem>) {
    Object.assign(this, init);
    this.quantity = init.quantity ?? 1;
  }

  get total() {
    return this.price * this.quantity;
  }
}

export abstract class Expense {
  id: string;
  type!: ExpenseType;
  title!: string;
  totalAmount!: number;
  participants!: Participant[];
  splitRule!: SplitRule;
  createdAt!: string;

  protected constructor(init: Partial<Expense>) {
    Object.assign(this, init);
    this.id = init.id || crypto.randomUUID();
    this.createdAt = init.createdAt || new Date().toISOString();
  }

  abstract calculateShares(): Record<string, number>;
}
export class NoteExpense extends Expense {
  constructor(init: Partial<NoteExpense>) {
    super({ ...init, type: ExpenseType.NOTE });
  }

  calculateShares(): Record<string, number> {
    return SplitCalculator.calculate(
      this.totalAmount,
      this.participants,
      this.splitRule
    );
  }
}

export class BillExpense extends Expense {
  items: BillItem[];
  discountAmount?: number;

  constructor(init: Partial<BillExpense>) {
    super({ ...init, type: ExpenseType.BILL });
    this.items = init.items || [];
  }

  get totalBeforeDiscount() {
    return this.items.reduce((s, i) => s + i.total, 0);
  }

  get finalTotal() {
    return Math.max(
      0,
      this.totalBeforeDiscount - (this.discountAmount || 0)
    );
  }

  calculateShares(): Record<string, number> {
    return SplitCalculator.calculate(
      this.finalTotal,
      this.participants,
      this.splitRule
    );
  }
}

export class SplitCalculator {
  static calculate(
    total: number,
    participants: Participant[],
    rule: SplitRule
  ): Record<string, number> {
    const result: Record<string, number> = {};

    switch (rule.type) {
      case SplitType.EVEN: {
        const avg = Math.round(total / participants.length);
        participants.forEach(p => (result[p.id] = avg));
        break;
      }

      case SplitType.PERCENTAGE: {
        Object.entries(rule.values || {}).forEach(([id, percent]) => {
          result[id] = Math.round((total * percent) / 100);
        });
        break;
      }

      case SplitType.AMOUNT: {
        Object.entries(rule.values || {}).forEach(([id, amount]) => {
          result[id] = amount;
        });
        break;
      }
    }

    return result;
  }
}

export class Trip {
  id: string;
  name!: string;
  ownerId!: string;           // userId
  participants: Participant[];
  expenses: Expense[];
  createdAt: string;
  invites: TripInvite[];
  imageUrl?: string;
  status: "active" | "archived" = "active";
  constructor(init: Partial<Trip>) {
    Object.assign(this, init);
    this.id = init.id || crypto.randomUUID();
    this.participants = init.participants || [];
    this.invites = init.invites || [];
    this.expenses = init.expenses || [];
    this.createdAt = init.createdAt || new Date().toISOString();
  }

  addExpense(expense: Expense) {
    this.expenses.push(expense);
  }

  get totalExpense() {
    return this.expenses.reduce((s, e) => s + e.totalAmount, 0);
  }

  calculateTripBalance(): Record<string, number> {
    const balance: Record<string, number> = {};

    this.expenses.forEach(exp => {
      const shares = exp.calculateShares();
      Object.entries(shares).forEach(([userId, amount]) => {
        balance[userId] = (balance[userId] || 0) + amount;
      });
    });

    return balance;
  }
}

// tính tiền pải trả qua lại giữa các participant
/**
 * balanceMap:
 *  +100  -> được nhận 100
 *  -100  -> phải trả 100
 */
type BalanceMap = Record<string, number>;

export interface Settlement {
  from: string;   // participantId - người trả
  to: string;     // participantId - người nhận
  amount: number;
}

export class SettlementCalculator {
  static settle(balanceMap: BalanceMap): Settlement[] {
    const settlements: Settlement[] = [];

    // Người được nhận tiền
    const creditors: { id: string; amount: number }[] = [];

    // Người phải trả tiền
    const debtors: { id: string; amount: number }[] = [];

    Object.entries(balanceMap).forEach(([id, amount]) => {
      if (amount > 0) creditors.push({ id, amount });
      else if (amount < 0) debtors.push({ id, amount: Math.abs(amount) });
    });

    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];

      const payAmount = Math.min(debtor.amount, creditor.amount);

      settlements.push({
        from: debtor.id,
        to: creditor.id,
        amount: payAmount,
      });

      debtor.amount -= payAmount;
      creditor.amount -= payAmount;

      if (debtor.amount === 0) i++;
      if (creditor.amount === 0) j++;
    }

    return settlements;
  }
}
// Example usage:
// const balances = trip.calculateTripBalance();
// const settlements = SettlementCalculator.settle(balances);
// [
//   { from: "B", to: "A", amount: 150 },
//   { from: "C", to: "A", amount: 150 }
// ]
