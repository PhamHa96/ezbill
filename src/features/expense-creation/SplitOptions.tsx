import React from 'react';
import { useFmt } from '../../hooks/useFmt';
import { useExpenseStore } from '../../stores/expenseStore';
import { SplitType, ExpenseType } from '../../services/expense.model';
import { Input } from '../../components/ui/Input';

export const SplitOptions: React.FC = () => {
  const fmt = useFmt();
  const { participants, totalAmount, updateParticipantSplit, payerId, setPayer, type } = useExpenseStore();

  // Decide what split method is globally active (or per user if we wanted to be complex)
  // For MVP, if one is PERCENTAGE, we show PERCENTAGE mode for all.
  // We'll track a local UI state for which tab is selected, and assign it to everyone when clicked.
  const [activeTab, setActiveTab] = React.useState<SplitType>(SplitType.EVEN);

  const handleTabChange = (type: SplitType) => {
    setActiveTab(type);
    // Initialize everyone to this type
    participants.forEach(p => {
      updateParticipantSplit(p.userId, type, 0);
    });
  };

  const calculateTotalPercentage = () => {
    return participants.reduce((sum, p) => sum + (p.splitValue || 0), 0);
  };

  const calculateTotalAmount = () => {
    return participants.reduce((sum, p) => sum + (p.calculatedAmount || 0), 0);
  };

  return (
    <div className="bg-surface-card p-5 rounded-3xl shadow-soft mb-6">
      <h3 className="font-bold text-text-main mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-[20px]">pie_chart</span>
        Split Options
      </h3>

      {/* Tabs */}
      <div className="flex bg-surface-page p-1 rounded-full mb-6 relative">
        <button
          onClick={() => handleTabChange(SplitType.EVEN)}
          className={`flex-1 py-2 text-[13px] font-bold rounded-full transition-all tracking-wide z-10 ${activeTab === SplitType.EVEN ? 'bg-primary text-white shadow-md' : 'text-text-muted hover:text-text-main'
            }`}
        >
          Evenly
        </button>
        <button
          onClick={() => handleTabChange(SplitType.PERCENTAGE)}
          className={`flex-1 py-2 text-[13px] font-bold rounded-full transition-all tracking-wide z-10 ${activeTab === SplitType.PERCENTAGE ? 'bg-primary text-white shadow-md' : 'text-text-muted hover:text-text-main'
            }`}
        >
          Percentage
        </button>
        <button
          onClick={() => handleTabChange(SplitType.AMOUNT)}
          className={`flex-1 py-2 text-[13px] font-bold rounded-full transition-all tracking-wide z-10 ${activeTab === SplitType.AMOUNT ? 'bg-primary text-white shadow-md' : 'text-text-muted hover:text-text-main'
            }`}
        >
          Exact
        </button>
      </div>

      {/* Validation messages */}
      {activeTab === SplitType.PERCENTAGE && Math.round(calculateTotalPercentage()) !== 100 && totalAmount > 0 && (
        <p className="text-red-500 text-xs font-bold mb-4 text-center">
          Total must be exactly 100% (currently {calculateTotalPercentage()}%)
        </p>
      )}

      {activeTab === SplitType.AMOUNT && Math.round(calculateTotalAmount() * 100) !== Math.round(totalAmount * 100) && totalAmount > 0 && (
        <p className="text-red-500 text-xs font-bold mb-4 text-center">
          Total must equal {fmt(totalAmount)} (currently {fmt(calculateTotalAmount())})
        </p>
      )}

      {/* Participant List */}
      <div className="flex flex-col gap-3">
        {participants.map((p) => (
          <div key={p.userId} className="flex items-center gap-3">
            <div className="relative">
              <img src={p.avatarUrl} alt={p.name} className="w-10 h-10 rounded-full border-2 border-[#ffd1dc] object-cover" />
              <button
                onClick={() => setPayer(p.userId)}
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center border border-white ${payerId === p.userId ? 'bg-green-500' : 'bg-gray-300'}`}
                title={payerId === p.userId ? "Payer" : "Mark as Payer"}
              >
                {payerId === p.userId && <span className="material-symbols-outlined text-[10px] text-white">check</span>}
              </button>
            </div>

            <div className="flex-1">
              <p className="font-bold text-sm text-text-main">
                {p.name} {payerId === p.userId && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full ml-1 font-bold">Paid</span>}
              </p>
              {activeTab === SplitType.EVEN && type === ExpenseType.NOTE && (
                <p className="text-xs font-bold text-primary mt-0.5">{fmt(p.calculatedAmount)}</p>
              )}
            </div>

            {/* In BILL mode, we only show Summary here because Item splitting is done in BillItemsEditor */}
            {type === ExpenseType.BILL ? (
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-primary">{fmt(p.calculatedAmount)}</p>
              </div>
            ) : (
              <>
                {/* Inputs for % or Exact (NOTE MODE ONLY) */}
                {activeTab === SplitType.PERCENTAGE && (
                  <div className="w-24 relative">
                    <Input
                      type="number"
                      value={p.splitValue || ''}
                      onChange={e => updateParticipantSplit(p.userId, SplitType.PERCENTAGE, Number(e.target.value))}
                      className="py-1 px-2 text-right text-text-main !text-sm pr-6"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-text-muted">%</span>
                  </div>
                )}

                {activeTab === SplitType.AMOUNT && (
                  <div className="w-28 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-text-muted">$</span>
                    <Input
                      type="number"
                      value={p.splitValue || ''}
                      onChange={e => updateParticipantSplit(p.userId, SplitType.AMOUNT, Number(e.target.value))}
                      className="py-1 px-2 text-right text-text-main !text-sm pl-6"
                    />
                  </div>
                )}

                {/* Show Calculated Result Summary on Right for non-Even cases */}
                {activeTab !== SplitType.EVEN && (
                  <div className="w-16 text-right shrink-0">
                    <p className="text-xs font-bold text-primary">{fmt(p.calculatedAmount)}</p>
                  </div>
                )}
              </>
            )}

          </div>
        ))}
      </div>
    </div>
  );
};
