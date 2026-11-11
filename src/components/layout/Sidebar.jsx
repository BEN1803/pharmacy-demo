
import {
  ChevronLeft,
  ChevronRight,
  Pill,
  X,
  LogOut,
} from "lucide-react";

import {
  navigationGroups,
  bottomNavigation,
} from "@/data/navigation";

export default function Sidebar({
  collapsed,
  onToggle,
  activeItem,
  onNavigate,
  mobileOpen,
  onClose,
}) {
  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          glass-panel fixed inset-y-0 left-0 z-50
          flex flex-col border-r border-white/10
          transition-all duration-300 ease-in-out
          ${collapsed ? "lg:w-[84px]" : "lg:w-[260px]"}
          w-[260px]
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Brand */}
        <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-white/10 px-5">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 shadow-lg shadow-violet-500/20">
              <Pill className="h-5 w-5 text-white" />
            </div>

            {!collapsed && (
              <div className="whitespace-nowrap">
                <h1 className="text-lg font-bold tracking-tight">
                  Medi<span className="gradient-text">Flow</span>
                </h1>

                <p className="text-[10px] tracking-[0.18em] text-muted">
                  PHARMACY SYSTEM
                </p>
              </div>
            )}
          </div>

          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted hover:bg-white/10 lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Collapse button */}
        <button
          onClick={onToggle}
          className="absolute -right-3 top-[88px] hidden h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-[#17172b] text-gray-300 shadow-lg transition hover:bg-violet-500 hover:text-white lg:flex"
          aria-label="Toggle sidebar"
        >
          {collapsed ? (
            <ChevronRight size={15} />
          ) : (
            <ChevronLeft size={15} />
          )}
        </button>

        {/* Pharmacy profile */}
        <div className="mx-3 mt-5 rounded-xl border border-white/[0.07] bg-white/[0.035] p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-300">
              <Pill size={18} />
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-white">
                  HealthPlus Pharmacy
                </p>
                <p className="mt-1 text-[10px] text-muted">
                  Retail account
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-7 overflow-y-auto px-3 py-7">
          {navigationGroups.map((group) => (
            <div key={group.title}>
              {!collapsed && (
                <p className="mb-3 px-3 text-[10px] font-semibold tracking-[0.18em] text-gray-500">
                  {group.title}
                </p>
              )}

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = activeItem === item.label;

                  return (
                    <button
                      key={item.label}
                      title={collapsed ? item.label : undefined}
                      onClick={() => {
                        onNavigate(item.label);
                        onClose();
                      }}
                      className={`
                        group relative flex w-full items-center gap-3
                        rounded-xl px-3 py-3 text-left
                        transition-all duration-200
                        ${
                          active
                            ? "bg-violet-500/15 text-violet-300"
                            : "text-gray-400 hover:bg-white/[0.05] hover:text-white"
                        }
                        ${collapsed ? "justify-center" : ""}
                      `}
                    >
                      {active && (
                        <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-violet-400" />
                      )}

                      <Icon
                        size={19}
                        className="shrink-0"
                      />

                      {!collapsed && (
                        <span className="text-[13px] font-medium">
                          {item.label}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom navigation */}
        <div className="space-y-1 border-t border-white/10 px-3 py-4">
          {bottomNavigation.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                title={collapsed ? item.label : undefined}
                onClick={() => onNavigate(item.label)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-gray-400 transition hover:bg-white/[0.05] hover:text-white ${
                  collapsed ? "justify-center" : ""
                }`}
              >
                <Icon size={19} className="shrink-0" />

                {!collapsed && (
                  <span className="text-[13px] font-medium">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}

          {/* Account footer */}
          {!collapsed && (
            <div className="mt-4 flex items-center gap-3 rounded-xl bg-white/[0.035] p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-cyan-400 text-xs font-bold text-white">
                BF
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-white">
                  Pharmacy Admin
                </p>
                <p className="truncate text-[10px] text-muted">
                  Administrator
                </p>
              </div>

              <LogOut size={15} className="text-gray-500" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
