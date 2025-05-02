export interface User {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  phoneNumber: string;
  balance: number;
  createdAt: string;
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export interface AuthResponseData {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface ExchangeRate {
  _id: string;
  rate: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Banner {
  url: string;
  id: string;
}

export interface Product {
  id: string;
  _id: string;
  sku: string;
  name: string;
  description: string;
  shortDescription: string;
  images: string[];
  category: {
    _id: string;
    name: string;
    parent: string;
    isHome: boolean;
  };
  details: {
    volume: Array<{
      id: string;
      volume: string;
      regularPrice: number;
      salePrice: number;
      stock: number;
      inStock: boolean;
      isDefault: boolean;
    }>;
    country: string;
    age: string;
    abv: string;
    source: string;
    closure: string;
    packaging: string;
    colour: string;
    flavour: string;
    grapeVarieties: string;
  };
  inStock: boolean;
  isFeatured: boolean;
  stock: number;
  type: string;
  tags: string;
  totalSales: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductListProps {
  product: Product[];
}

export type SearchProductsResponse = {
  products: Product[];
  totalPages: number;
  page: number;
  pageSize: number;
  count: number;
};

export interface SearchUsersResponse {
  users: User[];
  page: number;
  pageSize: number;
  totalPages: number;
  count: number;
}

export interface Category {
  _id: string;
  name: string;
  imageUrl: string;
  subcategories: Array<{
    _id: string;
    parent: string;
    name: string;
    isHome: boolean;
    __v: number;
  }>;
  isHome: boolean;
}

export interface Order {
  _id: string;
  orderId: string;
  user: {
    _id: string;
    fullName: string;
    phoneNumber: string;
    email: string;
  };
  status: "pending" | "processing" | "pickedup" | "delivered" | "cancelled";
  paymentType: "cash" | "fonepay";
  paymentStatus: "pending" | "completed" | "failed";
  items: Array<{
    product: Product | null;
    quantity: number;
    price: number;
    volume: string;
    _id: string;
  }>;
  deliveryAddress: {
    longitude: number;
    latitude: number;
    addressDetails: string;
    isDefault: boolean;
    _id: string;
    createdAt: string;
    updatedAt: string;
  };
  totalAmount: number;
  tokenAmount: number;
  exchangeRate: {
    _id: string;
    rate: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
  assignedTo?: {
    notificationsLastReadAt: string | null;
    _id: string;
    fullName: string;
    phoneNumber: string;
    email: string;
    balance: number;
    role: string;
    addresses: any[];
    createdAt: string;
    updatedAt: string;
  };
}

export type SearchOrdersResponse = {
  orders: Order[];
  totalPages: number;
  page: number;
  pageSize: number;
  count: number;
};

export interface TopProduct {
  _id: string;
  name: string;
  totalSales: number;
}

export interface RecentOrder {
  id: string;
  customer: string;
  amount: number;
  status: string;
  paymentStatus: string;
  date: string;
  items: {
    product?: string;
    quantity: number;
  }[];
}

export interface MonthlyRevenue {
  year: number;
  month: number;
  totalRevenue: number;
}

export interface AnalyticsData {
  totalSalesRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  topProducts: TopProduct[];
  recentOrders: RecentOrder[];
  monthlyRevenue: MonthlyRevenue[];
}
