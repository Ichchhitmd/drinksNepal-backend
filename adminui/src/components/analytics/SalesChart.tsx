import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const data = [
  { date: '2024-03-01', amount: 12400 },
  { date: '2024-03-02', amount: 15600 },
  { date: '2024-03-03', amount: 14200 },
  { date: '2024-03-04', amount: 16800 },
  { date: '2024-03-05', amount: 15900 },
  { date: '2024-03-06', amount: 17400 },
  { date: '2024-03-07', amount: 18200 },
  { date: '2024-03-08', amount: 16700 },
  { date: '2024-03-09', amount: 15800 },
  { date: '2024-03-10', amount: 17900 },
];

export function SalesChart() {
  return (
    <div className="p-6">
      <CardHeader className="space-y-1 px-0">
        <CardTitle>Daily Sales</CardTitle>
        <p className="text-sm text-muted-foreground">
          Revenue trends for the past 10 days
        </p>
      </CardHeader>
      <CardContent className="px-0">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis
                dataKey="date"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `Rs${value}`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Date
                            </span>
                            <span className="font-bold text-muted-foreground">
                              {new Date(payload[0].payload.date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Sales
                            </span>
                            <span className="font-bold">
                              Rs{payload[0].value}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </div>
  );
}