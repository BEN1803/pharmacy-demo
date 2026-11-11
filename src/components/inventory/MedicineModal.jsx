
"use client";

import { useState } from "react";
import { X, Pill, Plus } from "lucide-react";
import { medicineCategories } from "@/data/inventory";

const initialForm = {
  name: "",
  genericName: "",
  strength: "",
  category: "Pain Relief",
  dosageForm: "Tablet",
  manufacturer: "",
  sku: "",
  purchasePrice: "",
  sellingPrice: "",
  reorderLevel: "50",
  batchNumber: "",
  quantity: "",
  expiryDate: "",
};

export default function MedicineModal({ open, onClose, onSave }) {
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !form.name.trim() ||
      !form.sku.trim() ||
      !form.batchNumber.trim() ||
      !form.expiryDate ||
      form.quantity === "" ||
      form.purchasePrice === "" ||
      form.sellingPrice === ""
    ) {
      setError("Please complete all required fields.");
      return;
    }

    if (
      Number(form.quantity) < 0 ||
      Number(form.purchasePrice) < 0 ||
      Number(form.sellingPrice) < 0 ||
      Number(form.reorderLevel) < 0
    ) {
      setError("Quantity and prices cannot be negative.");
      return;
    }

    if (Number(form.sellingPrice) < Number(form.purchasePrice)) {
      setError("Selling price should not be lower than purchase price.");
      return;
    }

    setSaving(true);

    // Simulate a short save operation.
    await new Promise((resolve) => setTimeout(resolve, 700));

    const newMedicine = {
      id: Date.now(),
      name: form.name.trim(),
      genericName: form.genericName.trim() || form.name.trim(),
      strength: form.strength.trim(),
      category: form.category,
      dosageForm: form.dosageForm,
      manufacturer: form.manufacturer.trim(),
      sku: form.sku.trim(),
      barcode: "",
      purchasePrice: Number(form.purchasePrice),
      sellingPrice: Number(form.sellingPrice),
      reorderLevel: Number(form.reorderLevel),
      batches: [
        {
          batchNumber: form.batchNumber.trim(),
          quantity: Number(form.quantity),
          expiryDate: form.expiryDate,
        },
      ],
    };

    onSave(newMedicine);
    setForm(initialForm);
    setSaving(false);
  };

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-violet-400/70 focus:ring-2 focus:ring-violet-500/10";

  const labelClass = "mb-2 block text-sm font-medium text-white/70";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-md sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-[#111827] shadow-2xl shadow-black/40">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#111827]/95 px-5 py-4 backdrop-blur-xl sm:px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
              <Pill size={20} />
            </div>
            <div>
              <h2 className="font-semibold text-white">Add new medicine</h2>
              <p className="text-xs text-white/40">Register a medicine and its first batch</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-white/50 transition hover:bg-white/10 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-5 sm:p-7">
          <section>
            <h3 className="mb-4 text-sm font-semibold text-white">
              Medicine information
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Medicine name *</label>
                <input name="name" value={form.name} onChange={updateField} placeholder="e.g. Paracetamol" className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Generic name</label>
                <input name="genericName" value={form.genericName} onChange={updateField} placeholder="Generic name" className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Strength</label>
                <input name="strength" value={form.strength} onChange={updateField} placeholder="e.g. 500mg" className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Dosage form</label>
                <select name="dosageForm" value={form.dosageForm} onChange={updateField} className={inputClass}>
                  {["Tablet", "Capsule", "Syrup", "Injection", "Cream", "Ointment", "Drops", "Inhaler", "Other"].map((item) => (
                    <option key={item} value={item} className="bg-slate-900">{item}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Category *</label>
                <select name="category" value={form.category} onChange={updateField} className={inputClass}>
                  {medicineCategories.map((item) => (
                    <option key={item} value={item} className="bg-slate-900">{item}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Manufacturer</label>
                <input name="manufacturer" value={form.manufacturer} onChange={updateField} placeholder="Manufacturer" className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>SKU / Product code *</label>
                <input name="sku" value={form.sku} onChange={updateField} placeholder="e.g. MED-0009" className={inputClass} />
              </div>
            </div>
          </section>

          <div className="border-t border-white/10" />

          <section>
            <h3 className="mb-4 text-sm font-semibold text-white">
              Pricing and stock
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Purchase price (TZS) *</label>
                <input type="number" min="0" name="purchasePrice" value={form.purchasePrice} onChange={updateField} placeholder="0" className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Selling price (TZS) *</label>
                <input type="number" min="0" name="sellingPrice" value={form.sellingPrice} onChange={updateField} placeholder="0" className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Initial quantity *</label>
                <input type="number" min="0" name="quantity" value={form.quantity} onChange={updateField} placeholder="0" className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Reorder level</label>
                <input type="number" min="0" name="reorderLevel" value={form.reorderLevel} onChange={updateField} className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Batch number *</label>
                <input name="batchNumber" value={form.batchNumber} onChange={updateField} placeholder="e.g. PCM-2026-03" className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Expiry date *</label>
                <input type="date" name="expiryDate" value={form.expiryDate} onChange={updateField} className={inputClass} />
              </div>
            </div>
          </section>

          {error && (
            <div className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-white/70 transition hover:bg-white/5">
              Cancel
            </button>

            <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60">
              {saving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Saving medicine...
                </>
              ) : (
                <>
                  <Plus size={17} />
                  Save medicine
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
