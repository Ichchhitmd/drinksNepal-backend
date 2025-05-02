import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UserDetailsProps {
  user: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDetails({ user, open, onOpenChange }: UserDetailsProps) {
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <div className="flex items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold">{user.fullName}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Role</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">{user.role}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Rs. {user.balance}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Created At
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">User ID</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold break-all">{user._id}</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
