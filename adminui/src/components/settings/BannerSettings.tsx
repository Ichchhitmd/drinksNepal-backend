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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BASE_URL } from "@/config/api/endpoints";
import configService from "@/config/services/config/configService";
import { useGlobal } from "@/hooks/use-global";
import { Banner } from "@/types/types";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function BannerSettings() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [selectedFile, setSelectedFile] = useState<File>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<string>();
  const { setIsLoading, isAuthenticated } = useGlobal();

  useEffect(() => {
    loadBanners();
  }, [isAuthenticated]);

  const loadBanners = async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      const response = await configService.getBanners();
      setBanners(response?.data?.banners || []);
    } catch (error) {
      console.error("Error fetching banners:", error);
      toast.error("Failed to load banners");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    try {
      setIsLoading(true);
      if (!selectedFile) {
        toast.error("Please select a file to upload");
        return;
      }

      const response = await configService.uploadBanner(selectedFile);
      if (response.status === 200) {
        setBanners(response.data.banners);
        setSelectedFile(undefined);
        toast.success("Banner uploaded successfully");

        // Reset file input
        const fileInput = document.getElementById("banner") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      }
    } catch (error: any) {
      console.error("Failed to upload banner:", error);
      toast.error(error?.response?.data?.message || "Failed to upload banner");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBanner = async (bannerId: string) => {
    setBannerToDelete(bannerId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!bannerToDelete) return;

    try {
      setIsLoading(true);
      const response = await configService.deleteBanner(bannerToDelete);
      if (response.status === 200) {
        setBanners(response.data.banners);
        toast.success("Banner deleted successfully");
      }
    } catch (error) {
      console.error("Failed to delete banner:", error);
      toast.error("Failed to delete banner");
    } finally {
      setIsLoading(false);
      setDeleteDialogOpen(false);
      setBannerToDelete(undefined);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(banners);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Optimistically update UI
    setBanners(items);

    try {
      const bannerIds = items.map((banner) => banner.id);
      const response = await configService.reorderBanners(bannerIds);
      if (response.status !== 200) {
        throw new Error("Failed to reorder banners");
      }
    } catch (error) {
      console.error("Failed to reorder banners:", error);
      toast.error("Failed to save banner order");
      await loadBanners(); // Reload original order
    }
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Banner Management</CardTitle>
          <CardDescription>
            Manage promotional banners in the mobile app (maximum 5 banners)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 rounded-lg border p-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="banner">Upload New Banner</Label>
                <Input
                  id="banner"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || banners.length >= 5}
              >
                Upload Banner
              </Button>
              {banners.length >= 5 && (
                <p className="text-sm text-red-500">
                  Maximum number of banners (5) reached
                </p>
              )}
            </div>

            <div>
              <Label className="mb-4 block">
                Current Banners (drag to reorder)
              </Label>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="banners">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-4"
                    >
                      {banners.map((banner, index) => (
                        <Draggable
                          key={banner.id}
                          draggableId={banner.id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="relative group"
                            >
                              <img
                                src={`${BASE_URL}${banner.url}`}
                                alt={`Banner ${index + 1}`}
                                className="rounded-lg object-cover w-full aspect-video"
                              />
                              <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleDeleteBanner(banner.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Banner</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this banner? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
