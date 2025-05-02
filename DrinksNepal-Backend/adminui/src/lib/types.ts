export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "support";
  avatar?: string;
}

export interface Order {
  id: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered";
  paymentStatus: "pending" | "completed" | "failed";
  createdAt: string;
  address: string;
  contact: string;
  pointsEarned: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  totalSales: number;
  activeUsers: number;
}

export interface Analytics {
  dailySales: { date: string; amount: number }[];
  popularProducts: { name: string; sales: number }[];
  orderStatus: { status: string; count: number }[];
}
