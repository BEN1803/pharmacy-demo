
import { Trophy, ArrowUpRight } from "lucide-react";

import { topProducts } from "@/data/dashboard";

function formatCurrency(value) {
  return `TZS ${value.toLocaleString("en-US")}`;
}

export default function TopProducts() {
  return (
    <section className="glass-panel min-w-0 rounded-2xl p-5 sm:p-6">

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">
            Top Selling Products
          </h3>

          <p className="mt-1 text-xs text-muted">
            Your best-performing medicines
          </p>
        </div>

        <div className="rounded-xl bg-amber-400/10 p-2.5">
          <Trophy size={19} className="text-amber-400" />
        </div>
      </div>

      <div className="mt-6 space-y-5">
        {topProducts.map((product, index) => (
          <div key={product.id}>

            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-xs font-semibold text-gray-400">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-white">
                    {product.name}
                  </p>

                  <p className="mt-1 text-[10px] text-muted">
                    {product.category}
                  </p>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-xs font-semibold">
                  {formatCurrency(product.revenue)}
                </p>

                <p className="mt-1 text-[10px] text-muted">
                  {product.sold} sold
                </p>
              </div>
            </div>

            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-500"
                style={{ width: `${product.share}%` }}
              />
            </div>

          </div>
        ))}
      </div>

      <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] py-3 text-xs font-medium text-gray-300 transition hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-violet-300">
        View product analytics
        <ArrowUpRight size={14} />
      </button>
    </section>
  );
}
