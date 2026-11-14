"use client";

import { useMemo, useState } from "react";

import {
  TrendingUp,
  Wallet,
  ShoppingCart,
  Users,
  Percent,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Lightbulb,
  TriangleAlert,
  CircleDot,
} from "lucide-react";

import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import {
  analyticsKpis,
  monthlyPerformance,
  categoryPerformance,
  paymentMix,
  hourlySales,
  topSellingMedicines,
  analyticsInsights,
} from "@/data/analytics";

const kpiIcons = {
  revenue: Wallet,
  profit: TrendingUp,
  orders: ShoppingCart,
  returns: Users,
};

const kpiColors = {
  revenue: "bg-violet-500/10 text-violet-300 border-violet-500/10",
  profit: "bg-emerald-500/10 text-emerald-300 border-emerald-500/10",
  orders: "bg-cyan-500/10 text-cyan-300 border-cyan-500/10",
  returns: "bg-amber-500/10 text-amber-300 border-amber-500/10",
};

const donutColors = ["#8b5cf6", "#22d3ee", "#34d399", "#fbbf24", "#f472b6", "#60a5fa"];

const formatMoney = (amount) =>
  new Intl.NumberFormat("en-TZ", {
    style: "currency",
    currency: "TZS",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

const formatCompact = (value) => {
  if (value >= 1000000) return `TZS ${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `TZS ${Math.round(value / 1000)}K`;

  return `TZS ${value}`;
};

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="glass-panel rounded-xl border border-line p-3 shadow-xl">
      <p className="mb-2 text-xs font-semibold text-ink">{label}</p>

      {payload.map((item) => (
        <div
          key={item.dataKey}
          className="mt-1 flex items-center justify-between gap-5"
        >
          <span className="text-[11px] text-muted">{item.name}</span>
          <span className="text-xs font-semibold text-ink">
            {formatCompact(item.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPageContent() {
  const [range, setRange] = useState("12m");

  const performance = useMemo(
    () => (range === "6m" ? monthlyPerformance.slice(-6) : monthlyPerformance),
    [range]
  );

  const totals = useMemo(() => {
    const revenue = performance.reduce((sum, item) => sum + item.revenue, 0);
    const profit = performance.reduce((sum, item) => sum + item.profit, 0);
    const target = performance.reduce((sum, item) => sum + item.target, 0);

    return { revenue, profit, target, attainment: Math.round((revenue / target) * 100) };
  }, [performance]);

  return (
    <div className="space-y-7 pb-10">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs text-muted">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-violet-300">Analytics</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Business Analytics
          </h1>

          <p className="mt-2 text-sm text-muted">
            Understand sales performance, product mix and customer behaviour.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-xl border border-line bg-surface p-1">
            {[
              { label: "6 Months", value: "6m" },
              { label: "12 Months", value: "12m" },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => setRange(item.value)}
                className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                  range === item.value
                    ? "bg-violet-500/20 text-violet-300"
                    : "text-muted hover:text-ink"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button className="flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:bg-violet-400">
            <Download size={15} />
            Export report
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {analyticsKpis.map((kpi) => {
          const Icon = kpiIcons[kpi.id];
          const positive = kpi.trend === "up";

          return (
            <div
              key={kpi.id}
              className="glass-card rounded-2xl border border-line p-5 transition hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted">{kpi.label}</p>

                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border ${kpiColors[kpi.id]}`}
                >
                  <Icon size={19} />
                </div>
              </div>

              <p className="mt-4 text-2xl font-bold text-ink">
                {kpi.suffix
                  ? `${kpi.value}${kpi.suffix}`
                  : formatMoney(kpi.value)}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span
                  className={`flex items-center gap-0.5 text-xs font-semibold ${
                    positive ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {positive ? (
                    <ArrowUpRight size={14} />
                  ) : (
                    <ArrowDownRight size={14} />
                  )}
                  {kpi.change}%
                </span>

                <span className="text-[11px] text-muted">{kpi.caption}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue vs target */}
      <section className="glass-panel rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <h2 className="text-base font-semibold text-ink">
              Revenue vs Target
            </h2>

            <p className="mt-1 text-xs text-muted">
              Monthly revenue, gross profit and the sales target.
            </p>
          </div>

          <div className="flex flex-wrap gap-5">
            <div>
              <p className="text-[11px] text-muted">Revenue</p>
              <p className="mt-1 text-base font-bold text-ink">
                {formatCompact(totals.revenue)}
              </p>
            </div>

            <div>
              <p className="text-[11px] text-muted">Gross profit</p>
              <p className="mt-1 text-base font-bold text-emerald-400">
                {formatCompact(totals.profit)}
              </p>
            </div>

            <div>
              <p className="text-[11px] text-muted">Target attainment</p>
              <p className="mt-1 text-base font-bold text-cyan-400">
                {totals.attainment}%
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 h-[280px] w-full sm:h-[330px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={performance}
              margin={{ top: 10, right: 8, left: -12, bottom: 0 }}
            >
              <defs>
                <linearGradient id="analyticsRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid stroke="var(--chart-grid)" vertical={false} />

              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--muted)", fontSize: 11 }}
                dy={10}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--muted)", fontSize: 10 }}
                tickFormatter={(value) =>
                  `${(value / 1000000).toFixed(1).replace(/\.0$/, "")}M`
                }
              />

              <Tooltip content={<ChartTooltip />} />

              <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#a78bfa"
                strokeWidth={2.5}
                fill="url(#analyticsRevenue)"
                activeDot={{ r: 5 }}
              />

              <Line
                type="monotone"
                dataKey="profit"
                name="Gross profit"
                stroke="#34d399"
                strokeWidth={2}
                dot={false}
              />

              <Line
                type="monotone"
                dataKey="target"
                name="Target"
                stroke="#22d3ee"
                strokeWidth={1.5}
                strokeDasharray="5 5"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-5 border-t border-line pt-4">
          {[
            { color: "bg-violet-400", label: "Revenue" },
            { color: "bg-emerald-400", label: "Gross profit" },
            { color: "bg-cyan-400", label: "Target" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${item.color}`} />
              <span className="text-xs text-muted">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Category mix, payments, hourly */}
      <div className="grid gap-6 xl:grid-cols-3">
        <section className="glass-panel rounded-2xl p-5 sm:p-6">
          <h2 className="text-base font-semibold text-ink">
            Sales by Category
          </h2>
          <p className="mt-1 text-xs text-muted">
            Share of revenue this period.
          </p>

          <div className="mt-4 h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryPerformance}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={54}
                  outerRadius={82}
                  paddingAngle={3}
                  stroke="none"
                >
                  {categoryPerformance.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={donutColors[index % donutColors.length]}
                    />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(value, name) => [`${value}%`, name]}
                  contentStyle={{
                    background: "var(--panel)",
                    border: "1px solid var(--line)",
                    borderRadius: 12,
                    fontSize: 12,
                    color: "var(--foreground)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 space-y-2.5">
            {categoryPerformance.map((category, index) => (
              <div
                key={category.name}
                className="flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: donutColors[index % donutColors.length],
                    }}
                  />
                  <span className="text-ink-soft">{category.name}</span>
                </div>

                <span className="font-medium text-muted">{category.value}%</span>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-panel rounded-2xl p-5 sm:p-6">
          <h2 className="text-base font-semibold text-ink">
            Payment Methods
          </h2>
          <p className="mt-1 text-xs text-muted">
            How customers completed their purchases.
          </p>

          <div className="mt-6 space-y-5">
            {paymentMix.map((payment) => (
              <div key={payment.name}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs text-ink-soft">{payment.name}</span>
                  <span className="text-xs font-semibold text-ink">
                    {payment.value}%
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-surface-strong">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${payment.value}%`,
                      backgroundColor: payment.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-cyan-400/10 bg-cyan-500/[0.06] p-4">
            <div className="flex items-center gap-2 text-cyan-300">
              <Percent size={15} />
              <p className="text-xs font-semibold">Collection rate</p>
            </div>

            <p className="mt-2 text-2xl font-bold text-ink">97.4%</p>
            <p className="mt-1 text-[11px] leading-5 text-muted">
              Of invoiced sales were fully collected this month.
            </p>
          </div>
        </section>

        <section className="glass-panel rounded-2xl p-5 sm:p-6">
          <h2 className="text-base font-semibold text-ink">
            Sales by Hour
          </h2>
          <p className="mt-1 text-xs text-muted">
            Average revenue across opening hours.
          </p>

          <div className="mt-5 h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={hourlySales}
                margin={{ top: 5, right: 0, left: -18, bottom: 0 }}
              >
                <CartesianGrid
                  stroke="var(--chart-grid)"
                  vertical={false}
                />

                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted)", fontSize: 10 }}
                  dy={8}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted)", fontSize: 9 }}
                  tickFormatter={(value) => `${value / 1000}K`}
                />

                <Tooltip
                  cursor={{ fill: "var(--surface)" }}
                  formatter={(value) => [formatMoney(value), "Revenue"]}
                  contentStyle={{
                    background: "var(--panel)",
                    border: "1px solid var(--line)",
                    borderRadius: 12,
                    fontSize: 12,
                    color: "var(--foreground)",
                  }}
                />

                <Bar
                  dataKey="value"
                  name="Revenue"
                  fill="#8b5cf6"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={34}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 flex items-start gap-3 rounded-xl border border-violet-400/10 bg-violet-500/[0.06] p-4">
            <Lightbulb size={17} className="mt-0.5 shrink-0 text-violet-300" />

            <p className="text-[11px] leading-5 text-muted">
              The 4 PM – 8 PM window generates the highest hourly revenue.
              Schedule your strongest cashier for that period.
            </p>
          </div>
        </section>
      </div>

      {/* Top products + insights */}
      <div className="grid gap-6 xl:grid-cols-3">
        <section className="glass-panel overflow-hidden rounded-2xl xl:col-span-2">
          <div className="border-b border-line p-5">
            <h2 className="font-semibold text-ink">Top Selling Medicines</h2>
            <p className="mt-1 text-xs text-muted">
              Ranked by units sold this month.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left">
              <thead>
                <tr className="border-b border-line bg-surface-soft text-[10px] uppercase tracking-wider text-muted">
                  <th className="px-5 py-3.5 font-semibold">Medicine</th>
                  <th className="px-5 py-3.5 font-semibold">Units</th>
                  <th className="px-5 py-3.5 font-semibold">Revenue</th>
                  <th className="px-5 py-3.5 font-semibold">Margin</th>
                  <th className="px-5 py-3.5 text-right font-semibold">
                    Performance
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-line">
                {topSellingMedicines.map((medicine) => (
                  <tr
                    key={medicine.id}
                    className="transition hover:bg-hover"
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-ink">
                        {medicine.name}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted">
                        {medicine.category}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-ink-soft">
                      {medicine.units}
                    </td>

                    <td className="px-5 py-4 text-sm font-semibold text-ink">
                      {formatMoney(medicine.revenue)}
                    </td>

                    <td className="px-5 py-4 text-sm text-emerald-300">
                      {medicine.margin}%
                    </td>

                    <td className="px-5 py-4">
                      <div className="ml-auto h-1.5 w-28 overflow-hidden rounded-full bg-surface-strong">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400"
                          style={{
                            width: `${Math.round(
                              (medicine.units /
                                topSellingMedicines[0].units) * 100
                            )}%`,
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="glass-panel rounded-2xl p-5 sm:p-6">
          <h2 className="text-base font-semibold text-ink">
            Performance Insights
          </h2>
          <p className="mt-1 text-xs text-muted">
            Automated observations from your data.
          </p>

          <div className="mt-5 space-y-3">
            {analyticsInsights.map((insight) => {
              const tone = {
                positive: {
                  icon: TrendingUp,
                  className: "text-emerald-300 bg-emerald-500/10",
                },
                warning: {
                  icon: TriangleAlert,
                  className: "text-amber-300 bg-amber-500/10",
                },
                neutral: {
                  icon: CircleDot,
                  className: "text-cyan-300 bg-cyan-500/10",
                },
              }[insight.tone];

              const Icon = tone.icon;

              return (
                <div
                  key={insight.id}
                  className="rounded-xl border border-line bg-surface-soft p-4"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tone.className}`}
                    >
                      <Icon size={15} />
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-ink">
                        {insight.title}
                      </p>
                      <p className="mt-1 text-[11px] leading-5 text-muted">
                        {insight.detail}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 border-t border-line pt-4">
            <p className="text-[11px] text-muted">
              Data refreshed 5 minutes ago
            </p>
            <p className="mt-1 text-[10px] text-muted">
              Demo figures for the November 2026 trading period.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
