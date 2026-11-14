"use client";

import { useEffect, useState } from "react";

import {
  Building2,
  Bell,
  SlidersHorizontal,
  Database,
  Save,
  CheckCircle2,
  Download,
  Trash2,
  ShieldCheck,
  TriangleAlert,
  X,
  Sun,
  Moon,
} from "lucide-react";

import { usePharmacy } from "@/context/PharmacyContext";
import { useTheme } from "@/context/ThemeContext";

const STORAGE_KEY = "mediflow_settings";

const defaultSettings = {
  profile: {
    pharmacyName: "HealthPlus Pharmacy",
    licenseNumber: "TZ-PHM-2026-00418",
    email: "hello@healthplus.co.tz",
    phone: "+255 754 000 111",
    address: "Plot 24, Nyerere Road",
    city: "Dar es Salaam",
    currency: "TZS",
    timezone: "Africa/Dar_es_Salaam",
  },
  notifications: {
    lowStock: true,
    expiringBatches: true,
    newOrders: true,
    marketplaceOffers: false,
    weeklyReport: true,
    smsAlerts: false,
  },
  preferences: {
    lowStockThreshold: 30,
    expiryWarningDays: 90,
    defaultPayment: "M-Pesa",
    receiptFooter: "Thank you for choosing HealthPlus Pharmacy. Get well soon!",
    autoPrintReceipts: true,
    showOutOfStock: false,
  },
};

const tabs = [
  { id: "profile", label: "Pharmacy Profile", icon: Building2 },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "preferences", label: "Preferences", icon: SlidersHorizontal },
  { id: "data", label: "Data & Privacy", icon: Database },
];

