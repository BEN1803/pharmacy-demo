"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Search,
  Plus,
  Users,
  UserCheck,
  CalendarOff,
  TrendingUp,
  Pencil,
  Trash2,
  X,
  Save,
  Filter,
  AlertCircle,
  UserRound,
} from "lucide-react";

import { initialEmployees, employeeRoles } from "@/data/employees";

const STORAGE_KEY = "mediflow_employees";

const emptyForm = {
  name: "",
  role: "Pharmacist",
  department: "Pharmacy",
  email: "",
  phone: "",
  shift: "Morning",
  status: "Active",
  joinDate: new Date().toISOString().slice(0, 10),
};

const formatMoney = (amount) =>
  new Intl.NumberFormat("en-TZ", {
    style: "currency",
    currency: "TZS",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getInitials = (name) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

export default function EmployeesPageContent() {
  const [employees, setEmployees] = useState(initialEmployees);
  const [loaded, setLoaded] = useState(false);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Restore saved employees.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setEmployees(parsed);
        }
      }
    } catch (err) {
      console.error("Could not load employees:", err);
    } finally {
      setLoaded(true);
    }
  }, []);

  // Persist employees.
  useEffect(() => {
    if (!loaded) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
    } catch (err) {
      console.error("Could not save employees:", err);
    }
  }, [employees, loaded]);

  const stats = useMemo(() => {
    const active = employees.filter((employee) => employee.status === "Active").length;
    const onLeave = employees.filter((employee) => employee.status === "On Leave").length;
    const sales = employees.reduce((sum, employee) => sum + Number(employee.sales || 0), 0);

    return { total: employees.length, active, onLeave, sales };
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();

    return employees.filter((employee) => {
      const matchesSearch =
        !query ||
        employee.name.toLowerCase().includes(query) ||
        employee.email.toLowerCase().includes(query) ||
        employee.phone.toLowerCase().includes(query) ||
        employee.department.toLowerCase().includes(query);

      const matchesRole = roleFilter === "All" || employee.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [employees, search, roleFilter]);

  const openAddModal = () => {
    setEditingEmployee(null);
    setForm({ ...emptyForm, joinDate: new Date().toISOString().slice(0, 10) });
    setError("");
    setModalOpen(true);
  };

  const openEditModal = (employee) => {
    setEditingEmployee(employee);

    setForm({
      name: employee.name || "",
      role: employee.role || "Pharmacist",
      department: employee.department || "",
      email: employee.email || "",
      phone: employee.phone || "",
      shift: employee.shift || "Morning",
      status: employee.status || "Active",
      joinDate: employee.joinDate || "",
    });

    setError("");
    setModalOpen(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    if (!form.name.trim() || !form.phone.trim() || !form.email.trim()) {
      setError("Name, email and phone number are required.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    const duplicateEmail = employees.some(
      (employee) =>
        employee.email.toLowerCase() === form.email.trim().toLowerCase() &&
        employee.id !== editingEmployee?.id
    );

    if (duplicateEmail) {
      setError("Another employee already uses this email address.");
      return;
    }

    setSaving(true);

    if (editingEmployee) {
      setEmployees((previous) =>
        previous.map((employee) =>
          employee.id === editingEmployee.id
            ? {
                ...employee,
                ...form,
                name: form.name.trim(),
                email: form.email.trim(),
                phone: form.phone.trim(),
                department: form.department.trim() || "Pharmacy",
              }
            : employee
        )
      );
    } else {
      const newEmployee = {
        id: `EMP-${Date.now().toString().slice(-6)}`,
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        department: form.department.trim() || "Pharmacy",
        sales: 0,
        performance: 0,
      };

      setEmployees((previous) => [newEmployee, ...previous]);
    }

    setSaving(false);
    setModalOpen(false);
    setEditingEmployee(null);
    setForm(emptyForm);
  };

  const deleteEmployee = (id) => {
    setEmployees((previous) => previous.filter((employee) => employee.id !== id));
    setDeletingId(null);
  };

  return (
    <div className="space-y-7 pb-10">
      {/* Heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs text-muted">
            <span>Management</span>
            <span>/</span>
            <span className="text-violet-300">Employees</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Employee Directory
          </h1>

          <p className="mt-2 text-sm text-muted">
            Manage staff profiles, shifts and performance for your pharmacy.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:-translate-y-0.5"
        >
          <Plus size={18} />
          Add Employee
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Employees" value={stats.total} icon={Users} color="violet" />
        <StatCard label="Active Today" value={stats.active} icon={UserCheck} color="green" />
        <StatCard label="On Leave" value={stats.onLeave} icon={CalendarOff} color="amber" />
        <StatCard
          label="Sales Generated"
          value={formatMoney(stats.sales)}
          icon={TrendingUp}
          color="cyan"
        />
      </div>

      {/* Directory */}
      <section className="glass-panel overflow-hidden rounded-2xl">
        <div className="flex flex-col gap-4 border-b border-line p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-semibold text-ink">Team Members</h2>
            <p className="mt-1 text-xs text-muted">
              {filteredEmployees.length} of {employees.length} employees
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, email, phone..."
                className="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-4 text-sm text-ink outline-none placeholder:text-muted focus:border-violet-500/50 sm:w-64"
              />
            </div>

            <div className="relative">
              <Filter
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />

              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                className="w-full appearance-none rounded-xl border border-line bg-elevated py-2.5 pl-9 pr-8 text-sm text-ink-soft outline-none focus:border-violet-500/50 sm:w-48"
              >
                <option value="All">All roles</option>
                {employeeRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[900px] text-left">
            <thead>
              <tr className="border-b border-line bg-surface-soft text-[10px] uppercase tracking-wider text-muted">
                <th className="px-5 py-4 font-semibold">Employee</th>
                <th className="px-5 py-4 font-semibold">Role</th>
                <th className="px-5 py-4 font-semibold">Shift</th>
                <th className="px-5 py-4 font-semibold">Joined</th>
                <th className="px-5 py-4 font-semibold">Sales</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-line">
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="transition hover:bg-hover">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/70 to-cyan-500/70 text-xs font-bold text-white">
                        {getInitials(employee.name)}
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink">{employee.name}</p>
                        <p className="mt-0.5 truncate text-[11px] text-muted">
                          {employee.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <p className="text-sm text-ink-soft">{employee.role}</p>
                    <p className="mt-0.5 text-[11px] text-muted">{employee.department}</p>
                  </td>

                  <td className="px-5 py-4 text-sm text-ink-soft">{employee.shift}</td>

                  <td className="px-5 py-4 text-sm text-muted">
                    {formatDate(employee.joinDate)}
                  </td>

                  <td className="px-5 py-4 text-sm font-semibold text-ink">
                    {formatMoney(employee.sales)}
                  </td>

                  <td className="px-5 py-4">
                    <StatusBadge status={employee.status} />
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-1.5">
                      <ActionButton title="Edit employee" onClick={() => openEditModal(employee)}>
                        <Pencil size={16} />
                      </ActionButton>

                      <ActionButton
                        title="Remove employee"
                        danger
                        onClick={() => setDeletingId(employee.id)}
                      >
                        <Trash2 size={16} />
                      </ActionButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredEmployees.length === 0 && <EmptyState onAdd={openAddModal} />}
        </div>

        {/* Mobile cards */}
        <div className="space-y-3 p-4 md:hidden">
          {filteredEmployees.map((employee) => (
            <div
              key={employee.id}
              className="rounded-xl border border-line bg-surface-soft p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/70 to-cyan-500/70 text-xs font-bold text-white">
                    {getInitials(employee.name)}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-ink">{employee.name}</p>
                    <p className="mt-0.5 text-xs text-muted">{employee.role}</p>
                  </div>
                </div>

                <StatusBadge status={employee.status} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-muted">Shift</p>
                  <p className="mt-1 text-ink-soft">{employee.shift}</p>
                </div>

                <div>
                  <p className="text-muted">Joined</p>
                  <p className="mt-1 text-ink-soft">{formatDate(employee.joinDate)}</p>
                </div>

                <div className="col-span-2">
                  <p className="text-muted">Sales generated</p>
                  <p className="mt-1 font-semibold text-ink">
                    {formatMoney(employee.sales)}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex gap-2 border-t border-line pt-3">
                <button
                  onClick={() => openEditModal(employee)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-line py-2 text-xs text-ink-soft hover:bg-hover"
                >
                  <Pencil size={14} />
                  Edit
                </button>

                <button
                  onClick={() => setDeletingId(employee.id)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-rose-400/20 py-2 text-xs text-rose-300 hover:bg-rose-500/10"
                >
                  <Trash2 size={14} />
                  Remove
                </button>
              </div>
            </div>
          ))}

          {filteredEmployees.length === 0 && <EmptyState onAdd={openAddModal} />}
        </div>
      </section>

      {/* Add / edit modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setModalOpen(false);
          }}
        >
          <div className="glass-panel max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-line shadow-2xl">
            <div className="flex items-center justify-between border-b border-line p-5">
              <div>
                <h2 className="font-semibold text-ink">
                  {editingEmployee ? "Edit Employee" : "Add Employee"}
                </h2>
                <p className="mt-1 text-xs text-muted">
                  Keep staff records and shift assignments up to date.
                </p>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-2 text-muted hover:bg-hover hover:text-ink"
                aria-label="Close employee form"
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

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Full name *"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Neema Kimaro"
                />

                <Field
                  label="Email *"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="name@mediflow.demo"
                />

                <SelectField
                  label="Role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  options={employeeRoles}
                />

                <Field
                  label="Department"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  placeholder="e.g. Pharmacy"
                />

                <Field
                  label="Phone *"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+255 7xx xxx xxx"
                />

                <SelectField
                  label="Shift"
                  name="shift"
                  value={form.shift}
                  onChange={handleChange}
                  options={["Morning", "Evening", "Night"]}
                />

                <SelectField
                  label="Status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  options={["Active", "On Leave", "Inactive"]}
                />

                <Field
                  label="Join date"
                  name="joinDate"
                  type="date"
                  value={form.joinDate}
                  onChange={handleChange}
                />
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-line px-5 py-3 text-sm font-medium text-ink-soft hover:bg-hover"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                >
                  <Save size={16} />
                  {editingEmployee ? "Save Changes" : "Add Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deletingId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-2xl border border-line p-6 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-300">
                <AlertCircle size={19} />
              </div>

              <div>
                <h2 className="font-semibold text-ink">Remove employee?</h2>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {employees.find((employee) => employee.id === deletingId)?.name} will be
                  removed from the directory. This cannot be undone.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => setDeletingId(null)}
                className="rounded-xl border border-line px-5 py-2.5 text-sm font-medium text-ink-soft hover:bg-hover"
              >
                Keep employee
              </button>

              <button
                onClick={() => deleteEmployee(deletingId)}
                className="rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-500"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  const colors = {
    violet: "bg-violet-500/10 text-violet-300 border-violet-500/10",
    cyan: "bg-cyan-500/10 text-cyan-300 border-cyan-500/10",
    amber: "bg-amber-500/10 text-amber-300 border-amber-500/10",
    green: "bg-emerald-500/10 text-emerald-300 border-emerald-500/10",
  };

  return (
    <div className="glass-card rounded-2xl border border-line p-5 transition hover:-translate-y-1 hover:border-violet-500/20">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted">{label}</p>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl border ${colors[color]}`}
        >
          <Icon size={19} />
        </div>
      </div>

      <p className="mt-4 break-words text-xl font-bold text-ink sm:text-2xl">{value}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Active: "bg-emerald-500/10 text-emerald-300 border-emerald-400/10",
    "On Leave": "bg-amber-500/10 text-amber-300 border-amber-400/10",
    Inactive: "bg-gray-500/10 text-ink-soft border-gray-400/10",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${
        styles[status] || styles.Inactive
      }`}
    >
      {status}
    </span>
  );
}

function Field({ label, name, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-ink-soft">{label}</label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink outline-none placeholder:text-muted focus:border-violet-500/50"
      />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-ink-soft">{label}</label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-line bg-elevated px-4 py-3 text-sm text-ink outline-none focus:border-violet-500/50"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function ActionButton({ children, title, onClick, danger }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`rounded-lg border border-line p-2 transition ${
        danger
          ? "text-muted hover:border-rose-400/20 hover:bg-rose-500/10 hover:text-rose-300"
          : "text-muted hover:border-violet-400/20 hover:bg-violet-500/10 hover:text-violet-300"
      }`}
    >
      {children}
    </button>
  );
}

function EmptyState({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface text-muted">
        <UserRound size={25} />
      </div>

      <h3 className="font-semibold text-ink">No employees found</h3>

      <p className="mt-2 max-w-sm text-xs leading-5 text-muted">
        Adjust your search or add a new team member to the directory.
      </p>

      <button
        onClick={onAdd}
        className="mt-5 flex items-center gap-2 rounded-xl bg-violet-500/15 px-4 py-2.5 text-xs font-semibold text-violet-300 transition hover:bg-violet-500/25"
      >
        <Plus size={15} />
        Add Employee
      </button>
    </div>
  );
}
