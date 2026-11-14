
"use client";

import { useState } from "react";
import Link from "next/link";

import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  Settings,
  User,
  LogOut,
  CheckCheck,
  Sun,
  Moon,
} from "lucide-react";

import { useTheme } from "@/context/ThemeContext";

export default function Topbar({
  onMenuClick,
  pageTitle,
}) {
  const { toggleTheme } = useTheme();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-line bg-background/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8">

      {/* Left section */}
      <div className="flex min-w-0 items-center gap-3 sm:gap-5">

        <button
          onClick={onMenuClick}
          className="rounded-xl border border-line bg-surface p-2 text-ink-soft hover:bg-hover lg:hidden"
          aria-label="Open navigation"
        >
          <Menu size={19} />
        </button>

        <div className="min-w-0">
          <p className="hidden text-[10px] font-medium tracking-[0.15em] text-muted sm:block">
            RETAIL WORKSPACE
          </p>

          <h2 className="truncate text-base font-semibold text-ink sm:mt-1 sm:text-lg">
            {pageTitle}
          </h2>
        </div>
      </div>

      {/* Right section */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-4">

        {/* Search */}
        <div className="hidden w-48 items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2.5 md:flex lg:w-64">
          <Search size={16} className="text-muted" />

          <input
            type="text"
            placeholder="Search anything..."
            className="w-full bg-transparent text-xs text-ink outline-none placeholder:text-muted"
          />

          <span className="rounded border border-line px-1.5 py-0.5 text-[9px] text-muted">
            /
          </span>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-xl border border-line bg-surface p-2.5 text-muted transition hover:border-violet-400/30 hover:bg-hover hover:text-ink"
          aria-label="Toggle color theme"
          title="Toggle color theme"
        >
          <Moon size={18} className="theme-icon-dark" />
          <Sun size={18} className="theme-icon-light" />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setProfileOpen(false);
            }}
            className="relative rounded-xl border border-line bg-surface p-2.5 text-ink-soft transition hover:bg-hover"
            aria-label="Notifications"
          >
            <Bell size={18} />

            <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-background bg-violet-400" />
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
                <div className="flex gap-3 rounded-xl bg-surface p-3">
                  <span className="h-2 w-2 mt-1.5 shrink-0 rounded-full bg-amber-400" />

                  <div>
                    <p className="text-xs font-medium">
                      Low stock alert
                    </p>
                    <p className="mt-1 text-[11px] leading-5 text-muted">
                      Paracetamol 500mg is running low.
                    </p>
                    <p className="mt-1 text-[10px] text-muted">
                      5 minutes ago
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 rounded-xl bg-surface p-3">
                  <span className="h-2 w-2 mt-1.5 shrink-0 rounded-full bg-emerald-400" />

                  <div>
                    <p className="text-xs font-medium">
                      New order received
                    </p>
                    <p className="mt-1 text-[11px] leading-5 text-muted">
                      Your wholesale order has been confirmed.
                    </p>
                    <p className="mt-1 text-[10px] text-muted">
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
            className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-hover"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 text-xs font-bold text-white">
              BF
            </div>

            <div className="hidden text-left sm:block">
              <p className="text-xs font-semibold text-ink">
                Benjamin
              </p>
              <p className="text-[10px] text-muted">
                Administrator
              </p>
            </div>

            <ChevronDown size={14} className="hidden text-muted sm:block" />
          </button>

          {profileOpen && (
            <div className="glass-panel absolute right-0 top-14 w-52 rounded-xl p-2 shadow-2xl">
              <div className="border-b border-line px-3 py-2">
                <p className="text-xs font-semibold">
                  My Account
                </p>
                <p className="mt-1 text-[10px] text-muted">
                  admin@mediflow.demo
                </p>
              </div>

              <button
                onClick={() => setProfileOpen(false)}
                className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs text-ink-soft hover:bg-hover"
              >
                <User size={15} />
                My profile
              </button>

              <Link
                href="/settings"
                onClick={() => setProfileOpen(false)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs text-ink-soft hover:bg-hover"
              >
                <Settings size={15} />
                Account settings
              </Link>

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
