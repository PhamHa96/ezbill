import { SplitType } from '../services/expense.model';
import type { Participant, BillItem, SplitBase } from '../services/expense.model';

export const calculateTotalAmount = (items: BillItem[]): number => {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
};

export const recalculateSplits = <T extends SplitBase>(totalAmount: number, splits: T[]): T[] => {
  if (splits.length === 0 || totalAmount <= 0) {
    return splits.map(p => ({ ...p, calculatedAmount: 0 }));
  }

  const evenSplits = splits.filter(p => p.splitType === SplitType.EVEN);
  const percentageSplits = splits.filter(p => p.splitType === SplitType.PERCENTAGE);
  const amountSplits = splits.filter(p => p.splitType === SplitType.AMOUNT);

  let remainingAmount = totalAmount;

  const updatedAmountSplits = amountSplits.map(p => {
    const val = p.splitValue || 0;
    remainingAmount -= val;
    return { ...p, calculatedAmount: val };
  });

  const updatedPercentageSplits = percentageSplits.map(p => {
    const val = (totalAmount * (p.splitValue || 0)) / 100;
    remainingAmount -= val;
    return { ...p, calculatedAmount: val };
  });

  const numEven = evenSplits.length;
  const evenAmount = numEven > 0 ? remainingAmount / numEven : 0;
  
  const updatedEvenSplits = evenSplits.map(p => {
    return { ...p, calculatedAmount: evenAmount > 0 ? evenAmount : 0 };
  });

  return splits.map(originP => {
    if (originP.splitType === SplitType.AMOUNT) {
      return updatedAmountSplits.find(p => p.userId === originP.userId) || originP;
    }
    if (originP.splitType === SplitType.PERCENTAGE) {
      return updatedPercentageSplits.find(p => p.userId === originP.userId) || originP;
    }
    return updatedEvenSplits.find(p => p.userId === originP.userId) || originP;
  });
};

export const recalculateGlobalSplitsFromItems = (items: BillItem[], participants: Participant[]): Participant[] => {
  const participantTotals = new Map<string, number>();

  items.forEach(item => {
    item.splits.forEach(split => {
      const current = participantTotals.get(split.userId) || 0;
      participantTotals.set(split.userId, current + split.calculatedAmount);
    });
  });

  return participants.map(p => ({
    ...p,
    calculatedAmount: participantTotals.get(p.userId) || 0,
  }));
};
