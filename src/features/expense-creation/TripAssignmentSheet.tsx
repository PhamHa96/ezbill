import React, { useState, useEffect } from 'react';
import { storage } from '../../lib/storage';
import type { Trip } from '../../types';

interface TripAssignmentSheetProps {
  onClose: () => void;
  onAssignToTrip: (tripId: string | null) => void;
}

export const TripAssignmentSheet: React.FC<TripAssignmentSheetProps> = ({ onClose, onAssignToTrip }) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newTripName, setNewTripName] = useState('');
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  useEffect(() => {
    storage.get('ezbill_trips').then(data => {
      if (data) setTrips(JSON.parse(data));
    });
  }, []);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const handler = () => {
      const offset = window.innerHeight - vv.height - vv.offsetTop;
      setKeyboardOffset(Math.max(0, offset));
    };
    vv.addEventListener('resize', handler);
    vv.addEventListener('scroll', handler);
    return () => {
      vv.removeEventListener('resize', handler);
      vv.removeEventListener('scroll', handler);
    };
  }, []);

  const handleCreateNew = async () => {
    if (!newTripName.trim()) return;
    const newTrip: Trip = {
      id: Math.random().toString(36).substring(7),
      name: newTripName,
      status: 'active',
      spent: 0,
      budget: 0,
      imageUrl: `https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1000`, // generic
      emoji: '✈️',
      participants: [], // will merge below
    };

    const updatedTrips = [newTrip, ...trips];
    await storage.set('ezbill_trips', JSON.stringify(updatedTrips));
    onAssignToTrip(newTrip.id);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end">
       {/* Backdrop */}
       <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in" onClick={onClose} />

       {/* Sheet */}
       <div
         className="relative bg-surface-page rounded-t-[32px] w-full max-h-[85vh] flex flex-col pt-2 pb-safe animate-in slide-in-from-bottom-full duration-300"
         style={{ marginBottom: keyboardOffset, transition: 'margin-bottom 0.2s ease' }}
       >
          <div className="w-12 h-1.5 bg-secondary/20 rounded-full mx-auto mb-6 mt-3" />

          <div className="px-6 flex-1 overflow-y-auto pb-10">
            {isCreating ? (
              <div className="animate-in fade-in zoom-in-95">
                <h2 className="text-xl font-extrabold text-primary mb-2">Name your Trip</h2>
                <p className="text-sm text-text-muted mb-6">Group your expenses easily by trip</p>
                <input
                  autoFocus
                  value={newTripName}
                  onChange={e => setNewTripName(e.target.value)}
                  placeholder="e.g. Summer 2026"
                  className="w-full bg-surface-card border-2 border-[#ffd1dc] rounded-2xl px-4 py-4 text-lg font-bold text-text-main focus:outline-none focus:border-primary mb-6"
                />
                <button
                  onClick={handleCreateNew}
                  className="w-full py-4 rounded-full bg-primary text-white font-bold text-lg active:scale-95 transition-transform"
                >
                  Create & Save Expense
                </button>
                <button
                  onClick={() => setIsCreating(false)}
                  className="w-full py-4 mt-2 rounded-full text-text-muted font-bold active:scale-95 transition-transform"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-right-4">
                <h2 className="text-xl font-extrabold text-primary mb-2">Save to a Trip?</h2>
                <p className="text-sm text-text-muted mb-6">Keep track of balances inside a group or save independently.</p>

                <button
                  onClick={() => setIsCreating(true)}
                  className="w-full mb-4 p-4 rounded-2xl bg-surface-card border-2 border-dashed border-[#ffd1dc] flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors text-primary font-bold active:scale-95"
                >
                  <span className="material-symbols-outlined">add_circle</span>
                  Create New Trip
                </button>

                {trips.length > 0 && (
                  <div className="mb-4">
                    <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-3">Existing Trips</p>
                    <div className="flex flex-col gap-3">
                      {trips.map(trip => (
                        <button
                          key={trip.id}
                          onClick={() => onAssignToTrip(trip.id)}
                          className="w-full flex items-center gap-4 p-3 rounded-2xl bg-surface-card border border-[#ffd1dc] hover:border-primary transition-colors text-left active:scale-95 shadow-sm"
                        >
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl shrink-0">
                            {trip.emoji}
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-text-main text-sm truncate">{trip.name}</p>
                            <p className="text-xs text-text-muted mt-0.5">{trip.participants?.length || 0} participants</p>
                          </div>
                          <span className="material-symbols-outlined text-text-muted">chevron_right</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="my-6 border-b border-[#ffd1dc]" />

                <button
                  onClick={() => onAssignToTrip(null)}
                  className="w-full p-4 rounded-2xl bg-secondary/10 hover:bg-secondary/20 transition-colors text-text-main font-bold active:scale-95 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">bolt</span>
                  Skip (Quick Note)
                </button>
              </div>
            )}
          </div>
       </div>
    </div>
  );
};
