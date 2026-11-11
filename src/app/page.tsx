
import AppShell from "@/components/layout/AppShell";

import StatCard from "@/components/dashboard/StatCard";
import SalesChart from "@/components/dashboard/SalesChart";
import TopProducts from "@/components/dashboard/TopProducts";
import StockAlerts from "@/components/dashboard/StockAlerts";
import RecentTransactions from "@/components/dashboard/RecentTransactions";

import { dashboardStats } from "@/data/dashboard";

import {
  CalendarDays,
  Download,
} from "lucide-react";

export default function Home() {
  return (
    <AppShell>

      {/* Dashboard welcome */}
      <section className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

        <div>
          <p className="text-sm text-muted">
            Wednesday, 11 November 2026
          </p>

          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Business overview
          </h1>

          <p className="mt-2 text-sm text-muted">
            Monitor your pharmacy performance and daily operations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">

          <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-medium text-gray-300 transition hover:bg-white/10">
            <CalendarDays size={15} />
            November 2026
          </button>

          <button className="flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:bg-violet-400">
            <Download size={15} />
            Export report
          </button>

        </div>
      </section>

      {/* KPI cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat) => (
          <StatCard key={stat.title} stat={stat} />
        ))}
      </section>

      {/* Analytics and top products */}
      <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">

        <div className="min-w-0 xl:col-span-2">
          <SalesChart />
        </div>

        <TopProducts />

      </section>

      {/* Inventory and activity */}
      <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">

        <StockAlerts />

        <div className="glass-panel rounded-2xl p-5 sm:p-6">
          <div>
            <h3 className="text-base font-semibold">
              Business health
            </h3>

            <p className="mt-1 text-xs text-muted">
              A quick look at your operational indicators.
            </p>
          </div>

          <div className="mt-6 space-y-6">

            <div>
              <div className="mb-2 flex justify-between">
                <span className="text-xs text-gray-300">
                  Stock availability
                </span>

                <span className="text-xs font-semibold text-emerald-400">
                  92%
                </span>
              </div>

              <div className="h-2 rounded-full bg-white/[0.06]">
                <div className="h-2 w-[92%] rounded-full bg-emerald-400" />
              </div>
            </div>

            <div>
              <div className="mb-2 flex justify-between">
                <span className="text-xs text-gray-300">
                  Order fulfilment
                </span>

                <span className="text-xs font-semibold text-cyan-400">
                  86%
                </span>
              </div>

              <div className="h-2 rounded-full bg-white/[0.06]">
                <div className="h-2 w-[86%] rounded-full bg-cyan-400" />
              </div>
            </div>

            <div>
              <div className="mb-2 flex justify-between">
                <span className="text-xs text-gray-300">
                  Sales target
                </span>

                <span className="text-xs font-semibold text-violet-400">
                  74%
                </span>
              </div>

              <div className="h-2 rounded-full bg-white/[0.06]">
                <div className="h-2 w-[74%] rounded-full bg-violet-400" />
              </div>
            </div>

          </div>

          <div className="mt-7 rounded-xl border border-violet-400/10 bg-violet-500/[0.06] p-4">
            <p className="text-xs font-semibold text-violet-300">
              Performance insight
            </p>

            <p className="mt-2 text-xs leading-6 text-gray-400">
              Your pharmacy is maintaining strong stock availability.
              Review products with low stock to avoid interrupted sales.
            </p>
          </div>
        </div>

      </section>

      {/* Recent transactions */}
      <section className="mt-6">
        <RecentTransactions />
      </section>

    </AppShell>
  );
}
