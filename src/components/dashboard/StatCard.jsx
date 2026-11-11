
import {
  Wallet,
  TrendingUp,
  ShoppingCart,
  Package,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const iconMap = {
  revenue: Wallet,
  profit: TrendingUp,
  sales: ShoppingCart,
  inventory: Package,
};

export default function StatCard({ stat }) {
  const Icon = iconMap[stat.icon];

  const isPositive = stat.trend === "up";

  return (
    <article className="glass-card group rounded-2xl p-5">

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">
          {stat.title}
        </p>

        <div className="rounded-xl border border-violet-400/10 bg-violet-500/10 p-2.5 transition group-hover:bg-violet-500/20">
          <Icon size={19} className="text-violet-300" />
        </div>
      </div>

      <h3 className="mt-5 break-words text-xl font-bold tracking-tight sm:text-2xl">
        {stat.value}
      </h3>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">

        <div
          className={`flex items-center gap-0.5 ${
            isPositive ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {isPositive ? (
            <ArrowUpRight size={14} />
          ) : (
            <ArrowDownRight size={14} />
          )}

          <span className="text-xs font-semibold">
            {stat.change}
          </span>
        </div>

        <span className="text-[11px] text-muted">
          {stat.description}
        </span>
      </div>
    </article>
  );
}
