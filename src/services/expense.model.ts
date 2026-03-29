// EZBILL
//  ├─ Participants (Friends)
//  ├─ Expenses[]
//  │    ├─ NoteExpense
//  │    └─ BillExpense
//  └─ Settlement (kết quả chia tiền)
export const ExpenseType = {
  NOTE: "NOTE",
  BILL: "BILL",
} as const;
export type ExpenseType = typeof ExpenseType[keyof typeof ExpenseType];

export const SplitType = {
  EVEN: "EVEN", // Chia đều
  PERCENTAGE: "PERCENT", // Chia %
  AMOUNT: "AMOUNT", // Chia số tiền cụ thể
} as const;
export type SplitType = typeof SplitType[keyof typeof SplitType];

export interface SplitBase {
  userId: string;
  splitType: SplitType;
  splitValue: number; // Phần trăm (%) hoặc số tiền cụ thể
  calculatedAmount: number; // Số tiền được tính toán tự động
}

export interface Participant extends SplitBase {
  name?: string;
  avatarUrl?: string;
}

export type ItemSplit = SplitBase

export interface BillItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  splits: ItemSplit[];
}

export interface Expense {
  id: string;
  tripId?: string;
  type: ExpenseType;
  description: string;
  totalAmount: number;
  payerId: string; // Ai là người đã trả tiền hoá đơn này
  items: BillItem[];
  participants: Participant[];
  createdAt: string;
  // BILL scan totals — present only when scanned from receipt
  beforeDiscountTotal?: number; // Tổng giá gốc trước giảm giá
  actualTotal?: number;         // Tổng thực trả sau giảm giá
}
