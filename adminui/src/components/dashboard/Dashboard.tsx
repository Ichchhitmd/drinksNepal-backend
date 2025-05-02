import analyticsService from "@/config/services/analytics/analyticsService";
import { useGlobal } from "@/hooks/use-global";
import { AnalyticsData } from "@/types/types";
import { useEffect, useState } from "react";
import { PopularProducts } from "./PopularProducts";
import { RecentOrders } from "./RecentOrders";
import { SalesChart } from "./SalesChart";
import { StatsCards } from "./StatsCards";

export function Dashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, setIsLoading } = useGlobal();

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const response = await analyticsService.getAnalytics();
        setAnalytics(response.data);
      } catch (err) {
        setError("Failed to load dashboard data");
        console.error("Error fetching analytics:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [isAuthenticated]);

  if (error) {
    return <div className="p-8 text-red-500">{error}</div>;
  }

  return (
    <div className="container space-y-8 p-8">
      <h1 className="text-3xl font-bold">Dashboard Overview</h1>
      <StatsCards
        totalRevenue={analytics?.totalSalesRevenue || 0}
        totalOrders={analytics?.totalOrders || 0}
        totalProducts={analytics?.totalProducts || 0}
        totalCustomers={analytics?.totalCustomers || 0}
      />
      <div className="grid gap-8 md:grid-cols-2">
        <SalesChart monthlyRevenue={analytics?.monthlyRevenue || []} />
        <PopularProducts topProducts={analytics?.topProducts || []} />
      </div>
      <RecentOrders recentOrders={analytics?.recentOrders || []} />
    </div>
  );
}
