import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, CheckCheck, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'system' | 'alert';
  status: 'unread' | 'read';
  timestamp: string;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'New Order #1234',
    message: 'A new order has been placed by John Doe',
    type: 'order',
    status: 'unread',
    timestamp: '2024-03-20T10:00:00Z',
  },
  {
    id: '2',
    title: 'Low Stock Alert',
    message: 'Coca Cola is running low on stock (5 units remaining)',
    type: 'alert',
    status: 'unread',
    timestamp: '2024-03-20T09:30:00Z',
  },
  {
    id: '3',
    title: 'System Update',
    message: 'System maintenance scheduled for tonight at 2 AM',
    type: 'system',
    status: 'read',
    timestamp: '2024-03-19T15:00:00Z',
  },
];

const typeColors = {
  order: 'bg-blue-100 text-blue-800',
  system: 'bg-purple-100 text-purple-800',
  alert: 'bg-red-100 text-red-800',
};

export default function Notifications() {
  const [notifications, setNotifications] = useState(mockNotifications);

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notification =>
      notification.id === id ? { ...notification, status: 'read' } : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({
      ...notification,
      status: 'read'
    })));
  };

  const NotificationCard = ({ notification }: { notification: Notification }) => (
    <Card className={cn(
      'transition-colors',
      notification.status === 'unread' ? 'bg-muted/50' : 'bg-background'
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={cn('capitalize', typeColors[notification.type])}>
                {notification.type}
              </Badge>
              {notification.status === 'unread' && (
                <div className="h-2 w-2 rounded-full bg-primary" />
              )}
            </div>
            <h4 className="font-semibold">{notification.title}</h4>
            <p className="text-sm text-muted-foreground">{notification.message}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(notification.timestamp).toLocaleString()}
            </p>
          </div>
          {notification.status === 'unread' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => markAsRead(notification.id)}
            >
              <CheckCheck className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Notifications</h2>
          <p className="text-muted-foreground">
            Manage your notifications and alerts
          </p>
        </div>
        <Button onClick={markAllAsRead} variant="outline">
          Mark all as read
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {notifications.map(notification => (
            <NotificationCard key={notification.id} notification={notification} />
          ))}
        </TabsContent>

        <TabsContent value="unread" className="space-y-4">
          {notifications
            .filter(n => n.status === 'unread')
            .map(notification => (
              <NotificationCard key={notification.id} notification={notification} />
            ))}
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          {notifications
            .filter(n => n.type === 'order')
            .map(notification => (
              <NotificationCard key={notification.id} notification={notification} />
            ))}
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          {notifications
            .filter(n => n.type === 'alert')
            .map(notification => (
              <NotificationCard key={notification.id} notification={notification} />
            ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}