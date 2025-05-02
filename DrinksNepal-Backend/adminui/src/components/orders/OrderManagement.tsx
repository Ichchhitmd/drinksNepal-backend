import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BASE_URL } from "@/config/api/endpoints";
import authService from "@/config/services/auth/authService";
import orderServices from "@/config/services/orders/orderService";
import { useGlobal } from "@/hooks/use-global";
import { cn } from "@/lib/utils";
import { Order, User } from "@/types/types";
import { Clock, Package, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const statusIcons = {
  pending: Clock,
  processing: Package,
  outfordelivery: Truck,
};

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  pickedup: "bg-orange-100 text-orange-800",
  cancelled: "bg-red-100 text-red-800",
};

export const socket = io(BASE_URL, {
  path: "/socket.io",
  autoConnect: true,
  withCredentials: true,
});

export function OrderManagement() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [deliveryGuys, setDeliveryGuys] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentTab, setCurrentTab] = useState("pending");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDeliveryGuy, setSelectedDeliveryGuy] = useState<string>("");
  const [orderToAssign, setOrderToAssign] = useState<Order | null>(null);
  const { isAuthenticated, setIsLoading } = useGlobal();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated) return;

      try {
        const { data } = await orderServices.filterOrders(
          1,
          0,
          "",
          { status: currentTab },
          { createdAt: "desc" }
        );
        setOrders(data.orders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    if (!isInitialLoad) {
      fetchOrders();
    }
  }, [currentTab, isInitialLoad]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated) return;

      try {
        const { data } = await orderServices.filterOrders(
          1,
          0,
          "",
          { status: currentTab },
          { createdAt: "desc" }
        );
        setOrders(data.orders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    const fetchDeliveryGuys = async () => {
      if (!isAuthenticated) return;
      try {
        const { data } = await authService.searchUsers(
          "",
          { role: "deliveryGuy" },
          { createdAt: "desc" },
          1,
          100
        );
        setDeliveryGuys(data.users);
      } catch (error) {
        console.error("Error fetching delivery guys:", error);
      }
    };

    const fetchData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([fetchDeliveryGuys(), fetchOrders()]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
        setIsInitialLoad(false);
      }
    };

    fetchData();

    // Socket event listener for order updates
    const handleOrderUpdate = (data: {
      order: Order;
      status: Order["status"];
    }) => {
      setOrders((prevOrders) => {
        // If the updated order's status matches current tab, add it
        if (data.status === currentTab) {
          // Avoid duplicates
          const orderExists = prevOrders.some(
            (order) => order._id === data.order._id
          );
          if (!orderExists) {
            return [data.order, ...prevOrders];
          }
        }
        // If the order was in this tab but status changed, remove it
        return prevOrders.filter((order) => order._id !== data.order._id);
      });
    };

    socket.on("connect", () => {
      console.log("Connected to socket");
    });

    // Subscribe to socket events
    socket.on("order_updated", handleOrderUpdate);

    // Cleanup socket listener
    return () => {
      socket.off("order_updated", handleOrderUpdate);
    };
  }, [isAuthenticated]);

  const handleStatusChange = async (
    orderId: string,
    newStatus: Order["status"],
    deliveryGuyId?: string
  ) => {
    try {
      setIsLoading(true);
      await orderServices.changeOrderStatus(orderId, newStatus, deliveryGuyId);

      const { data } = await orderServices.filterOrders(
        1,
        0,
        "",
        { status: currentTab },
        { createdAt: "desc" }
      );
      setOrders(data.orders);
    } catch (error) {
      console.error("Error updating order status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignDeliveryGuy = async () => {
    console.log(orderToAssign, selectedDeliveryGuy);
    if (!orderToAssign || !selectedDeliveryGuy) return;

    try {
      await handleStatusChange(
        orderToAssign._id,
        "processing",
        selectedDeliveryGuy
      );
      // Remove from current list
      setOrders(orders.filter((order) => order._id !== orderToAssign._id));

      setShowAssignModal(false);
      setSelectedDeliveryGuy("");
      setOrderToAssign(null);
    } catch (error) {
      console.error("Error assigning delivery guy:", error);
    }
  };

  const OrderCard = ({ order }: { order: Order }) => {
    const StatusIcon = statusIcons[order.status as keyof typeof statusIcons];

    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Order #{order?.orderId}
          </CardTitle>
          <Badge
            variant="secondary"
            className={cn("capitalize", statusColors[order.status])}
          >
            {order.status}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{order?.user?.fullName}</p>
                <p className="text-sm text-muted-foreground">
                  {order?.user?.phoneNumber}
                </p>
              </div>
              <StatusIcon className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Items:</span>
                <span className="font-medium">{order.items.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-medium">Rs. {order?.totalAmount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment:</span>
                <Badge
                  variant={
                    order.paymentStatus === "completed"
                      ? "default"
                      : "destructive"
                  }
                >
                  {order.paymentStatus}
                </Badge>
              </div>
            </div>

            <div className="flex gap-2 flex-col">
              {order.status === "pending" && (
                <Button
                  onClick={() => {
                    setOrderToAssign(order);
                    setShowAssignModal(true);
                  }}
                >
                  Process Order
                </Button>
              )}
              <Button
                className="flex-1"
                variant="outline"
                onClick={() => {
                  setSelectedOrder(order);
                  setShowDetailsModal(true);
                }}
              >
                View Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Order Management</h2>
        <p className="text-muted-foreground">
          Manage and update order statuses
        </p>
      </div>

      <Dialog
        open={showAssignModal}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedDeliveryGuy("");
          }
          setShowAssignModal(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Order</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mb-4">
            Please assign a delivery guy to process this order
          </p>
          <Select
            value={selectedDeliveryGuy}
            onValueChange={setSelectedDeliveryGuy}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Delivery Guy" />
            </SelectTrigger>
            <SelectContent>
              {deliveryGuys.map((guy) => (
                <SelectItem key={guy._id} value={guy._id}>
                  {guy.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignDeliveryGuy}>Process</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showDetailsModal}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedOrder(null);
          }
          setShowDetailsModal(open);
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Order Details
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-8">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">
                    Customer Details
                  </h3>
                  <div className="space-y-2">
                    <p className="text-gray-700">
                      {selectedOrder.user?.fullName}
                    </p>
                    <p className="text-gray-600">
                      {selectedOrder.user?.phoneNumber}
                    </p>
                    <p className="text-gray-600">{selectedOrder.user?.email}</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">
                    Delivery Details
                  </h3>
                  <p className="text-gray-700">
                    {selectedOrder.deliveryAddress?.addressDetails}
                  </p>
                </div>
              </div>

              <div className="bg-white border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  Order Items
                </h3>
                <div className="divide-y divide-gray-200">
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-3"
                    >
                      <span className="text-gray-800 font-medium">
                        {item.product?.name}
                      </span>
                      <span className="text-gray-600">
                        Volume: {item.volume}
                      </span>
                      <span className="text-gray-600">
                        Qty: {item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                <span className="text-lg font-semibold text-gray-800">
                  Total Amount:
                </span>
                <span className="text-xl font-bold text-primary">
                  Rs. {selectedOrder.totalAmount}
                </span>
              </div>
            </div>
          )}
          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setShowDetailsModal(false)}
              className="px-6"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs
        defaultValue="pending"
        className="space-y-4"
        onValueChange={(value) => setCurrentTab(value)}
      >
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="outfordelivery">Out for Delivery</TabsTrigger>
        </TabsList>

        <TabsContent value={currentTab} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
