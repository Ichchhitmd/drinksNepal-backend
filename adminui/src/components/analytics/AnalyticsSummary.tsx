import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Package, ShoppingCart } from 'lucide-react';

const stats = [
  {
    name: 'Total Revenue',
    value: 'Rs. 245,678',
    change: '+12.5%',
    trend: 'up',
    description: 'compared to last month',
  },
  {
    name: 'Average Order Value',
    value: 'Rs. 1,234',
    change: '+5.2%',
    trend: 'up',
    description: 'compared to last month',
  },
  {
    name: 'Total Orders',
    value: '1,234',
    change: '-2.3%',
    trend: 'down',
    description: 'compared to last month',
  },
  {
    name: 'Active Products',
    value: '156',
    change: '+8.1%',
    trend: 'up',
    description: 'compared to last month',
  },
];

export function AnalyticsSummary() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.name}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.name}
            </CardTitle>
            {stat.trend === 'up' ? (
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              <span
                className={
                  stat.trend === 'up'
                    ? 'text-emerald-500'
                    : 'text-red-500'
                }
              >
                {stat.change}
              </span>{' '}
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}