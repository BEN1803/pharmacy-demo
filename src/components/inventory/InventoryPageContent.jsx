
"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  Search,
  Plus,
  Package,
  AlertTriangle,
  XCircle,
  CalendarDays,
  Download,
  ChevronDown,
  ChevronUp,
  Eye,
  Pill,
  RefreshCw,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import MedicineModal from "@/components/inventory/MedicineModal";

import {
  medicines as initialMedicines,
  medicineCategories,
} from "@/data/inventory";

const PAGE_SIZE = 6;

// Format prices in Tanzanian Shillings.
const formatMoney = (amount) =>
  new Intl.NumberFormat("en-TZ", {
    style: "currency",
    currency: "TZS",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

// Calculate the total quantity across all medicine batches.
const getStock = (medicine) =>
  (medicine.batches || []).reduce(
    (total, batch) => total + Number(batch.quantity || 0),
    0
  );

// Determine the current stock status.
const getStockStatus = (medicine) => {
  const quantity = getStock(medicine);

  if (quantity === 0) return "Out of Stock";

  if (quantity <= Number(medicine.reorderLevel)) {
    return "Low Stock";
  }

  return "In Stock";
};

// Calculate days remaining before expiry.
// The current date is passed in from component state.
const getDaysUntilExpiry = (expiryDate, today) => {
  if (!today || !expiryDate) return null;

  const expiry = new Date(expiryDate);

  if (Number.isNaN(expiry.getTime())) return null;

  expiry.setHours(0, 0, 0, 0);

  return Math.ceil(
    (expiry.getTime() - today) / (1000 * 60 * 60 * 24)
  );
};

// Determine the expiry status of a batch.
const getExpiryStatus = (expiryDate, today) => {
  const days = getDaysUntilExpiry(expiryDate, today);

  if (days === null) return "Unknown";
  if (days < 0) return "Expired";
  if (days <= 90) return "Expiring Soon";

  return "Valid";
};

// Count medicines containing batches that expire within 90 days.
const getExpiringSoonCount = (items, today) => {
  if (!today) return 0;

  return items.filter((medicine) =>
    (medicine.batches || []).some(
      (batch) =>
        getExpiryStatus(batch.expiryDate, today) === "Expiring Soon"
    )
  ).length;
};

// Stock status colors.
const getStatusClasses = (status) => {
  switch (status) {
    case "In Stock":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";

    case "Low Stock":
      return "border-amber-500/20 bg-amber-500/10 text-amber-400";

    case "Out of Stock":
      return "border-red-500/20 bg-red-500/10 text-red-400";

    default:
      return "border-white/10 bg-white/5 text-muted";
  }
};

// Expiry status colors.
const getExpiryClasses = (status) => {
  switch (status) {
    case "Valid":
      return "bg-emerald-500/10 text-emerald-400";

    case "Expiring Soon":
      return "bg-amber-500/10 text-amber-400";

    case "Expired":
      return "bg-red-500/10 text-red-400";

    default:
      return "bg-white/5 text-muted";
  }
};

// Format expiry dates for display.
const formatDate = (date) => {
  if (!date) return "Not specified";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Invalid date";
  }

  return parsedDate.toLocaleDateString("en-GB");
};

export default function InventoryPageContent() {
  const [medicines, setMedicines] = useState(initialMedicines);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [stockFilter, setStockFilter] = useState("All Stock");

  const [currentPage, setCurrentPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Store the browser's current date after mounting.
  // This prevents Next.js from evaluating new Date()
  // during static prerendering.
  const [today, setToday] = useState(null);

  useEffect(() => {
    const currentDate = new Date();

    currentDate.setHours(0, 0, 0, 0);

    setToday(currentDate.getTime());
  }, []);

  // Simulate the initial loading process.
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 650);

    return () => clearTimeout(timer);
  }, []);

  // Calculate inventory dashboard statistics.
  const statistics = useMemo(() => {
    const totalProducts = medicines.length;

    const totalUnits = medicines.reduce(
      (total, medicine) => total + getStock(medicine),
      0
    );

    const lowStock = medicines.filter(
      (medicine) => getStockStatus(medicine) === "Low Stock"
    ).length;

    const outOfStock = medicines.filter(
      (medicine) => getStockStatus(medicine) === "Out of Stock"
    ).length;

    const expiringSoon = getExpiringSoonCount(medicines, today);

    const sellingValue = medicines.reduce(
      (total, medicine) =>
        total +
        getStock(medicine) * Number(medicine.sellingPrice || 0),
      0
    );

    const purchaseValue = medicines.reduce(
      (total, medicine) =>
        total +
        getStock(medicine) * Number(medicine.purchasePrice || 0),
      0
    );

    return {
      totalProducts,
      totalUnits,
      lowStock,
      outOfStock,
      expiringSoon,
      sellingValue,
      purchaseValue,
    };
  }, [medicines, today]);

  // Search and filter the medicine list.
  const filteredMedicines = useMemo(() => {
    return medicines.filter((medicine) => {
      const searchTerm = search.toLowerCase().trim();

      const matchesSearch =
        !searchTerm ||
        [
          medicine.name,
          medicine.genericName,
          medicine.sku,
          medicine.category,
          medicine.manufacturer,
          ...(medicine.batches || []).map(
            (batch) => batch.batchNumber
          ),
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(searchTerm)
          );

      const matchesCategory =
        category === "All Categories" ||
        medicine.category === category;

      const status = getStockStatus(medicine);

      const matchesStock =
        stockFilter === "All Stock" || status === stockFilter;

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [medicines, search, category, stockFilter]);

  // Reset pagination when search or filters change.
  useEffect(() => {
    setCurrentPage(1);
  }, [search, category, stockFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredMedicines.length / PAGE_SIZE)
  );

  const paginatedMedicines = filteredMedicines.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Add a medicine created through the modal.
  function handleAddMedicine(newMedicine) {
    setMedicines((current) => [
      {
        ...newMedicine,
        id: newMedicine.id || `MED-${Date.now()}`,
        batches: newMedicine.batches || [],
      },
      ...current,
    ]);

    setModalOpen(false);
  }

  // Expand or collapse batch details.
  function toggleExpanded(id) {
    setExpandedId((current) => (current === id ? null : id));
  }

  // Export currently filtered medicines to CSV.
  function exportCSV() {
    const headers = [
      "Medicine Name",
      "Generic Name",
      "SKU",
      "Category",
      "Manufacturer",
      "Quantity",
      "Reorder Level",
      "Purchase Price",
      "Selling Price",
      "Stock Status",
    ];

    const rows = filteredMedicines.map((medicine) => [
      medicine.name,
      medicine.genericName,
      medicine.sku,
      medicine.category,
      medicine.manufacturer,
      getStock(medicine),
      medicine.reorderLevel,
      medicine.purchasePrice,
      medicine.sellingPrice,
      getStockStatus(medicine),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(value ?? "").replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "mediflow-inventory.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  // Reset all filters.
  function clearFilters() {
    setSearch("");
    setCategory("All Categories");
    setStockFilter("All Stock");
  }

  return (
    <div className="space-y-6">

      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Inventory Management
          </h1>

          <p className="mt-1 text-sm text-muted">
            Manage medicines, monitor stock levels and track expiry dates.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={exportCSV}
            disabled={filteredMedicines.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-foreground transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={17} />
            Export CSV
          </button>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Medicine
          </button>
        </div>
      </div>

      {/* Inventory statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Medicines"
          value={statistics.totalProducts}
          description={`${statistics.totalUnits.toLocaleString()} total units`}
          icon={Package}
          iconStyle="bg-blue-500/10 text-blue-400"
        />

        <StatCard
          title="Low Stock"
          value={statistics.lowStock}
          description="Medicines below reorder level"
          icon={AlertTriangle}
          iconStyle="bg-amber-500/10 text-amber-400"
        />

        <StatCard
          title="Out of Stock"
          value={statistics.outOfStock}
          description="Medicines requiring restocking"
          icon={XCircle}
          iconStyle="bg-red-500/10 text-red-400"
        />

        <StatCard
          title="Expiring Soon"
          value={statistics.expiringSoon}
          description="Medicines with batches expiring within 90 days"
          icon={CalendarDays}
          iconStyle="bg-violet-500/10 text-violet-400"
        />
      </div>

      {/* Inventory value */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="glass-card rounded-2xl p-5">
          <p className="text-sm text-muted">
            Inventory Selling Value
          </p>

          <h2 className="mt-2 text-2xl font-bold text-foreground">
            {formatMoney(statistics.sellingValue)}
          </h2>

          <p className="mt-2 text-xs text-muted">
            Estimated value of available stock at selling prices.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <p className="text-sm text-muted">
            Inventory Purchase Value
          </p>

          <h2 className="mt-2 text-2xl font-bold text-foreground">
            {formatMoney(statistics.purchaseValue)}
          </h2>

          <p className="mt-2 text-xs text-muted">
            Estimated cost of available stock at purchase prices.
          </p>
        </div>
      </div>

      {/* Search and filters */}
      <div className="glass-card space-y-4 rounded-2xl p-5">
        <div className="flex items-center gap-2">
          <Filter size={17} className="text-muted" />

          <h2 className="text-sm font-semibold text-foreground">
            Search and Filter
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search medicine, SKU, batch..."
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-blue-500"
            />
          </div>

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-foreground outline-none focus:border-blue-500"
          >
            <option value="All Categories">All Categories</option>

            {medicineCategories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(event) => setStockFilter(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-foreground outline-none focus:border-blue-500"
          >
            <option value="All Stock">All Stock Statuses</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>

        {(search ||
          category !== "All Categories" ||
          stockFilter !== "All Stock") && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted">
              Showing {filteredMedicines.length} matching medicines
            </p>

            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 text-xs font-medium text-blue-400 hover:text-blue-300"
            >
              <RefreshCw size={13} />
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Medicine table */}
      <div className="glass-card overflow-hidden rounded-2xl">
        <div className="flex flex-col gap-2 border-b border-white/5 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-foreground">
              Medicine Inventory
            </h2>

            <p className="mt-1 text-xs text-muted">
              Select a medicine name to view its complete details.
            </p>
          </div>

          <span className="w-fit rounded-lg bg-white/5 px-3 py-1.5 text-xs text-muted">
            {filteredMedicines.length} medicines
          </span>
        </div>

        {loading ? (
          <LoadingRows />
        ) : filteredMedicines.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
            <div className="rounded-2xl bg-white/5 p-4 text-muted">
              <Pill size={30} />
            </div>

            <h3 className="mt-4 font-semibold text-foreground">
              No medicines found
            </h3>

            <p className="mt-2 max-w-sm text-sm text-muted">
              Try changing your search or filters to find the medicine
              you're looking for.
            </p>

            <button
              onClick={clearFilters}
              className="mt-5 text-sm font-medium text-blue-400 hover:text-blue-300"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-white/[0.02] text-xs uppercase text-muted">
                  <tr>
                    <th className="px-5 py-4 font-medium">Medicine</th>
                    <th className="px-5 py-4 font-medium">Category</th>
                    <th className="px-5 py-4 font-medium">Stock</th>
                    <th className="px-5 py-4 font-medium">Purchase Price</th>
                    <th className="px-5 py-4 font-medium">Selling Price</th>
                    <th className="px-5 py-4 font-medium">Status</th>
                    <th className="px-5 py-4 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                  {paginatedMedicines.map((medicine) => {
                    const quantity = getStock(medicine);
                    const status = getStockStatus(medicine);
                    const isExpanded = expandedId === medicine.id;

                    return (
                      <Fragment key={medicine.id}>
                        <tr className="transition hover:bg-white/[0.02]">

                          {/* Medicine name */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                                <Pill size={19} />
                              </div>

                              <div>
                                <Link
                                  href={`/inventory/${medicine.id}`}
                                  className="font-medium text-foreground transition hover:text-blue-400"
                                >
                                  {medicine.name}
                                </Link>

                                <p className="mt-1 text-xs text-muted">
                                  {medicine.genericName}
                                </p>

                                <p className="mt-1 text-[11px] text-muted">
                                  SKU: {medicine.sku}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="px-5 py-4 text-muted">
                            {medicine.category}
                          </td>

                          {/* Stock quantity */}
                          <td className="px-5 py-4">
                            <p className="font-semibold text-foreground">
                              {quantity.toLocaleString()} units
                            </p>

                            <p className="mt-1 text-xs text-muted">
                              Reorder at {medicine.reorderLevel}
                            </p>
                          </td>

                          {/* Purchase price */}
                          <td className="px-5 py-4 text-muted">
                            {formatMoney(medicine.purchasePrice)}
                          </td>

                          {/* Selling price */}
                          <td className="px-5 py-4 font-medium text-foreground">
                            {formatMoney(medicine.sellingPrice)}
                          </td>

                          {/* Stock status */}
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStatusClasses(status)}`}
                            >
                              {status}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/inventory/${medicine.id}`}
                                title="View medicine details"
                                className="rounded-lg border border-white/10 p-2 text-muted transition hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-400"
                              >
                                <Eye size={16} />
                              </Link>

                              <button
                                onClick={() =>
                                  toggleExpanded(medicine.id)
                                }
                                title="View batches"
                                className="rounded-lg border border-white/10 p-2 text-muted transition hover:bg-white/10 hover:text-foreground"
                              >
                                {isExpanded ? (
                                  <ChevronUp size={16} />
                                ) : (
                                  <ChevronDown size={16} />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Expanded batch information */}
                        {isExpanded && (
                          <tr>
                            <td
                              colSpan={7}
                              className="bg-white/[0.015] px-5 py-5"
                            >
                              <div className="space-y-3">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <h3 className="text-sm font-semibold text-foreground">
                                    Batch Information
                                  </h3>

                                  <span className="text-xs text-muted">
                                    {(medicine.batches || []).length} batches
                                  </span>
                                </div>

                                {(medicine.batches || []).length === 0 ? (
                                  <p className="text-sm text-muted">
                                    No batches have been recorded for this medicine.
                                  </p>
                                ) : (
                                  <div className="overflow-x-auto">
                                    <table className="w-full min-w-[550px] text-left text-xs">
                                      <thead className="text-muted">
                                        <tr>
                                          <th className="px-3 py-3 font-medium">
                                            Batch Number
                                          </th>

                                          <th className="px-3 py-3 font-medium">
                                            Quantity
                                          </th>

                                          <th className="px-3 py-3 font-medium">
                                            Expiry Date
                                          </th>

                                          <th className="px-3 py-3 font-medium">
                                            Expiry Status
                                          </th>
                                        </tr>
                                      </thead>

                                      <tbody className="divide-y divide-white/5">
                                        {(medicine.batches || []).map(
                                          (batch, index) => {
                                            const expiryStatus = today
                                              ? getExpiryStatus(
                                                  batch.expiryDate,
                                                  today
                                                )
                                              : "Unknown";

                                            return (
                                              <tr
                                                key={`${batch.batchNumber}-${index}`}
                                              >
                                                <td className="px-3 py-3 font-medium text-foreground">
                                                  {batch.batchNumber}
                                                </td>

                                                <td className="px-3 py-3 text-muted">
                                                  {Number(
                                                    batch.quantity
                                                  ).toLocaleString()}{" "}
                                                  units
                                                </td>

                                                <td className="px-3 py-3 text-muted">
                                                  {formatDate(
                                                    batch.expiryDate
                                                  )}
                                                </td>

                                                <td className="px-3 py-3">
                                                  <span
                                                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${getExpiryClasses(expiryStatus)}`}
                                                  >
                                                    {expiryStatus}
                                                  </span>
                                                </td>
                                              </tr>
                                            );
                                          }
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                )}

                                <div className="pt-2">
                                  <Link
                                    href={`/inventory/${medicine.id}`}
                                    className="inline-flex items-center gap-2 text-xs font-medium text-blue-400 hover:text-blue-300"
                                  >
                                    View complete medicine details
                                    <ChevronRight size={14} />
                                  </Link>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-3 border-t border-white/5 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted">
                Showing{" "}
                {filteredMedicines.length === 0
                  ? 0
                  : (currentPage - 1) * PAGE_SIZE + 1}
                {" "}to{" "}
                {Math.min(
                  currentPage * PAGE_SIZE,
                  filteredMedicines.length
                )}
                {" "}of {filteredMedicines.length} medicines
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                  disabled={currentPage === 1}
                  className="rounded-lg border border-white/10 p-2 text-muted transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={17} />
                </button>

                <span className="px-3 text-xs text-muted">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.min(totalPages, page + 1)
                    )
                  }
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-white/10 p-2 text-muted transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Next page"
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add medicine modal */}
      {modalOpen && (
        <MedicineModal
          onClose={() => setModalOpen(false)}
          onSave={handleAddMedicine}
        />
      )}
    </div>
  );
}

// Reusable statistics card.
function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconStyle,
}) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted">{title}</p>

          <h3 className="mt-3 text-2xl font-bold text-foreground">
            {value}
          </h3>
        </div>

        <div className={`rounded-xl p-3 ${iconStyle}`}>
          <Icon size={21} />
        </div>
      </div>

      <p className="mt-3 text-xs text-muted">
        {description}
      </p>
    </div>
  );
}

// Loading placeholder displayed while inventory loads.
function LoadingRows() {
  return (
    <div className="space-y-4 p-5">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="flex animate-pulse items-center gap-4"
        >
          <div className="h-10 w-10 rounded-xl bg-white/10" />

          <div className="flex-1 space-y-2">
            <div className="h-3 w-40 rounded bg-white/10" />
            <div className="h-2.5 w-24 rounded bg-white/5" />
          </div>

          <div className="hidden h-8 w-20 rounded-lg bg-white/5 sm:block" />
          <div className="hidden h-8 w-20 rounded-lg bg-white/5 md:block" />
        </div>
      ))}
    </div>
  );
}
