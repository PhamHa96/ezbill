import React, { useState } from 'react';
import { useFmt } from '../../hooks/useFmt';
import type { Expense } from '../../services/expense.model';
import { exportExpenseToPDF, shareExpense } from '../../services/pdf.service';

interface ExpenseDetailModalProps {
  expense: Expense | null;
  onClose: () => void;
}

export const ExpenseDetailModal: React.FC<ExpenseDetailModalProps> = ({ expense, onClose }) => {
  const fmt = useFmt();
  const [sharing, setSharing] = useState(false);
  const [exporting, setExporting] = useState(false);

  if (!expense) return null;

  const payer = expense.participants.find(p => p.userId === expense.payerId);

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      await exportExpenseToPDF(expense);
    } finally {
      setExporting(false);
    }
  };

  const handleShare = async () => {
    setSharing(true);
    try {
      await shareExpense(expense);
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end">
       {/* Backdrop */}
       <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in" onClick={onClose} />

       {/* Sheet */}
       <div className="relative bg-surface-page rounded-t-[32px] w-full max-h-[90vh] flex flex-col pt-2 pb-safe animate-in slide-in-from-bottom-full duration-600">
          <div className="w-12 h-1.5 bg-secondary/20 rounded-full mx-auto mb-6 mt-3 shrink-0" />

          <div className="px-6 flex-1 overflow-y-auto pb-10">
             <div className="flex flex-col items-center text-center mb-3">
                <h2 className="text-2xl font-extrabold text-text-main leading-tight mb-1">
                  {expense.description}
                </h2>
                <div className="flex items-center justify-center gap-2 text-text-muted text-xs font-bold mb-4">
                  <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                  {new Date(expense.createdAt || '').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
                <p className="text-2xl font-black text-primary">{fmt(expense.totalAmount)}</p>
             </div>

             {/* Action Buttons */}
             <div className="flex gap-3 mb-6">
               <button
                 onClick={handleExportPDF}
                 disabled={exporting}
                 className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-primary/10 text-primary font-bold text-sm active:scale-95 transition-transform disabled:opacity-50"
               >
                 <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                 {exporting ? 'Exporting…' : 'Export PDF'}
               </button>
               <button
                 onClick={handleShare}
                 disabled={sharing}
                 className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-secondary/10 text-text-main font-bold text-sm active:scale-95 transition-transform disabled:opacity-50"
               >
                 <span className="material-symbols-outlined text-[18px]">share</span>
                 {sharing ? 'Sharing…' : 'Share'}
               </button>
             </div>

             {/* Payer Info */}
             <div className="bg-surface-card rounded-3xl p-4 shadow-sm border border-[#ffd1dc] flex items-center gap-4 mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/10 rounded-bl-full -z-0" />
                <img src={payer?.avatarUrl} alt={payer?.name} className="w-12 h-12 rounded-full object-cover border-2 border-green-500 z-10" />
                <div className="z-10 bg-surface-card">
                   <p className="text-[10px] uppercase font-bold text-text-muted tracking-widest mb-0.5">Paid By</p>
                   <p className="text-sm font-extrabold text-text-main flex items-center gap-1">
                     {payer?.name || 'Someone'}
                     <span className="material-symbols-outlined text-green-500 text-[14px]">check_circle</span>
                   </p>
                </div>
             </div>

             {/* Participants / Splits */}
             <h3 className="text-[11px] uppercase font-bold text-text-muted tracking-widest mb-3">Participants Split</h3>
             <div className="bg-surface-card rounded-3xl shadow-sm border border-[#ffd1dc] overflow-hidden mb-6">
                {expense.participants.map((p, idx) => (
                  <div key={p.userId} className={`p-4 flex items-center gap-4 ${idx !== expense.participants.length - 1 ? 'border-b border-[#ffd1dc]' : ''}`}>
                      <img src={p.avatarUrl} alt={p.name} className="w-10 h-10 rounded-full object-cover bg-surface-page" />
                      <div className="flex-1">
                         <p className="font-bold text-text-main text-sm">{p.name}</p>
                         <p className="text-[10px] text-text-muted font-bold uppercase mt-0.5 inline-block bg-surface-page px-2 py-0.5 rounded-full">{p.splitType}</p>
                      </div>
                      <div className="text-right">
                         <p className="font-bold text-text-main">{fmt(p.calculatedAmount)}</p>
                         {p.userId === expense.payerId && (
                           <span className="text-[9px] bg-green-500 text-white px-2 py-0.5 rounded-full font-bold">Paid</span>
                         )}
                      </div>
                  </div>
                ))}
             </div>

             {/* Items (Only if it's a Bill) */}
             {expense.type === 'BILL' && expense.items && expense.items.length > 0 && (
               <>
                 <h3 className="text-[11px] uppercase font-bold text-text-muted tracking-widest mb-3">Receipt Items</h3>
                 <div className="bg-surface-card rounded-3xl shadow-sm border border-[#ffd1dc] overflow-hidden mb-6">
                    {expense.items.map((item, idx) => (
                      <div key={item.id} className={`p-4 ${idx !== expense.items.length - 1 ? 'border-b border-[#ffd1dc]' : ''}`}>
                         <div className="flex items-center justify-between mb-2">
                            <div>
                               <p className="font-bold text-text-main text-sm">{item.name}</p>
                               <p className="text-xs text-text-muted font-bold">{item.quantity} x {fmt(item.price)}</p>
                            </div>
                            <p className="font-bold text-text-main text-sm">{fmt(item.quantity * item.price)}</p>
                         </div>
                         <div className="flex gap-1 overflow-x-auto pb-1 mt-2">
                           {item.splits.filter(s => s.calculatedAmount > 0).map(s => {
                             const user = expense.participants.find(u => u.userId === s.userId);
                             return (
                               <div key={s.userId} className="shrink-0 flex items-center gap-1.5 bg-surface-page rounded-full pr-2 pl-1 py-1">
                                  <img src={user?.avatarUrl} alt={user?.name} className="w-4 h-4 rounded-full object-cover" />
                                  <span className="text-[9px] font-bold text-text-main">{fmt(s.calculatedAmount)}</span>
                               </div>
                             );
                           })}
                         </div>
                      </div>
                    ))}
                 </div>
               </>
             )}
          </div>
       </div>
    </div>
  );
};
