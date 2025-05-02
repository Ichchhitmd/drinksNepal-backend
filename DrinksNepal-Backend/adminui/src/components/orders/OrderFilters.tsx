import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OrderFiltersProps {
  selectedStatus: string | null;
  setSelectedStatus: (status: string | null) => void;
  selectedPaymentStatus: string | null;
  setSelectedPaymentStatus: (status: string | null) => void;
  sortOrder: "asc" | "desc" | null;
  setSortOrder: (order: "asc" | "desc" | null) => void;
}

export function OrderFilters({
  selectedStatus,
  setSelectedStatus,
  selectedPaymentStatus,
  setSelectedPaymentStatus,
  sortOrder,
  setSortOrder,
}: OrderFiltersProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <Select
        value={selectedStatus || "all"}
        onValueChange={(value) =>
          setSelectedStatus(value === "all" ? null : value)
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Order Status</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="processing">Processing</SelectItem>
          <SelectItem value="outfordelivery">Out for Delivery</SelectItem>
          <SelectItem value="delivered">Delivered</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={selectedPaymentStatus || "all"}
        onValueChange={(value) =>
          setSelectedPaymentStatus(value === "all" ? null : value)
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Payment Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Payment Status</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="failed">Failed</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={sortOrder || "default"}
        onValueChange={(value) =>
          setSortOrder(value === "default" ? null : (value as "asc" | "desc"))
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort By" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="default">Sort By Date</SelectItem>
          <SelectItem value="desc">Newest First</SelectItem>
          <SelectItem value="asc">Oldest First</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
