import { Suspense } from "react";

import AppShell from "@/components/layout/AppShell";
import MedicineDetailsPage from "@/components/inventory/MedicineDetailsPage";

export default function MedicineDetailsRoute() {
  return (
    <AppShell>
      <Suspense
        fallback={
          <div className="animate-pulse space-y-6">
            <div className="h-9 w-56 rounded-lg bg-surface-strong" />
            <div className="h-80 rounded-2xl bg-surface" />
          </div>
        }
      >
        <MedicineDetailsPage />
      </Suspense>
    </AppShell>
  );
}
