import API_ENDPOINTS from "@/config/api/endpoints";
import fetchWrapper from "@/config/api/fetchWrapper";
import { ApiResponse, Category, SearchProductsResponse } from "@/types/types";

interface SearchFilters {
  category?: string;
  subCategory?: string;
  minPrice?: number;
  maxPrice?: number;
}

const productsServices = {
  uploadCSV: async (formData: FormData) => {
    try {
      return await fetchWrapper(API_ENDPOINTS.POST_PRODUCTS, {
        method: "POST",
        body: formData,
      });
    } catch (error) {
      console.error("Error uploading CSV:", error);
      throw error;
    }
  },
  exportAllProducts: async (): Promise<BlobPart> => {
    try {
      return await fetchWrapper<BlobPart>(API_ENDPOINTS.EXPORT_PRODUCTS, {
        method: "GET",
      });
    } catch (error) {
      console.error("Error exporting products:", error);
      throw error;
    }
  },
  searchProducts: async (
    page: number,
    pageSize: number,
    searchType: string,
    query: string,
    filters?: SearchFilters,
    sort?: {
      price: "asc" | "desc" | null;
    }
  ): Promise<ApiResponse<SearchProductsResponse>> => {
    console.log("filters", filters);
    try {
      const searchParams = {
        page: page,
        pageSize: pageSize,
        searchType,
        query,
        filters: {
          ...(filters?.category && { category: filters.category }),
          ...(filters?.subCategory && { subCategory: filters.subCategory }),
          ...(filters?.minPrice !== undefined &&
            filters.minPrice !== 0 && {
              minPrice: filters.minPrice,
            }),
          ...(filters?.maxPrice !== undefined &&
            filters.maxPrice !== 10000 && {
              maxPrice: filters.maxPrice,
            }),
        },
        sort: sort?.price ? { price: sort.price } : undefined,
      };

      return await fetchWrapper(API_ENDPOINTS.SEARCH_PRODUCTS, {
        method: "POST",
        body: searchParams,
      });
    } catch (error) {
      console.error("Error searching products:", error);
      throw error;
    }
  },
  getAllCategories: async (): Promise<ApiResponse<Category[]>> => {
    try {
      return await fetchWrapper(API_ENDPOINTS.GET_ALL_CATEGORIES, {
        method: "GET",
      });
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  },
};

export default productsServices;
