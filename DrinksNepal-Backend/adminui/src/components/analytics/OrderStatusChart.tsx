import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const data = [
  { status: 'Pending', value: 15 },
  { status: 'Processing', value: 25 },
  { status: 'Shipped', value: 30 },
  { status: 'Delivered', value: 80 },
];

const COLORS = ['#fbbf24', '#60a5fa', '#a78bfa', '#34d399'];

export function OrderStatusChart() {
  return (
    <div className="p-6">
      <CardHeader className="space-y-1 px-0">
        <CardTitle>Order Status</CardTitle>
        <p className="text-sm text-muted-foreground">
          Distribution of orders by status
        </p>
      </CardHeader>
      <CardContent className="px-0">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={entry.status}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Status
                            </span>
                            <span className="font-bold text-muted-foreground">
                              {payload[0].payload.status}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Orders
                            </span>
                            <span className="font-bold">
                              {payload[0].value}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          {data.map((item, index) => (
            <div key={item.status} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: COLORS[index] }}
              />
              <span className="text-sm">
                {item.status} ({item.value})
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </div>
  );
}