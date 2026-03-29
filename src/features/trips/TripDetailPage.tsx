import React, { useEffect, useRef, useState } from 'react';
import { useFmt } from '../../hooks/useFmt';
import { useParams, useNavigate } from 'react-router-dom';
import { storage } from '../../lib/storage';
import type { Trip } from '../../types';
import type { Expense } from '../../services/expense.model';
import { calculateSettlement } from '../../utils/settlementCalculator';
import type { Debt } from '../../utils/settlementCalculator';
import { ExpenseDetailModal } from '../../components/ui/ExpenseDetailModal';
import { exportTripToPDF, shareTripSummary } from '../../services/pdf.service';

const SWIPE_THRESHOLD = 80;

interface SwipableExpenseRowProps {
  exp: Expense;
  payerName: string;
  onTap: () => void;
  onDeleteRequest: () => void;
}

const SwipableExpenseRow: React.FC<SwipableExpenseRowProps> = ({ exp, payerName, onTap, onDeleteRequest }) => {
  const fmt = useFmt();
  const [offsetX, setOffsetX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const didSwipe = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setDragging(true);
    didSwipe.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const dx = startX.current - e.touches[0].clientX;
    setOffsetX(dx > 0 ? Math.min(dx, SWIPE_THRESHOLD) : 0);
  };

  const handleTouchEnd = () => {
    setDragging(false);
    if (offsetX >= SWIPE_THRESHOLD * 0.6) {
      didSwipe.current = true;
      setOffsetX(0);
      onDeleteRequest();
    } else {
      setOffsetX(0);
    }
  };

  const revealRatio = Math.min(offsetX / SWIPE_THRESHOLD, 1);

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Delete bg — right side */}
      <div
        className="absolute inset-y-0 right-0 flex items-center justify-center bg-red-500 rounded-2xl"
        style={{ width: Math.max(offsetX, 0) }}
      >
        {offsetX > 20 && (
          <div className="flex flex-col items-center gap-0.5" style={{ opacity: revealRatio }}>
            <span className="material-symbols-outlined text-white text-[20px]">delete</span>
            {offsetX >= SWIPE_THRESHOLD * 0.7 && (
              <span className="text-white text-[9px] font-bold tracking-wide">Delete</span>
            )}
          </div>
        )}
      </div>

      {/* Card */}
      <div
        style={{ transform: `translateX(-${offsetX}px)`, transition: dragging ? 'none' : 'transform 0.25s ease' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => { if (!didSwipe.current) onTap(); didSwipe.current = false; }}
        className="bg-surface-card p-3 rounded-2xl shadow-sm flex items-center gap-4 cursor-pointer border border-transparent relative z-10"
      >
        <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center text-secondary shrink-0">
          <span className="material-symbols-outlined">{exp.type === 'BILL' ? 'receipt_long' : 'notes'}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-text-main truncate">{exp.description}</p>
          <p className="text-[11px] text-text-muted font-bold mt-0.5">Paid by {payerName}</p>
        </div>
        <p className="font-extrabold text-primary shrink-0">{fmt(exp.totalAmount)}</p>
      </div>
    </div>
  );
};

