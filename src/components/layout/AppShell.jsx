
"use client";

import { useState, Suspense } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppShell({ children }) {
  // Controls whether the desktop sidebar is expanded or collapsed.
  const [collapsed, setCollapsed] = useState(false);

  // Controls the sidebar drawer on mobile screens.
  const [mobileOpen, setMobileOpen] = useState(false);

  // Keeps track of the currently selected navigation label.
  const [activeItem, setActiveItem] = useState("Overview");

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* 
        Sidebar uses usePathname() to identify the active route.
        Suspense handles the URL-dependent rendering during prerendering.
      */}
      <Suspense
        fallback={
          <aside className="fixed inset-y-0 left-0 hidden w-[260px] glass-panel lg:block">
            <div className="p-5 text-sm text-muted">
              Loading navigation...
            </div>
          </aside>
        }
      >
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
          activeItem={activeItem}
          onNavigate={setActiveItem}
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />
      </Suspense>

      {/* Main application workspace */}
      <div
        className={`min-h-screen transition-all duration-300 ${
          collapsed ? "lg:ml-[84px]" : "lg:ml-[260px]"
        }`}
      >
        {/* Top navigation bar */}
        <Topbar
          pageTitle={activeItem}
          onMenuClick={() => {
            setCollapsed(false);
            setMobileOpen(true);
          }}
        />

        {/* Current page content */}
        <main className="mx-auto w-full max-w-[1800px] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
