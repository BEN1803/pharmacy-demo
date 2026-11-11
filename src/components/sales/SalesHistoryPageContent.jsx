
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  Search,
  Receipt,
  Banknote,
  Smartphone,
  CreditCard,
  ShoppingBag,
  TrendingUp,
  Eye,
  X,
  CalendarDays,
  ShoppingCart,
  Download,
  Printer,
  ArrowUpRight,
  Package,
  Filter,
} from "lucide-react";

import { usePharmacy } from "@/context/PharmacyContext";

// Format amounts as Tanzanian Shillings.
const formatMoney = (amount) =>
  new Intl.NumberFormat("en-TZ", {
    style: "currency",
    currency: "TZS",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

// Format transaction dates.
const formatDate = (date) => {
  if (!date) return "Date unavailable";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Invalid date";
  }

  return parsedDate.toLocaleString("en-TZ", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

// Get the appropriate payment icon.
const getPaymentIcon = (method) => {
  switch (method) {
    case "Cash":
      return Banknote;
    case "Mobile":
      return Smartphone;
    case "Card":
      return CreditCard;
    default:
      return Receipt;
  }
};

export default function SalesHistoryPageContent() {
  const { sales, loaded } = usePharmacy();

  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [selectedSale, setSelectedSale] = useState(null);
  const [currentTime, setCurrentTime] = useState(null);

  // Initialize the current time after the component mounts.
  // This avoids dynamic Date() calls during Next.js prerendering.
  useEffect(() => {
    setCurrentTime(Date.now());
  }, []);

  // Calculate summary information.
  const summary = useMemo(() => {
    const totalRevenue = sales.reduce(
      (total, sale) => total + Number(sale.total || 0),
      0
    );

    const totalDiscount = sales.reduce(
      (total, sale) => total + Number(sale.discount || 0),
      0
    );

    const totalItems = sales.reduce(
      (total, sale) =>
        total +
        (sale.items || []).reduce(
          (sum, item) => sum + Number(item.quantity || 0),
          0
        ),
      0
    );

    const transactionCount = sales.length;

    const averageSale =
      transactionCount > 0
        ? totalRevenue / transactionCount
        : 0;

    return {
      totalRevenue,
      totalDiscount,
      totalItems,
      transactionCount,
      averageSale,
    };
  }, [sales]);

  // Search and filter transactions.
  const filteredSales = useMemo(() => {
    if (!currentTime) return [];

    const currentDate = new Date(currentTime);

    return sales.filter((sale) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        sale.id?.toLowerCase().includes(searchValue) ||
        (sale.items || []).some((item) =>
          item.name?.toLowerCase().includes(searchValue)
        );

      const matchesPayment =
        paymentFilter === "All" ||
        sale.paymentMethod === paymentFilter;

      let matchesDate = true;

      if (dateFilter !== "All") {
        const saleDate = new Date(sale.date);

        if (Number.isNaN(saleDate.getTime())) {
          matchesDate = false;
        } else {
          const startOfToday = new Date(currentDate);
          startOfToday.setHours(0, 0, 0, 0);

          const startOfSaleDate = new Date(saleDate);
          startOfSaleDate.setHours(0, 0, 0, 0);

          const daysDifference = Math.floor(
            (startOfToday.getTime() -
              startOfSaleDate.getTime()) /
              (1000 * 60 * 60 * 24)
          );

          if (dateFilter === "Today") {
            matchesDate =
              startOfSaleDate.getTime() ===
              startOfToday.getTime();
          }

          if (dateFilter === "7 Days") {
            matchesDate =
              daysDifference >= 0 && daysDifference < 7;
          }

          if (dateFilter === "30 Days") {
            matchesDate =
              daysDifference >= 0 && daysDifference < 30;
          }
        }
      }

      return matchesSearch && matchesPayment && matchesDate;
    });
  }, [
    sales,
    search,
    paymentFilter,
    dateFilter,
    currentTime,
  ]);

  // Export the filtered transactions as a CSV file.
  const exportCSV = () => {
    if (filteredSales.length === 0) return;

    const headers = [
      "Transaction ID",
      "Date",
      "Payment Method",
      "Items",
      "Subtotal",
      "Discount",
      "Total",
      "Status",
    ];

    const rows = filteredSales.map((sale) => [
      sale.id,
      formatDate(sale.date),
      sale.paymentMethod,
      (sale.items || [])
        .map((item) => `${item.name} x ${item.quantity}`)
        .join("; "),
      sale.subtotal,
      sale.discount,
      sale.total,
      sale.status || "Completed",
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

    const blob = new Blob(
      ["\uFEFF" + csvContent],
      { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `mediflow-sales-${Date.now()}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // Open a printable receipt in a separate window.
  const printReceipt = (sale) => {
    const printWindow = window.open(
      "",
      "_blank",
      "width=800,height=700"
    );

    if (!printWindow) {
      alert("Please allow pop-ups to print receipts.");
      return;
    }

    const itemsHTML = (sale.items || [])
      .map(
        (item) => `
          <tr>
            <td>${escapeHTML(item.name)}</td>
            <td>${Number(item.quantity || 0)}</td>
            <td>${formatMoney(item.sellingPrice)}</td>
            <td>${formatMoney(
              Number(item.sellingPrice || 0) *
                Number(item.quantity || 0)
            )}</td>
          </tr>
        `
      )
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${escapeHTML(sale.id)}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 600px;
              margin: 40px auto;
              padding: 20px;
              color: #222;
            }

            .header {
              text-align: center;
              margin-bottom: 30px;
            }

            .header h1 {
              margin-bottom: 5px;
              color: #2563eb;
            }

            .details {
              margin-bottom: 20px;
              font-size: 13px;
            }

            .details p {
              display: flex;
              justify-content: space-between;
              gap: 20px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 12px;
            }

            th, td {
              padding: 10px 5px;
              border-bottom: 1px solid #ddd;
              text-align: left;
            }

            th {
              background: #f4f4f5;
            }

            .totals {
              margin-top: 20px;
              margin-left: auto;
              width: 230px;
            }

            .totals p {
              display: flex;
              justify-content: space-between;
            }

            .total {
              font-size: 18px;
              font-weight: bold;
              border-top: 1px solid #222;
              padding-top: 12px;
            }

            .footer {
              text-align: center;
              margin-top: 40px;
              font-size: 12px;
              color: #666;
            }

            @media print {
              body {
                margin: 0 auto;
              }
            }
          </style>
        </head>

        <body>
          <div class="header">
            <h1>MediFlow Pharmacy</h1>
            <p>Sales Receipt</p>
          </div>

          <div class="details">
            <p>
              <strong>Transaction ID</strong>
              <span>${escapeHTML(sale.id)}</span>
            </p>

            <p>
              <strong>Date</strong>
              <span>${escapeHTML(formatDate(sale.date))}</span>
            </p>

            <p>
              <strong>Payment Method</strong>
              <span>${escapeHTML(sale.paymentMethod)}</span>
            </p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>

            <tbody>
              ${itemsHTML}
            </tbody>
          </table>

          <div class="totals">
            <p>
              <span>Subtotal</span>
              <span>${formatMoney(sale.subtotal)}</span>
            </p>

            <p>
              <span>Discount</span>
              <span>${formatMoney(sale.discount)}</span>
            </p>

            <p class="total">
              <span>Total</span>
              <span>${formatMoney(sale.total)}</span>
            </p>
          </div>

          <div class="footer">
            <p>Thank you for choosing MediFlow Pharmacy.</p>
            <p>Demo receipt - No real payment processed.</p>
          </div>

          <script>
            window.onload = function () {
              window.print();
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  // Escape user-provided values before inserting them into receipt HTML.
  function escapeHTML(value) {
    return String(value ?? "").replace(
      /[&<>"']/g,
      (character) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;",
        })[character]
    );
  }

  // Loading screen.
  if (!loaded || !currentTime) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-500" />

          <p className="mt-4 text-sm text-muted">
            Loading sales history...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted">
            <ShoppingBag size={16} />
            Pharmacy / Sales
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Sales History
          </h1>

          <p className="mt-1 text-sm text-muted">
            Track transactions, revenue and customer purchases.
          </p>
        </div>

        <button
          onClick={exportCSV}
          disabled={filteredSales.length === 0}
          className="flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm font-semibold transition hover:border-blue-500/40 hover:text-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Download size={17} />
          Export CSV
        </button>
      </div>

      {/* Sales navigation tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--border)]">
        <Link
          href="/sales"
          className="flex items-center gap-2 border-b-2 border-transparent px-4 py-3 text-sm font-medium text-muted transition hover:border-blue-500/50 hover:text-foreground"
        >
          <ShoppingCart size={17} />
          New Sale
        </Link>

        <Link
          href="/sales/history"
          className="flex items-center gap-2 border-b-2 border-blue-500 px-4 py-3 text-sm font-semibold text-blue-500"
        >
          <Receipt size={17} />
          Sales History
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Revenue"
          value={formatMoney(summary.totalRevenue)}
          description="Revenue from recorded sales"
          icon={Banknote}
          color="emerald"
        />

        <SummaryCard
          title="Transactions"
          value={summary.transactionCount}
          description="Completed transactions"
          icon={Receipt}
          color="blue"
        />

        <SummaryCard
          title="Items Sold"
          value={summary.totalItems.toLocaleString()}
          description="Total medicine units sold"
          icon={Package}
          color="violet"
        />

        <SummaryCard
          title="Average Sale"
          value={formatMoney(summary.averageSale)}
          description="Average transaction value"
          icon={TrendingUp}
          color="amber"
        />
      </div>

      {/* Additional discount summary */}
      <div className="flex flex-col gap-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-amber-500/10 p-3 text-amber-500">
            <ArrowUpRight size={20} />
          </div>

          <div>
            <p className="text-sm font-semibold">
              Discounts given
            </p>

            <p className="text-xs text-muted">
              Total discounts across recorded transactions
            </p>
          </div>
        </div>

        <p className="text-xl font-bold text-amber-500">
          {formatMoney(summary.totalDiscount)}
        </p>
      </div>

      {/* Filters */}
      <div className="glass-panel space-y-4 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <Filter size={17} className="text-blue-500" />
          <h2 className="font-semibold">Filter transactions</h2>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {/* Search */}
          <div className="relative">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search transaction or medicine..."
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500"
            />
          </div>

          {/* Payment filter */}
          <select
            value={paymentFilter}
            onChange={(event) =>
              setPaymentFilter(event.target.value)
            }
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-3 text-sm outline-none focus:border-blue-500"
          >
            <option value="All">All payment methods</option>
            <option value="Cash">Cash</option>
            <option value="Mobile">Mobile</option>
            <option value="Card">Card</option>
          </select>

          {/* Date filter */}
          <select
            value={dateFilter}
            onChange={(event) =>
              setDateFilter(event.target.value)
            }
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-3 text-sm outline-none focus:border-blue-500"
          >
            <option value="All">All dates</option>
            <option value="Today">Today</option>
            <option value="7 Days">Last 7 days</option>
            <option value="30 Days">Last 30 days</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-muted">
            Showing {filteredSales.length} of {sales.length} transactions
          </p>

          <button
            onClick={() => {
              setSearch("");
              setPaymentFilter("All");
              setDateFilter("All");
            }}
            className="text-xs font-semibold text-blue-500 transition hover:text-blue-600"
          >
            Clear filters
          </button>
        </div>
      </div>

      {/* Transaction table */}
      <div className="glass-panel overflow-hidden rounded-2xl">
        <div className="flex flex-col gap-2 border-b border-[var(--border)] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <h2 className="font-bold">Transactions</h2>

            <p className="mt-1 text-xs text-muted">
              View and manage completed pharmacy sales.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted">
            <CalendarDays size={15} />
            Transaction records
          </div>
        </div>

        {filteredSales.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
              <Receipt size={27} />
            </div>

            <h3 className="mt-4 font-semibold">
              {sales.length === 0
                ? "No sales recorded yet"
                : "No matching transactions"}
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
              {sales.length === 0
                ? "Completed sales will automatically appear here. Start by creating your first transaction."
                : "Try changing your search term or filters to find a transaction."}
            </p>

            {sales.length === 0 && (
              <Link
                href="/sales"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <ShoppingCart size={16} />
                Create a sale
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--background)]/60 text-xs text-muted">
                  <th className="px-5 py-4 font-semibold">
                    Transaction
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Date
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Items
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Payment
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Total
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right font-semibold">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredSales.map((sale) => {
                  const PaymentIcon = getPaymentIcon(
                    sale.paymentMethod
                  );

                  const itemCount = (sale.items || []).reduce(
                    (sum, item) =>
                      sum + Number(item.quantity || 0),
                    0
                  );

                  return (
                    <tr
                      key={sale.id}
                      className="border-b border-[var(--border)] transition last:border-0 hover:bg-[var(--background)]/50"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold">
                          {sale.id}
                        </p>

                        <p className="mt-1 text-xs text-muted">
                          Pharmacy sale
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm">
                          {formatDate(sale.date)}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-medium">
                          {itemCount} units
                        </p>

                        <p className="mt-1 text-xs text-muted">
                          {(sale.items || []).length} products
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="rounded-lg bg-blue-500/10 p-2 text-blue-500">
                            <PaymentIcon size={15} />
                          </div>

                          <span className="text-sm">
                            {sale.paymentMethod}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-bold">
                          {formatMoney(sale.total)}
                        </p>

                        {Number(sale.discount) > 0 && (
                          <p className="mt-1 text-xs text-emerald-500">
                            Discount: {formatMoney(sale.discount)}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-500">
                          {sale.status || "Completed"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setSelectedSale(sale)}
                          className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-semibold transition hover:border-blue-500/40 hover:text-blue-500"
                        >
                          <Eye size={15} />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction receipt modal */}
      {selectedSale && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setSelectedSale(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-2xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Modal heading */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-blue-500">
                  <Receipt size={20} />
                  <span className="text-sm font-semibold">
                    Sales receipt
                  </span>
                </div>

                <h2 className="mt-2 text-xl font-bold">
                  Transaction details
                </h2>

                <p className="mt-1 text-xs text-muted">
                  {selectedSale.id}
                </p>
              </div>

              <button
                onClick={() => setSelectedSale(null)}
                className="rounded-lg p-2 text-muted transition hover:bg-[var(--background)] hover:text-foreground"
                aria-label="Close receipt"
              >
                <X size={19} />
              </button>
            </div>

            {/* Transaction information */}
            <div className="mt-5 rounded-xl border border-[var(--border)] p-4">
              <div className="flex justify-between gap-3 text-sm">
                <span className="text-muted">Date</span>
                <span className="text-right font-medium">
                  {formatDate(selectedSale.date)}
                </span>
              </div>

              <div className="mt-3 flex justify-between text-sm">
                <span className="text-muted">
                  Payment method
                </span>

                <span className="font-medium">
                  {selectedSale.paymentMethod}
                </span>
              </div>

              <div className="mt-3 flex justify-between text-sm">
                <span className="text-muted">Status</span>

                <span className="font-semibold text-emerald-500">
                  {selectedSale.status || "Completed"}
                </span>
              </div>
            </div>

            {/* Purchased items */}
            <div className="mt-5">
              <h3 className="text-sm font-semibold">
                Purchased medicines
              </h3>

              <div className="mt-3 space-y-3">
                {(selectedSale.items || []).map(
                  (item, index) => (
                    <div
                      key={`${item.id}-${index}`}
                      className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-3 last:border-0"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {item.name}
                        </p>

                        <p className="mt-1 text-xs text-muted">
                          {item.quantity} ×{" "}
                          {formatMoney(item.sellingPrice)}
                        </p>
                      </div>

                      <p className="shrink-0 text-sm font-bold">
                        {formatMoney(
                          item.sellingPrice * item.quantity
                        )}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Totals */}
            <div className="mt-4 space-y-3 border-t border-[var(--border)] pt-4 text-sm">
              <div className="flex justify-between text-muted">
                <span>Subtotal</span>
                <span>
                  {formatMoney(selectedSale.subtotal)}
                </span>
              </div>

              <div className="flex justify-between text-muted">
                <span>Discount</span>
                <span className="text-emerald-500">
                  -{formatMoney(selectedSale.discount)}
                </span>
              </div>

              <div className="flex justify-between border-t border-[var(--border)] pt-3">
                <span className="font-bold">Total paid</span>

                <span className="text-xl font-bold text-blue-500">
                  {formatMoney(selectedSale.total)}
                </span>
              </div>
            </div>

            {/* Receipt actions */}
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <button
                onClick={() => printReceipt(selectedSale)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <Printer size={17} />
                Print receipt
              </button>

              <button
                onClick={() => setSelectedSale(null)}
                className="rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-semibold transition hover:bg-[var(--background)]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable summary card.
function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
  color,
}) {
  const colorClasses = {
    emerald: "bg-emerald-500/10 text-emerald-500",
    blue: "bg-blue-500/10 text-blue-500",
    violet: "bg-violet-500/10 text-violet-500",
    amber: "bg-amber-500/10 text-amber-500",
  };

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted">{title}</p>

          <h3 className="mt-3 text-2xl font-bold tracking-tight">
            {value}
          </h3>
        </div>

        <div
          className={`rounded-xl p-3 ${
            colorClasses[color] || colorClasses.blue
          }`}
        >
          <Icon size={21} />
        </div>
      </div>

      <p className="mt-3 text-xs text-muted">
        {description}
      </p>
    </div>
  );
}
