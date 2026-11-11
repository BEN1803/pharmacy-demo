
"use client";

import { useMemo, useState } from "react";
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Pill,
  CreditCard,
  Banknote,
  Smartphone,
  ShoppingBag,
  X,
  CheckCircle2,
  AlertCircle,
  Receipt,
} from "lucide-react";

import { medicines } from "@/data/inventory";

const formatMoney = (amount) =>
  new Intl.NumberFormat("en-TZ", {
    style: "currency",
    currency: "TZS",
    maximumFractionDigits: 0,
  }).format(amount || 0);

const getStock = (medicine) =>
  (medicine.batches || []).reduce(
    (total, batch) => total + Number(batch.quantity || 0),
    0
  );

export default function SalesPageContent() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [processing, setProcessing] = useState(false);
  const [completedSale, setCompletedSale] = useState(null);
  const [notification, setNotification] = useState("");

  // Get unique medicine categories.
  const categories = useMemo(() => {
    const unique = [...new Set(medicines.map((medicine) => medicine.category))];
    return ["All", ...unique];
  }, []);

  // Filter medicines using search and category.
  const filteredMedicines = useMemo(() => {
    return medicines.filter((medicine) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        medicine.name.toLowerCase().includes(searchValue) ||
        medicine.genericName?.toLowerCase().includes(searchValue) ||
        medicine.sku?.toLowerCase().includes(searchValue);

      const matchesCategory =
        selectedCategory === "All" ||
        medicine.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory]);

  // Calculate the cart subtotal.
  const subtotal = cart.reduce(
    (total, item) => total + item.sellingPrice * item.quantity,
    0
  );

  // Calculate discount and final amount.
  const discountAmount = subtotal * (Math.min(100, Math.max(0, discount)) / 100);
  const total = subtotal - discountAmount;

  // Add a medicine to the cart.
  const addToCart = (medicine) => {
    const availableStock = getStock(medicine);

    if (availableStock <= 0) {
      setNotification("This medicine is out of stock.");
      return;
    }

    const existingItem = cart.find((item) => item.id === medicine.id);

    if (existingItem) {
      if (existingItem.quantity >= availableStock) {
        setNotification("You cannot add more than the available stock.");
        return;
      }

      setCart((previousCart) =>
        previousCart.map((item) =>
          item.id === medicine.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart((previousCart) => [
        ...previousCart,
        { ...medicine, quantity: 1 },
      ]);
    }

    setNotification("");
  };

  // Increase or decrease cart quantity.
  const updateQuantity = (medicineId, change) => {
    setCart((previousCart) =>
      previousCart
        .map((item) => {
          if (item.id !== medicineId) return item;

          const availableStock = getStock(item);
          const newQuantity = item.quantity + change;

          if (newQuantity > availableStock) {
            setNotification("Available stock limit reached.");
            return item;
          }

          return { ...item, quantity: newQuantity };
        })
        .filter((item) => item.quantity > 0)
    );
  };

  // Remove an item completely.
  const removeFromCart = (medicineId) => {
    setCart((previousCart) =>
      previousCart.filter((item) => item.id !== medicineId)
    );
  };

  // Simulate checkout.
  const handleCheckout = () => {
    if (cart.length === 0 || processing) return;

    setProcessing(true);
    setNotification("");

    setTimeout(() => {
      const sale = {
        id: `SALE-${Date.now().toString().slice(-8)}`,
        date: new Date().toLocaleString(),
        items: [...cart],
        subtotal,
        discount: discountAmount,
        total,
        paymentMethod,
      };

      setCompletedSale(sale);
      setProcessing(false);
      setCart([]);
      setDiscount(0);
    }, 1000);
  };

  // Start a new transaction after a successful sale.
  const startNewSale = () => {
    setCompletedSale(null);
    setSearch("");
    setSelectedCategory("All");
    setPaymentMethod("Cash");
    setNotification("");
  };

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted">
            <ShoppingBag size={16} />
            Pharmacy / Sales
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Point of Sale
          </h1>

          <p className="mt-1 text-sm text-muted">
            Create a new transaction and manage customer purchases.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3">
          <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-500">
            <ShoppingCart size={18} />
          </div>

          <div>
            <p className="text-xs text-muted">Cart items</p>
            <p className="font-semibold">
              {cart.reduce((sum, item) => sum + item.quantity, 0)} units
            </p>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-600">
          <AlertCircle size={18} />
          {notification}
          <button
            onClick={() => setNotification("")}
            className="ml-auto"
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* POS workspace */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_390px]">
        {/* Medicine selection */}
        <section className="min-w-0 space-y-4">
          <div className="glass-panel rounded-2xl p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search medicine, generic name or SKU..."
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500"
                />
              </div>

              <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-3 text-sm text-muted">
                {filteredMedicines.length} medicines found
              </div>
            </div>

            {/* Category filters */}
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-medium transition ${
                    selectedCategory === category
                      ? "bg-blue-600 text-white"
                      : "border border-[var(--border)] bg-[var(--card)] text-muted hover:text-foreground"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Medicine cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-3">
            {filteredMedicines.map((medicine) => {
              const stock = getStock(medicine);
              const isOutOfStock = stock <= 0;
              const cartItem = cart.find(
                (item) => item.id === medicine.id
              );

              return (
                <div
                  key={medicine.id}
                  className="glass-card flex flex-col rounded-2xl p-4 transition hover:-translate-y-0.5 hover:border-blue-500/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                      <Pill size={21} />
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                        isOutOfStock
                          ? "bg-red-500/10 text-red-500"
                          : stock <= medicine.reorderLevel
                            ? "bg-amber-500/10 text-amber-600"
                            : "bg-emerald-500/10 text-emerald-500"
                      }`}
                    >
                      {isOutOfStock
                        ? "Out of stock"
                        : stock <= medicine.reorderLevel
                          ? "Low stock"
                          : "In stock"}
                    </span>
                  </div>

                  <div className="mt-4 flex-1">
                    <h3 className="font-semibold">{medicine.name}</h3>

                    <p className="mt-1 text-xs text-muted">
                      {medicine.genericName}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-muted">
                      <span>{medicine.strength}</span>
                      <span>•</span>
                      <span>{medicine.dosageForm}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-end justify-between border-t border-[var(--border)] pt-3">
                    <div>
                      <p className="text-xs text-muted">Selling price</p>
                      <p className="mt-1 font-bold text-blue-500">
                        {formatMoney(medicine.sellingPrice)}
                      </p>
                      <p className="mt-1 text-[11px] text-muted">
                        {stock} units available
                      </p>
                    </div>

                    <button
                      onClick={() => addToCart(medicine)}
                      disabled={isOutOfStock}
                      className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Plus size={15} />
                      {cartItem ? "Add more" : "Add"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredMedicines.length === 0 && (
            <div className="glass-panel rounded-2xl px-5 py-14 text-center">
              <Search size={30} className="mx-auto text-muted" />
              <h3 className="mt-3 font-semibold">No medicines found</h3>
              <p className="mt-1 text-sm text-muted">
                Try another search term or category.
              </p>
            </div>
          )}
        </section>

        {/* Shopping cart and checkout */}
        <aside className="h-fit rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm sm:p-5 xl:sticky xl:top-24">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart size={19} />
              <h2 className="font-bold">Current Sale</h2>
            </div>

            <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-500">
              {cart.length} products
            </span>
          </div>

          {/* Cart items */}
          <div className="mt-5 max-h-[390px] space-y-3 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[var(--border)] py-12 text-center">
                <ShoppingCart
                  size={30}
                  className="mx-auto text-muted opacity-60"
                />
                <p className="mt-3 text-sm font-medium">
                  Your cart is empty
                </p>
                <p className="mt-1 text-xs text-muted">
                  Select medicines to begin a sale.
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-[var(--border)] p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {item.name}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {formatMoney(item.sellingPrice)} each
                      </p>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="rounded-lg p-1.5 text-muted transition hover:bg-red-500/10 hover:text-red-500"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="rounded-lg border border-[var(--border)] p-1.5 hover:bg-[var(--background)]"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={13} />
                      </button>

                      <span className="w-6 text-center text-sm font-semibold">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="rounded-lg border border-[var(--border)] p-1.5 hover:bg-[var(--background)]"
                        aria-label="Increase quantity"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    <p className="text-sm font-bold">
                      {formatMoney(item.sellingPrice * item.quantity)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Discount */}
          <div className="mt-5 border-t border-[var(--border)] pt-4">
            <label className="text-sm font-semibold">
              Discount (%)
            </label>

            <input
              type="number"
              min="0"
              max="100"
              value={discount}
              onChange={(event) => {
                const value = Number(event.target.value);
                setDiscount(Math.min(100, Math.max(0, value || 0)));
              }}
              disabled={cart.length === 0}
              className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:opacity-50"
            />
          </div>

          {/* Payment method */}
          <div className="mt-5">
            <p className="text-sm font-semibold">Payment method</p>

            <div className="mt-2 grid grid-cols-3 gap-2">
              {[
                { name: "Cash", icon: Banknote },
                { name: "Mobile", icon: Smartphone },
                { name: "Card", icon: CreditCard },
              ].map((method) => {
                const Icon = method.icon;

                return (
                  <button
                    key={method.name}
                    onClick={() => setPaymentMethod(method.name)}
                    className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-xs transition ${
                      paymentMethod === method.name
                        ? "border-blue-500 bg-blue-500/10 text-blue-500"
                        : "border-[var(--border)] text-muted hover:text-foreground"
                    }`}
                  >
                    <Icon size={18} />
                    {method.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Total summary */}
          <div className="mt-5 space-y-3 border-t border-[var(--border)] pt-4 text-sm">
            <div className="flex justify-between text-muted">
              <span>Subtotal</span>
              <span>{formatMoney(subtotal)}</span>
            </div>

            <div className="flex justify-between text-muted">
              <span>Discount</span>
              <span className="text-emerald-500">
                -{formatMoney(discountAmount)}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-[var(--border)] pt-3">
              <span className="font-semibold">Total payable</span>
              <span className="text-xl font-bold text-blue-500">
                {formatMoney(total)}
              </span>
            </div>
          </div>

          {/* Checkout button */}
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || processing}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {processing ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Processing sale...
              </>
            ) : (
              <>
                <Receipt size={17} />
                Complete Sale
              </>
            )}
          </button>

          <p className="mt-3 text-center text-[11px] text-muted">
            Demo mode · No real payment will be processed
          </p>
        </aside>
      </div>

      {/* Successful sale modal */}
      {completedSale && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 size={30} />
            </div>

            <h2 className="mt-4 text-center text-xl font-bold">
              Sale completed!
            </h2>

            <p className="mt-1 text-center text-sm text-muted">
              Your demo transaction was successful.
            </p>

            <div className="mt-5 rounded-xl border border-[var(--border)] p-4">
              <div className="flex justify-between text-xs text-muted">
                <span>Transaction ID</span>
                <span className="font-semibold text-foreground">
                  {completedSale.id}
                </span>
              </div>

              <div className="mt-3 flex justify-between text-xs text-muted">
                <span>Date</span>
                <span>{completedSale.date}</span>
              </div>

              <div className="mt-3 flex justify-between text-xs text-muted">
                <span>Payment</span>
                <span>{completedSale.paymentMethod}</span>
              </div>

              <div className="my-4 border-t border-[var(--border)]" />

              {completedSale.items.map((item) => (
                <div
                  key={item.id}
                  className="mb-2 flex justify-between gap-3 text-sm"
                >
                  <span className="text-muted">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-medium">
                    {formatMoney(item.sellingPrice * item.quantity)}
                  </span>
                </div>
              ))}

              <div className="mt-4 border-t border-[var(--border)] pt-3">
                <div className="flex justify-between text-xs text-muted">
                  <span>Subtotal</span>
                  <span>{formatMoney(completedSale.subtotal)}</span>
                </div>

                <div className="mt-2 flex justify-between text-xs text-muted">
                  <span>Discount</span>
                  <span>{formatMoney(completedSale.discount)}</span>
                </div>

                <div className="mt-3 flex justify-between">
                  <span className="font-semibold">Total paid</span>
                  <span className="text-lg font-bold text-emerald-500">
                    {formatMoney(completedSale.total)}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={startNewSale}
              className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Start New Sale
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
