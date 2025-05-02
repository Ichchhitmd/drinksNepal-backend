import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import orderService from "@/config/services/orders/orderService";
import { useGlobal } from "@/hooks/use-global";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function PointsSettings() {
  const [exchangeRate, setExchangeRate] = useState(0);
  const [pointsPerThousand, setPointsPerThousand] = useState(0);
  const [initialRate, setInitialRate] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);
  const { setIsLoading } = useGlobal();

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await orderService.createExchangeRate(exchangeRate);
      setInitialRate(exchangeRate);
      setHasChanges(false);
      toast.success("Points settings saved successfully");
    } catch {
      toast.error("Failed to save points settings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadExchangeRate = async () => {
      const response = await orderService.getCurrentExchangeRate();
      const rate = response?.data?.rate || 0;
      setExchangeRate(rate);
      setInitialRate(rate);
      setPointsPerThousand(rate * 1000);
    };
    loadExchangeRate();
  }, []);

  useEffect(() => {
    setHasChanges(exchangeRate !== initialRate);
  }, [exchangeRate, initialRate]);

  const handlePointsChange = (value: number) => {
    setPointsPerThousand(value);
    setExchangeRate(value / 1000);
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Points System Configuration</CardTitle>
          <CardDescription>
            Configure how points are earned and redeemed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-medium">Current Rate:</span>
              <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                {pointsPerThousand} points per 1000 Rs.
              </span>
            </div>
            <Label htmlFor="earning-rate">Points Earning Rate</Label>
            <div className="flex items-center gap-2">
              <Input
                id="earning-rate"
                type="text"
                value={pointsPerThousand}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*\.?\d*$/.test(value)) {
                    handlePointsChange(Number(value));
                  }
                }}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">
                points for every
              </span>
              <Input
                type="number"
                defaultValue="1000"
                className="w-24"
                disabled
              />
              <span className="text-sm text-muted-foreground">Rs. spent</span>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={!hasChanges}
          className="bg-primary disabled:bg-primary/50 disabled:cursor-not-allowed"
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}
