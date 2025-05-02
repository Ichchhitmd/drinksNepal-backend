import { Card } from '@/components/ui/card';
import { SalesChart } from './SalesChart';
import { OrderStatusChart } from './OrderStatusChart';
import { TopProducts } from './TopProducts';
import { AnalyticsSummary } from './AnalyticsSummary';

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
      </div>

      <AnalyticsSummary />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <SalesChart />
        </Card>
        <Card className="col-span-3">
          <OrderStatusChart />
        </Card>
      </div>

      <TopProducts />
    </div>
  );
}