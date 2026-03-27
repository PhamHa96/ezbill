import React, { useEffect, useRef, useState } from 'react';
import { fmt } from '../../utils/helper';
import { useNavigate } from 'react-router-dom';
import { storage } from '../../lib/storage';
import type { Trip } from '../../types';

const SWIPE_THRESHOLD = 80;

interface SwipableTripProps {
  trip: Trip;
  onNavigate: () => void;
  onDeleteRequest: () => void;
}

const SwipableTrip: React.FC<SwipableTripProps> = ({ trip, onNavigate, onDeleteRequest }) => {
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
    const dx = startX.current - e.touches[0].clientX; // positive = swipe left
    if (dx > 0) setOffsetX(Math.min(dx, SWIPE_THRESHOLD));
    else setOffsetX(0);
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
    <div className="relative overflow-hidden rounded-[24px]">
      {/* Delete background — right side */}
      <div
        className="absolute inset-y-0 right-0 flex items-center justify-center bg-red-500 rounded-[24px]"
        style={{ width: Math.max(offsetX, 0) }}
      >
        {offsetX > 20 && (
          <div className="flex flex-col items-center gap-1" style={{ opacity: revealRatio }}>
            <span className="material-symbols-outlined text-white text-[22px]">delete</span>
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
        onClick={() => { if (!didSwipe.current) onNavigate(); didSwipe.current = false; }}
        className="bg-white p-4 rounded-[24px] shadow-soft flex flex-col gap-3 cursor-pointer relative z-10"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-2xl">
              {trip.emoji}
            </div>
            <div>
              <h3 className="font-extrabold text-text-main leading-tight">{trip.name}</h3>
              <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-0.5">
                {trip.participants.length} Participants
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-black text-primary">{fmt(trip.spent || 0)}</p>
            <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest mt-0.5">Total Spent</p>
          </div>
        </div>

        <div className="pt-3 border-t border-[#ffd1dc] flex items-center gap-2">
          <div className="flex -space-x-2 overflow-hidden h-8 w-full max-w-[200px]">
            {trip.participants.slice(0, 5).map((p, i) => (
              <img key={i} src={p.avatarUrl} alt={p.name}
                className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover bg-surface-page" />
            ))}
            {trip.participants.length > 5 && (
              <div className="flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-white bg-secondary/20 text-text-main text-[10px] font-bold">
                +{trip.participants.length - 5}
              </div>
            )}
          </div>
          <div className="ml-auto flex items-center text-text-muted text-xs font-bold gap-1 bg-surface-page px-2 py-1 rounded-full">
            <span className="material-symbols-outlined text-[14px]">receipt_long</span>
            {trip.status === 'completed' ? 'Settled' : 'Active'}
          </div>
        </div>
      </div>
    </div>
  );
};

export const TripsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    storage.get('ezbill_trips').then(data => {
      if (data) setTrips(JSON.parse(data));
    });
  }, []);

  const handleDelete = async (tripId: string) => {
    const updatedTrips = trips.filter(t => t.id !== tripId);
    await storage.set('ezbill_trips', JSON.stringify(updatedTrips));

    const expensesRaw = await storage.get('ezbill_expenses');
    if (expensesRaw) {
      const expenses = JSON.parse(expensesRaw);
      const remaining = expenses.filter((e: { tripId?: string }) => e.tripId !== tripId);
      await storage.set('ezbill_expenses', JSON.stringify(remaining));
    }

    setTrips(updatedTrips);
    setConfirmId(null);
  };

  const tripToDelete = trips.find(t => t.id === confirmId);

  return (
    <div className="min-h-screen bg-surface-page flex flex-col pt-2 pb-28 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="px-6 pt-6 pb-4">
        <h1 className="text-3xl font-extrabold text-text-main mb-1">Trips 🌍</h1>
        <p className="text-text-muted text-sm font-semibold">Keep track of your group adventures</p>
      </div>

      <div className="px-6 flex flex-col gap-4 mt-4">
        {trips.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-primary text-2xl">flight_takeoff</span>
            </div>
            <p className="text-text-muted font-bold text-sm">No trips yet.</p>
            <button
              onClick={() => navigate('/expense/create')}
              className="mt-4 px-6 py-2 bg-primary text-white rounded-full font-bold shadow-sm active:scale-95 transition-transform"
            >
              Start an Adventure
            </button>
          </div>
        ) : (
          trips.map((trip) => (
            <SwipableTrip
              key={trip.id}
              trip={trip}
              onNavigate={() => navigate(`/trips/${trip.id}`)}
              onDeleteRequest={() => setConfirmId(trip.id)}
            />
          ))
        )}
      </div>

      {/* Confirm delete dialog */}
      {confirmId && tripToDelete && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmId(null)} />
          <div className="relative bg-white rounded-t-[32px] w-full px-6 pt-6 pb-safe animate-in slide-in-from-bottom-full duration-300"
            style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
            <div className="w-12 h-1.5 bg-secondary/20 rounded-full mx-auto mb-6" />
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-red-500 text-2xl">delete_forever</span>
            </div>
            <h2 className="text-xl font-extrabold text-text-main text-center mb-1">Delete "{tripToDelete.name}"?</h2>
            <p className="text-sm text-text-muted text-center mb-8">
              This will also delete all expenses linked to this trip. This cannot be undone.
            </p>
            <button
              onClick={() => handleDelete(confirmId)}
              className="w-full py-4 rounded-full bg-red-500 text-white font-bold text-base mb-3 active:scale-95 transition-transform"
            >
              Delete Trip & Expenses
            </button>
            <button
              onClick={() => setConfirmId(null)}
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
