
"use client";

import { useMemo, useState } from "react";
import {
  X,
  PackageCheck,
  AlertCircle,
  Save,
} from "lucide-react";

const formatMoney = (amount) =>
  new Intl.NumberFormat("en-TZ", {
    style: "currency",
    currency: "TZS",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

export default function ReceiveStockModal({
  order,
  onClose,
  onConfirm,
}) {
  const [items, setItems] = useState(() =>
    order.items.map((item) => ({
      medicineId: item.medicineId,
      quantity: "",
      batchNumber: "",
      expiryDate: "",
      unitPrice: String(item.unitPrice || 0),
    }))
  );

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const remainingTotal = useMemo(
    () =>
      order.items.reduce((total, item) => {
        const received = Number(item.receivedQuantity || 0);
        return total + Math.max(0, Number(item.quantity) - received);
      }, 0),
    [order.items]
  );

  const updateItem = (medicineId, field, value) => {
    setItems((previous) =>
      previous.map((item) =>
        String(item.medicineId) === String(medicineId)
          ? { ...item, [field]: value }
          : item
      )
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const selectedItems = items.filter(
      (item) => Number(item.quantity) > 0
    );

    if (selectedItems.length === 0) {
      setError("Enter a received quantity for at least one medicine.");
      return;
    }

    for (const receivedItem of selectedItems) {
      const orderedItem = order.items.find(
        (item) =>
          String(item.medicineId) === String(receivedItem.medicineId)
      );

      const remaining =
        Number(orderedItem.quantity) -
        Number(orderedItem.receivedQuantity || 0);

      const quantity = Number(receivedItem.quantity);
      const unitPrice = Number(receivedItem.unitPrice);

      if (!Number.isInteger(quantity) || quantity <= 0) {
        setError("Received quantities must be positive whole numbers.");
        return;
      }

      if (quantity > remaining) {
        setError(
          `You cannot receive more than ${remaining} remaining units of ${orderedItem.medicineName}.`
        );
        return;
      }

      if (!receivedItem.batchNumber.trim()) {
        setError(`Enter a batch number for ${orderedItem.medicineName}.`);
        return;
      }

      if (!receivedItem.expiryDate) {
        setError(`Enter an expiry date for ${orderedItem.medicineName}.`);
        return;
      }

      if (
        !Number.isFinite(unitPrice) ||
        unitPrice < 0
      ) {
        setError("Enter a valid non-negative purchase price.");
        return;
      }
    }

    setSaving(true);

    try {
      await onConfirm(selectedItems);
    } catch (err) {
      setError(err.message || "Could not receive stock.");
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) {
          onClose();
        }
      }}
    >
      <div className="glass-panel max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-line shadow-2xl">
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-elevated px-5 py-4">
          <div>
            <div className="flex items-center gap-2">
              <PackageCheck size={19} className="text-emerald-300" />
              <h2 className="font-semibold text-ink">
                Receive Stock
              </h2>
            </div>
            <p className="mt-1 text-xs text-muted">
              {order.orderNumber} · {order.supplierName}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-2 text-muted hover:bg-hover hover:text-ink disabled:opacity-50"
            aria-label="Close receiving window"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-line bg-surface-soft p-4">
              <p className="text-xs text-muted">Outstanding units</p>
              <p className="mt-1 text-2xl font-bold text-ink">
                {remainingTotal}
              </p>
            </div>

            <div className="rounded-xl border border-emerald-400/10 bg-emerald-500/[0.06] p-4">
              <p className="text-xs text-muted">Supplier</p>
              <p className="mt-1 truncate text-sm font-semibold text-emerald-200">
                {order.supplierName}
              </p>
            </div>
          </div>

          <div>
            <h3 className="mb-1 text-sm font-semibold text-ink">
              Delivered medicines
            </h3>
            <p className="text-xs text-muted">
              Enter the quantity delivered and the details printed on each medicine batch.
              Leave quantity at zero if an item was not delivered.
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              <AlertCircle size={17} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            {order.items.map((item) => {
              const received = Number(item.receivedQuantity || 0);
              const remaining = Math.max(
                0,
                Number(item.quantity) - received
              );

              const current = items.find(
                (entry) =>
                  String(entry.medicineId) === String(item.medicineId)
              );

              return (
                <div
                  key={item.medicineId}
                  className="rounded-xl border border-line bg-surface-soft p-4"
                >
                  <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                    <div>
                      <p className="text-sm font-semibold text-ink">
                        {item.medicineName}
                      </p>
                      <p className="mt-1 text-[11px] text-muted">
                        SKU: {item.sku || "—"}
                      </p>
                    </div>

                    <div className="flex gap-3 text-xs">
                      <span className="text-muted">
                        Ordered: <strong className="text-ink">{item.quantity}</strong>
                      </span>
                      <span className="text-muted">
                        Received: <strong className="text-emerald-300">{received}</strong>
                      </span>
                      <span className="text-muted">
                        Remaining: <strong className="text-amber-300">{remaining}</strong>
                      </span>
                    </div>
                  </div>

                  {remaining === 0 ? (
                    <div className="rounded-lg border border-emerald-400/10 bg-emerald-500/[0.06] px-3 py-3 text-xs text-emerald-300">
                      This medicine has been fully received.
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <Field
                        label="Quantity received"
                        type="number"
                        min="0"
                        max={remaining}
                        value={current?.quantity ?? ""}
                        onChange={(value) =>
                          updateItem(item.medicineId, "quantity", value)
                        }
                      />

                      <Field
                        label="Batch number"
                        value={current?.batchNumber ?? ""}
                        placeholder="e.g. BATCH-2026-01"
                        onChange={(value) =>
                          updateItem(item.medicineId, "batchNumber", value)
                        }
                      />

                      <Field
                        label="Expiry date"
                        type="date"
                        value={current?.expiryDate ?? ""}
                        onChange={(value) =>
                          updateItem(item.medicineId, "expiryDate", value)
                        }
                      />

                      <Field
                        label="Unit purchase price (TZS)"
                        type="number"
                        min="0"
                        value={current?.unitPrice ?? ""}
                        onChange={(value) =>
                          updateItem(item.medicineId, "unitPrice", value)
                        }
                      />
                    </div>
                  )}

                  {remaining > 0 && Number(current?.quantity || 0) > 0 && (
                    <div className="mt-3 flex justify-between border-t border-line pt-3 text-xs">
                      <span className="text-muted">Received value</span>
                      <span className="font-semibold text-ink">
                        {formatMoney(
                          Number(current.quantity) * Number(current.unitPrice)
                        )}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-line px-5 py-3 text-sm text-ink-soft hover:bg-hover disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving || remainingTotal === 0}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/10 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? "Processing..." : "Confirm Stock Receipt"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  type = "text",
  value,
  onChange,
  min,
  max,
  placeholder,
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-ink-soft">
        {label}
      </label>
      <input
        type={type}
        min={min}
        max={max}
        step={type === "number" ? "1" : undefined}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-line bg-elevated px-3 py-2.5 text-xs text-ink outline-none placeholder:text-muted focus:border-emerald-500/50"
      />
    </div>
  );
}
