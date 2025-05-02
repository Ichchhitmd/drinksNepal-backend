import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BannerSettings } from "./BannerSettings";
import { PointsSettings } from "./PointsSettings";

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your application settings and configurations
        </p>
      </div>

      <Tabs defaultValue="points" className="space-y-4">
        <TabsList>
          <TabsTrigger value="points">Points System</TabsTrigger>
          <TabsTrigger value="banner">Banner</TabsTrigger>
        </TabsList>
        <TabsContent value="banner" className="space-y-4">
          <BannerSettings />
        </TabsContent>
        <TabsContent value="points" className="space-y-4">
          <PointsSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