export const TripDetailPage: React.FC = () => {
  const fmt = useFmt();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [activeTab, setActiveTab] = useState<'expenses' | 'balances'>('expenses');
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [sharing, setSharing] = useState(false);

  const loadData = async () => {
    const tripsData = await storage.get('ezbill_trips');
    if (tripsData) {
      const trips: Trip[] = JSON.parse(tripsData);
      const found = trips.find(t => t.id === id);
      if (found) setTrip(found);
    }
    const expensesData = await storage.get('ezbill_expenses');
    if (expensesData) {
      const all: Expense[] = JSON.parse(expensesData);
      setExpenses(all.filter(e => e.tripId === id));
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadData(); }, [id]);

  // Derive debts directly — no extra state/effect needed
  const debts: Debt[] = trip && expenses.length > 0
    ? calculateSettlement(expenses, trip.participants)
    : [];

  const handleDeleteExpense = async (expenseId: string) => {
    const expToDelete = expenses.find(e => e.id === expenseId);
    if (!expToDelete) return;

    const expensesRaw = await storage.get('ezbill_expenses');
    const allExpenses: Expense[] = expensesRaw ? JSON.parse(expensesRaw) : [];
    await storage.set('ezbill_expenses', JSON.stringify(allExpenses.filter(e => e.id !== expenseId)));

    const tripsRaw = await storage.get('ezbill_trips');
    if (tripsRaw) {
      const trips: Trip[] = JSON.parse(tripsRaw);
      const idx = trips.findIndex(t => t.id === id);
      if (idx >= 0) {
        trips[idx].spent = Math.max(0, (trips[idx].spent || 0) - expToDelete.totalAmount);
        await storage.set('ezbill_trips', JSON.stringify(trips));
        setTrip(trips[idx]);
      }
    }

    setExpenses(prev => prev.filter(e => e.id !== expenseId));
    setConfirmDeleteId(null);
  };

  const expenseToDelete = expenses.find(e => e.id === confirmDeleteId);

  const handleExportPDF = async () => {
    if (!trip) return;
    setExporting(true);
    try { await exportTripToPDF(trip, expenses, debts); } finally { setExporting(false); }
  };

  const handleShare = async () => {
    if (!trip) return;
    setSharing(true);
    try { await shareTripSummary(trip, expenses, debts); } finally { setSharing(false); }
  };

  if (!trip) {
    return (
      <div className="min-h-screen bg-surface-page flex items-center justify-center flex-col">
        <span className="material-symbols-outlined text-text-muted text-4xl mb-4 animate-spin">refresh</span>
        <p className="text-text-muted font-bold">Loading trip...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-page flex flex-col">
      {/* Header */}
      <div className="bg-surface-card px-6 pt-safe pb-8 rounded-b-[40px] shadow-sm relative z-10">
        <div className="flex items-center justify-between pt-4 pb-6">
          <button onClick={() => navigate(-1)} className="w-10 h-10 bg-surface-page rounded-full flex items-center justify-center text-text-main shadow-sm active:scale-95 transition-transform">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex items-center gap-2">
            <button onClick={handleShare} disabled={sharing} className="w-10 h-10 bg-surface-page text-primary rounded-full flex items-center justify-center shadow-sm active:scale-95 transition-transform disabled:opacity-50">
              <span className="material-symbols-outlined text-[20px]">{sharing ? 'hourglass_empty' : 'share'}</span>
            </button>
            <button onClick={handleExportPDF} disabled={exporting} className="w-10 h-10 bg-surface-page text-primary rounded-full flex items-center justify-center shadow-sm active:scale-95 transition-transform disabled:opacity-50">
              <span className="material-symbols-outlined text-[20px]">{exporting ? 'hourglass_empty' : 'picture_as_pdf'}</span>
            </button>
            <button onClick={() => navigate(`/expense/create?tripId=${trip.id}`)} className="w-10 h-10 bg-primary text-primary rounded-full flex items-center justify-center shadow-sm active:scale-95 transition-transform">
              <span className="material-symbols-outlined">add</span>
            </button>
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-text-main leading-tight mb-1">{trip.name} {trip.emoji}</h1>
          <p className="text-text-muted font-bold text-sm mb-6 flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">group</span>
            {trip.participants.length} Members
          </p>
          <div className="bg-gradient-to-l from-primary to-[#ff9ab8] p-5 rounded-3xl text-white shadow-soft relative overflow-hidden">
            <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[100px] text-[#FF7DA1]/80 rotate-12">account_balance_wallet</span>
            <p className="text-[#FF7DA1]/80 font-bold uppercase tracking-widest text-[10px] mb-1">Total Trip Spent</p>
            <p className="text-4xl font-black">{fmt(trip.spent || 0)}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 py-4 flex gap-4 mt-2">
        <button onClick={() => setActiveTab('expenses')} className={`flex-1 py-3 text-sm font-bold rounded-2xl transition-all ${activeTab === 'expenses' ? 'bg-primary text-white shadow-md' : 'bg-surface-card text-text-muted shadow-sm'}`}>
          Expenses
        </button>
        <button onClick={() => setActiveTab('balances')} className={`flex-1 py-3 text-sm font-bold rounded-2xl transition-all ${activeTab === 'balances' ? 'bg-primary text-white shadow-md' : 'bg-surface-card text-text-muted shadow-sm'}`}>
          Balances
        </button>
      </div>

      {/* Content */}
      <div className="px-6 flex-1 overflow-y-auto pb-10">
        {activeTab === 'expenses' && (
          <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-left-4">
            {expenses.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-text-muted font-bold text-sm">No expenses yet.</p>
              </div>
            ) : (
              expenses.map(exp => (
                <SwipableExpenseRow
                  key={exp.id}
                  exp={exp}
                  payerName={trip.participants.find(p => p.userId === exp.payerId)?.name || 'Someone'}
                  onTap={() => setSelectedExpense(exp)}
                  onDeleteRequest={() => setConfirmDeleteId(exp.id)}
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'balances' && (
          <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-right-4">
            {debts.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-green-500 text-2xl">done_all</span>
                </div>
                <p className="text-text-main font-bold">You are all settled up!</p>
              </div>
            ) : (
              debts.map((debt, index) => (
                <div key={index} className="bg-surface-card p-3 rounded-2xl shadow-sm flex items-center gap-3">
                  <img src={debt.fromAvatar} alt={debt.fromName} className="w-10 h-10 rounded-full border border-[#ffd1dc] object-cover" />
                  <div className="flex-1 flex flex-col items-center">
                    <p className="text-[10px] text-text-muted font-bold tracking-wide uppercase">Owes</p>
                    <div className="w-full flex items-center gap-2 my-1">
                      <div className="h-px bg-secondary/20 flex-1 relative">
                        <span className="material-symbols-outlined text-[14px] btn-arrow-forward text-secondary absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface-card px-1">arrow_forward</span>
                      </div>
                    </div>
                    <p className="font-black text-primary">{fmt(debt.amount)}</p>
                  </div>
                  <img src={debt.toAvatar} alt={debt.toName} className="w-10 h-10 rounded-full border border-[#ffd1dc] object-cover" />
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Expense detail modal */}
      {selectedExpense && (
        <ExpenseDetailModal expense={selectedExpense} onClose={() => setSelectedExpense(null)} />
      )}

      {/* Delete confirm sheet */}
      {confirmDeleteId && expenseToDelete && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmDeleteId(null)} />
          <div className="relative bg-surface-card rounded-t-[32px] w-full px-6 pt-4 pb-10 animate-in slide-in-from-bottom-full duration-300">
            <div className="w-12 h-1.5 bg-secondary/20 rounded-full mx-auto mb-6" />
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-red-500 text-2xl">delete_forever</span>
            </div>
            <h2 className="text-xl font-extrabold text-text-main text-center mb-1">Delete expense?</h2>
            <p className="text-sm text-text-muted text-center mb-2">
              <span className="font-bold text-text-main">"{expenseToDelete.description}"</span>
            </p>
            <p className="text-xs text-text-muted text-center mb-8">
              {fmt(expenseToDelete.totalAmount)} will be removed and trip total updated.
            </p>
            <button
              onClick={() => handleDeleteExpense(confirmDeleteId)}
              className="w-full py-4 rounded-full bg-red-500 text-white font-bold text-base mb-3 active:scale-95 transition-transform"
            >
              Delete Expense
            </button>
            <button
              onClick={() => setConfirmDeleteId(null)}
              className="w-full py-4 rounded-full text-text-muted font-bold active:scale-95 transition-transform"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
