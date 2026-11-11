
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Package,
  AlertTriangle,
  XCircle,
  CalendarClock,
  ArrowDownToLine,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Pill,
  SlidersHorizontal,
  RefreshCw,
  Boxes,
} from "lucide-react";

import MedicineModal from "./MedicineModal";

import {
  medicines as initialMedicines,
  medicineCategories,
  getMedicineStock,
  getStockStatus,
  getMedicineValue,
  getMedicineCostValue,
  getExpiryStatus,
  formatCurrency,
} from "@/data/inventory";

const PAGE_SIZE = 6;

function StatCard({ title, value, description, icon: Icon, color }) {
  const colors = {
    violet: "bg-violet-500/10 text-violet-300 ring-violet-400/10",
    amber: "bg-amber-500/10 text-amber-300 ring-amber-400/10",
    rose: "bg-rose-500/10 text-rose-300 ring-rose-400/10",
    emerald: "bg-emerald-500/10 text-emerald-300 ring-emerald-400/10",
  };

  return (
    <div className="glass-card rounded-2xl border border-white/10 p-5 transition duration-300 hover:-translate-y-1 hover:border-white/20">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-white/50">{title}</p>
          <h3 className="mt-2 text-2xl font-bold tracking-tight text-white">
            {value}
          </h3>
          <p className="mt-2 text-xs text-white/40">{description}</p>
        </div>

        <div className={`rounded-xl p-3 ring-1 ${colors[color]}`}>
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    "In Stock": "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",
    "Low Stock": "bg-amber-400/10 text-amber-300 border-amber-400/20",
    "Out of Stock": "bg-rose-400/10 text-rose-300 border-rose-400/20",
  };

  return (
    <span className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}

function ExpiryBadge({ date }) {
  const status = getExpiryStatus(date);

  const styles = {
    Valid: "text-emerald-300",
    "Expiring Soon": "text-amber-300",
    Expired: "text-rose-300",
  };

  return (
    <span className={`text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}

function LoadingRows() {
  return (
    <div className="space-y-4 p-5">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex animate-pulse items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-white/10" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 rounded bg-white/10" />
            <div className="h-2 w-1/4 rounded bg-white/5" />
          </div>
          <div className="hidden h-5 w-20 rounded-full bg-white/10 sm:block" />
          <div className="h-4 w-16 rounded bg-white/10" />
        </div>
      ))}
    </div>
  );
}

export default function InventoryPageContent() {
  const [medicines, setMedicines] = useState(initialMedicines);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [stockFilter, setStockFilter] = useState("All Stock");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simulate initial data loading.
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 650);
    return () => clearTimeout(timer);
  }, []);

  // Calculate inventory summary values.
  const summary = useMemo(() => {
    const totalUnits = medicines.reduce(
      (total, medicine) => total + getMedicineStock(medicine),
      0
    );

    const lowStock = medicines.filter(
      (medicine) => getStockStatus(medicine) === "Low Stock"
    ).length;

    const outOfStock = medicines.filter(
      (medicine) => getStockStatus(medicine) === "Out of Stock"
    ).length;

    const expiringSoon = medicines.reduce((total, medicine) => {
      return total + medicine.batches.filter(
        (batch) =>
          batch.quantity > 0 && getExpiryStatus(batch.expiryDate) === "Expiring Soon"
      ).length;
    }, 0);

    const sellingValue = medicines.reduce(
      (total, medicine) => total + getMedicineValue(medicine),
      0
    );

    const costValue = medicines.reduce(
      (total, medicine) => total + getMedicineCostValue(medicine),
      0
    );

    return {
      totalProducts: medicines.length,
      totalUnits,
      lowStock,
      outOfStock,
      expiringSoon,
      sellingValue,
      costValue,
    };
  }, [medicines]);

  // Search and filter medicines.
  const filteredMedicines = useMemo(() => {
    return medicines.filter((medicine) => {
      const searchTerm = search.toLowerCase();

      const matchesSearch = [
        medicine.name,
        medicine.genericName,
        medicine.sku,
        medicine.category,
        medicine.manufacturer,
        ...medicine.batches.map((batch) => batch.batchNumber),
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(searchTerm));

      const matchesCategory =
        category === "All Categories" || medicine.category === category;

      const status = getStockStatus(medicine);
      const matchesStock =
        stockFilter === "All Stock" || status === stockFilter;

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [medicines, search, category, stockFilter]);

  // Keep the current page valid when filters change.
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

  const handleAddMedicine = (newMedicine) => {
    setMedicines((current) => [newMedicine, ...current]);
    setModalOpen(false);
    setSearch("");
    setCategory("All Categories");
    setStockFilter("All Stock");
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearch("");
    setCategory("All Categories");
    setStockFilter("All Stock");
  };

  const exportInventory = () => {
    const headers = [
      "SKU",
      "Medicine",
      "Generic Name",
      "Category",
      "Stock",
      "Reorder Level",
      "Purchase Price",
      "Selling Price",
      "Selling Value",
      "Status",
    ];

    const rows = filteredMedicines.map((medicine) => [
      medicine.sku,
      medicine.name,
      medicine.genericName,
      medicine.category,
      getMedicineStock(medicine),
      medicine.reorderLevel,
      medicine.purchasePrice,
      medicine.sellingPrice,
      getMedicineValue(medicine),
      getStockStatus(medicine),
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "mediflow-inventory.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs text-white/40">
            <span>Pharmacy</span>
            <span>/</span>
            <span className="text-violet-300">Inventory</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Inventory Management
          </h1>

          <p className="mt-1 text-sm text-white/45">
            Manage medicines, stock levels and expiry dates.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={exportInventory}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/75 transition hover:bg-white/10"
          >
            <ArrowDownToLine size={17} />
            Export CSV
          </button>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/20 transition hover:bg-violet-500"
          >
            <Plus size={18} />
            Add Medicine
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Products"
          value={summary.totalProducts}
          description={`${summary.totalUnits.toLocaleString()} total units in stock`}
          icon={Package}
          color="violet"
        />

        <StatCard
          title="Low Stock"
          value={summary.lowStock}
          description="Products below reorder level"
          icon={AlertTriangle}
          color="amber"
        />

        <StatCard
          title="Out of Stock"
          value={summary.outOfStock}
          description="Products requiring replenishment"
          icon={XCircle}
          color="rose"
        />

        <StatCard
          title="Expiring Soon"
          value={summary.expiringSoon}
          description="Batches expiring within 90 days"
          icon={CalendarClock}
          color="emerald"
        />
      </div>

      {/* Inventory valuation */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-violet-400/15 bg-gradient-to-br from-violet-500/15 to-indigo-500/5 p-5">
          <div className="flex items-center gap-2 text-sm text-white/55">
            <Boxes size={17} />
            Inventory selling value
          </div>
          <p className="mt-3 text-2xl font-bold text-white sm:text-3xl">
            {formatCurrency(summary.sellingValue)}
          </p>
          <p className="mt-1 text-xs text-white/40">
            Value of current stock at selling prices
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center gap-2 text-sm text-white/55">
            <Package size={17} />
            Inventory cost value
          </div>
          <p className="mt-3 text-2xl font-bold text-white sm:text-3xl">
            {formatCurrency(summary.costValue)}
          </p>
          <p className="mt-1 text-xs text-white/40">
            Value of current stock at purchase prices
          </p>
        </div>
      </div>

      {/* Medicine catalogue */}
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] shadow-xl shadow-black/10">
        <div className="flex flex-col gap-4 border-b border-white/10 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-semibold text-white">Medicine catalogue</h2>
            <p className="mt-1 text-xs text-white/40">
              Browse and manage your pharmacy products.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-0 sm:w-64">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search medicine, SKU, batch..."
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-violet-400/60"
              />
            </div>

            <div className="relative">
              <SlidersHorizontal
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
              />
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="w-full appearance-none rounded-xl border border-white/10 bg-[#151c2b] py-2.5 pl-9 pr-9 text-sm text-white/75 outline-none focus:border-violet-400/60 sm:w-48"
              >
                <option value="All Categories">All Categories</option>
                {medicineCategories.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40"
              />
            </div>

            <select
              value={stockFilter}
              onChange={(event) => setStockFilter(event.target.value)}
              className="rounded-xl border border-white/10 bg-[#151c2b] px-3 py-2.5 text-sm text-white/75 outline-none focus:border-violet-400/60"
            >
              <option value="All Stock">All Stock</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-white/[0.025]">
              <tr className="text-xs uppercase tracking-wider text-white/35">
                <th className="px-5 py-4 font-medium">Medicine</th>
                <th className="px-5 py-4 font-medium">Category</th>
                <th className="px-5 py-4 font-medium">Stock</th>
                <th className="px-5 py-4 font-medium">Purchase price</th>
                <th className="px-5 py-4 font-medium">Selling price</th>
                <th className="px-5 py-4 font-medium">Stock value</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium">Details</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/[0.06]">
              {loading ? (
                <tr>
                  <td colSpan="8">
                    <LoadingRows />
                  </td>
                </tr>
              ) : paginatedMedicines.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-5 py-16 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-white/40">
                      <Search size={22} />
                    </div>
                    <p className="mt-3 font-medium text-white">
                      No medicines found
                    </p>
                    <p className="mt-1 text-sm text-white/40">
                      Try changing your search or filters.
                    </p>
                    <button
                      onClick={resetFilters}
                      className="mt-4 inline-flex items-center gap-2 text-sm text-violet-300 hover:text-violet-200"
                    >
                      <RefreshCw size={14} />
                      Clear filters
                    </button>
                  </td>
                </tr>
              ) : (
                paginatedMedicines.map((medicine) => {
                  const stock = getMedicineStock(medicine);
                  const status = getStockStatus(medicine);
                  const expanded = expandedId === medicine.id;

                  return (
                    <tbody key={medicine.id} className="contents">
                      <tr className="transition hover:bg-white/[0.025]">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                              <Pill size={19} />
                            </div>
                            <div>
                              <p className="font-medium text-white">
                                {medicine.name}
                              </p>
                              <p className="mt-0.5 text-xs text-white/40">
                                {medicine.strength} · {medicine.dosageForm} · {medicine.sku}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-white/60">
                          {medicine.category}
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-semibold text-white">
                            {stock.toLocaleString()}
                          </p>
                          <p className="mt-0.5 text-xs text-white/35">
                            Reorder at {medicine.reorderLevel}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm text-white/60">
                          {formatCurrency(medicine.purchasePrice)}
                        </td>

                        <td className="px-5 py-4 text-sm text-white/60">
                          {formatCurrency(medicine.sellingPrice)}
                        </td>

                        <td className="px-5 py-4 text-sm font-medium text-white">
                          {formatCurrency(getMedicineValue(medicine))}
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge status={status} />
                        </td>

                        <td className="px-5 py-4">
                          <button
                            onClick={() =>
                              setExpandedId(expanded ? null : medicine.id)
                            }
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-violet-300 transition hover:bg-violet-400/10"
                          >
                            {expanded ? "Hide" : "Batches"}
                            <ChevronDown
                              size={14}
                              className={`transition ${expanded ? "rotate-180" : ""}`}
                            />
                          </button>
                        </td>
                      </tr>

                      {expanded && (
                        <tr>
                          <td colSpan="8" className="bg-white/[0.025] px-5 py-4">
                            <div className="mb-3 flex flex-wrap justify-between gap-2">
                              <div>
                                <p className="text-sm font-semibold text-white">
                                  Batch information
                                </p>
                                <p className="mt-1 text-xs text-white/40">
                                  {medicine.manufacturer || "Manufacturer not specified"}
                                </p>
                              </div>
                              <span className="text-xs text-white/40">
                                {medicine.batches.length} batch(es)
                              </span>
                            </div>

                            <div className="overflow-x-auto">
                              <table className="w-full min-w-[500px] text-left">
                                <thead>
                                  <tr className="text-xs text-white/35">
                                    <th className="py-2 pr-4 font-medium">Batch number</th>
                                    <th className="py-2 pr-4 font-medium">Quantity</th>
                                    <th className="py-2 pr-4 font-medium">Expiry date</th>
                                    <th className="py-2 font-medium">Expiry status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {medicine.batches.map((batch) => (
                                    <tr key={batch.batchNumber} className="border-t border-white/[0.06] text-sm">
                                      <td className="py-3 pr-4 text-white/75">{batch.batchNumber}</td>
                                      <td className="py-3 pr-4 text-white/75">{batch.quantity.toLocaleString()}</td>
                                      <td className="py-3 pr-4 text-white/55">
                                        {new Date(`${batch.expiryDate}T00:00:00`).toLocaleDateString("en-GB")}
                                      </td>
                                      <td className="py-3">
                                        <ExpiryBadge date={batch.expiryDate} />
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filteredMedicines.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-white/40">
              Showing{" "}
              {Math.min((currentPage - 1) * PAGE_SIZE + 1, filteredMedicines.length)}
              {" "}to{" "}
              {Math.min(currentPage * PAGE_SIZE, filteredMedicines.length)}
              {" "}of {filteredMedicines.length} medicines
            </p>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((page) => page - 1)}
                className="rounded-lg border border-white/10 p-2 text-white/60 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeft size={17} />
              </button>

              <span className="px-3 text-xs text-white/60">
                Page {currentPage} of {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((page) => page + 1)}
                className="rounded-lg border border-white/10 p-2 text-white/60 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        )}
      </section>

      <MedicineModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleAddMedicine}
      />
    </div>
  );
}
