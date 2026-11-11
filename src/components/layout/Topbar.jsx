
"use client";

import { useState } from "react";

import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  Settings,
  User,
  LogOut,
  CheckCheck,
} from "lucide-react";

export default function Topbar({
  onMenuClick,
  pageTitle,
}) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-white/[0.07] bg-[#080b18]/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8">

      {/* Left section */}
      <div className="flex min-w-0 items-center gap-3 sm:gap-5">

        <button
          onClick={onMenuClick}
          className="rounded-xl border border-white/10 bg-white/[0.04] p-2 text-gray-300 hover:bg-white/10 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu size={19} />
        </button>

        <div className="min-w-0">
          <p className="hidden text-[10px] font-medium tracking-[0.15em] text-muted sm:block">
            RETAIL WORKSPACE
          </p>

          <h2 className="truncate text-base font-semibold text-white sm:mt-1 sm:text-lg">
            {pageTitle}
          </h2>
        </div>
      </div>

      {/* Right section */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-4">

        {/* Search */}
        <div className="hidden w-48 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 md:flex lg:w-64">
          <Search size={16} className="text-gray-500" />

          <input
            type="text"
            placeholder="Search anything..."
            className="w-full bg-transparent text-xs text-white outline-none placeholder:text-gray-500"
          />

          <span className="rounded border border-white/10 px-1.5 py-0.5 text-[9px] text-gray-500">
            /
          </span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setProfileOpen(false);
            }}
            className="relative rounded-xl border border-white/10 bg-white/[0.04] p-2.5 text-gray-300 transition hover:bg-white/10"
            aria-label="Notifications"
          >
            <Bell size={18} />

            <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-[#11162a] bg-violet-400" />
          </button>

          {notificationsOpen && (
            <div className="glass-panel absolute right-0 top-14 w-[300px] rounded-2xl p-4 shadow-2xl sm:w-[340px]">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">
                  Notifications
                </h3>

                <CheckCheck size={16} className="text-violet-400" />
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex gap-3 rounded-xl bg-white/[0.04] p-3">
                  <span className="h-2 w-2 mt-1.5 shrink-0 rounded-full bg-amber-400" />

                  <div>
                    <p className="text-xs font-medium">
                      Low stock alert
                    </p>
                    <p className="mt-1 text-[11px] leading-5 text-muted">
                      Paracetamol 500mg is running low.
                    </p>
                    <p className="mt-1 text-[10px] text-gray-500">
                      5 minutes ago
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 rounded-xl bg-white/[0.04] p-3">
                  <span className="h-2 w-2 mt-1.5 shrink-0 rounded-full bg-emerald-400" />

                  <div>
                    <p className="text-xs font-medium">
                      New order received
                    </p>
                    <p className="mt-1 text-[11px] leading-5 text-muted">
                      Your wholesale order has been confirmed.
                    </p>
                    <p className="mt-1 text-[10px] text-gray-500">
                      20 minutes ago
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setNotificationsOpen(false)}
                className="mt-4 w-full rounded-lg bg-violet-500/10 py-2 text-xs font-medium text-violet-300 hover:bg-violet-500/20"
              >
                Close notifications
              </button>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-white/[0.05]"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 text-xs font-bold text-white">
              BF
            </div>

            <div className="hidden text-left sm:block">
              <p className="text-xs font-semibold text-white">
                Benjamin
              </p>
              <p className="text-[10px] text-muted">
                Administrator
              </p>
            </div>

            <ChevronDown size={14} className="hidden text-gray-500 sm:block" />
          </button>

          {profileOpen && (
            <div className="glass-panel absolute right-0 top-14 w-52 rounded-xl p-2 shadow-2xl">
              <div className="border-b border-white/10 px-3 py-2">
                <p className="text-xs font-semibold">
                  My Account
                </p>
                <p className="mt-1 text-[10px] text-muted">
                  admin@mediflow.demo
                </p>
              </div>

              <button
                onClick={() => setProfileOpen(false)}
                className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs text-gray-300 hover:bg-white/10"
              >
                <User size={15} />
                My profile
              </button>

              <button
                onClick={() => setProfileOpen(false)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs text-gray-300 hover:bg-white/10"
              >
                <Settings size={15} />
                Account settings
              </button>

              <button
                onClick={() => setProfileOpen(false)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs text-red-400 hover:bg-red-400/10"
              >
                <LogOut size={15} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
