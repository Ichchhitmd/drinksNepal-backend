import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, Users, Wallet } from "lucide-react";

interface StatsCardsProps {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
}

export function StatsCards({
  totalRevenue,
  totalOrders,
  totalProducts,
  totalCustomers,
}: StatsCardsProps) {
  const stats = [
    {
      title: "Total Revenue",
      value: `Rs. ${totalRevenue.toLocaleString()}`,
      icon: Wallet,
    },
    {
      title: "Total Orders",
      value: totalOrders.toLocaleString(),
      icon: ShoppingCart,
    },
    {
      title: "Total Products",
      value: totalProducts.toLocaleString(),
      icon: Package,
    },
    {
      title: "Total Customers",
      value: totalCustomers.toLocaleString(),
      icon: Users,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="group relative">
              <div className="text-2xl font-bold truncate cursor-pointer">
                {stat.value}
              </div>
              <div className="absolute left-0 top-[-50px] invisible opacity-0 group-hover:visible group-hover:opacity-100 bg-white text-black p-2 rounded text-sm z-10 shadow-md border border-gray-200 transition-all duration-200 ease-in-out">
                {stat.value}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
