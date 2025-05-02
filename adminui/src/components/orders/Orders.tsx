import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import orderServices from "@/config/services/orders/orderService";
import { useDebounce } from "@/hooks/use-debounce";
import { useGlobal } from "@/hooks/use-global";
import { Order } from "@/types/types";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { OrderDialog } from "./OrderDialog";
import { OrderFilters } from "./OrderFilters";
import { OrderList } from "./OrderList";

export default function Orders() {
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 250);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<
    string | null
  >(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);
  const { isAuthenticated } = useGlobal();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated) return;
      setLoading(true);
      try {
        const filters: any = {};
        if (selectedStatus && selectedStatus !== "all") {
          filters.status = selectedStatus;
        }
        if (selectedPaymentStatus && selectedPaymentStatus !== "all") {
          filters.paymentStatus = selectedPaymentStatus;
        }

        const { data } = await orderServices.filterOrders(
          currentPage,
          10,
          debouncedSearch,
          Object.keys(filters).length > 0 ? filters : undefined,
          sortOrder ? { createdAt: sortOrder } : undefined
        );

        setOrders(data.orders);
        setTotalPages(data.totalPages);
      } catch (error) {
        setError("Failed to fetch orders");
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [
    currentPage,
    debouncedSearch,
    selectedStatus,
    selectedPaymentStatus,
    sortOrder,
    isAuthenticated,
  ]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="container space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            className="pl-8"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <OrderFilters
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          selectedPaymentStatus={selectedPaymentStatus}
          setSelectedPaymentStatus={setSelectedPaymentStatus}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />
      </div>

      <OrderList orders={orders} />

      <div className="flex justify-between items-center">
        <Button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <span className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>

      <OrderDialog open={showNewOrder} onOpenChange={setShowNewOrder} />

      {loading && <div>Loading...</div>}
      {error && <div className="error">{error}</div>}
    </div>
  );
}
