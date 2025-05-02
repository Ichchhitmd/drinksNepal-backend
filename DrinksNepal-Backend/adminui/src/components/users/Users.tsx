import authService from "@/config/services/auth/authService";
import { useGlobal } from "@/hooks/use-global";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { AddDeliveryPartnerModal } from "./AddDeliveryPartnerModal";
import { UserList } from "./UserList";

export default function Users() {
  const location = useLocation();
  const [userTypeParam, setUserTypeParam] = useState("");
  const { setIsLoading } = useGlobal();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setUserTypeParam(params.get("userType") || "");
  }, [location.search]);

  const handleAddPartner = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await authService.createDeliveryUser(data);
      if (response.status === 201) {
        toast.success("Delivery partner created successfully");
        setIsModalOpen(false);
        setUsers((prevUsers) => [response.data?.user, ...prevUsers]);
      }
    } catch (error) {
      console.error("Failed to create delivery partner");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          {userTypeParam === "customer" ? "Customers" : "Delivery Partners"}
        </h1>
        {userTypeParam === "deliveryGuy" && (
          <AddDeliveryPartnerModal
            onSubmit={handleAddPartner}
            open={isModalOpen}
            onOpenChange={setIsModalOpen}
          />
        )}
      </div>
      <UserList userType={userTypeParam} users={users} setUsers={setUsers} />
    </div>
  );
}
