import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Product, ProductListProps } from "@/types/types";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";

export function ProductList({ product = [] }: ProductListProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const displayFields = [
    { label: "SKU", key: "sku" },
    { label: "Image", key: "image" },
    { label: "Name", key: "name" },
    { label: "Category", key: "category.name" },
  ];

  const getValue = (product: Product, key: string): string | number => {
    const keys = key.split(".");
    let value: any = product;

    for (const k of keys) {
      if (k.includes("[")) {
        const [arrayKey, index] = k.replace("]", "").split("[");
        value = value[arrayKey][parseInt(index, 10)];
      } else {
        value = value[k];
      }
    }

    return value ?? "-";
  };

  const renderProductDetails = (product: Product) => {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 divide-x">
              <div className="space-y-2 pr-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">ID:</span>
                  <span className="text-sm font-medium">{product._id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Name:</span>
                  <span className="text-sm font-medium">{product.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">SKU:</span>
                  <span className="text-sm font-medium">{product.sku}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Type:</span>
                  <span className="text-sm font-medium">{product.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Tags:</span>
                  <div className="flex gap-1">
                    <span className="text-sm font-medium">
                      {product.tags
                        .split(",")
                        .map((tag) => `#${tag.trim()}`)
                        .join(", ")}
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-2 pl-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Stock Status:
                  </span>
                  <Badge variant={product.inStock ? "default" : "destructive"}>
                    {product.inStock ? "In Stock" : "Out of Stock"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Featured:
                  </span>
                  <Badge variant={product.isFeatured ? "default" : "secondary"}>
                    {product.isFeatured ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total Stock:
                  </span>
                  <span className="text-sm font-medium">{product.stock}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total Sales:
                  </span>
                  <span className="text-sm font-medium">
                    {product.totalSales}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Full Description</h4>
              <p className="text-sm text-muted-foreground">
                {product.description}
              </p>
            </div>
            <Separator />
            <div>
              <h4 className="text-sm font-medium mb-2">Short Description</h4>
              <p className="text-sm text-muted-foreground">
                {product.shortDescription}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 divide-x">
              <div className="space-y-2 pr-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Category Name:
                  </span>
                  <span className="text-sm font-medium">
                    {product.category.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Category ID:
                  </span>
                  <span className="text-sm font-medium">
                    {product.category._id}
                  </span>
                </div>
              </div>
              <div className="space-y-2 pl-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Parent Category:
                  </span>
                  <span className="text-sm font-medium">
                    {product.category.parent}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Home Category:
                  </span>
                  <Badge
                    variant={product.category.isHome ? "default" : "secondary"}
                  >
                    {product.category.isHome ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 divide-x">
              <div className="space-y-2 pr-4">
                {Object.entries(product.details)
                  .slice(
                    0,
                    Math.ceil(Object.entries(product.details).length / 2)
                  )
                  .map(
                    ([key, value]) =>
                      key !== "volume" && (
                        <div key={key} className="flex justify-between">
                          <span className="text-sm text-muted-foreground capitalize">
                            {key}:
                          </span>
                          <span className="text-sm font-medium">
                            {String(value)}
                          </span>
                        </div>
                      )
                  )}
              </div>
              <div className="space-y-2 pl-4">
                {Object.entries(product.details)
                  .slice(Math.ceil(Object.entries(product.details).length / 2))
                  .map(
                    ([key, value]) =>
                      key !== "volume" && (
                        <div key={key} className="flex justify-between">
                          <span className="text-sm text-muted-foreground capitalize">
                            {key}:
                          </span>
                          <span className="text-sm font-medium">
                            {String(value)}
                          </span>
                        </div>
                      )
                  )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Volume Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4 font-medium">Volume</th>
                    <th className="text-left py-2 px-4 font-medium">
                      Regular Price
                    </th>
                    <th className="text-left py-2 px-4 font-medium">
                      Sale Price
                    </th>
                    <th className="text-left py-2 px-4 font-medium">Stock</th>
                    <th className="text-left py-2 px-4 font-medium">Status</th>
                    <th className="text-left py-2 px-4 font-medium">Default</th>
                  </tr>
                </thead>
                <tbody>
                  {product.details.volume.map((vol) => (
                    <tr key={vol.id} className="border-b last:border-0">
                      <td className="py-2 px-4">{vol.volume}</td>
                      <td className="py-2 px-4">{vol.regularPrice}</td>
                      <td className="py-2 px-4">{vol.salePrice}</td>
                      <td className="py-2 px-4">{vol.stock}</td>
                      <td className="py-2 px-4">
                        <Badge
                          variant={vol.inStock ? "default" : "destructive"}
                        >
                          {vol.inStock ? "In Stock" : "Out of Stock"}
                        </Badge>
                      </td>
                      <td className="py-2 px-4">
                        <Badge
                          variant={vol.isDefault ? "default" : "secondary"}
                        >
                          {vol.isDefault ? "Yes" : "No"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${product.name} - ${index + 1}`}
                  className="aspect-square object-cover rounded-lg shadow-sm"
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Created: {new Date(product.createdAt).toLocaleString()}</span>
          <span>
            Last Updated: {new Date(product.updatedAt).toLocaleString()}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            {displayFields.map((field) => (
              <TableHead key={field.key}>{field.label}</TableHead>
            ))}
            <TableHead>Volume Options</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {product.map((product) => (
            <TableRow key={product._id}>
              {displayFields.map((field) => (
                <TableCell key={field.key}>
                  {field.key === "image" ? (
                    product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name || "Product"}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      "No Image"
                    )
                  ) : (
                    getValue(product, field.key)
                  )}
                </TableCell>
              ))}
              <TableCell>
                <div className="space-y-2">
                  {product.details.volume.map((vol) => (
                    <div key={vol.id} className="text-sm">
                      {vol.volume}: ₹{vol.regularPrice}
                      {vol.salePrice < vol.regularPrice && (
                        <span className="text-green-600 ml-1">
                          (Sale: ₹{vol.salePrice})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </TableCell>
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
                      onClick={() => setSelectedProduct(product)}
                    >
                      View Details
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedProduct && (
        <Dialog
          open={!!selectedProduct}
          onOpenChange={() => setSelectedProduct(null)}
        >
          <DialogContent className="max-w-[90vw] max-h-[90vh] w-full overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Product Details</DialogTitle>
            </DialogHeader>
            {renderProductDetails(selectedProduct)}
            <div className="mt-4 flex justify-end">
              <Button onClick={() => setSelectedProduct(null)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
