import React from 'react';
import { ExpenseType } from '../../services/expense.model';
import { useExpenseStore } from '../../stores/expenseStore';

export const ExpenseTypeSelector: React.FC = () => {
  const { type, setType } = useExpenseStore();

  return (
    <div className="flex bg-[#FFE5EC] p-1 rounded-full mb-6">
      <button
        type="button"
        onClick={() => setType(ExpenseType.NOTE)}
        className={`flex-1 py-3 text-sm font-extrabold rounded-full transition-all ${
          type === ExpenseType.NOTE
            ? 'bg-white text-primary shadow-sm'
            : 'text-[#FF7DA1] hover:bg-white/50'
        }`}
      >
        <div className="flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[18px]">edit_note</span>
          Quick Note
        </div>
      </button>
      
      <button
        type="button"
        onClick={() => setType(ExpenseType.BILL)}
        className={`flex-1 py-3 text-sm font-extrabold rounded-full transition-all ${
          type === ExpenseType.BILL
            ? 'bg-white text-primary shadow-sm'
            : 'text-[#FF7DA1] hover:bg-white/50'
        }`}
      >
        <div className="flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[18px]">receipt_long</span>
          Itemized Bill
        </div>
      </button>
    </div>
  );
};
