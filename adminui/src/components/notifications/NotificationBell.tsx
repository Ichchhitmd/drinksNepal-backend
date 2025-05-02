import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';

export function NotificationBell() {
  const navigate = useNavigate();
  const [unreadCount] = useState(2); // This would come from your notification state

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-4 pb-2">
          <h5 className="font-medium">Notifications</h5>
          <Button
            variant="ghost"
            className="text-xs text-muted-foreground"
            onClick={() => navigate('/notifications')}
          >
            View all
          </Button>
        </div>
        <DropdownMenuItem>
          <div className="flex flex-col gap-1">
            <p className="font-medium">New Order #1234</p>
            <p className="text-sm text-muted-foreground">
              A new order has been placed by John Doe
            </p>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <div className="flex flex-col gap-1">
            <p className="font-medium">Low Stock Alert</p>
            <p className="text-sm text-muted-foreground">
              Coca Cola is running low on stock
            </p>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}