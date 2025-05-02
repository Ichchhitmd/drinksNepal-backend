import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

const data = [
  { name: 'Jan', total: 1200 },
  { name: 'Feb', total: 2100 },
  { name: 'Mar', total: 1800 },
  { name: 'Apr', total: 2400 },
  { name: 'May', total: 2800 },
  { name: 'Jun', total: 3200 },
  { name: 'Jul', total: 2900 },
];

export function Overview() {
  return (
    <div className="p-6">
      <CardHeader className="space-y-1 px-0">
        <CardTitle>Sales Overview</CardTitle>
        <p className="text-sm text-muted-foreground">
          Monthly revenue for the current year
        </p>
      </CardHeader>
      <CardContent className="px-0">
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis
                dataKey="name"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `Rs${value}`}
              />
              <Bar
                dataKey="total"
                fill="currentColor"
                radius={[4, 4, 0, 0]}
                className="fill-primary"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </div>
  );
}