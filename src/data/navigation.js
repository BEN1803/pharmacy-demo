
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ChartNoAxesCombined,
  Users,
  ClipboardList,
  Store,
  Truck,
  ShoppingBasket,
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
        href: "/",
      },
      {
        label: "Inventory",
        href: "/inventory",
        icon: Package,
      },
      {
        label: "Sales",
        icon: ShoppingCart,
        href: "/sales",
      },
      {
        label: "Analytics",
        icon: ChartNoAxesCombined,
        href: "/analytics",
      },
    ],
  },
  {
    title: "MANAGEMENT",
    items: [
      {
        label: "Employees",
        icon: Users,
        href: "/employees",
      },
      {
        label: "Orders",
        icon: ClipboardList,
        href: "/orders",
      },
      {
        label: "Marketplace",
        icon: Store,
        href: "/marketplace",
      },
      {
        label: "Suppliers",
        icon: Truck,
        href: "/suppliers",
      },
      {
        label: "Purchases",
        icon: ShoppingBasket,
        href: "/purchases",
      },
    ],
  },
];

export const bottomNavigation = [
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
  },
  {
    label: "Help & Support",
    icon: Headset,
  },
];
