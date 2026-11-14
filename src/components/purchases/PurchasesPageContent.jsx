
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  Plus,
  Search,
  ShoppingBasket,
  ClipboardList,
  Clock3,
  CheckCircle2,
  Truck,
  X,
  Trash2,
  Eye,
  Pencil,
  Package,
  PackageCheck,
  CalendarDays,
  Building2,
  Save,
  AlertCircle,
  Filter,
} from "lucide-react";

import { usePharmacy } from "@/context/PharmacyContext";
import ReceiveStockModal from "@/components/purchases/ReceiveStockModal";

const PURCHASE_STORAGE_KEY = "mediflow_purchase_orders";
const SUPPLIER_STORAGE_KEY = "mediflow_suppliers";

const emptyOrderForm = {
  supplierId: "",
  orderDate: new Date().toISOString().slice(0, 10),
  expectedDate: "",
  notes: "",
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

const getOrderStatus = (order) => {
  if (order.status === "Received") return "Received";
  if (order.status === "Partially Received") return "Partially Received";
  if (order.status === "Ordered") return "Ordered";

  return "Draft";
};

export default function PurchasesPageContent() {
  const {
    medicines,
    loaded: pharmacyLoaded,
    updateMedicine,
  } = usePharmacy();

  const [suppliers, setSuppliers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [modalOpen, setModalOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [editingOrder, setEditingOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [receivingOrder, setReceivingOrder] = useState(null);

  const [form, setForm] = useState(emptyOrderForm);
  const [orderItems, setOrderItems] = useState([]);

  const [saving, setSaving] = useState(false);
  const [receiving, setReceiving] = useState(false);
  const [error, setError] = useState("");

  // Load purchase orders and suppliers from localStorage.
  useEffect(() => {
    try {
      const savedOrders = localStorage.getItem(PURCHASE_STORAGE_KEY);
      const savedSuppliers = localStorage.getItem(SUPPLIER_STORAGE_KEY);

      if (savedOrders) {
        const parsedOrders = JSON.parse(savedOrders);

        if (Array.isArray(parsedOrders)) {
          setOrders(parsedOrders);
        }
      }

      if (savedSuppliers) {
        const parsedSuppliers = JSON.parse(savedSuppliers);

        if (Array.isArray(parsedSuppliers)) {
          setSuppliers(parsedSuppliers);
        }
      }
    } catch (err) {
      console.error("Could not load purchase data:", err);
    } finally {
      setLoaded(true);
    }
  }, []);

  // Persist purchase orders whenever they change.
  useEffect(() => {
    if (!loaded) return;

    try {
      localStorage.setItem(
        PURCHASE_STORAGE_KEY,
        JSON.stringify(orders)
      );
    } catch (err) {
      console.error("Could not save purchase orders:", err);
    }
  }, [orders, loaded]);

  // Calculate order statistics.
  const stats = useMemo(() => {
    const draft = orders.filter(
      (order) => order.status === "Draft"
    ).length;

    const pending = orders.filter(
      (order) =>
        order.status === "Ordered" ||
        order.status === "Partially Received"
    ).length;

    const received = orders.filter(
      (order) => order.status === "Received"
    ).length;

    const totalValue = orders.reduce(
      (total, order) => total + Number(order.total || 0),
      0
    );

    return {
      total: orders.length,
      draft,
      pending,
      received,
      totalValue,
    };
  }, [orders]);

  // Search and filter purchase orders.
  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !query ||
        String(order.orderNumber || "").toLowerCase().includes(query) ||
        String(order.supplierName || "").toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const calculateTotal = (items) =>
    items.reduce(
      (total, item) =>
        total +
        Number(item.quantity || 0) * Number(item.unitPrice || 0),
      0
    );

  // Start a new purchase order.
  const openCreateModal = () => {
    setEditingOrder(null);

    setForm({
      ...emptyOrderForm,
      orderDate: new Date().toISOString().slice(0, 10),
    });

    setOrderItems([]);
    setError("");
    setModalOpen(true);
  };

  // Edit an existing draft.
  const openEditModal = (order) => {
    if (order.status !== "Draft") return;

    setEditingOrder(order);

    setForm({
      supplierId: order.supplierId,
      orderDate: order.orderDate,
      expectedDate: order.expectedDate || "",
      notes: order.notes || "",
    });

    setOrderItems(
      order.items.map((item) => ({ ...item }))
    );

    setError("");
    setModalOpen(true);
  };

  // Add a medicine to the order.
  const addOrderItem = () => {
    const availableMedicines = medicines.filter(
      (medicine) =>
        !orderItems.some(
          (item) => String(item.medicineId) === String(medicine.id)
        )
    );

    if (availableMedicines.length === 0) {
      setError("All available medicines have already been added.");
      return;
    }

    const medicine = availableMedicines[0];

    setOrderItems((previous) => [
      ...previous,
      {
        medicineId: medicine.id,
        medicineName: medicine.name,
        sku: medicine.sku,
        quantity: 1,
        unitPrice: Number(medicine.purchasePrice || 0),
      },
    ]);

    setError("");
  };

  // Change the medicine selected for an order item.
  const changeMedicine = (index, medicineId) => {
    const medicine = medicines.find(
      (item) => String(item.id) === String(medicineId)
    );

    if (!medicine) return;

    setOrderItems((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              medicineId: medicine.id,
              medicineName: medicine.name,
              sku: medicine.sku,
              unitPrice: Number(medicine.purchasePrice || 0),
            }
          : item
      )
    );
  };

  // Update quantity or purchase price.
  const updateOrderItem = (index, field, value) => {
    setOrderItems((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, [field]: value }
          : item
      )
    );
  };

  // Remove a medicine from the order.
  const removeOrderItem = (index) => {
    setOrderItems((previous) =>
      previous.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  // Save a purchase order.
  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    if (!form.supplierId) {
      setError("Please select a supplier.");
      return;
    }

    if (!form.orderDate) {
      setError("Please select an order date.");
      return;
    }

    if (orderItems.length === 0) {
      setError("Add at least one medicine to the order.");
      return;
    }

    const invalidItem = orderItems.some(
      (item) =>
        !Number.isInteger(Number(item.quantity)) ||
        Number(item.quantity) <= 0 ||
        !Number.isFinite(Number(item.unitPrice)) ||
        Number(item.unitPrice) < 0
    );

    if (invalidItem) {
      setError(
        "Every medicine must have a valid positive quantity and non-negative price."
      );
      return;
    }

    const supplier = suppliers.find(
      (item) => String(item.id) === String(form.supplierId)
    );

    if (!supplier) {
      setError("The selected supplier could not be found.");
      return;
    }

    setSaving(true);

    const total = calculateTotal(orderItems);

    if (editingOrder) {
      const updatedOrder = {
        ...editingOrder,
        supplierId: supplier.id,
        supplierName: supplier.companyName,
        orderDate: form.orderDate,
        expectedDate: form.expectedDate,
        notes: form.notes.trim(),
        items: orderItems.map((item) => ({
          ...item,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
        })),
        total,
        updatedAt: new Date().toISOString(),
      };

      setOrders((previous) =>
        previous.map((order) =>
          order.id === editingOrder.id ? updatedOrder : order
        )
      );
    } else {
      const newOrder = {
        id: `PO-${Date.now()}`,
        orderNumber: `PO-${new Date().getFullYear()}-${Date.now()
          .toString()
          .slice(-5)}`,
        supplierId: supplier.id,
        supplierName: supplier.companyName,
        orderDate: form.orderDate,
        expectedDate: form.expectedDate,
        notes: form.notes.trim(),
        items: orderItems.map((item) => ({
          ...item,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          receivedQuantity: 0,
          receipts: [],
        })),
        total,
        status: "Draft",
        createdAt: new Date().toISOString(),
      };

      setOrders((previous) => [newOrder, ...previous]);
    }

    setSaving(false);
    setModalOpen(false);
    setEditingOrder(null);
    setOrderItems([]);
    setForm(emptyOrderForm);
  };

  // Change a draft into an ordered purchase.
  const placeOrder = (order) => {
    if (order.status !== "Draft") return;

    const updated = {
      ...order,
      status: "Ordered",
      updatedAt: new Date().toISOString(),
    };

    setOrders((previous) =>
      previous.map((item) =>
        item.id === order.id ? updated : item
      )
    );

    setSelectedOrder(updated);
  };

  // Receive stock against an existing purchase order.
  const handleReceiveStock = async (receivedItems) => {
    if (!pharmacyLoaded) {
      throw new Error("Inventory data is still loading. Please try again.");
    }

    if (!receivingOrder) {
      throw new Error("No purchase order is currently selected.");
    }

    const currentOrder = orders.find(
      (order) => order.id === receivingOrder.id
    );

    if (!currentOrder) {
      throw new Error("The purchase order could not be found.");
    }

    if (
      !["Ordered", "Partially Received"].includes(currentOrder.status)
    ) {
      throw new Error("This purchase order cannot receive stock.");
    }

    if (!Array.isArray(receivedItems) || receivedItems.length === 0) {
      throw new Error("Enter at least one delivery item.");
    }

    setReceiving(true);

    try {
      const receivedAt = new Date().toISOString();

      // Validate every delivery before changing inventory.
      const validatedItems = receivedItems.map((receivedItem) => {
        const orderItem = currentOrder.items.find(
          (item) =>
            String(item.medicineId) === String(receivedItem.medicineId)
        );

        if (!orderItem) {
          throw new Error("A received medicine is not part of this order.");
        }

        const alreadyReceived = Number(orderItem.receivedQuantity || 0);
        const remaining =
          Number(orderItem.quantity) - alreadyReceived;

        const quantity = Number(receivedItem.quantity);
        const unitPrice = Number(receivedItem.unitPrice);
        const batchNumber = String(
          receivedItem.batchNumber || ""
        ).trim();
        const expiryDate = receivedItem.expiryDate;

        if (!Number.isInteger(quantity) || quantity <= 0) {
          throw new Error(
            `Enter a valid whole-number quantity for ${orderItem.medicineName}.`
          );
        }

        if (quantity > remaining) {
          throw new Error(
            `You can only receive ${remaining} more units of ${orderItem.medicineName}.`
          );
        }

        if (!batchNumber) {
          throw new Error(
            `Enter a batch number for ${orderItem.medicineName}.`
          );
        }

        if (
          !expiryDate ||
          Number.isNaN(new Date(`${expiryDate}T00:00:00`).getTime())
        ) {
          throw new Error(
            `Enter a valid expiry date for ${orderItem.medicineName}.`
          );
        }

        if (!Number.isFinite(unitPrice) || unitPrice < 0) {
          throw new Error(
            `Enter a valid purchase price for ${orderItem.medicineName}.`
          );
        }

        const medicine = medicines.find(
          (item) =>
            String(item.id) === String(orderItem.medicineId)
        );

        if (!medicine) {
          throw new Error(
            `${orderItem.medicineName} could not be found in inventory.`
          );
        }

        return {
          orderItem,
          medicine,
          quantity,
          unitPrice,
          batchNumber,
          expiryDate,
        };
      });

      // Add each received delivery as a new inventory batch.
      validatedItems.forEach((item) => {
        const newBatch = {
          id: `BATCH-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 7)}`,
          batchNumber: item.batchNumber,
          quantity: item.quantity,
          expiryDate: item.expiryDate,
          purchasePrice: item.unitPrice,
          supplierName: currentOrder.supplierName,
          supplierId: currentOrder.supplierId,
          purchaseOrderNumber: currentOrder.orderNumber,
          receivedAt,
        };

        updateMedicine({
          id: item.medicine.id,
          batches: [
            ...(item.medicine.batches || []),
            newBatch,
          ],
        });
      });

      // Update cumulative received quantities and delivery history.
      const updatedItems = currentOrder.items.map((orderItem) => {
        const delivery = validatedItems.find(
          (item) =>
            String(item.orderItem.medicineId) ===
            String(orderItem.medicineId)
        );

        if (!delivery) return orderItem;

        const receipt = {
          id: `RECEIPT-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 7)}`,
          batchNumber: delivery.batchNumber,
          quantity: delivery.quantity,
          unitPrice: delivery.unitPrice,
          expiryDate: delivery.expiryDate,
          receivedAt,
        };

        return {
          ...orderItem,
          receivedQuantity:
            Number(orderItem.receivedQuantity || 0) +
            delivery.quantity,
          receipts: [
            ...(orderItem.receipts || []),
            receipt,
          ],
        };
      });

      const fullyReceived = updatedItems.every(
        (item) =>
          Number(item.receivedQuantity || 0) >=
          Number(item.quantity)
      );

      const updatedOrder = {
        ...currentOrder,
        items: updatedItems,
        status: fullyReceived ? "Received" : "Partially Received",
        updatedAt: receivedAt,
      };

      setOrders((previous) =>
        previous.map((order) =>
          order.id === updatedOrder.id ? updatedOrder : order
        )
      );

      setSelectedOrder(updatedOrder);
      setReceivingOrder(null);
    } finally {
      setReceiving(false);
    }
  };

  const openDetails = (order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  const closeDetails = () => {
    setDetailsOpen(false);
    setSelectedOrder(null);
  };

  if (!loaded || !pharmacyLoaded) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-9 w-56 rounded-lg bg-surface-strong" />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-28 rounded-2xl bg-surface"
            />
          ))}
        </div>

        <div className="h-80 rounded-2xl bg-surface" />
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
            <span className="text-violet-300">Purchases</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Purchase Management
          </h1>

          <p className="mt-2 text-sm text-muted">
            Create and track medicine purchase orders from your suppliers.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          disabled={
            suppliers.filter(
              (supplier) => supplier.status === "Active"
            ).length === 0
          }
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={18} />
          Create Purchase Order
        </button>
      </div>

      {/* Supplier warning */}
      {suppliers.filter(
        (supplier) => supplier.status === "Active"
      ).length === 0 && (
        <div className="flex flex-col gap-3 rounded-xl border border-amber-400/20 bg-amber-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertCircle
              size={19}
              className="mt-0.5 text-amber-300"
            />

            <div>
              <p className="text-sm font-semibold text-amber-200">
                No active suppliers available
              </p>

              <p className="mt-1 text-xs text-amber-200/70">
                Register or activate a supplier before creating a purchase order.
              </p>
            </div>
          </div>

          <Link
            href="/suppliers"
            className="text-xs font-semibold text-amber-200 underline underline-offset-4"
          >
            Manage suppliers
          </Link>
        </div>
      )}

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Orders"
          value={stats.total}
          icon={ClipboardList}
          color="violet"
        />

        <StatCard
          label="Draft Orders"
          value={stats.draft}
          icon={Pencil}
          color="cyan"
        />

        <StatCard
          label="Awaiting Delivery"
          value={stats.pending}
          icon={Clock3}
          color="amber"
        />

        <StatCard
          label="Received Orders"
          value={stats.received}
          icon={CheckCircle2}
          color="green"
        />
      </div>

      {/* Order value overview */}
      <div className="glass-card flex flex-col justify-between gap-4 rounded-2xl border border-line p-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
            <ShoppingBasket size={22} />
          </div>

          <div>
            <p className="text-xs text-muted">
              Total purchase order value
            </p>

            <p className="mt-1 text-2xl font-bold text-ink">
              {formatMoney(stats.totalValue)}
            </p>
          </div>
        </div>

        <p className="max-w-sm text-xs leading-5 text-muted">
          This amount includes all recorded orders, including drafts. It is not a measure of money already paid.
        </p>
      </div>

      {/* Purchase order directory */}
      <section className="glass-panel overflow-hidden rounded-2xl">
        <div className="flex flex-col gap-4 border-b border-line p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-semibold text-ink">
              Purchase Orders
            </h2>

            <p className="mt-1 text-xs text-muted">
              {filteredOrders.length} orders found
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
                placeholder="Search order or supplier..."
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
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                className="w-full appearance-none rounded-xl border border-line bg-elevated py-2.5 pl-9 pr-8 text-sm text-ink-soft outline-none focus:border-violet-500/50 sm:w-44"
              >
                <option value="All">All statuses</option>
                <option value="Draft">Draft</option>
                <option value="Ordered">Ordered</option>
                <option value="Partially Received">Partially Received</option>
                <option value="Received">Received</option>
              </select>
            </div>
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[850px] text-left">
            <thead>
              <tr className="border-b border-line bg-surface-soft text-[10px] uppercase tracking-wider text-muted">
                <th className="px-5 py-4 font-semibold">Order</th>
                <th className="px-5 py-4 font-semibold">Supplier</th>
                <th className="px-5 py-4 font-semibold">Order date</th>
                <th className="px-5 py-4 font-semibold">Items</th>
                <th className="px-5 py-4 font-semibold">Total</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-line">
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="transition hover:bg-hover"
                >
                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-ink">
                      {order.orderNumber}
                    </p>

                    <p className="mt-1 text-[11px] text-muted">
                      {order.id}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-sm text-ink-soft">
                    {order.supplierName}
                  </td>

                  <td className="px-5 py-4 text-sm text-muted">
                    {formatDate(order.orderDate)}
                  </td>

                  <td className="px-5 py-4 text-sm text-ink-soft">
                    {order.items.length} items
                  </td>

                  <td className="px-5 py-4 text-sm font-semibold text-ink">
                    {formatMoney(order.total)}
                  </td>

                  <td className="px-5 py-4">
                    <OrderStatus status={getOrderStatus(order)} />
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-1.5">
                      <ActionButton
                        title="View order"
                        onClick={() => openDetails(order)}
                      >
                        <Eye size={16} />
                      </ActionButton>

                      {order.status === "Draft" && (
                        <ActionButton
                          title="Edit draft"
                          onClick={() => openEditModal(order)}
                        >
                          <Pencil size={16} />
                        </ActionButton>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredOrders.length === 0 && (
            <EmptyState onCreate={openCreateModal} />
          )}
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
                  <p className="text-sm font-semibold text-ink">
                    {order.orderNumber}
                  </p>

                  <p className="mt-1 text-xs text-muted">
                    {order.supplierName}
                  </p>
                </div>

                <OrderStatus status={getOrderStatus(order)} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-muted">Order date</p>
                  <p className="mt-1 text-ink-soft">
                    {formatDate(order.orderDate)}
                  </p>
                </div>

                <div>
                  <p className="text-muted">Items</p>
                  <p className="mt-1 text-ink-soft">
                    {order.items.length}
                  </p>
                </div>

                <div className="col-span-2">
                  <p className="text-muted">Total</p>
                  <p className="mt-1 font-semibold text-ink">
                    {formatMoney(order.total)}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex gap-2 border-t border-line pt-3">
                <button
                  onClick={() => openDetails(order)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-line py-2 text-xs text-ink-soft hover:bg-hover"
                >
                  <Eye size={14} />
                  View
                </button>

                {order.status === "Draft" && (
                  <button
                    onClick={() => openEditModal(order)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-line py-2 text-xs text-ink-soft hover:bg-hover"
                  >
                    <Pencil size={14} />
                    Edit
                  </button>
                )}
              </div>
            </div>
          ))}

          {filteredOrders.length === 0 && (
            <EmptyState onCreate={openCreateModal} />
          )}
        </div>
      </section>

      {/* Create / Edit purchase order modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setModalOpen(false);
            }
          }}
        >
          <div className="glass-panel max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-line shadow-2xl">
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-elevated px-5 py-4">
              <div>
                <h2 className="font-semibold text-ink">
                  {editingOrder ? "Edit Purchase Order" : "Create Purchase Order"}
                </h2>

                <p className="mt-1 text-xs text-muted">
                  Select a supplier and add medicines to purchase.
                </p>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-2 text-muted hover:bg-hover hover:text-ink"
                aria-label="Close purchase order form"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 p-5">
              {error && (
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                  {error}
                </div>
              )}

              {/* Supplier and order dates */}
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-violet-300">
                  Order information
                </p>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="sm:col-span-1">
                    <label className="mb-2 block text-xs font-medium text-ink-soft">
                      Supplier *
                    </label>

                    <select
                      value={form.supplierId}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          supplierId: event.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-line bg-elevated px-4 py-3 text-sm text-ink outline-none focus:border-violet-500/50"
                    >
                      <option value="">Select supplier</option>

                      {suppliers
                        .filter(
                          (supplier) => supplier.status === "Active"
                        )
                        .map((supplier) => (
                          <option
                            key={supplier.id}
                            value={supplier.id}
                          >
                            {supplier.companyName}
                          </option>
                        ))}
                    </select>
                  </div>

                  <DateField
                    label="Order date *"
                    value={form.orderDate}
                    onChange={(value) =>
                      setForm((previous) => ({
                        ...previous,
                        orderDate: value,
                      }))
                    }
                  />

                  <DateField
                    label="Expected delivery"
                    value={form.expectedDate}
                    onChange={(value) =>
                      setForm((previous) => ({
                        ...previous,
                        expectedDate: value,
                      }))
                    }
                    min={form.orderDate}
                  />
                </div>
              </div>

              {/* Order items */}
              <div className="border-t border-line pt-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-violet-300">
                      Order items
                    </p>

                    <p className="mt-1 text-xs text-muted">
                      Add the medicines and quantities required.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addOrderItem}
                    className="flex items-center gap-2 rounded-lg border border-violet-400/20 bg-violet-500/10 px-3 py-2 text-xs font-semibold text-violet-300 transition hover:bg-violet-500/20"
                  >
                    <Plus size={15} />
                    Add medicine
                  </button>
                </div>

                {orderItems.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-line-strong py-10 text-center">
                    <Package
                      size={25}
                      className="mx-auto text-muted"
                    />

                    <p className="mt-3 text-sm font-medium text-ink-soft">
                      No medicines added
                    </p>

                    <p className="mt-1 text-xs text-muted">
                      Use Add medicine to start building your order.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orderItems.map((item, index) => (
                      <div
                        key={`${index}-${item.medicineId}`}
                        className="rounded-xl border border-line bg-surface-soft p-4"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <p className="text-xs font-semibold text-ink-soft">
                            Item {index + 1}
                          </p>

                          <button
                            type="button"
                            onClick={() => removeOrderItem(index)}
                            className="rounded-lg p-2 text-rose-400 hover:bg-rose-500/10"
                            aria-label="Remove medicine"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                          <div className="sm:col-span-1">
                            <label className="mb-2 block text-xs text-muted">
                              Medicine
                            </label>

                            <select
                              value={item.medicineId}
                              onChange={(event) =>
                                changeMedicine(index, event.target.value)
                              }
                              className="w-full rounded-lg border border-line bg-elevated px-3 py-2.5 text-xs text-ink outline-none focus:border-violet-500/50"
                            >
                              {medicines.map((medicine) => (
                                <option
                                  key={medicine.id}
                                  value={medicine.id}
                                  disabled={orderItems.some(
                                    (other, otherIndex) =>
                                      otherIndex !== index &&
                                      String(other.medicineId) ===
                                        String(medicine.id)
                                  )}
                                >
                                  {medicine.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <NumberField
                            label="Quantity"
                            value={item.quantity}
                            min="1"
                            onChange={(value) =>
                              updateOrderItem(index, "quantity", value)
                            }
                          />

                          <NumberField
                            label="Unit purchase price (TZS)"
                            value={item.unitPrice}
                            min="0"
                            onChange={(value) =>
                              updateOrderItem(index, "unitPrice", value)
                            }
                          />
                        </div>

                        <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                          <span className="text-xs text-muted">
                            Item subtotal
                          </span>

                          <span className="text-sm font-semibold text-ink">
                            {formatMoney(
                              Number(item.quantity || 0) *
                                Number(item.unitPrice || 0)
                            )}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes and total */}
              <div className="grid gap-5 border-t border-line pt-5 lg:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-medium text-ink-soft">
                    Order notes
                  </label>

                  <textarea
                    rows={4}
                    value={form.notes}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        notes: event.target.value,
                      }))
                    }
                    placeholder="Additional instructions..."
                    className="w-full resize-none rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink outline-none placeholder:text-muted focus:border-violet-500/50"
                  />
                </div>

                <div className="rounded-xl border border-violet-400/10 bg-violet-500/[0.06] p-5">
                  <p className="text-xs text-muted">
                    Order summary
                  </p>

                  <div className="mt-4 flex justify-between text-xs text-muted">
                    <span>Total items</span>
                    <span>{orderItems.length}</span>
                  </div>

                  <div className="mt-3 flex justify-between text-xs text-muted">
                    <span>Total units</span>
                    <span>
                      {orderItems.reduce(
                        (sum, item) =>
                          sum + Number(item.quantity || 0),
                        0
                      )}
                    </span>
                  </div>

                  <div className="mt-4 border-t border-line pt-4">
                    <p className="text-xs text-muted">Grand total</p>

                    <p className="mt-1 text-2xl font-bold text-ink">
                      {formatMoney(calculateTotal(orderItems))}
                    </p>
                  </div>
                </div>
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
                  {saving
                    ? "Saving..."
                    : editingOrder
                      ? "Save Changes"
                      : "Save Purchase Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Purchase order details */}
      {detailsOpen && selectedOrder && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeDetails();
            }
          }}
        >
          <div className="glass-panel max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-line shadow-2xl">
            <div className="flex items-start justify-between border-b border-line p-5">
              <div>
                <p className="text-xs text-muted">Purchase order</p>

                <h2 className="mt-1 text-xl font-bold text-ink">
                  {selectedOrder.orderNumber}
                </h2>

                <p className="mt-1 text-xs text-muted">
                  {selectedOrder.supplierName}
                </p>
              </div>

              <button
                onClick={closeDetails}
                className="rounded-lg p-2 text-muted hover:bg-hover hover:text-ink"
                aria-label="Close order details"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <OrderStatus status={getOrderStatus(selectedOrder)} />

                <span className="text-xs text-muted">
                  Created {formatDate(selectedOrder.orderDate)}
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <DetailItem
                  icon={Building2}
                  label="Supplier"
                  value={selectedOrder.supplierName}
                />

                <DetailItem
                  icon={CalendarDays}
                  label="Expected delivery"
                  value={formatDate(selectedOrder.expectedDate)}
                />
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold text-ink">
                  Ordered medicines
                </h3>

                <div className="overflow-x-auto rounded-xl border border-line">
                  <table className="w-full min-w-[480px] text-left">
                    <thead className="bg-surface text-[10px] uppercase text-muted">
                      <tr>
                        <th className="px-4 py-3">Medicine</th>
                        <th className="px-4 py-3">Ordered</th>
                        <th className="px-4 py-3">Received</th>
                        <th className="px-4 py-3">Remaining</th>
                        <th className="px-4 py-3">Unit price</th>
                        <th className="px-4 py-3 text-right">Subtotal</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-line">
                      {selectedOrder.items.map((item, index) => {
                        const received = Number(
                          item.receivedQuantity || 0
                        );

                        const remaining = Math.max(
                          0,
                          Number(item.quantity) - received
                        );

                        return (
                          <tr key={`${item.medicineId}-${index}`}>
                            <td className="px-4 py-3 text-xs text-ink-soft">
                              {item.medicineName}
                            </td>

                            <td className="px-4 py-3 text-xs text-ink-soft">
                              {item.quantity}
                            </td>

                            <td className="px-4 py-3 text-xs text-emerald-300">
                              {received}
                            </td>

                            <td className="px-4 py-3 text-xs text-amber-300">
                              {remaining}
                            </td>

                            <td className="px-4 py-3 text-xs text-ink-soft">
                              {formatMoney(item.unitPrice)}
                            </td>

                            <td className="px-4 py-3 text-right text-xs font-semibold text-ink">
                              {formatMoney(
                                item.quantity * item.unitPrice
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Delivery progress */}
              {selectedOrder.status !== "Draft" && (
                <div className="rounded-xl border border-line bg-surface-soft p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-semibold text-ink-soft">
                      Delivery progress
                    </p>

                    <span className="text-xs text-muted">
                      {selectedOrder.items.reduce(
                        (sum, item) =>
                          sum + Number(item.receivedQuantity || 0),
                        0
                      )}{" "}
                      /{" "}
                      {selectedOrder.items.reduce(
                        (sum, item) =>
                          sum + Number(item.quantity || 0),
                        0
                      )}{" "}
                      units
                    </span>
                  </div>

                  {(() => {
                    const orderedUnits = selectedOrder.items.reduce(
                      (sum, item) => sum + Number(item.quantity || 0),
                      0
                    );

                    const receivedUnits = selectedOrder.items.reduce(
                      (sum, item) =>
                        sum + Number(item.receivedQuantity || 0),
                      0
                    );

                    const progress =
                      orderedUnits > 0
                        ? Math.min(
                            100,
                            (receivedUnits / orderedUnits) * 100
                          )
                        : 0;

                    return (
                      <div className="h-2 overflow-hidden rounded-full bg-surface-strong">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-400 transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    );
                  })()}
                </div>
              )}

              <div className="rounded-xl border border-line bg-surface-soft p-4">
                <p className="text-xs text-muted">
                  Total order value
                </p>

                <p className="mt-1 text-2xl font-bold text-ink">
                  {formatMoney(selectedOrder.total)}
                </p>
              </div>

              {selectedOrder.notes && (
                <div>
                  <p className="mb-2 text-xs font-semibold text-ink-soft">
                    Notes
                  </p>

                  <p className="text-sm leading-6 text-muted">
                    {selectedOrder.notes}
                  </p>
                </div>
              )}

              {/* Draft actions */}
              {selectedOrder.status === "Draft" && (
                <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:justify-end">
                  <button
                    onClick={() => {
                      closeDetails();
                      openEditModal(selectedOrder);
                    }}
                    className="flex items-center justify-center gap-2 rounded-xl border border-line px-5 py-3 text-sm text-ink-soft hover:bg-hover"
                  >
                    <Pencil size={15} />
                    Edit Draft
                  </button>

                  <button
                    onClick={() => placeOrder(selectedOrder)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-500"
                  >
                    <Truck size={16} />
                    Place Order
                  </button>
                </div>
              )}

              {/* Receive stock action */}
              {["Ordered", "Partially Received"].includes(
                selectedOrder.status
              ) && (
                <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:justify-end">
                  <button
                    onClick={() => {
                      setReceivingOrder(selectedOrder);
                    }}
                    className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
                  >
                    <PackageCheck size={17} />
                    Receive Stock
                  </button>
                </div>
              )}

              {selectedOrder.status === "Received" && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-400/15 bg-emerald-500/10 p-3 text-xs text-emerald-300">
                  <CheckCircle2 size={16} />
                  All items in this purchase order have been received.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Receive stock modal */}
      {receivingOrder && (
        <ReceiveStockModal
          order={receivingOrder}
          onClose={() => {
            if (!receiving) {
              setReceivingOrder(null);
            }
          }}
          onConfirm={handleReceiveStock}
        />
      )}
    </div>
  );
}

// Dashboard statistic card.
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

// Purchase order status badge.
function OrderStatus({ status }) {
  const styles = {
    Draft: "bg-gray-500/10 text-ink-soft border-gray-400/10",
    Ordered: "bg-amber-500/10 text-amber-300 border-amber-400/10",
    "Partially Received":
      "bg-cyan-500/10 text-cyan-300 border-cyan-400/10",
    Received:
      "bg-emerald-500/10 text-emerald-300 border-emerald-400/10",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${
        styles[status] || styles.Draft
      }`}
    >
      {status}
    </span>
  );
}

// Date field.
function DateField({ label, value, onChange, min }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-ink-soft">
        {label}
      </label>

      <input
        type="date"
        value={value}
        min={min}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-line bg-elevated px-3 py-3 text-sm text-ink outline-none focus:border-violet-500/50"
      />
    </div>
  );
}

// Numeric order item field.
function NumberField({ label, value, onChange, min }) {
  return (
    <div>
      <label className="mb-2 block text-xs text-muted">
        {label}
      </label>

      <input
        type="number"
        min={min}
        step="1"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-violet-500/50"
      />
    </div>
  );
}

// Supplier/order detail field.
function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-line bg-surface-soft p-3">
      <div className="mb-2 flex items-center gap-2 text-[11px] text-muted">
        <Icon size={14} />
        {label}
      </div>

      <p className="break-words text-sm font-medium text-ink">
        {value || "—"}
      </p>
    </div>
  );
}

// Table action button.
function ActionButton({ children, title, onClick }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="rounded-lg border border-line p-2 text-muted transition hover:border-violet-400/20 hover:bg-violet-500/10 hover:text-violet-300"
    >
      {children}
    </button>
  );
}

// Empty order state.
function EmptyState({ onCreate }) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface text-muted">
        <ShoppingBasket size={25} />
      </div>

      <h3 className="font-semibold text-ink">
        No purchase orders found
      </h3>

      <p className="mt-2 max-w-sm text-xs leading-5 text-muted">
        Create a purchase order to start recording medicines purchased from suppliers.
      </p>

      <button
        onClick={onCreate}
        className="mt-5 flex items-center gap-2 rounded-xl bg-violet-500/15 px-4 py-2.5 text-xs font-semibold text-violet-300 transition hover:bg-violet-500/25"
      >
        <Plus size={15} />
        Create Purchase Order
      </button>
    </div>
  );
}
