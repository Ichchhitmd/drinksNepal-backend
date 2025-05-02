import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TopProduct } from "@/types/types";

interface PopularProductsProps {
  topProducts: TopProduct[];
}

export function PopularProducts({ topProducts }: PopularProductsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Popular Products</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {topProducts.map((product) => (
            <div
              key={product._id}
              className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
            >
              <div>
                <div className="group relative">
                  <p className="font-medium truncate max-w-[250px] cursor-pointer">
                    {product.name}
                  </p>
                  <div className="absolute left-0 top-[-60px] invisible opacity-0 group-hover:visible group-hover:opacity-100 bg-white text-black p-2 rounded text-sm z-10 shadow-md border border-gray-200 transition-all duration-200 ease-in-out">
                    {product.name}
                  </div>
                </div>
              </div>
              <div className="font-medium">
                Rs. {(product.totalSales * 500).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
