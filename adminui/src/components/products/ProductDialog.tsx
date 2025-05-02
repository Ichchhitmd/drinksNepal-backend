import { useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFileUpload: (file: File) => void;
}

export const ProductDialog: React.FC<ProductDialogProps> = ({
  open,
  onOpenChange,
  onFileUpload,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files ? event.target.files[0] : null;
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (file) {
      setIsUploading(true);
      try {
        await onFileUpload(file);
        setIsUploading(false);
        setFile(null); // Clear file after successful upload
        onOpenChange(false);
      } catch (error) {
        setIsUploading(false);
        console.error("Error uploading file:", error);
      }
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setFile(null); // Clear file when dialog is closed
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload CSV File</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
          />
          {file && <p>Selected File: {file.name}</p>}
        </div>
        <div className="flex justify-end space-x-4 mt-4">
          <Button
            onClick={() => handleOpenChange(false)}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={isUploading || !file}>
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
