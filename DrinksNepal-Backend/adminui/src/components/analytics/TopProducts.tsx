import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const products = [
  {
    name: 'Coca Cola',
    sales: 482,
    revenue: 'Rs. 12,234',
    growth: '+12.3%',
    progress: 100,
  },
  {
    name: 'Pepsi',
    sales: 367,
    revenue: 'Rs. 9,427',
    growth: '+8.1%',
    progress: 76,
  },
  {
    name: 'Fanta',
    sales: 289,
    revenue: 'Rs. 7,389',
    growth: '+5.4%',
    progress: 60,
  },
  {
    name: 'Sprite',
    sales: 245,
    revenue: 'Rs. 6,278',
    growth: '+4.2%',
    progress: 51,
  },
  {
    name: 'Mountain Dew',
    sales: 208,
    revenue: 'Rs. 5,321',
    growth: '+3.7%',
    progress: 43,
  },
];

export function TopProducts() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Products</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Sales</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>Growth</TableHead>
              <TableHead>Performance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.name}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.sales}</TableCell>
                <TableCell>{product.revenue}</TableCell>
                <TableCell className="text-emerald-500">
                  {product.growth}
                </TableCell>
                <TableCell className="w-[200px]">
                  <Progress value={product.progress} className="h-2" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}