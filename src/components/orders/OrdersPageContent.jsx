"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Search,
  ClipboardList,
  Clock3,
  PackageCheck,
  Truck,
  Wallet,
  Eye,
  X,
  MapPin,
  Phone,
  CreditCard,
  Filter,
  ShoppingBag,
  ArrowRight,
  Ban,
  CircleCheck,
} from "lucide-react";

import { initialOrders, orderStatuses } from "@/data/orders";

const STORAGE_KEY = "mediflow_orders";

const formatMoney = (amount) =>
  new Intl.NumberFormat("en-TZ", {
    style: "currency",
    currency: "TZS",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

const formatDateTime = (value) => {
  if (!value) return "—";

  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const orderTotal = (order) =>
  (order.items || []).reduce(
    (total, item) => total + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

const nextStatus = {
  Pending: "Packed",
  Packed: "Out for Delivery",
  "Out for Delivery": "Delivered",
};

const advanceLabel = {
  Pending: "Mark as packed",
  Packed: "Send for delivery",
  "Out for Delivery": "Mark as delivered",
};

export default function OrdersPageContent() {
  const [orders, setOrders] = useState(initialOrders);
  const [loaded, setLoaded] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setOrders(parsed);
        }
      }
    } catch (err) {
      console.error("Could not load orders:", err);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch (err) {
      console.error("Could not save orders:", err);
    }
  }, [orders, loaded]);

  const stats = useMemo(() => {
    const pending = orders.filter((order) => order.status === "Pending").length;
    const inProgress = orders.filter((order) =>
      ["Packed", "Out for Delivery"].includes(order.status)
    ).length;
    const delivered = orders.filter((order) => order.status === "Delivered").length;
    const revenue = orders
      .filter((order) => order.status !== "Cancelled")
      .reduce((total, order) => total + orderTotal(order), 0);

    return { total: orders.length, pending, inProgress, delivered, revenue };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !query ||
        order.id.toLowerCase().includes(query) ||
        order.customer.toLowerCase().includes(query) ||
        order.phone.toLowerCase().includes(query);

      const matchesStatus = statusFilter === "All" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const updateStatus = (orderId, status) => {
    setOrders((previous) =>
      previous.map((order) => (order.id === orderId ? { ...order, status } : order))
    );

    setSelectedOrder((previous) =>
      previous && previous.id === orderId ? { ...previous, status } : previous
    );
  };

  return (
    <div className="space-y-7 pb-10">
      {/* Heading */}
      <div>
        <div className="mb-2 flex items-center gap-2 text-xs text-muted">
          <span>Management</span>
          <span>/</span>
          <span className="text-violet-300">Orders</span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Customer Orders
        </h1>

        <p className="mt-2 text-sm text-muted">
          Track online, phone and in-store orders from placement to delivery.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Orders" value={stats.total} icon={ClipboardList} color="violet" />
        <StatCard label="Pending" value={stats.pending} icon={Clock3} color="amber" />
        <StatCard label="In Progress" value={stats.inProgress} icon={Truck} color="cyan" />
        <StatCard label="Delivered" value={stats.delivered} icon={PackageCheck} color="green" />
      </div>

      {/* Revenue strip */}
      <div className="glass-card flex flex-col justify-between gap-4 rounded-2xl border border-line p-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
            <Wallet size={22} />
          </div>

          <div>
            <p className="text-xs text-muted">Order value (excluding cancelled)</p>
            <p className="mt-1 text-2xl font-bold text-ink">
              {formatMoney(stats.revenue)}
            </p>
          </div>
        </div>

        <p className="max-w-sm text-xs leading-5 text-muted">
          Orders are confirmed by phone or through the online store. Mark each order as packed,
          dispatched and delivered as it moves.
        </p>
      </div>

      {/* Order directory */}
      <section className="glass-panel overflow-hidden rounded-2xl">
        <div className="flex flex-col gap-4 border-b border-line p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-semibold text-ink">Order Queue</h2>
            <p className="mt-1 text-xs text-muted">
              {filteredOrders.length} orders shown
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
                placeholder="Search order or customer..."
                className="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-4 text-sm text-ink outline-none placeholder:text-muted focus:border-violet-500/50 sm:w-64"
              />
            </div>

            <div className="relative">
              <Filter
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full appearance-none rounded-xl border border-line bg-elevated py-2.5 pl-9 pr-8 text-sm text-ink-soft outline-none focus:border-violet-500/50 sm:w-48"
              >
                <option value="All">All statuses</option>
                {orderStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
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
                <th className="px-5 py-4 font-semibold">Order</th>
                <th className="px-5 py-4 font-semibold">Customer</th>
                <th className="px-5 py-4 font-semibold">Channel</th>
                <th className="px-5 py-4 font-semibold">Items</th>
                <th className="px-5 py-4 font-semibold">Total</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-line">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="transition hover:bg-hover">
                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-ink">{order.id}</p>
                    <p className="mt-1 text-[11px] text-muted">
                      {formatDateTime(order.placedAt)}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <p className="text-sm text-ink-soft">{order.customer}</p>
                    <p className="mt-0.5 text-[11px] text-muted">{order.phone}</p>
                  </td>

                  <td className="px-5 py-4 text-sm text-muted">{order.channel}</td>

                  <td className="px-5 py-4 text-sm text-ink-soft">
                    {order.items.length} items
                  </td>

                  <td className="px-5 py-4 text-sm font-semibold text-ink">
                    {formatMoney(orderTotal(order))}
                  </td>

                  <td className="px-5 py-4">
                    <OrderStatus status={order.status} />
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="rounded-lg border border-line p-2 text-muted transition hover:border-violet-400/20 hover:bg-violet-500/10 hover:text-violet-300"
                        title="View order"
                      >
                        <Eye size={16} />
                      </button>

                      {nextStatus[order.status] && (
                        <button
                          onClick={() => updateStatus(order.id, nextStatus[order.status])}
                          className="rounded-lg border border-line p-2 text-muted transition hover:border-emerald-400/20 hover:bg-emerald-500/10 hover:text-emerald-300"
                          title={advanceLabel[order.status]}
                        >
                          <ArrowRight size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredOrders.length === 0 && <EmptyState />}
        </div>

        {/* Mobile cards */}
        <div className="space-y-3 p-4 md:hidden">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="rounded-xl border border-line bg-surface-soft p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-ink">{order.id}</p>
                  <p className="mt-1 text-xs text-muted">{order.customer}</p>
                </div>

                <OrderStatus status={order.status} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-muted">Channel</p>
                  <p className="mt-1 text-ink-soft">{order.channel}</p>
                </div>

                <div>
                  <p className="text-muted">Items</p>
                  <p className="mt-1 text-ink-soft">{order.items.length}</p>
                </div>

                <div className="col-span-2">
                  <p className="text-muted">Total</p>
                  <p className="mt-1 font-semibold text-ink">
                    {formatMoney(orderTotal(order))}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex gap-2 border-t border-line pt-3">
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-line py-2 text-xs text-ink-soft hover:bg-hover"
                >
                  <Eye size={14} />
                  View
                </button>

                {nextStatus[order.status] && (
                  <button
                    onClick={() => updateStatus(order.id, nextStatus[order.status])}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-line py-2 text-xs text-emerald-300 hover:bg-emerald-500/10"
                  >
                    <ArrowRight size={14} />
                    {nextStatus[order.status]}
                  </button>
                )}
              </div>
            </div>
          ))}

          {filteredOrders.length === 0 && <EmptyState />}
        </div>
      </section>

      {/* Order details */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedOrder(null);
          }}
        >
          <div className="glass-panel max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-line shadow-2xl">
            <div className="flex items-start justify-between border-b border-line p-5">
              <div>
                <p className="text-xs text-muted">Order</p>
                <h2 className="mt-1 text-xl font-bold text-ink">{selectedOrder.id}</h2>
                <p className="mt-1 text-xs text-muted">
                  Placed {formatDateTime(selectedOrder.placedAt)}
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg p-2 text-muted hover:bg-hover hover:text-ink"
                aria-label="Close order details"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <OrderStatus status={selectedOrder.status} />

                <span className="text-xs text-muted">{selectedOrder.channel}</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <DetailItem icon={ShoppingBag} label="Customer" value={selectedOrder.customer} />
                <DetailItem icon={Phone} label="Phone" value={selectedOrder.phone} />
                <DetailItem
                  icon={MapPin}
                  label="Delivery address"
                  value={selectedOrder.deliveryAddress}
                />
                <DetailItem
                  icon={CreditCard}
                  label="Payment method"
                  value={selectedOrder.payment}
                />
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold text-ink">Order items</h3>

                <div className="overflow-hidden rounded-xl border border-line">
                  <table className="w-full text-left">
                    <thead className="bg-surface text-[10px] uppercase text-muted">
                      <tr>
                        <th className="px-4 py-3">Medicine</th>
                        <th className="px-4 py-3">Qty</th>
                        <th className="px-4 py-3 text-right">Amount</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-line">
                      {selectedOrder.items.map((item, index) => (
                        <tr key={`${item.name}-${index}`}>
                          <td className="px-4 py-3 text-xs text-ink-soft">{item.name}</td>
                          <td className="px-4 py-3 text-xs text-muted">{item.quantity}</td>
                          <td className="px-4 py-3 text-right text-xs font-semibold text-ink">
                            {formatMoney(Number(item.price) * Number(item.quantity))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="rounded-xl border border-line bg-surface-soft p-4">
                  <p className="text-xs font-semibold text-ink-soft">Notes</p>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {selectedOrder.notes}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between rounded-xl border border-line bg-surface-soft p-4">
                <p className="text-xs text-muted">Order total</p>
                <p className="text-2xl font-bold text-ink">
                  {formatMoney(orderTotal(selectedOrder))}
                </p>
              </div>

              {!["Delivered", "Cancelled"].includes(selectedOrder.status) && (
                <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:justify-between">
                  <button
                    onClick={() => updateStatus(selectedOrder.id, "Cancelled")}
                    className="flex items-center justify-center gap-2 rounded-xl border border-rose-400/20 px-4 py-3 text-sm font-medium text-rose-300 transition hover:bg-rose-500/10"
                  >
                    <Ban size={16} />
                    Cancel order
                  </button>

                  <button
                    onClick={() =>
                      updateStatus(selectedOrder.id, nextStatus[selectedOrder.status])
                    }
                    className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
                  >
                    <CheckIcon status={selectedOrder.status} />
                    {advanceLabel[selectedOrder.status]}
                  </button>
                </div>
              )}

              {selectedOrder.status === "Delivered" && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-400/15 bg-emerald-500/10 p-3 text-xs text-emerald-300">
                  <CircleCheck size={16} />
                  This order has been delivered successfully.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CheckIcon({ status }) {
  return status === "Out for Delivery" ? <PackageCheck size={16} /> : <ArrowRight size={16} />;
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

      <p className="mt-4 text-2xl font-bold text-ink">{value}</p>
    </div>
  );
}

function OrderStatus({ status }) {
  const styles = {
    Pending: "bg-amber-500/10 text-amber-300 border-amber-400/10",
    Packed: "bg-cyan-500/10 text-cyan-300 border-cyan-400/10",
    "Out for Delivery": "bg-violet-500/10 text-violet-300 border-violet-400/10",
    Delivered: "bg-emerald-500/10 text-emerald-300 border-emerald-400/10",
    Cancelled: "bg-rose-500/10 text-rose-300 border-rose-400/10",
  };

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-medium ${
        styles[status] || styles.Pending
      }`}
    >
      {status}
    </span>
  );
}

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-line bg-surface-soft p-3">
      <div className="mb-2 flex items-center gap-2 text-[11px] text-muted">
        <Icon size={14} />
        {label}
      </div>

      <p className="break-words text-sm font-medium text-ink">{value || "—"}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface text-muted">
        <ShoppingBag size={25} />
      </div>

      <h3 className="font-semibold text-ink">No orders found</h3>

      <p className="mt-2 max-w-sm text-xs leading-5 text-muted">
        Try a different search term or status filter to see more orders.
      </p>
    </div>
  );
}
