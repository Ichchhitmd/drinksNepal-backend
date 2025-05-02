import API_ENDPOINTS from "@/config/api/endpoints";
import fetchWrapper from "@/config/api/fetchWrapper";
import { Order } from "@/lib/types";
import { ApiResponse, ExchangeRate, SearchOrdersResponse } from "@/types/types";

const orderService = {
  createExchangeRate: async (
    rate: number
  ): Promise<ApiResponse<ExchangeRate>> => {
    const response = await fetchWrapper<ApiResponse<ExchangeRate>>(
      API_ENDPOINTS.CREATE_EXCHANGE_RATE,
      {
        method: "POST",
        body: {
          rate,
        },
      }
    );
    return response;
  },
  getCurrentExchangeRate: async (): Promise<ApiResponse<ExchangeRate>> => {
    const response = await fetchWrapper<ApiResponse<ExchangeRate>>(
      API_ENDPOINTS.GET_CURRENT_EXCHANGE_RATE,
      {
        method: "GET",
      }
    );
    return response;
  },
  filterOrders: async (
    page: number,
    pageSize: number,
    query: string,
    filters: any,
    sort?: {
      createdAt: "asc" | "desc" | null;
    }
  ): Promise<ApiResponse<SearchOrdersResponse>> => {
    const searchParams = {
      page: page,
      pageSize: pageSize,
      query,
      filters: {
        ...(filters?.status && { status: filters.status }),
        ...(filters?.paymentStatus && {
          paymentStatus: filters.paymentStatus,
        }),
        ...(filters?.month && { month: filters.month }),
        ...(filters?.year && { year: filters.year }),
      },
      sort: sort?.createdAt ? { createdAt: sort.createdAt } : undefined,
    };
    const response = await fetchWrapper<ApiResponse<SearchOrdersResponse>>(
      API_ENDPOINTS.ORDERS,
      {
        method: "POST",
        body: searchParams,
      }
    );
    return response;
  },
  changeOrderStatus: async (
    orderId: string,
    status: string,
    deliveryGuyId?: string
  ): Promise<ApiResponse<Order>> => {
    const response = await fetchWrapper<ApiResponse<Order>>(
      `${API_ENDPOINTS.ORDERS}/${orderId}`,
      {
        method: "PUT",
        body: {
          newStatus: status,
          ...(status === "processing" && {
            deliveryGuyId: deliveryGuyId,
          }),
        },
      }
    );
    return response;
  },
};

export default orderService;
