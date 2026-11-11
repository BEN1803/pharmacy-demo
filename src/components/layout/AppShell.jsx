
"use client";

import { useState } from "react";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppShell({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("Overview");

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        activeItem={activeItem}
        onNavigate={setActiveItem}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      {/* Main workspace */}
      <div
        className={`
          min-h-screen transition-all duration-300
          ${collapsed ? "lg:ml-[84px]" : "lg:ml-[260px]"}
        `}
      >

        {/* Top navigation */}
        <Topbar
          pageTitle={activeItem}
          onMenuClick={() => setMobileOpen(true)}
        />

        {/* Page content */}
        <main className="mx-auto w-full max-w-[1800px] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
