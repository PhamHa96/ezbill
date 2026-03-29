import React, { useState } from "react";
import { useExpenseStore } from "../../stores/expenseStore";
import { isNativePlatform } from "../../utils/helper";
import { useFmt } from "../../hooks/useFmt";
import { billService } from "../../services/bill.service";
import { cameraService } from "../../services/camera.service";

export const BillItemsEditor: React.FC = () => {
  const fmt = useFmt();
  const {
    items,
    addItem,
    updateItem,
    removeItem,
    participants,
    toggleItemParticipant,
    setBillTotal,
    setDiscountInfo,
  } = useExpenseStore();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [qty, setQty] = useState("1");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [isScanning, setIsScanning] = useState(false);

  const handleScan = async () => {
    try {
      let response;
      if (isNativePlatform()) {
        const imageUrl = await cameraService.selectOrCaptureImage();
        if (!imageUrl) return;
        setIsScanning(true);
        // Call real backend API
        response = await billService.scanBill(imageUrl);
      } else {
        response = {
          expenses: [
            { name: "Choco - Matcha Cream Latte", amount: 45000, quantity: 2 },
            { name: "Matcha Latte - Cold", amount: 85000, quantity: 1 },
          ],
          actualTotal: 159000,
          beforeDiscountTotal: 175000,
        };
      }

      console.log("response scanBill API", response);
      // Scale each item proportionally so they sum to actualTotal (handles both discount and VAT/surcharge)
      const ratio =
        response.beforeDiscountTotal > 0
          ? response.actualTotal / response.beforeDiscountTotal
          : 1;

      response.expenses.forEach((apiItem) => {
        addItem({
          name: apiItem.name,
          price: (apiItem.amount / apiItem.quantity) * ratio,
          quantity: apiItem.quantity,
        });
      });
      setBillTotal(response.actualTotal);
      setDiscountInfo(response.beforeDiscountTotal, response.actualTotal);
    } catch (err) {
      console.error("OCR API or Camera failed:", err);
      alert(
        "Failed to scan and parse the receipt. Please try again or enter manually.",
      );
    } finally {
      setIsScanning(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setName(item.name);
    setPrice(item.price.toString());
    setQty(item.quantity.toString());
  };

  const handleAdd = () => {
    if (!name || !price) return;

    if (editingId) {
      updateItem(editingId, {
        name,
        price: Number(price),
        quantity: Number(qty),
      });
      setEditingId(null);
    } else {
      addItem({ name, price: Number(price), quantity: Number(qty) });
    }

    setName("");
    setPrice("");
    setQty("1");
  };

  return (
    <div className="mb-6 bg-surface-card p-5 rounded-3xl shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-text-main flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">
            shopping_cart
          </span>
          Items
        </h3>

        <button
          onClick={handleScan}
          disabled={isScanning}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs transition-colors ${isScanning ? "bg-secondary/10 text-text-muted cursor-wait" : "bg-green-100 text-green-600 hover:bg-green-200 active:scale-95"}`}
        >
          {isScanning ? (
            <span className="material-symbols-outlined text-[16px] animate-spin">
              refresh
            </span>
          ) : (
            <span className="material-symbols-outlined text-[16px]">
              photo_camera
            </span>
          )}
          {isScanning ? "Scanning..." : "Scan Receipt"}
        </button>
      </div>

      {/* List of current items */}
      <div className="flex flex-col gap-3 mb-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col p-3 bg-surface-page rounded-2xl border border-[#ffd1dc]"
          >
            <div
              className={`flex items-center justify-between transition-all ${editingId === item.id ? "opacity-50" : ""}`}
            >
              <div className="flex-1">
                <p className="font-bold text-sm text-text-main">{item.name}</p>
                <p className="text-xs text-text-muted mt-1">
                  {fmt(item.price)} x {item.quantity}
                </p>
              </div>
              <div className="text-right flex items-center gap-2">
                <p className="font-bold text-primary mr-2">
                  {fmt(item.price * item.quantity)}
                </p>

                <button
                  onClick={() => handleEdit(item)}
                  className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center hover:bg-blue-500/20 transition disabled:opacity-50"
                  disabled={!!editingId}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    edit
                  </span>
                </button>
                <button
                  onClick={() => removeItem(item.id)}
                  className="w-8 h-8 rounded-full bg-red-100 text-red-500 flex items-center justify-center hover:bg-red-200 transition disabled:opacity-50"
                  disabled={!!editingId}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    close
                  </span>
                </button>
              </div>
            </div>
            {/* ITEM PARTICIPANTS */}
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#ffd1dc] overflow-x-auto pb-3">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider shrink-0">
                Shared by:
              </span>
              <div className="flex items-center gap-4">
                {participants.map((p) => {
                  const isShared = item.splits.some(
                    (s) => s.userId === p.userId,
                  );
                  const splitAmt =
                    item.splits.find((s) => s.userId === p.userId)
                      ?.calculatedAmount || 0;
                  return (
                    <button
                      key={p.userId}
                      onClick={() => toggleItemParticipant(item.id, p.userId)}
                      className={`relative flex flex-col items-center transition-all shrink-0 ${isShared ? "scale-105" : "opacity-40 grayscale hover:opacity-100"}`}
                    >
                      <img
                        src={p.avatarUrl}
                        alt={p.name}
                        className={`w-8 h-8 rounded-full ring-2 ring-white object-cover ${isShared ? "border-[#ffd1dc]" : "border-transparent"}`}
                      />
                      {isShared && splitAmt > 0 && (
                        <span className="absolute -bottom-2 bg-[#FFE5EC] text-text-muted text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm whitespace-nowrap z-10 border border-white">
                          {fmt(splitAmt)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-sm text-text-muted text-center py-4 italic">
            No items added yet
          </p>
        )}
      </div>

      {/* Add new item form inline */}
      <div className="flex items-end gap-2 border-t border-[#ffd1dc] pt-4">
        <div className="flex-1">
          <label className="text-[10px] uppercase font-bold text-text-muted ml-2">
            Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Pizza"
            className="w-full bg-surface-page border border-[#ffd1dc] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary"
          />
        </div>
        <div className="w-24">
          <label className="text-[10px] uppercase font-bold text-text-muted ml-2">
            Price
          </label>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            type="number"
            placeholder="0.00"
            className="w-full bg-surface-page border border-[#ffd1dc] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#ffd1dc]"
          />
        </div>
        <div className="w-12">
          <label className="text-[10px] uppercase font-bold text-text-muted ml-2">
            Qty
          </label>
          <input
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            type="number"
            min="1"
            className="w-full bg-surface-page border border-[#ffd1dc] rounded-xl px-2 py-2 text-sm focus:outline-none focus:border-[#ffd1dc] text-center"
          />
        </div>
        <button
          onClick={handleAdd}
          className="bg-pink-400 text-white w-10 h-10 rounded-xl flex items-center justify-center transition shrink-0 shadow-sm active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">
            {editingId ? "check" : "add"}
          </span>
        </button>
      </div>
    </div>
  );
};
