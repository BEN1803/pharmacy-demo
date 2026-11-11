
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import {
  ArrowLeft,
  Package,
  Plus,
  TrendingUp,
  AlertTriangle,
  ClipboardList,
  X,
  CheckCircle2,
  Clock3,
} from "lucide-react";

import { usePharmacy } from "@/context/PharmacyContext";

const formatMoney = (amount) =>
  new Intl.NumberFormat("en-TZ", {
    style: "currency",
    currency: "TZS",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

const formatDate = (date) => {
  if (!date) return "Not specified";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Invalid date";
  }

  return parsedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getStock = (medicine) =>
  (medicine?.batches || []).reduce(
    (total, batch) => total + Number(batch.quantity || 0),
    0
  );

export default function MedicineDetailsPage() {
  const params = useParams();
  const medicineId = params.id;

  // Read the medicine from the shared pharmacy inventory.
  const {
    medicines,
    updateMedicine,
    loaded,
  } = usePharmacy();

  // Find the latest version of this medicine.
  const medicine = useMemo(
    () =>
      medicines.find(
        (item) => String(item.id) === String(medicineId)
      ) || null,
    [medicines, medicineId]
  );

  const [showStockModal, setShowStockModal] = useState(false);

  const [stockForm, setStockForm] = useState({
    batchNumber: "",
    quantity: "",
    expiryDate: "",
    supplier: "",
    purchasePrice: "",
  });

  const [movements, setMovements] = useState([]);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Store today's date after mounting to avoid prerendering issues.
  const [today, setToday] = useState(null);

  useEffect(() => {
    const currentDate = new Date();

    currentDate.setHours(0, 0, 0, 0);

    setToday(currentDate.getTime());
  }, []);

  // Build the opening stock movement history once the shared data loads.
  // The effect depends on the medicine ID, not the entire medicine object,
  // so receiving stock does not reset the movement history.
  useEffect(() => {
    if (!loaded || !medicine) return;

    setMovements(
      (medicine.batches || []).map((batch, index) => ({
        id: `${medicine.id}-${batch.batchNumber}-${index}`,
        type: "Opening stock",
        batchNumber: batch.batchNumber,
        quantity: Number(batch.quantity || 0),
        date: "Opening inventory",
        supplier: medicine.manufacturer || "Not specified",
      }))
    );
  }, [loaded, medicine?.id]);

  // Calculate available stock from all batches.
  const totalStock = useMemo(
    () => getStock(medicine),
    [medicine]
  );

  // Show a temporary success notification.
  useEffect(() => {
    if (!successMessage) return;

    const timer = setTimeout(() => {
      setSuccessMessage("");
    }, 3500);

    return () => clearTimeout(timer);
  }, [successMessage]);

  // Show a temporary error notification.
  useEffect(() => {
    if (!errorMessage) return;

    const timer = setTimeout(() => {
      setErrorMessage("");
    }, 4500);

    return () => clearTimeout(timer);
  }, [errorMessage]);

  // Handle loading before checking whether the medicine exists.
  if (!loaded) {
    return (
      <div className="glass-card rounded-2xl p-10">
        <div className="mx-auto flex max-w-sm flex-col items-center text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-blue-500" />

          <h2 className="mt-5 font-semibold text-foreground">
            Loading medicine details
          </h2>

          <p className="mt-2 text-sm text-muted">
            Retrieving the latest inventory information...
          </p>
        </div>
      </div>
    );
  }

  if (!medicine) {
    return (
      <div className="glass-card rounded-2xl p-10 text-center">
        <Package size={42} className="mx-auto text-muted" />

        <h2 className="mt-4 text-xl font-semibold text-foreground">
          Medicine not found
        </h2>

        <p className="mt-2 text-sm text-muted">
          This medicine may not exist in the current demo inventory.
        </p>

        <Link
          href="/inventory"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <ArrowLeft size={16} />
          Back to inventory
        </Link>
      </div>
    );
  }

  // Determine current stock status.
  const stockStatus =
    totalStock === 0
      ? "Out of Stock"
      : totalStock <= Number(medicine.reorderLevel)
      ? "Low Stock"
      : "In Stock";

  const stockStatusStyle =
    stockStatus === "Out of Stock"
      ? "border-red-500/20 bg-red-500/10 text-red-400"
      : stockStatus === "Low Stock"
      ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
      : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";

  const inventoryValue =
    totalStock * Number(medicine.sellingPrice || 0);

  const inventoryCost =
    totalStock * Number(medicine.purchasePrice || 0);

  // Update the stock form fields.
  function updateStockField(event) {
    const { name, value } = event.target;

    setStockForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  // Receive a new batch and save it to shared inventory.
  function handleStockSubmit(event) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const batchNumber = stockForm.batchNumber.trim();
    const supplier = stockForm.supplier.trim();
    const quantity = Number(stockForm.quantity);
    const purchasePrice = Number(stockForm.purchasePrice);

    // Validate required values.
    if (
      !batchNumber ||
      !stockForm.expiryDate ||
      !supplier ||
      !Number.isFinite(quantity) ||
      quantity <= 0 ||
      !Number.isFinite(purchasePrice) ||
      purchasePrice < 0
    ) {
      setErrorMessage("Please enter valid stock information.");
      return;
    }

    // Prevent duplicate batch numbers for this medicine.
    const duplicateBatch = (medicine.batches || []).some(
      (batch) =>
        String(batch.batchNumber).toLowerCase() ===
        batchNumber.toLowerCase()
    );

    if (duplicateBatch) {
      setErrorMessage(
        "This batch number already exists for this medicine."
      );
      return;
    }

    // Do not accept an invalid expiry date.
    const expiryDate = new Date(
      `${stockForm.expiryDate}T00:00:00`
    );

    if (Number.isNaN(expiryDate.getTime())) {
      setErrorMessage("Please enter a valid expiry date.");
      return;
    }

    setSaving(true);

    // Simulate a short stock receiving process.
    setTimeout(() => {
      try {
        const newBatch = {
          batchNumber,
          quantity,
          expiryDate: stockForm.expiryDate,
        };

        // Update the shared medicine record.
        // Inventory and POS will receive this update automatically.
        updateMedicine({
          ...medicine,
          purchasePrice,
          batches: [
            ...(medicine.batches || []),
            newBatch,
          ],
        });

        // Record the stock receipt in this page's movement history.
        setMovements((current) => [
          {
            id: `${Date.now()}`,
            type: "Stock received",
            batchNumber,
            quantity,
            date: new Date().toLocaleDateString("en-GB"),
            supplier,
          },
          ...current,
        ]);

        setStockForm({
          batchNumber: "",
          quantity: "",
          expiryDate: "",
          supplier: "",
          purchasePrice: "",
        });

        setShowStockModal(false);
        setSuccessMessage(
          "New stock has been added successfully."
        );
      } catch (error) {
        console.error("Could not receive stock:", error);

        setErrorMessage(
          error.message || "Could not add the new stock."
        );
      } finally {
        setSaving(false);
      }
    }, 700);
  }

  return (
    <div className="space-y-6">

      {/* Page heading and navigation */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/inventory"
            className="mb-3 inline-flex items-center gap-2 text-sm text-muted transition hover:text-foreground"
          >
            <ArrowLeft size={16} />
            Back to inventory
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">
              {medicine.name}
            </h1>

            <span
              className={`rounded-full border px-3 py-1 text-xs font-medium ${stockStatusStyle}`}
            >
              {stockStatus}
            </span>
          </div>

          <p className="mt-1 text-sm text-muted">
            {medicine.genericName} · {medicine.strength} · {medicine.dosageForm}
          </p>
        </div>

        <button
          onClick={() => setShowStockModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Receive Stock
        </button>
      </div>

      {/* Success notification */}
      {successMessage && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-400">
          <CheckCircle2 size={18} />
          {successMessage}
        </div>
      )}

      {/* Error notification */}
      {errorMessage && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          <AlertTriangle size={18} />
          {errorMessage}
        </div>
      )}

      {/* Stock summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Available Stock"
          value={`${totalStock.toLocaleString()} units`}
          description="Total quantity across batches"
          icon={Package}
          iconStyle="bg-blue-500/10 text-blue-400"
        />

        <SummaryCard
          title="Reorder Level"
          value={`${medicine.reorderLevel} units`}
          description="Minimum recommended quantity"
          icon={AlertTriangle}
          iconStyle="bg-amber-500/10 text-amber-400"
        />

        <SummaryCard
          title="Selling Value"
          value={formatMoney(inventoryValue)}
          description="Estimated value at selling price"
          icon={TrendingUp}
          iconStyle="bg-emerald-500/10 text-emerald-400"
        />

        <SummaryCard
          title="Purchase Value"
          value={formatMoney(inventoryCost)}
          description="Estimated value at purchase price"
          icon={ClipboardList}
          iconStyle="bg-violet-500/10 text-violet-400"
        />
      </div>

      {/* Medicine information */}
      <section className="glass-card rounded-2xl p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-400">
            <Package size={20} />
          </div>

          <div>
            <h2 className="font-semibold text-foreground">
              Medicine Information
            </h2>

            <p className="text-xs text-muted">
              Product identification and pricing information
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem label="Medicine name" value={medicine.name} />
          <InfoItem label="Generic name" value={medicine.genericName} />
          <InfoItem label="Strength" value={medicine.strength} />
          <InfoItem label="Category" value={medicine.category} />
          <InfoItem label="Dosage form" value={medicine.dosageForm} />
          <InfoItem label="Manufacturer" value={medicine.manufacturer} />
          <InfoItem label="SKU" value={medicine.sku} />
          <InfoItem label="Barcode" value={medicine.barcode} />

          <InfoItem
            label="Purchase price"
            value={formatMoney(medicine.purchasePrice)}
          />

          <InfoItem
            label="Selling price"
            value={formatMoney(medicine.sellingPrice)}
          />

          <InfoItem
            label="Profit per unit"
            value={formatMoney(
              Number(medicine.sellingPrice || 0) -
              Number(medicine.purchasePrice || 0)
            )}
          />
        </div>
      </section>

      {/* Batch management */}
      <section className="glass-card overflow-hidden rounded-2xl">
        <div className="flex flex-col gap-2 border-b border-white/5 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-foreground">
              Medicine Batches
            </h2>

            <p className="mt-1 text-xs text-muted">
              Monitor quantities and expiry dates for each batch
            </p>
          </div>

          <span className="w-fit rounded-lg bg-white/5 px-3 py-1.5 text-xs text-muted">
            {(medicine.batches || []).length} batches
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="bg-white/[0.02] text-xs uppercase text-muted">
              <tr>
                <th className="px-5 py-4 font-medium">Batch number</th>
                <th className="px-5 py-4 font-medium">Quantity</th>
                <th className="px-5 py-4 font-medium">Expiry date</th>
                <th className="px-5 py-4 font-medium">Expiry status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {(medicine.batches || []).map((batch, index) => {
                const expiryTime = batch.expiryDate
                  ? new Date(
                      `${batch.expiryDate}T00:00:00`
                    ).getTime()
                  : NaN;

                const daysRemaining =
                  today && Number.isFinite(expiryTime)
                    ? Math.ceil(
                        (expiryTime - today) /
                        (1000 * 60 * 60 * 24)
                      )
                    : null;

                const expiryStatus =
                  daysRemaining === null
                    ? "Unknown"
                    : daysRemaining < 0
                    ? "Expired"
                    : daysRemaining <= 90
                    ? "Expiring soon"
                    : "Valid";

                const expiryStyle =
                  expiryStatus === "Expired"
                    ? "bg-red-500/10 text-red-400"
                    : expiryStatus === "Expiring soon"
                    ? "bg-amber-500/10 text-amber-400"
                    : expiryStatus === "Valid"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-white/5 text-muted";

                return (
                  <tr key={`${batch.batchNumber}-${index}`}>
                    <td className="px-5 py-4 font-medium text-foreground">
                      {batch.batchNumber}
                    </td>

                    <td className="px-5 py-4 text-foreground">
                      {Number(batch.quantity || 0).toLocaleString()} units
                    </td>

                    <td className="px-5 py-4 text-muted">
                      {formatDate(batch.expiryDate)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${expiryStyle}`}
                      >
                        {expiryStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {(medicine.batches || []).length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-10 text-center text-sm text-muted"
                  >
                    No batches recorded. Receive stock to add the first batch.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Stock movement history */}
      <section className="glass-card overflow-hidden rounded-2xl">
        <div className="border-b border-white/5 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-500/10 p-2.5 text-violet-400">
              <Clock3 size={20} />
            </div>

            <div>
              <h2 className="font-semibold text-foreground">
                Stock Movement History
              </h2>

              <p className="mt-1 text-xs text-muted">
                Record of stock received for this medicine
              </p>
            </div>
          </div>
        </div>

        {movements.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted">
            No stock movements recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {movements.map((movement) => (
              <div
                key={movement.id}
                className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-400">
                    <Plus size={18} />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {movement.type}
                    </p>

                    <p className="mt-1 text-xs text-muted">
                      Batch: {movement.batchNumber} · Supplier: {movement.supplier}
                    </p>
                  </div>
                </div>

                <div className="sm:text-right">
                  <p className="text-sm font-semibold text-emerald-400">
                    +{movement.quantity} units
                  </p>

                  <p className="mt-1 text-xs text-muted">
                    {movement.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Receive stock modal */}
      {showStockModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-xl rounded-2xl border border-white/10 bg-[#111827] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Receive New Stock
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  Add a new batch of {medicine.name}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowStockModal(false)}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
                aria-label="Close stock form"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleStockSubmit} className="space-y-4 p-5">
              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Batch number
                </label>

                <input
                  name="batchNumber"
                  value={stockForm.batchNumber}
                  onChange={updateStockField}
                  placeholder="e.g. PCM-2026-03"
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-gray-300">
                    Quantity received
                  </label>

                  <input
                    name="quantity"
                    type="number"
                    min="1"
                    step="1"
                    value={stockForm.quantity}
                    onChange={updateStockField}
                    placeholder="e.g. 200"
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-gray-300">
                    Expiry date
                  </label>

                  <input
                    name="expiryDate"
                    type="date"
                    value={stockForm.expiryDate}
                    onChange={updateStockField}
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Supplier
                </label>

                <input
                  name="supplier"
                  value={stockForm.supplier}
                  onChange={updateStockField}
                  placeholder="Enter supplier name"
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Purchase price per unit (TZS)
                </label>

                <input
                  name="purchasePrice"
                  type="number"
                  min="0"
                  step="1"
                  value={stockForm.purchasePrice}
                  onChange={updateStockField}
                  placeholder="e.g. 150"
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowStockModal(false)}
                  disabled={saving}
                  className="rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-gray-300 transition hover:bg-white/5 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Adding stock..." : "Confirm Stock Received"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable stock summary card.
function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
  iconStyle,
}) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted">{title}</p>

          <h3 className="mt-3 text-xl font-bold text-foreground">
            {value}
          </h3>
        </div>

        <div className={`rounded-xl p-3 ${iconStyle}`}>
          <Icon size={20} />
        </div>
      </div>

      <p className="mt-3 text-xs text-muted">
        {description}
      </p>
    </div>
  );
}

// Reusable medicine information item.
function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>

      <p className="mt-1 break-words text-sm font-medium text-foreground">
        {value || "Not specified"}
      </p>
    </div>
  );
}
