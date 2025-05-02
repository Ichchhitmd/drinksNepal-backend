import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Order } from "@/types/types";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { OrderDetails } from "./OrderDetails";

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

export function OrderList({ orders }: { orders: Order[] }) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order?._id}>
                <TableCell className="font-medium">#{order?.orderId}</TableCell>
                <TableCell>{order?.user?.fullName}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={
                      orderStatusColors[
                        order.status as keyof typeof orderStatusColors
                      ]
                    }
                  >
                    {order?.status}
                  </Badge>
                </TableCell>
                <TableCell>
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
                </TableCell>
                <TableCell>Rs. {order?.totalAmount}</TableCell>
                <TableCell>
                  {new Date(order?.createdAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSelectedOrder(order)}>
                        View details
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <OrderDetails
        order={selectedOrder}
        open={!!selectedOrder}
        onOpenChange={() => setSelectedOrder(null)}
      />
    </>
  );
}
