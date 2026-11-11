
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ChartNoAxesCombined,
  Users,
  ClipboardList,
  Store,
  Truck,
  Settings,
  Headset,
} from "lucide-react";

export const navigationGroups = [
  {
    title: "WORKSPACE",
    items: [
      {
        label: "Overview",
        icon: LayoutDashboard,
      },
      {
        label: "Inventory",
        icon: Package,
      },
      {
        label: "Sales",
        icon: ShoppingCart,
      },
      {
        label: "Analytics",
        icon: ChartNoAxesCombined,
      },
    ],
  },
  {
    title: "MANAGEMENT",
    items: [
      {
        label: "Employees",
        icon: Users,
      },
      {
        label: "Orders",
        icon: ClipboardList,
      },
      {
        label: "Marketplace",
        icon: Store,
      },
      {
        label: "Suppliers",
        icon: Truck,
      },
    ],
  },
];

export const bottomNavigation = [
  {
    label: "Settings",
    icon: Settings,
  },
  {
    label: "Help & Support",
    icon: Headset,
  },
];
