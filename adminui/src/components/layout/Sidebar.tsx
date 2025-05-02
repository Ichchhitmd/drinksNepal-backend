import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  BarChart,
  ClipboardList,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Truck,
  Users,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Order Management", href: "/order-management", icon: ClipboardList },
  { name: "Orders", href: "/orders", icon: ShoppingCart },
  { name: "Products", href: "/products", icon: Package },
  { name: "Sales", href: "/sales", icon: BarChart },
  { name: "Customers", href: "/users?userType=customer", icon: Users },
  {
    name: "Delivery Partners",
    href: "/users?userType=deliveryGuy",
    icon: Truck,
  },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
  collapsed?: boolean;
}

export function Sidebar({ mobile, onClose, collapsed }: SidebarProps) {
  const location = useLocation();

  return (
    <nav className="flex flex-1 flex-col">
      <ul role="list" className="flex flex-1 flex-col gap-1 p-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <li key={item.name}>
              <Button
                asChild
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-2",
                  isActive && "bg-primary text-primary-foreground",
                  collapsed && "justify-center px-2"
                )}
                onClick={mobile ? onClose : undefined}
              >
                <Link to={item.href}>
                  <item.icon className="h-5 w-5" />
                  {!collapsed && item.name}
                </Link>
              </Button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
