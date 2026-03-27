import React, { useEffect, useState } from "react";
import { fmt } from "../../utils/helper";

import type { Trip } from "../../types";
import { storage } from "../../lib/storage";
import type { Expense } from "../../services/expense.model";
import { ExpenseDetailModal } from "../../components/ui/ExpenseDetailModal";

const HomePage: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [latestTrip, setLatestTrip] = useState<Trip | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const expensesData = await storage.get('ezbill_expenses');
      if (expensesData) {
        setExpenses(JSON.parse(expensesData));
      }

      const tripsData = await storage.get('ezbill_trips');
      if (tripsData) {
        const trips: Trip[] = JSON.parse(tripsData);
        if (trips && trips.length > 0) {
          // Display the newest trip created (assuming unshifted to front)
          setLatestTrip(trips[0]);
        }
      }
    };
    loadData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Greeting */}
      <div className="px-6 pt-4 pb-2">
        <p className="text-3xl font-extrabold tracking-tight text-primary">
          Hi! ✨
        </p>
        <p className="text-text-muted text-lg font-semibold">
          Ready for new adventures?
        </p>
      </div>

      {/* Summary Cards */}
      {/* <div className="flex gap-4 px-6 pt-4 pb-6">
        <div className="relative flex-1 rounded-[28px] bg-white px-6 py-5 shadow-soft">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#FF7DA1] text-lg">
                arrow_upward
              </span>
            </div>
            <span className="text-[11px] tracking-widest font-bold text-gray-400">
              TO PAY
            </span>
          </div>
          <p className="mt-3 text-[28px] font-black text-primary">$120.50</p>
        </div>

        <div className="relative flex-1 rounded-[28px] px-6 py-5 text-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#FFA1B8] to-[#FF7DA1]" />
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />

          <div className="relative z-10 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-lg">
                arrow_downward
              </span>
            </div>
            <span className="text-[11px] tracking-widest font-bold text-white/90">
              TO RECEIVE
            </span>
          </div>

          <p className="relative z-10 mt-3 text-[28px] font-black">$345.00</p>
        </div>
      </div> */}

      {/* Current Trips Section */}
      {latestTrip && (
        <section>
          <div className="flex items-center justify-between px-6 pb-4">
            <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-pink-400"></span>
              Recent Trip
            </h2>
          </div>

          <div className="px-6">
            <div className="rounded-[32px] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.06)] overflow-hidden">
              <div className="relative w-full aspect-[16/8] overflow-hidden rounded-t-[32px]">
                <div className="absolute inset-0 bg-gradient-to-br from-[#9ED3E1] to-[#6FA7B5]" />
                <div className="absolute bottom-3 left-4">
                  <span className="bg-white px-4 py-1 rounded-full text-[10px] font-bold tracking-wide shadow-sm text-[#FF7DA1]">
                    ACTIVE
                  </span>
                </div>
              </div>

              <div className="px-6 pt-5 pb-6">
                <p className="text-xl font-extrabold text-text-main mb-4">
                  {latestTrip.name} {latestTrip.emoji}
                </p>

                <div className="flex items-center justify-between mb-5">
                  <div className="flex -space-x-3">
                    {latestTrip.participants.slice(0, 5).map((p, idx) => (
                      <img
                        key={idx}
                        src={p.avatarUrl}
                        className="inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover shadow-sm bg-surface-page"
                        alt={p.name}
                      />
                    ))}
                    {latestTrip.participants.length > 5 && (
                      <div className="flex items-center justify-center h-10 w-10 rounded-full ring-2 ring-white bg-secondary text-white text-xs font-bold shadow-sm z-10 relative">
                        +{latestTrip.participants.length - 5}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between text-xs font-bold text-text-muted">
                  <span>${(latestTrip.spent || 0).toLocaleString()} spent</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Recent Activity Section */}
      <section className="mt-8 mb-8">
        <div className="flex items-center justify-between px-6 pb-4">
          <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-pink-400"></span>
            Recent Activities
          </h2>
        </div>

        <div className="flex flex-col px-6 gap-3 pb-28">
          {expenses.length === 0 ? (
            <p className="text-center text-text-muted mt-8 text-sm font-semibold italic">No expenses yet. Add your first trip expense!</p>
          ) : (
            expenses.slice(0, 10).map((expense) => (
              <div key={expense.id} onClick={() => setSelectedExpense(expense)}>
                <ExpenseItem expense={expense} />
              </div>
            ))
          )}
        </div>
      </section>

      {selectedExpense && (
        <ExpenseDetailModal
          expense={selectedExpense}
          onClose={() => setSelectedExpense(null)}
        />
      )}
    </div>
  );
};

const ExpenseItem: React.FC<{ expense: Expense }> = ({ expense }) => {
  const isPaidByMe = expense.payerId === 'u1';
  // Get amount this user owes (or is owed if they paid)
  const mySplit = expense.participants.find(p => p.userId === 'u1');
  const myAmount = mySplit?.calculatedAmount || 0;

  const getIcon = () => {
    return expense.type === "BILL" ? "restaurant_menu" : "receipt_long";
  };

  const getColorClass = () => {
    return expense.type === "BILL"
      ? "bg-[#FFE5EC] text-primary border-[#FFD1DC]"
      : "bg-[#FFF4D6] text-[#F59E0B] border-[#FFE8B6]";
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-3xl bg-white shadow-card border border-white transition-all hover:scale-[1.02] cursor-pointer">
      <div
        className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 border bg-pink-100 ${getColorClass()}`}
      >
        <span className="material-symbols-outlined text-xl">{getIcon()}</span>
      </div>
      <div className="flex-1 overflow-hidden">
        <p className="font-bold text-sm truncate text-text-main">
          {expense.description || (expense.type === 'BILL' ? 'Itemized Bill' : 'Quick Note')}
        </p>
        <p className="text-xs font-semibold text-text-muted mt-0.5">
          {isPaidByMe ? 'You paid for this' : 'Someone else paid'} • {new Date(expense.createdAt).toLocaleDateString()}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="font-bold text-sm text-text-main">
          {fmt(expense.totalAmount)}
        </p>
        {myAmount > 0 && !isPaidByMe && (
          <p className="text-[10px] text-primary font-bold">
            You owe: {fmt(myAmount)}
          </p>
        )}
        {isPaidByMe && (
          <p className="text-[10px] text-green-500 font-bold">
            You get back {fmt(expense.totalAmount - myAmount)}
          </p>
        )}
      </div>
    </div>
  );
};

export default HomePage;
