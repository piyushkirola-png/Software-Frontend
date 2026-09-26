import {
  LayoutDashboard,
  Package,
  Tag,
  ShoppingBag,
  Key,
  Users,
  Star,
  BarChart3,
  Settings,
  User as UserIcon,
  CreditCard,
  Lock,
  FolderTree,
} from "lucide-react";

export interface NavItem {
  label: string;
  to: string;
  icon: any;
}

export const USER_NAV: NavItem[] = [
  { label: "Dashboard", to: "/user/dashboard", icon: LayoutDashboard },
  { label: "Orders", to: "/user/orders", icon: Package },
  { label: "License Keys", to: "/user/keys", icon: Key },
  { label: "Profile", to: "/user/profile", icon: UserIcon },
  { label: "Update Password", to: "/user/password", icon: Lock },
];

export const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Categories", to: "/admin/categories", icon: FolderTree },
  { label: "Products", to: "/admin/products", icon: Package },
  { label: "Coupons", to: "/admin/coupons", icon: Tag },
  { label: "Orders", to: "/admin/orders", icon: ShoppingBag },
  { label: "Payments", to: "/admin/payments", icon: CreditCard },
  { label: "License Keys", to: "/admin/keys", icon: Key },
  { label: "Users", to: "/admin/users", icon: Users },
  { label: "Reviews", to: "/admin/reviews", icon: Star },
  { label: "Reports", to: "/admin/reports", icon: BarChart3 },
  { label: "Settings", to: "/admin/settings", icon: Settings },
];
