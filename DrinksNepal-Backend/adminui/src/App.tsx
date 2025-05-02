import Analytics from "@/components/analytics/Analytics";
import { Login } from "@/components/auth/Login";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { Layout } from "@/components/layout/Layout";
import Notifications from "@/components/notifications/Notifications";
import { OrderManagement } from "@/components/orders/OrderManagement";
import Orders from "@/components/orders/Orders";
import Products from "@/components/products/Products";
import Settings from "@/components/settings/Settings";
import Users from "@/components/users/Users";
import { GlobalProvider, useGlobal } from "@/hooks/use-global";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import Sales from "./components/sales/Sales";
import authService from "./config/services/auth/authService";
import { User } from "./types/types";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const {
    setIsLoading,
    isAuthenticated,
    setisAuthenticated,
    isLoaded,
    setIsLoaded,
  } = useGlobal();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      console.log("Checking Auth");
      if (isAuthenticated) return;
      const accessToken = Cookies.get("accessToken");
      if (accessToken) {
        setIsLoading(true);
        try {
          const response = await authService.authenticate(accessToken);
          if (response?.status === 200) {
            setUser(response.data);
            setisAuthenticated(true);
          }
        } catch {
          Cookies.remove("accessToken");
          navigate("/login");
        } finally {
          setIsLoading(false);
        }
      }
      setIsLoaded(true);
    };

    initializeAuth();
  }, [navigate, setIsLoading, isAuthenticated, isLoaded]);

  useEffect(() => {
    if (user) {
      if (user.role !== "admin") {
        Cookies.remove("accessToken");
        navigate("/login");
      }
    }
  }, [user, navigate]);

  return isLoaded && !isAuthenticated ? <Navigate to="/login" /> : children;
}

export default function App() {
  const { isLoading } = useGlobal();
  return (
    <GlobalProvider>
      {isLoading && (
        <div className="fixed inset-0 bg-background/50 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="orders" element={<Orders />} />
            <Route path="sales" element={<Sales />} />
            <Route path="order-management" element={<OrderManagement />} />
            <Route path="products" element={<Products />} />
            <Route path="users" element={<Users />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </GlobalProvider>
  );
}