export default function SettingsPageContent() {
  const { resetPharmacyData } = usePharmacy();
  const { setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState("profile");
  const [settings, setSettings] = useState(defaultSettings);
  const [loaded, setLoaded] = useState(false);

  const [saved, setSaved] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  // Restore saved settings.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (stored) {
        const parsed = JSON.parse(stored);

        setSettings({
          profile: { ...defaultSettings.profile, ...(parsed.profile || {}) },
          notifications: {
            ...defaultSettings.notifications,
            ...(parsed.notifications || {}),
          },
          preferences: {
            ...defaultSettings.preferences,
            ...(parsed.preferences || {}),
          },
        });
      }
    } catch (err) {
      console.error("Could not load settings:", err);
    } finally {
      setLoaded(true);
    }
  }, []);

  const updateProfile = (field, value) => {
    setSaved(false);
    setSettings((previous) => ({
      ...previous,
      profile: { ...previous.profile, [field]: value },
    }));
  };

  const updatePreference = (field, value) => {
    setSaved(false);
    setSettings((previous) => ({
      ...previous,
      preferences: { ...previous.preferences, [field]: value },
    }));
  };

  const toggleNotification = (field) => {
    setSaved(false);
    setSettings((previous) => ({
      ...previous,
      notifications: {
        ...previous.notifications,
        [field]: !previous.notifications[field],
      },
    }));
  };

  const saveSettings = () => {
    if (!loaded) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setSaved(true);
    } catch (err) {
      console.error("Could not save settings:", err);
    }
  };

  const exportData = () => {
    const snapshot = {};

    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);

      if (key && key.startsWith("mediflow_")) {
        try {
          snapshot[key] = JSON.parse(localStorage.getItem(key));
        } catch {
          snapshot[key] = localStorage.getItem(key);
        }
      }
    }

    const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mediflow-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const resetDemoData = () => {
    try {
      resetPharmacyData();

      const keys = [];

      for (let index = 0; index < localStorage.length; index += 1) {
        const key = localStorage.key(index);

        if (key && key.startsWith("mediflow_")) {
          keys.push(key);
        }
      }

      keys.forEach((key) => localStorage.removeItem(key));

      setSettings(defaultSettings);
      setResetDone(true);
      setResetOpen(false);
    } catch (err) {
      console.error("Could not reset demo data:", err);
    }
  };

  return (
    <div className="space-y-7 pb-10">
      {/* Heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs text-muted">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-violet-300">Settings</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Settings
          </h1>

          <p className="mt-2 text-sm text-muted">
            Configure your pharmacy profile, alerts and workspace preferences.
          </p>
        </div>

        {activeTab !== "data" && (
          <button
            onClick={saveSettings}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:-translate-y-0.5"
          >
            {saved ? <CheckCircle2 size={17} /> : <Save size={17} />}
            {saved ? "Settings Saved" : "Save Changes"}
          </button>
        )}
      </div>

      {resetDone && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          <p className="flex-1">
            Demo data has been reset. Reload any page to see the original sample records.
          </p>
          <button
            onClick={() => setResetDone(false)}
            aria-label="Dismiss message"
            className="text-emerald-300/70 hover:text-emerald-200"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
        {/* Tabs */}
        <nav className="glass-panel flex gap-1 overflow-x-auto rounded-2xl p-2 lg:h-fit lg:flex-col">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${
                  active
                    ? "bg-violet-500/15 font-medium text-violet-300"
                    : "text-muted hover:bg-hover hover:text-ink"
                }`}
              >
                <Icon size={17} />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Panels */}
        <div className="min-w-0">
          {activeTab === "profile" && (
            <section className="glass-panel rounded-2xl p-5 sm:p-6">
              <SectionHeading
                title="Pharmacy Profile"
                description="This information appears on receipts and purchase orders."
              />

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Field
                  label="Pharmacy name"
                  value={settings.profile.pharmacyName}
                  onChange={(value) => updateProfile("pharmacyName", value)}
                />

                <Field
                  label="Business licence number"
                  value={settings.profile.licenseNumber}
                  onChange={(value) => updateProfile("licenseNumber", value)}
                />

                <Field
                  label="Contact email"
                  type="email"
                  value={settings.profile.email}
                  onChange={(value) => updateProfile("email", value)}
                />

                <Field
                  label="Phone number"
                  value={settings.profile.phone}
                  onChange={(value) => updateProfile("phone", value)}
                />

                <Field
                  label="Street address"
                  value={settings.profile.address}
                  onChange={(value) => updateProfile("address", value)}
                />

                <Field
                  label="City"
                  value={settings.profile.city}
                  onChange={(value) => updateProfile("city", value)}
                />

                <SelectField
                  label="Currency"
                  value={settings.profile.currency}
                  onChange={(value) => updateProfile("currency", value)}
                  options={["TZS", "KES", "UGX", "USD"]}
                />

                <SelectField
                  label="Timezone"
                  value={settings.profile.timezone}
                  onChange={(value) => updateProfile("timezone", value)}
                  options={[
                    "Africa/Dar_es_Salaam",
                    "Africa/Nairobi",
                    "Africa/Kampala",
                    "UTC",
                  ]}
                />
              </div>

              <div className="mt-6 rounded-xl border border-violet-400/10 bg-violet-500/[0.06] p-4">
                <p className="text-xs font-semibold text-violet-300">Account owner</p>
                <p className="mt-2 text-sm text-ink-soft">Pharmacy Admin</p>
                <p className="mt-0.5 text-xs text-muted">admin@mediflow.demo</p>
              </div>
            </section>
          )}

          {activeTab === "notifications" && (
            <section className="glass-panel rounded-2xl p-5 sm:p-6">
              <SectionHeading
                title="Notifications"
                description="Choose which alerts appear in your workspace and inbox."
              />

              <div className="mt-6 divide-y divide-line">
                <ToggleRow
                  title="Low stock alerts"
                  description="Notify when a medicine falls below its reorder level."
                  checked={settings.notifications.lowStock}
                  onToggle={() => toggleNotification("lowStock")}
                />

                <ToggleRow
                  title="Expiring batches"
                  description="Warn about batches approaching their expiry date."
                  checked={settings.notifications.expiringBatches}
                  onToggle={() => toggleNotification("expiringBatches")}
                />

                <ToggleRow
                  title="New customer orders"
                  description="Receive an alert whenever an online order is placed."
                  checked={settings.notifications.newOrders}
                  onToggle={() => toggleNotification("newOrders")}
                />

                <ToggleRow
                  title="Marketplace offers"
                  description="Hear about supplier promotions and bulk discounts."
                  checked={settings.notifications.marketplaceOffers}
                  onToggle={() => toggleNotification("marketplaceOffers")}
                />

                <ToggleRow
                  title="Weekly performance report"
                  description="A summary of revenue, profit and stock movement every Monday."
                  checked={settings.notifications.weeklyReport}
                  onToggle={() => toggleNotification("weeklyReport")}
                />

                <ToggleRow
                  title="SMS alerts"
                  description="Send critical stock alerts to the registered phone number."
                  checked={settings.notifications.smsAlerts}
                  onToggle={() => toggleNotification("smsAlerts")}
                />
              </div>
            </section>
          )}

          {activeTab === "preferences" && (
            <section className="glass-panel rounded-2xl p-5 sm:p-6">
              <SectionHeading
                title="Workspace Preferences"
                description="Defaults used across inventory, sales and reporting."
              />

              {/* Appearance */}
              <div className="mt-6 rounded-xl border border-line bg-surface-soft p-4">
                <p className="text-sm font-medium text-ink">Appearance</p>
                <p className="mt-1 text-[11px] text-muted">
                  Choose the theme used across your workspace.
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      value: "light",
                      label: "Light",
                      description: "Bright, clean surfaces",
                      icon: Sun,
                    },
                    {
                      value: "dark",
                      label: "Dark",
                      description: "Low-light comfort",
                      icon: Moon,
                    },
                  ].map((option) => {
                    const Icon = option.icon;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setTheme(option.value)}
                        data-theme-choice={option.value}
                        className="theme-choice flex items-center gap-3 rounded-xl border border-line bg-surface p-3.5 text-left transition hover:border-violet-400/30"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
                          <Icon size={17} />
                        </div>

                        <div className="flex-1">
                          <p className="text-xs font-semibold text-ink">
                            {option.label}
                          </p>
                          <p className="mt-0.5 text-[10px] text-muted">
                            {option.description}
                          </p>
                        </div>

                        <CheckCircle2
                          size={16}
                          className="theme-check text-violet-400"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Field
                  label="Low stock threshold (units)"
                  type="number"
                  value={settings.preferences.lowStockThreshold}
                  onChange={(value) => updatePreference("lowStockThreshold", value)}
                  hint="Applied to medicines without their own reorder level."
                />

                <Field
                  label="Expiry warning window (days)"
                  type="number"
                  value={settings.preferences.expiryWarningDays}
                  onChange={(value) => updatePreference("expiryWarningDays", value)}
                  hint="Batches expiring within this window are highlighted."
                />

                <SelectField
                  label="Default payment method"
                  value={settings.preferences.defaultPayment}
                  onChange={(value) => updatePreference("defaultPayment", value)}
                  options={["Cash", "M-Pesa", "Bank transfer", "Card"]}
                />
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-xs font-medium text-ink-soft">
                  Receipt footer message
                </label>

                <textarea
                  rows={3}
                  value={settings.preferences.receiptFooter}
                  onChange={(event) =>
                    updatePreference("receiptFooter", event.target.value)
                  }
                  className="w-full resize-none rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink outline-none placeholder:text-muted focus:border-violet-500/50"
                />

                <p className="mt-2 text-[11px] text-muted">
                  Printed at the bottom of every customer receipt.
                </p>
              </div>

              <div className="mt-6 divide-y divide-line border-t border-line">
                <ToggleRow
                  title="Auto-print receipts"
                  description="Open the print dialog automatically after checkout."
                  checked={settings.preferences.autoPrintReceipts}
                  onToggle={() =>
                    updatePreference(
                      "autoPrintReceipts",
                      !settings.preferences.autoPrintReceipts
                    )
                  }
                />

                <ToggleRow
                  title="Show out-of-stock medicines in POS"
                  description="List unavailable products with a disabled state."
                  checked={settings.preferences.showOutOfStock}
                  onToggle={() =>
                    updatePreference(
                      "showOutOfStock",
                      !settings.preferences.showOutOfStock
                    )
                  }
                />
              </div>
            </section>
          )}

          {activeTab === "data" && (
            <div className="space-y-5">
              <section className="glass-panel rounded-2xl p-5 sm:p-6">
                <SectionHeading
                  title="Data & Privacy"
                  description="Your demo workspace is stored locally in this browser."
                />

                <div className="mt-6 flex items-start gap-3 rounded-xl border border-cyan-400/10 bg-cyan-500/[0.06] p-4">
                  <ShieldCheck size={18} className="mt-0.5 shrink-0 text-cyan-300" />

                  <p className="text-xs leading-5 text-muted">
                    No data leaves this device. Inventory, sales, employees, orders and
                    marketplace requests are kept in browser storage for demonstration
                    purposes only.
                  </p>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <button
                    onClick={exportData}
                    className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface-soft p-4 text-left transition hover:border-violet-400/25 hover:bg-violet-500/[0.06]"
                  >
                    <div>
                      <p className="text-sm font-medium text-ink">Export workspace data</p>
                      <p className="mt-1 text-[11px] text-muted">
                        Download a JSON backup of all demo records.
                      </p>
                    </div>

                    <Download size={18} className="shrink-0 text-violet-300" />
                  </button>

                  <button
                    onClick={() => setResetOpen(true)}
                    className="flex items-center justify-between gap-3 rounded-xl border border-rose-400/15 bg-rose-500/[0.04] p-4 text-left transition hover:border-rose-400/30 hover:bg-rose-500/[0.08]"
                  >
                    <div>
                      <p className="text-sm font-medium text-ink">Reset demo data</p>
                      <p className="mt-1 text-[11px] text-muted">
                        Restore original inventory and clear all edits.
                      </p>
                    </div>

                    <Trash2 size={18} className="shrink-0 text-rose-300" />
                  </button>
                </div>
              </section>

              <section className="glass-panel rounded-2xl p-5 sm:p-6">
                <h2 className="text-sm font-semibold text-ink">Storage overview</h2>

                <div className="mt-4 space-y-2.5">
                  {[
                    ["Pharmacy inventory & sales", "mediflow_pharmacy_data"],
                    ["Purchase orders", "mediflow_purchase_orders"],
                    ["Suppliers", "mediflow_suppliers"],
                    ["Employees", "mediflow_employees"],
                    ["Customer orders", "mediflow_orders"],
                    ["Marketplace requests", "mediflow_marketplace_requests"],
                    ["Workspace settings", "mediflow_settings"],
                    ["Theme preference", "mediflow_theme"],
                  ].map(([label, key]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between rounded-lg bg-surface-soft px-3 py-2.5"
                    >
                      <span className="text-xs text-ink-soft">{label}</span>
                      <span className="font-mono text-[10px] text-muted">{key}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>

      {/* Reset confirmation */}
      {resetOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-2xl border border-line p-6 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-300">
                <TriangleAlert size={19} />
              </div>

              <div>
                <h2 className="font-semibold text-ink">Reset all demo data?</h2>
                <p className="mt-2 text-sm leading-6 text-muted">
                  This removes every saved medicine, sale, supplier, employee, order and
                  marketplace request in this browser. The original sample data will return.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => setResetOpen(false)}
                className="rounded-xl border border-line px-5 py-2.5 text-sm font-medium text-ink-soft hover:bg-hover"
              >
                Cancel
              </button>

              <button
                onClick={resetDemoData}
                className="rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-500"
              >
                Reset everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionHeading({ title, description }) {
  return (
    <div>
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      <p className="mt-1 text-xs text-muted">{description}</p>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", hint }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-ink-soft">{label}</label>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink outline-none placeholder:text-muted focus:border-violet-500/50"
      />

      {hint && <p className="mt-2 text-[11px] text-muted">{hint}</p>}
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-ink-soft">{label}</label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-line bg-elevated px-4 py-3 text-sm text-ink outline-none focus:border-violet-500/50"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function ToggleRow({ title, description, checked, onToggle }) {
  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <div>
        <p className="text-sm font-medium text-ink">{title}</p>
        <p className="mt-1 text-[11px] leading-5 text-muted">{description}</p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        onClick={onToggle}
        className={`relative mt-1 h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-violet-500" : "bg-track"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-knob transition-transform ${
            checked ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
