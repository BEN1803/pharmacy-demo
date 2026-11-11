
import {
  AlertTriangle,
  PackageX,
  ArrowUpRight,
} from "lucide-react";

import { stockAlerts } from "@/data/dashboard";

export default function StockAlerts() {
  return (
    <section className="glass-panel min-w-0 rounded-2xl p-5 sm:p-6">

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">
            Inventory Alerts
          </h3>

          <p className="mt-1 text-xs text-muted">
            Products requiring attention
          </p>
        </div>

        <div className="rounded-xl bg-amber-400/10 p-2.5">
          <AlertTriangle size={19} className="text-amber-400" />
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {stockAlerts.map((product) => {
          const outOfStock = product.quantity === 0;

          return (
            <div
              key={product.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] p-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={`rounded-lg p-2 ${
                    outOfStock
                      ? "bg-red-400/10 text-red-400"
                      : "bg-amber-400/10 text-amber-400"
                  }`}
                >
                  {outOfStock ? (
                    <PackageX size={17} />
                  ) : (
                    <AlertTriangle size={17} />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold">
                    {product.name}
                  </p>

                  <p className="mt-1 text-[10px] text-muted">
                    {product.category}
                  </p>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <p
                  className={`text-xs font-semibold ${
                    outOfStock ? "text-red-400" : "text-amber-400"
                  }`}
                >
                  {product.quantity} units
                </p>

                <p className="mt-1 text-[10px] text-muted">
                  {product.status}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] py-3 text-xs font-medium text-gray-300 transition hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-violet-300">
        Manage inventory
        <ArrowUpRight size={14} />
      </button>
    </section>
  );
}
