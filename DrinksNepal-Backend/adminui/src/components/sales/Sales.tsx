import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import orderServices from "@/config/services/orders/orderService";
import { useGlobal } from "@/hooks/use-global";
import { Order } from "@/types/types";
import { useEffect, useState } from "react";
import { SalesList } from "./SalesList";

export default function Sales() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [monthlyTotalSales, setMonthlyTotalSales] = useState<Order[]>([]);
  const [totalSales, setTotalSales] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString()
  );
  const [selectedMonth, setSelectedMonth] = useState<string>(
    (new Date().getMonth() + 1).toString()
  );
  const { isAuthenticated, setIsLoading } = useGlobal();

  // Generate year options (last 5 years)
  const years = Array.from(
    { length: 10 },
    (_, i) => new Date().getFullYear() - i
  );

  const months = [
    { value: "all", label: "All Months" },
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  useEffect(() => {
    const fetchMonthlyTotalSales = async () => {
      if (!isAuthenticated) return;
      try {
        const filters: any = {
          year: parseInt(selectedYear),
        };

        if (selectedMonth !== "all") {
          filters.month = parseInt(selectedMonth);
        }

        const { data } = await orderServices.filterOrders(
          currentPage,
          0,
          "",
          filters,
          { createdAt: "desc" }
        );

        setMonthlyTotalSales(data.orders);
      } catch (error) {
        setError("Failed to fetch total monthly sales data");
        console.error("Error fetching total monthly sales:", error);
      }
    };

    const fetchSales = async () => {
      if (!isAuthenticated) return;
      setIsLoading(true);
      try {
        const filters: any = {
          //   status: "delivered",
          year: parseInt(selectedYear),
        };

        // Only add month filter if a specific month is selected
        if (selectedMonth !== "all") {
          filters.month = parseInt(selectedMonth);
        }

        const { data } = await orderServices.filterOrders(
          currentPage,
          10,
          "",
          filters,
          { createdAt: "desc" }
        );

        setOrders(data.orders);
        setTotalPages(data.totalPages);
      } catch (error) {
        setError("Failed to fetch sales data");
        console.error("Error fetching sales:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSales();
    fetchMonthlyTotalSales();
  }, [currentPage, selectedYear, selectedMonth, isAuthenticated]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  useEffect(() => {
    if (monthlyTotalSales?.length > 0) {
      const totalSales = monthlyTotalSales.reduce(
        (sum, order) => sum + order.totalAmount,
        0
      );
      setTotalSales(totalSales);
    }
  }, [monthlyTotalSales]);

  const exportToCSV = () => {
    // Convert data to CSV format
    const headers = [
      "Order ID",
      "Date",
      "Customer Name",
      "Total Amount",
      "Items",
    ];
    const csvData = monthlyTotalSales.map((order) => {
      // Group items by product ID and volume
      const groupedItems = order.items.reduce((acc, item) => {
        const productId = item.product?._id;
        if (productId) {
          const key = `${item.product?.name} | ${item?.volume}`;
          if (!acc[key]) {
            acc[key] = 0;
          }
          acc[key] += item.quantity;
        }
        return acc;
      }, {} as Record<string, number>);

      // Convert grouped items to string with volume info
      const itemsList = Object.entries(groupedItems)
        .map(([name, quantity]) => `${name} (${quantity})`)
        .join(", ");

      return [
        order.orderId,
        new Date(order.createdAt).toLocaleDateString(),
        `${order.user?.fullName}`,
        order.totalAmount,
        `"${itemsList}"`,
      ];
    });

    // Combine headers and data
    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    // Create and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `sales_${selectedYear}_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Monthly Sales</h1>
        <Button onClick={exportToCSV}>Export</Button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-4">
          <Select
            value={selectedYear}
            onValueChange={(value) => {
              setSelectedYear(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedMonth}
            onValueChange={(value) => {
              setSelectedMonth(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total Sales</p>
          <p className="text-2xl font-bold">Rs. {totalSales}</p>
        </div>
      </div>

      <SalesList orders={orders} />

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
      {error && <div className="error">{error}</div>}
    </div>
  );
}
