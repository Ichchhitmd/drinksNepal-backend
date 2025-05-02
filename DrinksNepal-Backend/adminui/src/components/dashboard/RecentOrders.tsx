import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecentOrder } from "@/types/types";

interface RecentOrdersProps {
  recentOrders: RecentOrder[];
}

const orderStatusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  delivered: "bg-green-100 text-green-800",
  processing: "bg-blue-100 text-blue-800",
  pickedup: "bg-purple-100 text-purple-800",
  cancelled: "bg-red-100 text-red-800",
};

const paymentStatusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

export function RecentOrders({ recentOrders }: RecentOrdersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="p-4 font-medium">Order ID</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Order Status</th>
                <th className="p-4 font-medium">Payment Status</th>
                <th className="p-4 font-medium">Total</th>
                <th className="p-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b">
                  <td className="p-4">#{order.id}</td>
                  <td className="p-4">{order.customer}</td>
                  <td className="p-4">
                    <Badge
                      variant="secondary"
                      className={
                        orderStatusColors[
                          order.status as keyof typeof orderStatusColors
                        ]
                      }
                    >
                      {order.status}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Badge
                      variant="secondary"
                      className={
                        paymentStatusColors[
                          order.paymentStatus as keyof typeof paymentStatusColors
                        ]
                      }
                    >
                      {order.paymentStatus}
                    </Badge>
                  </td>
                  <td className="p-4">Rs. {order.amount.toLocaleString()}</td>
                  <td className="p-4">
                    {new Date(order.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
