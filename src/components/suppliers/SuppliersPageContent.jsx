
"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Search,
  Plus,
  Truck,
  Users,
  Package,
  CheckCircle2,
  XCircle,
  MapPin,
  Phone,
  Mail,
  Pencil,
  Eye,
  X,
  Building2,
  UserRound,
  CalendarDays,
  FileText,
  Filter,
  Save,
} from "lucide-react";

const STORAGE_KEY = "mediflow_suppliers";

const initialSuppliers = [
  {
    id: "SUP-001",
    companyName: "Shelys Pharmaceuticals",
    contactPerson: "John Mwakyusa",
    phone: "+255 754 123 456",
    email: "sales@shelys.co.tz",
    location: "Dar es Salaam",
    address: "Plot 12, Industrial Area",
    suppliedProducts: [
      "Paracetamol 500mg",
      "Vitamin C 1000mg",
      "Loratadine 10mg",
    ],
    status: "Active",
    notes: "Main supplier for general medicines.",
    createdAt: "2026-01-15",
  },
  {
    id: "SUP-002",
    companyName: "Zenufa Laboratories",
    contactPerson: "Mary Joseph",
    phone: "+255 713 456 789",
    email: "orders@zenufa.co.tz",
    location: "Dar es Salaam",
    address: "Nyerere Road, Dar es Salaam",
    suppliedProducts: [
      "Amoxicillin 500mg",
    ],
    status: "Active",
    notes: "Supplies antibiotics.",
    createdAt: "2026-02-04",
  },
  {
    id: "SUP-003",
    companyName: "Tanzania Pharmaceutical Industries",
    contactPerson: "Peter Mushi",
    phone: "+255 765 222 111",
    email: "info@tpi.co.tz",
    location: "Arusha",
    address: "Arusha Industrial Area",
    suppliedProducts: [
      "Cetirizine 10mg",
      "Metformin 500mg",
    ],
    status: "Active",
    notes: "Regular supplier.",
    createdAt: "2026-02-20",
  },
  {
    id: "SUP-004",
    companyName: "Keko Pharmaceuticals",
    contactPerson: "Grace Charles",
    phone: "+255 712 888 222",
    email: "sales@keko.co.tz",
    location: "Dar es Salaam",
    address: "Keko, Temeke",
    suppliedProducts: [
      "Ibuprofen 400mg",
    ],
    status: "Active",
    notes: "Supplies pain relief products.",
    createdAt: "2026-03-08",
  },
  {
    id: "SUP-005",
    companyName: "Ajanta Pharma",
    contactPerson: "David Thomas",
    phone: "+255 742 555 333",
    email: "orders@ajantapharma.co.tz",
    location: "Dar es Salaam",
    address: "Dar es Salaam",
    suppliedProducts: [
      "Artemether + Lumefantrine 20mg/120mg",
    ],
    status: "Inactive",
    notes: "Currently not supplying the pharmacy.",
    createdAt: "2026-04-12",
  },
  {
    id: "SUP-006",
    companyName: "MedSource Tanzania",
    contactPerson: "Sarah Emmanuel",
    phone: "+255 786 111 444",
    email: "info@medsource.co.tz",
    location: "Mbeya",
    address: "Mbeya Business Centre",
    suppliedProducts: [
      "Medical consumables",
      "First aid supplies",
    ],
    status: "Active",
    notes: "Supplies selected medical consumables.",
    createdAt: "2026-05-01",
  },
];

const emptyForm = {
  companyName: "",
  contactPerson: "",
  phone: "",
  email: "",
  location: "",
  address: "",
  suppliedProducts: "",
  status: "Active",
  notes: "",
};

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(`${date}T00:00:00`).toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

