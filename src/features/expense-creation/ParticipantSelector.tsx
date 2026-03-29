import React, { useState } from 'react';
import { useExpenseStore } from '../../stores/expenseStore';

export const ParticipantSelector: React.FC = () => {
  const { participants, addParticipant, removeParticipant } = useExpenseStore();
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');

  const handleAdd = () => {
    if (name.trim()) {
      addParticipant(name.trim());
      setName('');
      setIsAdding(false);
    }
  };

  return (
    <div className="mb-6 bg-surface-card p-5 rounded-3xl shadow-soft">
      <h3 className="text-[11px] font-bold text-text-muted tracking-widest uppercase mb-3 block">Who is involved?</h3>
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        {participants.map(p => (
          <div key={p.userId} className="relative shrink-0 flex flex-col items-center">
            <img src={p.avatarUrl} alt={p.name} className="w-12 h-12 rounded-full ring-2 ring-white object-cover" />
            <p className="text-[10px] font-bold mt-1 text-text-main max-w-[60px] truncate">{p.name}</p>
            {p.userId !== 'u1' && (
              <button
                onClick={() => removeParticipant(p.userId)}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white text-red-500 flex items-center justify-center shadow-md active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            )}
          </div>
        ))}

        {isAdding ? (
          <div className="flex items-center gap-2 shrink-0 border border-[#ffd1dc] rounded-full pl-4 pr-1 py-1 h-12 ml-2 bg-primary/5 mb-3">
            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="Name..."
              className="w-20 text-sm focus:outline-none bg-transparent font-bold text-primary placeholder:text-primary/50"
            />
            <button onClick={handleAdd} className="w-8 h-8 rounded-full bg-[#ff85a1] flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-[16px]">check</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-12 h-12 rounded-full border-2 border-dashed border-[#ffd1dc] text-primary flex items-center justify-center shrink-0 hover:bg-primary/10 transition-colors ml-2 mb-3"
          >
            <span className="material-symbols-outlined">person_add</span>
          </button>
        )}
      </div>
    </div>
  );
}
