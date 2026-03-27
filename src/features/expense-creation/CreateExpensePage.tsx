/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ExpenseTypeSelector } from './ExpenseTypeSelector';
import { ParticipantSelector } from './ParticipantSelector';
import { TripAssignmentSheet } from './TripAssignmentSheet';
import { BillItemsEditor } from './BillItemsEditor';
import { SplitOptions } from './SplitOptions';
import { useExpenseStore } from '../../stores/expenseStore';
import { ExpenseType, SplitType } from '../../services/expense.model';
import { Button } from '../../components/ui/Button';

export const CreateExpensePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tripIdContext = searchParams.get('tripId');

  const { type, description, setDescription, totalAmount, setTotalAmount, items, participants, payerId, beforeDiscountTotal, actualTotal, setParticipants, setPayer, reset } = useExpenseStore();

  useEffect(() => {
    reset(); // Clear old state first
    if (tripIdContext) {
      const loadTripParticipants = async () => {
        const { storage } = await import('../../lib/storage');
        const tripsData = await storage.get('ezbill_trips');
        if (tripsData) {
          const trips = JSON.parse(tripsData);
          const targetTrip = trips.find((t: any) => t.id === tripIdContext);
          if (targetTrip && targetTrip.participants) {
            // Reset split state — trip stores identity only, not expense-specific splits
            const cleanParticipants = targetTrip.participants.map((p: any) => ({
              ...p,
              splitType: SplitType.EVEN,
              splitValue: 0,
              calculatedAmount: 0,
            }));
            setParticipants(cleanParticipants);
            setPayer(cleanParticipants[0]?.userId || 'u1');
          }
        }
      };
      loadTripParticipants();
    }
  }, [tripIdContext, setParticipants, setPayer, reset]);

  const [showTripSheet, setShowTripSheet] = useState(false);

  const handleSaveClick = () => {
    // Basic validation
    if (!description.trim()) {
      alert("Please enter a description");
      return;
    }
    if (totalAmount <= 0) {
      alert("Total amount must be greater than 0");
      return;
    }

    if (tripIdContext) {
      handleAssignToTrip(tripIdContext);
    } else {
      setShowTripSheet(true);
    }
  };

  const handleAssignToTrip = async (tripId: string | null) => {
    setShowTripSheet(false);

    const newExpense: import('../../services/expense.model').Expense = {
      id: Math.random().toString(36).substring(7),
      tripId: tripId || undefined,
      type,
      description,
      totalAmount,
      payerId: payerId || participants[0]?.userId || 'u1',
      items,
      participants,
      createdAt: new Date().toISOString(),
      ...(type === 'BILL' && beforeDiscountTotal !== undefined ? { beforeDiscountTotal, actualTotal } : {}),
    };

    // Save to LocalStorage using project's storage lib
    const { storage } = await import('../../lib/storage');
    const existingData = await storage.get('ezbill_expenses');
    const expenses = existingData ? JSON.parse(existingData) : [];
    expenses.unshift(newExpense);
    await storage.set('ezbill_expenses', JSON.stringify(expenses));

    // Update Trip if assigned
    if (tripId) {
      const tripsData = await storage.get('ezbill_trips');
      if (tripsData) {
        const trips = JSON.parse(tripsData);
        const tripIndex = trips.findIndex((t: any) => t.id === tripId);
        if (tripIndex >= 0) {
          const existingParticipants = trips[tripIndex].participants || [];
          const existingIds = new Set(existingParticipants.map((p: any) => p.userId));
          // Only save identity fields — not expense-specific split state
          const newParticipants = participants
            .filter(p => !existingIds.has(p.userId))
            .map(p => ({ userId: p.userId, name: p.name, avatarUrl: p.avatarUrl, splitType: SplitType.EVEN, splitValue: 0, calculatedAmount: 0 }));

          trips[tripIndex].participants = [...existingParticipants, ...newParticipants];
          trips[tripIndex].spent = (trips[tripIndex].spent || 0) + totalAmount;

          await storage.set('ezbill_trips', JSON.stringify(trips));
        }
      }
    }

    navigate(tripId ? `/trips/${tripId}` : '/');
  };

  return (
    <div className="min-h-screen bg-surface-page flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-soft transition-all hover:scale-105"
        >
          <span className="material-symbols-outlined text-primary text-[20px]">arrow_back</span>
        </button>
        <h1 className="text-xl font-extrabold text-primary">Add Expense</h1>
        <div className="w-10" /> {/* Balancer */}
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-[120px] pt-2">
        <ExpenseTypeSelector />
        <ParticipantSelector />

        {/* General Inputs */}
        <div className="mb-6 bg-white p-5 rounded-3xl shadow-soft">
          <div className="mb-4">
            <label className="text-[11px] font-bold text-text-muted tracking-widest uppercase mb-2 block">
              What was this for?
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Dinner at Luigi's"
              className="w-full bg-surface-page rounded-2xl px-4 py-3 text-text-main font-bold placeholder:text-text-muted/50 focus:outline-none focus:border-[#ffd1dc] transition-all"
            />
          </div>

          {type === ExpenseType.NOTE && (
            <div>
              <label className="text-[11px] font-bold text-text-muted tracking-widest uppercase mb-2 block">
                Total Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-primary">$</span>
                <input
                  type="number"
                  value={totalAmount || ''}
                  onChange={(e) => setTotalAmount(Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full bg-surface-page rounded-2xl pl-10 pr-4 py-4 text-3xl text-primary font-black placeholder:text-primary/30 focus:outline-none focus:border-[#ffd1dc] transition-all"
                />
              </div>
            </div>
          )}

          {type === ExpenseType.BILL && (
            <div className="flex items-center justify-between bg-primary/5 p-4 rounded-2xl border border-[#ffd1dc]">
              <span className="font-bold text-primary">Calculated Total</span>
              <span className="text-2xl font-black text-primary">{Math.round(totalAmount).toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Items specific to Bill mode */}
        {type === ExpenseType.BILL && (
          <BillItemsEditor />
        )}

        {/* Split Options — only for NOTE mode; BILL splits are item-level */}
        {type !== ExpenseType.BILL && <SplitOptions />}

        <div className="h-[20px]"></div>
      </div>

      {/* Save Button — fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-20 px-6 pb-10 mb-10">
        <Button onClick={handleSaveClick}>
          Save Expense
        </Button>
      </div>

      {showTripSheet && (
        <TripAssignmentSheet
          onClose={() => setShowTripSheet(false)}
          onAssignToTrip={handleAssignToTrip}
        />
      )}

    </div>
  );
};