export default function SuppliersPageContent() {
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [loaded, setLoaded] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [modalOpen, setModalOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [editingSupplier, setEditingSupplier] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load supplier records from localStorage.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setSuppliers(parsed);
        }
      }
    } catch (err) {
      console.error("Could not load suppliers:", err);
    } finally {
      setLoaded(true);
    }
  }, []);

  // Save supplier records whenever they change.
  useEffect(() => {
    if (!loaded) return;

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(suppliers)
      );
    } catch (err) {
      console.error("Could not save suppliers:", err);
    }
  }, [suppliers, loaded]);

  // Calculate dashboard statistics.
  const stats = useMemo(() => {
    const active = suppliers.filter(
      (supplier) => supplier.status === "Active"
    ).length;

    const inactive = suppliers.length - active;

    const products = suppliers.reduce(
      (total, supplier) =>
        total + (supplier.suppliedProducts?.length || 0),
      0
    );

    return {
      total: suppliers.length,
      active,
      inactive,
      products,
    };
  }, [suppliers]);

  // Apply search and status filters.
  const filteredSuppliers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return suppliers.filter((supplier) => {
      const matchesSearch =
        !query ||
        supplier.companyName.toLowerCase().includes(query) ||
        supplier.contactPerson.toLowerCase().includes(query) ||
        supplier.phone.toLowerCase().includes(query) ||
        supplier.email.toLowerCase().includes(query) ||
        supplier.location.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        supplier.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [suppliers, search, statusFilter]);

  // Open the form for a new supplier.
  const openAddModal = () => {
    setEditingSupplier(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  };

  // Open the form with existing supplier information.
  const openEditModal = (supplier) => {
    setEditingSupplier(supplier);

    setForm({
      companyName: supplier.companyName || "",
      contactPerson: supplier.contactPerson || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      location: supplier.location || "",
      address: supplier.address || "",
      suppliedProducts: (
        supplier.suppliedProducts || []
      ).join(", "),
      status: supplier.status || "Active",
      notes: supplier.notes || "",
    });

    setError("");
    setModalOpen(true);
  };

  // Update individual form fields.
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Validate and save a supplier.
  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    if (
      !form.companyName.trim() ||
      !form.contactPerson.trim() ||
      !form.phone.trim() ||
      !form.location.trim()
    ) {
      setError(
        "Please complete the company name, contact person, phone and location."
      );
      return;
    }

    if (
      form.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      setError("Please enter a valid email address.");
      return;
    }

    setSaving(true);

    const suppliedProducts = form.suppliedProducts
      .split(",")
      .map((product) => product.trim())
      .filter(Boolean);

    const supplierData = {
      ...form,
      companyName: form.companyName.trim(),
      contactPerson: form.contactPerson.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      location: form.location.trim(),
      address: form.address.trim(),
      suppliedProducts,
      notes: form.notes.trim(),
    };

    if (editingSupplier) {
      setSuppliers((previous) =>
        previous.map((supplier) =>
          supplier.id === editingSupplier.id
            ? {
                ...supplier,
                ...supplierData,
              }
            : supplier
        )
      );
    } else {
      const newSupplier = {
        ...supplierData,
        id: `SUP-${Date.now().toString().slice(-8)}`,
        createdAt: new Date().toISOString().slice(0, 10),
      };

      setSuppliers((previous) => [
        newSupplier,
        ...previous,
      ]);
    }

    setSaving(false);
    setModalOpen(false);
    setEditingSupplier(null);
    setForm(emptyForm);
  };

  // Change supplier availability without deleting its history.
  const toggleSupplierStatus = (supplier) => {
    const nextStatus =
      supplier.status === "Active" ? "Inactive" : "Active";

    setSuppliers((previous) =>
      previous.map((item) =>
        item.id === supplier.id
          ? { ...item, status: nextStatus }
          : item
      )
    );

    if (selectedSupplier?.id === supplier.id) {
      setSelectedSupplier((previous) => ({
        ...previous,
        status: nextStatus,
      }));
    }
  };

  const openDetails = (supplier) => {
    setSelectedSupplier(supplier);
    setDetailsOpen(true);
  };

  const closeDetails = () => {
    setDetailsOpen(false);
    setSelectedSupplier(null);
  };

  if (!loaded) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-9 w-56 rounded-lg bg-white/10" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-28 rounded-2xl bg-white/[0.05]"
            />
          ))}
        </div>
        <div className="h-80 rounded-2xl bg-white/[0.05]" />
      </div>
    );
  }

  return (
    <div className="space-y-7 pb-10">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs text-muted">
            <span>Management</span>
            <span>/</span>
            <span className="text-violet-300">Suppliers</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Suppliers
          </h1>

          <p className="mt-2 text-sm text-muted">
            Manage your pharmacy suppliers and their supplied products.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:-translate-y-0.5 hover:shadow-violet-500/30"
        >
          <Plus size={18} />
          Add Supplier
        </button>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Suppliers"
          value={stats.total}
          icon={Truck}
          color="violet"
          description="Registered suppliers"
        />

        <StatCard
          label="Active Suppliers"
          value={stats.active}
          icon={CheckCircle2}
          color="green"
          description="Currently available"
        />

        <StatCard
          label="Inactive Suppliers"
          value={stats.inactive}
          icon={XCircle}
          color="rose"
          description="Not currently supplying"
        />

        <StatCard
          label="Supplied Products"
          value={stats.products}
          icon={Package}
          color="cyan"
          description="Supplier product entries"
        />
      </div>

      {/* Supplier directory */}
      <section className="glass-panel overflow-hidden rounded-2xl">
        <div className="flex flex-col gap-4 border-b border-white/10 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-semibold text-white">
              Supplier Directory
            </h2>
            <p className="mt-1 text-xs text-muted">
              {filteredSuppliers.length} supplier
              {filteredSuppliers.length === 1 ? "" : "s"} found
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search suppliers..."
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-violet-500/50 sm:w-64"
              />
            </div>

            <div className="relative">
              <Filter
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                className="w-full appearance-none rounded-xl border border-white/10 bg-[#17172b] py-2.5 pl-9 pr-8 text-sm text-gray-300 outline-none focus:border-violet-500/50 sm:w-40"
              >
                <option value="All">All statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[850px] text-left">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.025] text-[10px] uppercase tracking-wider text-gray-500">
                <th className="px-5 py-4 font-semibold">
                  Supplier
                </th>
                <th className="px-5 py-4 font-semibold">
                  Contact
                </th>
                <th className="px-5 py-4 font-semibold">
                  Location
                </th>
                <th className="px-5 py-4 font-semibold">
                  Products
                </th>
                <th className="px-5 py-4 font-semibold">
                  Status
                </th>
                <th className="px-5 py-4 text-right font-semibold">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/[0.06]">
              {filteredSuppliers.map((supplier) => (
                <tr
                  key={supplier.id}
                  className="transition hover:bg-white/[0.025]"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-400/10 bg-violet-500/10 text-violet-300">
                        <Building2 size={18} />
                      </div>

                      <div className="min-w-0">
                        <p className="max-w-[220px] truncate text-sm font-semibold text-white">
                          {supplier.companyName}
                        </p>
                        <p className="mt-1 text-[11px] text-muted">
                          {supplier.id}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <p className="text-sm text-gray-300">
                      {supplier.contactPerson}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {supplier.phone}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-gray-300">
                      <MapPin size={14} className="text-gray-500" />
                      {supplier.location}
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span className="rounded-lg border border-cyan-400/10 bg-cyan-500/10 px-2.5 py-1 text-xs font-medium text-cyan-300">
                      {supplier.suppliedProducts.length} products
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <StatusBadge status={supplier.status} />
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-1.5">
                      <ActionButton
                        title="View supplier"
                        onClick={() => openDetails(supplier)}
                      >
                        <Eye size={16} />
                      </ActionButton>

                      <ActionButton
                        title="Edit supplier"
                        onClick={() => openEditModal(supplier)}
                      >
                        <Pencil size={16} />
                      </ActionButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredSuppliers.length === 0 && (
            <EmptyState onAdd={openAddModal} />
          )}
        </div>

        {/* Mobile supplier cards */}
        <div className="space-y-3 p-4 md:hidden">
          {filteredSuppliers.map((supplier) => (
            <div
              key={supplier.id}
              className="rounded-xl border border-white/10 bg-white/[0.025] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                    <Building2 size={18} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {supplier.companyName}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {supplier.id}
                    </p>
                  </div>
                </div>

                <StatusBadge status={supplier.status} />
              </div>

              <div className="mt-4 space-y-2 text-xs text-gray-400">
                <p className="flex items-center gap-2">
                  <UserRound size={14} />
                  {supplier.contactPerson}
                </p>
                <p className="flex items-center gap-2">
                  <Phone size={14} />
                  {supplier.phone}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin size={14} />
                  {supplier.location}
                </p>
                <p className="flex items-center gap-2">
                  <Package size={14} />
                  {supplier.suppliedProducts.length} supplied products
                </p>
              </div>

              <div className="mt-4 flex gap-2 border-t border-white/10 pt-3">
                <button
                  onClick={() => openDetails(supplier)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 py-2 text-xs text-gray-300 hover:bg-white/5"
                >
                  <Eye size={14} />
                  View
                </button>

                <button
                  onClick={() => openEditModal(supplier)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 py-2 text-xs text-gray-300 hover:bg-white/5"
                >
                  <Pencil size={14} />
                  Edit
                </button>
              </div>
            </div>
          ))}

          {filteredSuppliers.length === 0 && (
            <EmptyState onAdd={openAddModal} />
          )}
        </div>
      </section>

      {/* Add / Edit Supplier Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setModalOpen(false);
            }
          }}
        >
          <div className="glass-panel max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#17172b] px-5 py-4">
              <div>
                <h2 className="font-semibold text-white">
                  {editingSupplier ? "Edit Supplier" : "Add New Supplier"}
                </h2>
                <p className="mt-1 text-xs text-muted">
                  Enter the supplier's business and contact information.
                </p>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white"
                aria-label="Close supplier form"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-5">
              {error && (
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                  {error}
                </div>
              )}

              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-violet-300">
                  Business information
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    label="Company name *"
                    name="companyName"
                    value={form.companyName}
                    onChange={handleChange}
                    placeholder="e.g. Shelys Pharmaceuticals"
                  />

                  <FormField
                    label="Contact person *"
                    name="contactPerson"
                    value={form.contactPerson}
                    onChange={handleChange}
                    placeholder="Full name"
                  />

                  <FormField
                    label="Phone number *"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+255 7XX XXX XXX"
                  />

                  <FormField
                    label="Email address"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="supplier@example.com"
                  />

                  <FormField
                    label="City / Location *"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="e.g. Mbeya"
                  />

                  <FormField
                    label="Physical address"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Street or business area"
                  />
                </div>
              </div>

              <div className="border-t border-white/10 pt-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-violet-300">
                  Supply information
                </p>

                <label className="mb-2 block text-xs font-medium text-gray-300">
                  Products supplied
                </label>

                <textarea
                  name="suppliedProducts"
                  value={form.suppliedProducts}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Separate product names with commas, e.g. Paracetamol 500mg, Vitamin C 1000mg"
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-violet-500/50"
                />

                <p className="mt-2 text-[11px] text-muted">
                  You can manage product relationships in a later purchasing stage.
                </p>

                <div className="mt-4">
                  <label className="mb-2 block text-xs font-medium text-gray-300">
                    Supplier status
                  </label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-[#17172b] px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-white/10 pt-5">
                <label className="mb-2 block text-xs font-medium text-gray-300">
                  Internal notes
                </label>

                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Additional information about this supplier..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-violet-500/50"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-gray-300 transition hover:bg-white/5"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                >
                  <Save size={16} />
                  {saving
                    ? "Saving..."
                    : editingSupplier
                      ? "Save Changes"
                      : "Register Supplier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Supplier Details Modal */}
      {detailsOpen && selectedSupplier && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeDetails();
            }
          }}
        >
          <div className="glass-panel max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-white/10 shadow-2xl">
            <div className="flex items-start justify-between border-b border-white/10 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                  <Building2 size={23} />
                </div>

                <div>
                  <h2 className="font-semibold text-white">
                    {selectedSupplier.companyName}
                  </h2>
                  <p className="mt-1 text-xs text-muted">
                    {selectedSupplier.id}
                  </p>
                </div>
              </div>

              <button
                onClick={closeDetails}
                className="rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white"
                aria-label="Close supplier details"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <StatusBadge status={selectedSupplier.status} />

                <button
                  onClick={() => toggleSupplierStatus(selectedSupplier)}
                  className="text-xs font-medium text-violet-300 hover:text-violet-200"
                >
                  {selectedSupplier.status === "Active"
                    ? "Deactivate supplier"
                    : "Activate supplier"}
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <DetailItem
                  icon={UserRound}
                  label="Contact person"
                  value={selectedSupplier.contactPerson}
                />

                <DetailItem
                  icon={Phone}
                  label="Phone number"
                  value={selectedSupplier.phone}
                />

                <DetailItem
                  icon={Mail}
                  label="Email address"
                  value={selectedSupplier.email || "Not provided"}
                />

                <DetailItem
                  icon={MapPin}
                  label="Location"
                  value={selectedSupplier.location}
                />

                <DetailItem
                  icon={Building2}
                  label="Physical address"
                  value={selectedSupplier.address || "Not provided"}
                />

                <DetailItem
                  icon={CalendarDays}
                  label="Date registered"
                  value={formatDate(selectedSupplier.createdAt)}
                />
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">
                    Supplied products
                  </h3>
                  <span className="text-xs text-muted">
                    {selectedSupplier.suppliedProducts.length} products
                  </span>
                </div>

                {selectedSupplier.suppliedProducts.length > 0 ? (
                  <div className="space-y-2">
                    {selectedSupplier.suppliedProducts.map(
                      (product, index) => (
                        <div
                          key={`${product}-${index}`}
                          className="flex items-center gap-2 text-sm text-gray-300"
                        >
                          <Package
                            size={15}
                            className="text-cyan-300"
                          />
                          {product}
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted">
                    No products have been recorded for this supplier.
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
                <div className="mb-2 flex items-center gap-2">
                  <FileText size={15} className="text-violet-300" />
                  <h3 className="text-sm font-semibold text-white">
                    Internal notes
                  </h3>
                </div>

                <p className="text-sm leading-6 text-gray-400">
                  {selectedSupplier.notes || "No notes recorded."}
                </p>
              </div>

              <button
                onClick={() => {
                  closeDetails();
                  openEditModal(selectedSupplier);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-500/15 py-3 text-sm font-semibold text-violet-300 transition hover:bg-violet-500/25"
              >
                <Pencil size={16} />
                Edit Supplier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable dashboard statistic card.
function StatCard({
  label,
  value,
  icon: Icon,
  color,
  description,
}) {
  const colors = {
    violet: "bg-violet-500/10 text-violet-300 border-violet-500/10",
    green: "bg-emerald-500/10 text-emerald-300 border-emerald-500/10",
    rose: "bg-rose-500/10 text-rose-300 border-rose-500/10",
    cyan: "bg-cyan-500/10 text-cyan-300 border-cyan-500/10",
  };

  return (
    <div className="glass-card rounded-2xl border border-white/[0.07] p-5 transition hover:-translate-y-1 hover:border-violet-500/20">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted">{label}</p>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl border ${colors[color]}`}
        >
          <Icon size={19} />
        </div>
      </div>

      <p className="mt-4 text-2xl font-bold tracking-tight text-white">
        {value}
      </p>

      <p className="mt-1 text-[11px] text-muted">
        {description}
      </p>
    </div>
  );
}

// Reusable supplier status label.
function StatusBadge({ status }) {
  const active = status === "Active";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
        active
          ? "border border-emerald-400/10 bg-emerald-500/10 text-emerald-300"
          : "border border-gray-400/10 bg-gray-500/10 text-gray-400"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-emerald-400" : "bg-gray-500"
        }`}
      />
      {status}
    </span>
  );
}

// Reusable form input.
function FormField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-xs font-medium text-gray-300"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-violet-500/50"
      />
    </div>
  );
}

// Reusable supplier detail field.
function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
      <div className="mb-2 flex items-center gap-2 text-[11px] text-muted">
        <Icon size={14} />
        {label}
      </div>

      <p className="break-words text-sm font-medium text-gray-200">
        {value}
      </p>
    </div>
  );
}

// Reusable action button for the supplier table.
function ActionButton({ children, title, onClick }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="rounded-lg border border-white/10 p-2 text-gray-400 transition hover:border-violet-400/20 hover:bg-violet-500/10 hover:text-violet-300"
    >
      {children}
    </button>
  );
}

// Empty state shown when no supplier matches the filters.
function EmptyState({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] text-gray-500">
        <Truck size={25} />
      </div>

      <h3 className="font-semibold text-white">
        No suppliers found
      </h3>

      <p className="mt-2 max-w-sm text-xs leading-5 text-muted">
        Try changing your search or status filter, or register a new supplier.
      </p>

      <button
        onClick={onAdd}
        className="mt-5 flex items-center gap-2 rounded-xl bg-violet-500/15 px-4 py-2.5 text-xs font-semibold text-violet-300 transition hover:bg-violet-500/25"
      >
        <Plus size={15} />
        Add Supplier
      </button>
    </div>
  );
}
