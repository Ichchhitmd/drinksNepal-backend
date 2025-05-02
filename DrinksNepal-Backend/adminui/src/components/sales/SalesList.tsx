import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
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

export function SalesList({ orders }: { orders: Order[] }) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
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
                <TableCell>{order.items.length} items</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      order.paymentStatus === "completed"
                        ? "default"
                        : "destructive"
                    }
                    className="capitalize"
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

      <Dialog
        open={!!selectedOrder}
        onOpenChange={() => setSelectedOrder(null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Order #{selectedOrder?.orderId}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="grid gap-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Customer Details
                  </h4>
                  <div className="mt-1 space-y-1">
                    <p className="text-sm font-medium">
                      {selectedOrder?.user?.fullName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedOrder?.user?.phoneNumber}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedOrder?.deliveryAddress?.addressDetails}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Order Details
                  </h4>
                  <div className="mt-1 space-y-1">
                    <p className="text-sm">
                      Status:{" "}
                      <Badge variant="secondary" className="ml-1 capitalize">
                        {selectedOrder.status}
                      </Badge>
                    </p>
                    <p className="text-sm">
                      Payment:{" "}
                      <Badge
                        variant={
                          selectedOrder.paymentStatus === "completed"
                            ? "default"
                            : "destructive"
                        }
                        className="ml-1 capitalize"
                      >
                        {selectedOrder.paymentStatus}
                      </Badge>
                    </p>
                    <p className="text-sm">
                      Points Earned:{" "}
                      <span className="font-medium">
                        {selectedOrder?.tokenAmount}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              <Separator />
              <div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.items.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell>{item?.product?.name}</TableCell>
                        <TableCell className="text-right">
                          {item?.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          Rs. {item.price}
                        </TableCell>
                        <TableCell className="text-right">
                          Rs. {item?.price * item?.quantity}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-medium">
                        Total
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        Rs. {selectedOrder?.totalAmount}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
