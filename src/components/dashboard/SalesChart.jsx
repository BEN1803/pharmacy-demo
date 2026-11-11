
"use client";

import { useState } from "react";

import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Area,
  Line,
} from "recharts";

import { salesData } from "@/data/dashboard";

const periods = [
  { label: "7 Days", value: "week" },
  { label: "This Month", value: "month" },
  { label: "This Year", value: "year" },
];

function formatCurrency(value) {
  if (value >= 1000000) {
    return `TZS ${(value / 1000000).toFixed(1)}M`;
  }

  if (value >= 1000) {
    return `TZS ${(value / 1000).toFixed(0)}K`;
  }

  return `TZS ${value}`;
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className="glass-panel rounded-xl border border-white/10 p-3 shadow-xl">
      <p className="mb-3 text-xs font-semibold text-white">
        {label}
      </p>

      {payload.map((item) => (
        <div
          key={item.dataKey}
          className="mb-2 flex items-center justify-between gap-5"
        >
          <span className="text-[11px] text-muted">
            {item.name}
          </span>

          <span className="text-xs font-semibold text-white">
            {formatCurrency(item.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function SalesChart() {
  const [period, setPeriod] = useState("week");

  const data = salesData[period];

  const totalRevenue = data.reduce(
    (total, item) => total + item.revenue,
    0
  );

  const totalProfit = data.reduce(
    (total, item) => total + item.profit,
    0
  );

  return (
    <section className="glass-panel min-w-0 rounded-2xl p-5 sm:p-6">

      {/* Chart header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <div>
          <h3 className="text-base font-semibold">
            Revenue & Profit
          </h3>

          <p className="mt-1 text-xs text-muted">
            Track your pharmacy financial performance
          </p>
        </div>

        {/* Period filter */}
        <div className="flex w-fit items-center gap-1 rounded-xl border border-white/[0.07] bg-white/[0.035] p-1">
          {periods.map((item) => (
            <button
              key={item.value}
              onClick={() => setPeriod(item.value)}
              className={`rounded-lg px-3 py-2 text-[10px] font-medium transition sm:text-xs ${
                period === item.value
                  ? "bg-violet-500/20 text-violet-300"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary figures */}
      <div className="mt-6 flex flex-wrap gap-6">

        <div>
          <p className="text-[11px] text-muted">
            Total Revenue
          </p>

          <p className="mt-1 text-lg font-bold">
            {formatCurrency(totalRevenue)}
          </p>
        </div>

        <div>
          <p className="text-[11px] text-muted">
            Total Gross Profit
          </p>

          <p className="mt-1 text-lg font-bold text-emerald-400">
            {formatCurrency(totalProfit)}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="mt-8 h-[260px] w-full sm:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 5, left: -15, bottom: 0 }}
          >
            <defs>
              <linearGradient
                id="revenueGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#8b5cf6"
                  stopOpacity={0.35}
                />

                <stop
                  offset="95%"
                  stopColor="#8b5cf6"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              stroke="rgba(255,255,255,0.06)"
              vertical={false}
            />

            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9299b2", fontSize: 11 }}
              dy={10}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9299b2", fontSize: 10 }}
              tickFormatter={(value) =>
                `${(value / 1000000).toFixed(0)}M`
              }
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke="#a78bfa"
              strokeWidth={2.5}
              fill="url(#revenueGradient)"
              activeDot={{ r: 5, fill: "#a78bfa" }}
            />

            <Line
              type="monotone"
              dataKey="profit"
              name="Gross Profit"
              stroke="#22d3ee"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-5 flex flex-wrap items-center gap-5 border-t border-white/[0.07] pt-4">

        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-violet-400" />
          <span className="text-xs text-muted">Revenue</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-cyan-400" />
          <span className="text-xs text-muted">Gross Profit</span>
        </div>
      </div>
    </section>
  );
}
