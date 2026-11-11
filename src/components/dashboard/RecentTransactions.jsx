
import { ArrowUpRight, ReceiptText } from "lucide-react";

import { recentTransactions } from "@/data/dashboard";

function formatCurrency(value) {
  return `TZS ${value.toLocaleString("en-US")}`;
}

export default function RecentTransactions() {
  return (
    <section className="glass-panel min-w-0 rounded-2xl p-5 sm:p-6">

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">
            Recent Transactions
          </h3>

          <p className="mt-1 text-xs text-muted">
            Latest activity from your pharmacy
          </p>
        </div>

        <ReceiptText size={19} className="text-violet-400" />
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[650px] text-left">

          <thead>
            <tr className="border-b border-white/[0.07] text-[10px] uppercase tracking-wider text-muted">
              <th className="pb-4 font-medium">Transaction</th>
              <th className="pb-4 font-medium">Customer</th>
              <th className="pb-4 font-medium">Payment</th>
              <th className="pb-4 font-medium">Time</th>
              <th className="pb-4 text-right font-medium">Amount</th>
              <th className="pb-4 text-right font-medium">Status</th>
            </tr>
          </thead>

          <tbody>
            {recentTransactions.map((transaction) => (
              <tr
                key={transaction.id}
                className="border-b border-white/[0.04] last:border-0"
              >
                <td className="py-4">
                  <p className="text-xs font-semibold">
                    {transaction.id}
                  </p>

                  <p className="mt-1 text-[10px] text-muted">
                    {transaction.product}
                  </p>
                </td>

                <td className="py-4 text-xs text-gray-300">
                  {transaction.customer}
                </td>

                <td className="py-4 text-xs text-gray-300">
                  {transaction.payment}
                </td>

                <td className="py-4 text-xs text-muted">
                  {transaction.time}
                </td>

                <td className="py-4 text-right text-xs font-semibold">
                  {formatCurrency(transaction.amount)}
                </td>

                <td className="py-4 text-right">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${
                      transaction.status === "Completed"
                        ? "bg-emerald-400/10 text-emerald-400"
                        : "bg-amber-400/10 text-amber-400"
                    }`}
                  >
                    {transaction.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button className="mt-5 flex items-center gap-2 text-xs font-medium text-violet-300 transition hover:text-violet-200">
        View all transactions
        <ArrowUpRight size={14} />
      </button>
    </section>
  );
}
