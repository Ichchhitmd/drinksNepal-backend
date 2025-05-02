import productsServices from "@/config/services/products/productService";
import { useGlobal } from "@/hooks/use-global";
import { Category, Product } from "@/types/types";
import { useEffect, useState } from "react";
import { useDebounce } from "../../hooks/use-debounce";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Slider } from "../ui/slider";
import { ProductDialog } from "./ProductDialog";
import { ProductList } from "./ProductList";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 250);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    null
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [filterValues, setFilterValues] = useState({
    search: "",
    category: null as string | null,
    subCategory: null as string | null,
    priceRange: [0, 10000] as [number, number],
  });
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);
  const { isAuthenticated, setIsLoading } = useGlobal();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        if (!isAuthenticated) return;
        const { data } = await productsServices.getAllCategories();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError("Failed to fetch categories");
      }
    };

    fetchCategories();
  }, [isAuthenticated]);

  // Get subcategories for selected category
  const getSubcategories = () => {
    const category = categories.find((cat) => cat._id === selectedCategory);
    return category?.subcategories || [];
  };

  useEffect(() => {
    const fetchProducts = async () => {
      if (!isAuthenticated) return;
      setIsLoading(true);
      try {
        const filters: any = {};

        if (filterValues.category) {
          filters.category = filterValues.category;
        }

        if (filterValues.subCategory) {
          filters.subCategory = filterValues.subCategory;
        }

        if (filterValues.priceRange) {
          filters.minPrice = filterValues.priceRange[0];
          filters.maxPrice = filterValues.priceRange[1];
        }

        const { data } = await productsServices.searchProducts(
          currentPage,
          10,
          "text",
          debouncedSearch,
          Object.keys(filters).length > 0 ? filters : undefined,
          sortOrder ? { price: sortOrder } : undefined
        );
        setProducts(data?.products);
        setTotalPages(data?.totalPages);
      } catch (error) {
        setError("Failed to fetch products");
        console.log("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, debouncedSearch, filterValues, sortOrder, isAuthenticated]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (file) {
      setIsLoading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        await productsServices.uploadCSV(formData);
        console.log("File uploaded successfully", file);
        setIsDialogOpen(false);
        // Re-fetch products after successful upload
        const { data } = await productsServices.searchProducts(
          currentPage,
          10,
          "text",
          searchQuery
        );
        setProducts(data.products);
        setTotalPages(data.totalPages);
      } catch (error) {
        setError("Failed to upload CSV. Please try again.");
        console.error("File upload failed:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setPriceRange([0, 10000]);
    setSearchQuery("");
    setFilterValues({
      search: "",
      category: null,
      subCategory: null,
      priceRange: [0, 10000],
    });
    setCurrentPage(1);
  };

  const handleExportCSV = async () => {
    try {
      setIsLoading(true);

      // Get CSV data with explicit response type
      const response = await productsServices.exportAllProducts();
      const csvContent = new Blob([response], {
        type: "text/csv;charset=utf-8;",
      });

      // Create download link
      const url = window.URL.createObjectURL(csvContent);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `products_export_${new Date().toISOString().split("T")[0]}.csv`
      );

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError("Failed to export products");
      console.error("Export failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <div className="flex gap-2">
          <Button
            onClick={() => handleExportCSV()}
            className="w-[140px]"
            variant="outline"
          >
            Export Products
          </Button>
          <Button onClick={() => setIsDialogOpen(true)} className="w-[140px]">
            Upload Products
          </Button>
        </div>
      </div>

      {/* Search, Sort and Filters Toggle Container */}
      <div className="flex gap-4 items-center">
        <Input
          type="search"
          placeholder="Search products..."
          value={searchQuery}
          onChange={handleSearch}
          className="flex-1"
        />
        <Select
          value={sortOrder || "default"}
          onValueChange={(value) =>
            setSortOrder(value === "default" ? null : (value as "asc" | "desc"))
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort By Price" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Sort By Price</SelectItem>
            <SelectItem value="asc">Lowest Price</SelectItem>
            <SelectItem value="desc">Highest Price</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={() => setIsFiltersVisible(!isFiltersVisible)}
          className="w-[140px]"
        >
          {isFiltersVisible ? "Hide Filters" : "Show Filters"}
        </Button>
      </div>

      {/* Filters Card with conditional rendering */}
      {isFiltersVisible && (
        <div className="border rounded-lg p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Filters</h2>
            <Button variant="outline" onClick={clearFilters} size="sm">
              Clear Filters
            </Button>
          </div>
          <div className="space-y-4">
            <Select
              value={selectedCategory || "_all"}
              onValueChange={(value) =>
                setSelectedCategory(value === "_all" ? null : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category._id} value={category._id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedSubcategory || "_all"}
              onValueChange={(value) =>
                setSelectedSubcategory(value === "_all" ? null : value)
              }
              disabled={!selectedCategory || getSubcategories().length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Subcategory" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All Subcategories</SelectItem>
                {getSubcategories().map((subcategory) => (
                  <SelectItem key={subcategory._id} value={subcategory._id}>
                    {subcategory.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="space-y-2">
              <label className="text-sm">
                Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
              </label>
              <Slider
                defaultValue={[0, 10000]}
                min={0}
                max={10000}
                step={100}
                value={priceRange}
                onValueChange={(value) =>
                  setPriceRange(value as [number, number])
                }
                minStepsBetweenThumbs={1}
                className="w-full"
              />
            </div>

            <Button
              className="w-full"
              onClick={() => {
                setFilterValues({
                  search: searchQuery,
                  category: selectedCategory,
                  subCategory: selectedSubcategory,
                  priceRange: priceRange,
                });
                setCurrentPage(1); // Reset to first page when applying new filters
              }}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      )}

      <ProductList product={products} />
      <div className="flex justify-between items-center">
        <Button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <span className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>

      {/* Product Upload Dialog */}
      <ProductDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onFileUpload={handleFileUpload}
      />

      {/* Error State */}
      {error && <div className="error">{error}</div>}
    </div>
  );
}
