import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export function NotificationSettings() {
  const handleSave = () => {
    toast.success('Notification settings saved successfully');
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Order Notifications</CardTitle>
          <CardDescription>
            Configure notifications for different order statuses
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label>Order Confirmation</Label>
                <p className="text-sm text-muted-foreground">
                  Send notification when order is confirmed
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="space-y-2">
              <Label>Confirmation Message</Label>
              <Textarea
                defaultValue="Thank you for your order! Your order #[ORDER_ID] has been confirmed and will be processed shortly."
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label>Order Processing</Label>
                <p className="text-sm text-muted-foreground">
                  Send notification when order status changes to processing
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="space-y-2">
              <Label>Processing Message</Label>
              <Textarea
                defaultValue="Your order #[ORDER_ID] is now being processed and will be shipped soon."
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label>Order Delivery</Label>
                <p className="text-sm text-muted-foreground">
                  Send notification when order is delivered
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="space-y-2">
              <Label>Delivery Message</Label>
              <Textarea
                defaultValue="Your order #[ORDER_ID] has been delivered. Thank you for choosing Drinks Nepal!"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Points & Rewards</CardTitle>
          <CardDescription>
            Configure notifications for points and rewards
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label>Points Earned</Label>
              <p className="text-sm text-muted-foreground">
                Notify users when they earn points
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="space-y-2">
            <Label>Points Message</Label>
            <Textarea
              defaultValue="Congratulations! You've earned [POINTS] points from your order #[ORDER_ID]."
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </div>
  );
}