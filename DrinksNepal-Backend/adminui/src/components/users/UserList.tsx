import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import authService from "@/config/services/auth/authService";
import { useDebounce } from "@/hooks/use-debounce";
import { useGlobal } from "@/hooks/use-global";
import { User } from "@/types/types";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "../ui/input";
import { AddDeliveryPartnerModal } from "./AddDeliveryPartnerModal";
import { UserDetails } from "./UserDetails";

interface UserListProps {
  userType: string;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

export function UserList({ userType, users, setUsers }: UserListProps) {
  const { isAuthenticated, setIsLoading } = useGlobal();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 250);
  const [pageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof User;
    direction: "asc" | "desc";
  }>({ key: "createdAt", direction: "desc" });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const sortData = (key: keyof User) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig?.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleSortChange = (value: string) => {
    setSortConfig({
      key: "createdAt",
      direction: value === "newest" ? "desc" : "asc",
    });
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleEditUser = async (data: any) => {
    try {
      setIsLoading(true);
      const response = await authService.updateDeliveryUser(
        userToEdit?._id!,
        data
      );
      if (response.status === 200) {
        toast.success("Delivery partner updated successfully");
        setIsEditModalOpen(false);
        // Refresh the user list
        const updatedUsers = users.map((user) =>
          user._id === userToEdit?._id ? { ...user, ...data } : user
        );
        setUsers(updatedUsers);
      }
    } catch (error) {
      console.error("Failed to update delivery partner");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (userId: string) => {
    setUserToDelete(userId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      setIsLoading(true);
      const response = await authService.deleteDeliveryUser(userToDelete);
      if (response.status === 200) {
        toast.success("Delivery partner deleted successfully");
        setUsers(users.filter((user) => user._id !== userToDelete));
      }
    } catch (error) {
      console.error("Failed to delete delivery partner");
    } finally {
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      if (!userType || !isAuthenticated) return;
      try {
        setIsLoading(true);
        const filters = {
          role: userType || undefined,
        };

        const sort = {
          [sortConfig.key]: sortConfig.direction,
        };

        const response = await authService.searchUsers(
          debouncedSearch,
          filters,
          sort,
          currentPage,
          pageSize
        );

        if (response?.status === 200) {
          setUsers(response.data.users);
          setTotalPages(response.data.totalPages);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [
    debouncedSearch,
    userType,
    sortConfig,
    currentPage,
    pageSize,
    isAuthenticated,
    setUsers,
  ]);

  const handleRedeemPoints = async (userId: string) => {
    try {
      setIsLoading(true);
      const response = await authService.redeemBalance(userId);

      if (response.status === 200) {
        setUsers(
          users.map((user) =>
            user._id === userId ? { ...user, ...response?.data } : user
          )
        );
      }
    } catch (error) {
      console.log("Error Redeeming Points");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Input
          type="search"
          placeholder="Search users..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-[500px]"
        />
        <Select defaultValue="newest" onValueChange={handleSortChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest Users</SelectItem>
            <SelectItem value="oldest">Oldest Users</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="cursor-pointer">
              <div className="flex items-center space-x-1">
                <span>Name</span>
              </div>
            </TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone Number</TableHead>
            {userType === "customer" && (
              <TableHead className="cursor-pointer">
                <div className="flex items-center space-x-1">
                  <span>Points</span>
                </div>
              </TableHead>
            )}
            <TableHead
              onClick={() => sortData("createdAt")}
              className="cursor-pointer"
            >
              <div className="flex items-center space-x-1">
                <span>Created At</span>
                <ArrowUpDown className="h-4 w-4" />
              </div>
            </TableHead>
            <TableHead className="w-[70px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user._id}>
              <TableCell>{user.fullName}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.phoneNumber}</TableCell>
              {userType === "customer" && <TableCell>{user.balance}</TableCell>}
              <TableCell>{user.createdAt}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedUser(user);
                        setIsDetailsOpen(true);
                      }}
                    >
                      View Details
                    </DropdownMenuItem>
                    {userType === "customer" && (
                      <DropdownMenuItem
                        onClick={() => handleRedeemPoints(user?._id)}
                      >
                        Redeem Points
                      </DropdownMenuItem>
                    )}
                    {userType === "deliveryGuy" && (
                      <>
                        <DropdownMenuItem
                          onClick={() => {
                            setUserToEdit(user);
                            setIsEditModalOpen(true);
                          }}
                        >
                          Edit User
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(user._id)}
                          className="text-red-600"
                        >
                          Delete User
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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

      <UserDetails
        user={selectedUser}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />

      {userToEdit && (
        <AddDeliveryPartnerModal
          isEdit={true}
          showButton={false}
          initialData={{
            fullName: userToEdit.fullName,
            email: userToEdit.email,
            phoneNumber: userToEdit.phoneNumber || "",
          }}
          onSubmit={handleEditUser}
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
        />
      )}

      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              delivery partner from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
