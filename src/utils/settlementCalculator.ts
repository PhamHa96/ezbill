import type { Expense, Participant } from '../services/expense.model';

export interface Debt {
  from: string; // userId
  fromName: string;
  fromAvatar?: string;
  to: string; // userId
  toName: string;
  toAvatar?: string;
  amount: number;
}

export const calculateSettlement = (expenses: Expense[], participants: Participant[]): Debt[] => {
  // 1. Calculate net balances for each user
  const balances = new Map<string, number>();
  
  // Initialize with 0
  participants.forEach(p => balances.set(p.userId, 0));

  expenses.forEach(exp => {
    // Add amount paid to the payer
    const currentPaid = balances.get(exp.payerId) || 0;
    balances.set(exp.payerId, currentPaid + exp.totalAmount);

    // Subtract amount owed for each participant
    exp.participants.forEach(p => {
       const currentBalance = balances.get(p.userId) || 0;
       balances.set(p.userId, currentBalance - (p.calculatedAmount || 0));
    });
  });

  // 2. Separate into debtors (negative) and creditors (positive)
  const debtors: {userId: string, name: string, avatar?: string, amount: number}[] = [];
  const creditors: {userId: string, name: string, avatar?: string, amount: number}[] = [];

  balances.forEach((amount, userId) => {
     // Find participant globally
     let participant = participants.find(p => p.userId === userId);
     
     // Fallback: search within expenses if user was removed from trip but still has debts
     if (!participant) {
         for (const exp of expenses) {
             const found = exp.participants.find(p => p.userId === userId);
             if (found) {
                participant = found; break;
             }
         }
     }

     if (!participant) return;

     if (amount < -0.01) {
        debtors.push({ userId, name: participant.name || userId, avatar: participant.avatarUrl, amount: Math.abs(amount) });
     } else if (amount > 0.01) {
        creditors.push({ userId, name: participant.name || userId, avatar: participant.avatarUrl, amount });
     }
  });

  // 3. Resolve debts (greedy algorithm)
  const debts: Debt[] = [];

  let d = 0; // debtor index
  let c = 0; // creditor index

  while (d < debtors.length && c < creditors.length) {
     const debtor = debtors[d];
     const creditor = creditors[c];

     const amountToSettle = Math.min(debtor.amount, creditor.amount);

     if (amountToSettle > 0.01) {
         debts.push({
           from: debtor.userId,
           fromName: debtor.name,
           fromAvatar: debtor.avatar,
           to: creditor.userId,
           toName: creditor.name,
           toAvatar: creditor.avatar,
           amount: amountToSettle
         });
     }

     debtor.amount -= amountToSettle;
     creditor.amount -= amountToSettle;

     if (debtor.amount < 0.01) d++;
     if (creditor.amount < 0.01) c++;
  }

  return debts;
};
