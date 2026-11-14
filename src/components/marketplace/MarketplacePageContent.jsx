"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Search,
  Store,
  Star,
  MapPin,
  Truck,
  BadgeCheck,
  Plus,
  Minus,
  Trash2,
  ShoppingBasket,
  Send,
  X,
  Package,
  Filter,
  ShieldCheck,
  Clock3,
} from "lucide-react";

import {
  marketplaceProducts,
  marketplaceCategories,
} from "@/data/marketplace";

const STORAGE_KEY = "mediflow_marketplace_requests";

const formatMoney = (amount) =>
  new Intl.NumberFormat("en-TZ", {
    style: "currency",
    currency: "TZS",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

export default function MarketplacePageContent() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("recommended");

  const [cart, setCart] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState("");

  // Load previous purchase requests.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setRequests(parsed);
        }
      }
    } catch (err) {
      console.error("Could not load marketplace requests:", err);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
    } catch (err) {
      console.error("Could not save marketplace requests:", err);
    }
  }, [requests, loaded]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    const results = marketplaceProducts.filter((product) => {
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.genericName.toLowerCase().includes(query) ||
        product.supplierName.toLowerCase().includes(query) ||
        product.location.toLowerCase().includes(query);

      const matchesCategory = category === "All" || product.category === category;

      return matchesSearch && matchesCategory;
    });

    return [...results].sort((a, b) => {
      if (sort === "price") return a.unitPrice - b.unitPrice;
      if (sort === "delivery") return a.deliveryDays - b.deliveryDays;
      if (sort === "rating") return b.rating - a.rating;
      return 0;
    });
  }, [search, category, sort]);

  const stats = useMemo(() => {
    const suppliers = new Set(marketplaceProducts.map((product) => product.supplierId)).size;
    const verified = marketplaceProducts.filter((product) => product.verified).length;
    const avgDelivery = Math.round(
      marketplaceProducts.reduce((sum, product) => sum + product.deliveryDays, 0) /
        marketplaceProducts.length
    );

    return {
      suppliers,
      products: marketplaceProducts.length,
      verified,
      avgDelivery,
      requests: requests.length,
    };
  }, [requests]);

  const cartTotal = cart.reduce(
    (total, item) => total + Number(item.unitPrice) * Number(item.quantity),
    0
  );

  const addToCart = (product) => {
    setConfirmation("");

    setCart((previous) => {
      const existing = previous.find((item) => item.id === product.id);

      if (existing) {
        return previous.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + product.moq }
            : item
        );
      }

      return [...previous, { ...product, quantity: product.moq }];
    });
  };

  const changeQuantity = (id, amount) => {
    setCart((previous) =>
      previous
        .map((item) => {
          if (item.id !== id) return item;

          const nextQuantity = item.quantity + amount;

          if (nextQuantity < item.moq) return item;

          return { ...item, quantity: nextQuantity };
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id) => {
    setCart((previous) => previous.filter((item) => item.id !== id));
  };

  const submitRequest = () => {
    if (cart.length === 0 || submitting) return;

    setSubmitting(true);

    const requestedItems = cart.map((item) => ({
      id: item.id,
      name: item.name,
      supplierName: item.supplierName,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
    }));

    const requestedTotal = cartTotal;

    setTimeout(() => {
      const request = {
        id: `REQ-${Date.now().toString().slice(-6)}`,
        createdAt: new Date().toISOString(),
        status: "Pending review",
        items: requestedItems,
        total: requestedTotal,
      };

      setRequests((previous) => [request, ...previous]);
      setCart([]);
      setSubmitting(false);
      setConfirmation(
        `Request ${request.id} submitted to ${new Set(
          request.items.map((item) => item.supplierName)
        ).size} supplier(s).`
      );
    }, 600);
  };

  return (
    <div className="space-y-7 pb-10">
      {/* Heading */}
      <div>
        <div className="mb-2 flex items-center gap-2 text-xs text-muted">
          <span>Management</span>
          <span>/</span>
          <span className="text-violet-300">Marketplace</span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Wholesale Marketplace
        </h1>

        <p className="mt-2 text-sm text-muted">
          Source medicines directly from verified suppliers and submit bulk purchase requests.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Suppliers" value={stats.suppliers} icon={Store} color="violet" />
        <StatCard
          label="Products Listed"
          value={stats.products}
          icon={Package}
          color="cyan"
        />
        <StatCard
          label="Avg. Delivery"
          value={`${stats.avgDelivery} days`}
          icon={Truck}
          color="amber"
        />
        <StatCard
          label="Purchase Requests"
          value={stats.requests}
          icon={ShoppingBasket}
          color="green"
        />
      </div>

      {confirmation && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
          <BadgeCheck size={18} className="mt-0.5 shrink-0" />

          <p className="flex-1">{confirmation}</p>

          <button
            onClick={() => setConfirmation("")}
            aria-label="Dismiss confirmation"
            className="text-emerald-300/70 hover:text-emerald-200"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        {/* Catalogue */}
        <div className="min-w-0 space-y-5">
          {/* Filters */}
          <div className="glass-panel flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search medicine, generic name or supplier..."
                className="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-4 text-sm text-ink outline-none placeholder:text-muted focus:border-violet-500/50"
              />
            </div>

            <div className="relative">
              <Filter
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />

              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="w-full appearance-none rounded-xl border border-line bg-elevated py-2.5 pl-9 pr-8 text-sm text-ink-soft outline-none focus:border-violet-500/50 sm:w-44"
              >
                {marketplaceCategories.map((item) => (
                  <option key={item} value={item}>
                    {item === "All" ? "All categories" : item}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="rounded-xl border border-line bg-elevated px-3 py-2.5 text-sm text-ink-soft outline-none focus:border-violet-500/50"
            >
              <option value="recommended">Recommended</option>
              <option value="price">Lowest price</option>
              <option value="delivery">Fastest delivery</option>
              <option value="rating">Highest rated</option>
            </select>
          </div>

          <p className="text-xs text-muted">
            {filteredProducts.length} products available
          </p>

          {/* Product grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {filteredProducts.map((product) => {
                const inCart = cart.find((item) => item.id === product.id);

                return (
                  <article
                    key={product.id}
                    className="glass-card flex flex-col rounded-2xl border border-line p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <span className="inline-flex rounded-full bg-violet-500/10 px-2.5 py-1 text-[10px] font-medium text-violet-300">
                          {product.category}
                        </span>

                        <h3 className="mt-3 text-sm font-semibold text-ink">
                          {product.name}
                        </h3>

                        <p className="mt-1 text-[11px] text-muted">
                          {product.genericName}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-1 rounded-lg bg-surface px-2 py-1 text-[11px] font-semibold text-amber-300">
                        <Star size={12} fill="currentColor" />
                        {product.rating}
                      </div>
                    </div>

                    <div className="mt-4 space-y-2 text-[11px] text-muted">
                      <div className="flex items-center gap-2">
                        <Store size={13} />
                        <span className="truncate text-ink-soft">
                          {product.supplierName}
                        </span>

                        {product.verified && (
                          <BadgeCheck size={13} className="shrink-0 text-cyan-400" />
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span className="flex items-center gap-1.5">
                          <MapPin size={12} />
                          {product.location}
                        </span>

                        <span className="flex items-center gap-1.5">
                          <Truck size={12} />
                          {product.deliveryDays} days
                        </span>
                      </div>
                    </div>

                    <p className="mt-4 line-clamp-2 text-[11px] leading-5 text-muted">
                      {product.description}
                    </p>

                    <div className="mt-4 flex items-end justify-between gap-3 border-t border-line pt-4">
                      <div>
                        <p className="text-lg font-bold text-ink">
                          {formatMoney(product.unitPrice)}
                        </p>

                        <p className="mt-0.5 text-[10px] text-muted">
                          per unit · MOQ {product.moq.toLocaleString()} ·{" "}
                          {product.availableUnits.toLocaleString()} available
                        </p>
                      </div>

                      <button
                        onClick={() => addToCart(product)}
                        className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
                          inCart
                            ? "border border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                            : "bg-violet-500 text-white hover:bg-violet-400"
                        }`}
                      >
                        <Plus size={14} />
                        {inCart ? "Add more" : "Add"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="glass-panel rounded-2xl px-5 py-16 text-center">
              <Store size={26} className="mx-auto text-muted" />

              <h3 className="mt-3 font-semibold text-ink">No products found</h3>

              <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-muted">
                Try a different search term or category. New supplier listings are added
                regularly.
              </p>
            </div>
          )}
        </div>

        {/* Requisition panel */}
        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <section className="glass-panel rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-ink">Purchase Request</h2>
                <p className="mt-1 text-xs text-muted">
                  {cart.length === 0
                    ? "No products selected"
                    : `${cart.length} product${cart.length > 1 ? "s" : ""} selected`}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                <ShoppingBasket size={19} />
              </div>
            </div>

            {cart.length === 0 ? (
              <div className="mt-5 rounded-xl border border-dashed border-line-strong px-4 py-8 text-center">
                <Package size={22} className="mx-auto text-muted" />

                <p className="mt-3 text-xs font-medium text-ink-soft">
                  Your request is empty
                </p>

                <p className="mt-1 text-[11px] leading-5 text-muted">
                  Add products from the marketplace to build a bulk order.
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-line bg-surface-soft p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-ink">
                          {item.name}
                        </p>
                        <p className="mt-0.5 truncate text-[10px] text-muted">
                          {item.supplierName}
                        </p>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="shrink-0 rounded-md p-1 text-rose-400 hover:bg-rose-500/10"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-1 rounded-lg border border-line">
                        <button
                          onClick={() => changeQuantity(item.id, -item.moq)}
                          className="p-1.5 text-muted hover:text-ink"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>

                        <span className="min-w-[52px] text-center text-[11px] font-medium text-ink">
                          {item.quantity.toLocaleString()}
                        </span>

                        <button
                          onClick={() => changeQuantity(item.id, item.moq)}
                          className="p-1.5 text-muted hover:text-ink"
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <span className="text-xs font-semibold text-ink">
                        {formatMoney(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5 border-t border-line pt-4">
              <div className="flex items-center justify-between text-xs text-muted">
                <span>Estimated total</span>
                <span className="text-lg font-bold text-ink">
                  {formatMoney(cartTotal)}
                </span>
              </div>

              <button
                onClick={submitRequest}
                disabled={cart.length === 0 || submitting}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send size={15} />
                {submitting ? "Submitting..." : "Submit Purchase Request"}
              </button>

              <p className="mt-3 text-center text-[10px] leading-4 text-muted">
                Suppliers confirm availability and final pricing before delivery.
              </p>
            </div>
          </section>

          {/* Trust panel */}
          <section className="glass-panel rounded-2xl p-5">
            <div className="flex items-center gap-2 text-cyan-300">
              <ShieldCheck size={16} />
              <p className="text-xs font-semibold">Buyer protection</p>
            </div>

            <ul className="mt-3 space-y-2.5 text-[11px] leading-5 text-muted">
              <li className="flex items-start gap-2">
                <BadgeCheck size={13} className="mt-0.5 shrink-0 text-cyan-400" />
                {stats.verified} verified product listings
              </li>
              <li className="flex items-start gap-2">
                <Clock3 size={13} className="mt-0.5 shrink-0 text-cyan-400" />
                Quotes answered within 24 hours
              </li>
              <li className="flex items-start gap-2">
                <Truck size={13} className="mt-0.5 shrink-0 text-cyan-400" />
                Delivery tracked from supplier dispatch
              </li>
            </ul>
          </section>

          {/* Recent requests */}
          {requests.length > 0 && (
            <section className="glass-panel rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-ink">Recent Requests</h2>

              <div className="mt-3 space-y-2.5">
                {requests.slice(0, 3).map((request) => (
                  <div
                    key={request.id}
                    className="rounded-lg border border-line bg-surface-soft p-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-semibold text-ink">
                        {request.id}
                      </p>

                      <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[9px] font-medium text-amber-300">
                        {request.status}
                      </span>
                    </div>

                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted">
                      <span>{request.items.length} products</span>
                      <span className="font-semibold text-ink-soft">
                        {formatMoney(request.total)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>
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

      <p className="mt-4 text-xl font-bold text-ink sm:text-2xl">{value}</p>
    </div>
  );
}
