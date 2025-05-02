import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { Order } from "@/types/types";

interface OrderDetailsProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderDetails({ order, open, onOpenChange }: OrderDetailsProps) {
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Order #{order?.orderId}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">
                Customer Details
              </h4>
              <div className="mt-1 space-y-1">
                <p className="text-sm font-medium">{order?.user?.fullName}</p>
                <p className="text-sm text-muted-foreground">
                  {order?.user?.phoneNumber}
                </p>
                <p className="text-sm text-muted-foreground">
                  {order?.deliveryAddress?.addressDetails}
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
                  <Badge variant="secondary" className={cn("ml-1 capitalize")}>
                    {order.status}
                  </Badge>
                </p>
                <p className="text-sm">
                  Payment:{" "}
                  <Badge
                    variant={
                      order.paymentStatus === "completed"
                        ? "default"
                        : "destructive"
                    }
                    className="ml-1 capitalize"
                  >
                    {order.paymentStatus}
                  </Badge>
                </p>
                <p className="text-sm">
                  Points Earned:{" "}
                  <span className="font-medium">{order?.tokenAmount}</span>
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
                {order.items.map((item) => (
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
                    Rs. {order?.totalAmount}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
