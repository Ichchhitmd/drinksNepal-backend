import API_ENDPOINTS from "@/config/api/endpoints";
import fetchWrapper from "@/config/api/fetchWrapper";
import {
  ApiResponse,
  AuthResponseData,
  SearchUsersResponse,
  User,
} from "@/types/types";

const loginServices = {
  loginAdmin: async (
    email: string,
    password: string
  ): Promise<ApiResponse<AuthResponseData>> => {
    const response = await fetchWrapper<ApiResponse<AuthResponseData>>(
      API_ENDPOINTS.LOGIN,
      {
        method: "POST",
        body: {
          email,
          password,
        },
      }
    );
    return response;
  },
  authenticate: async (accessToken: string): Promise<ApiResponse<User>> => {
    const response = await fetchWrapper<ApiResponse<User>>(
      API_ENDPOINTS.AUTHENTICATE,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response;
  },
  searchUsers: async (
    query: string,
    filters: any,
    sort: any,
    page: number,
    pageSize: number
  ): Promise<ApiResponse<SearchUsersResponse>> => {
    const response = await fetchWrapper<ApiResponse<SearchUsersResponse>>(
      API_ENDPOINTS.SEARCH_USERS,
      { method: "POST", body: { query, filters, sort, page, pageSize } }
    );
    return response;
  },
  createDeliveryUser: async (data: {
    fullName: string;
    email: string;
    phoneNumber: string;
  }): Promise<ApiResponse<AuthResponseData>> => {
    const response = await fetchWrapper<ApiResponse<AuthResponseData>>(
      API_ENDPOINTS.DELIVERY_USER,
      { method: "POST", body: data }
    );
    return response;
  },
  updateDeliveryUser: async (
    userId: string,
    data: any
  ): Promise<ApiResponse<AuthResponseData>> => {
    const response = await fetchWrapper<ApiResponse<AuthResponseData>>(
      `${API_ENDPOINTS.DELIVERY_USER}/${userId}`,
      { method: "PUT", body: data }
    );
    return response;
  },
  deleteDeliveryUser: async (
    userId: string
  ): Promise<ApiResponse<AuthResponseData>> => {
    const response = await fetchWrapper<ApiResponse<AuthResponseData>>(
      `${API_ENDPOINTS.DELIVERY_USER}/${userId}`,
      { method: "DELETE" }
    );
    return response;
  },
  redeemBalance: async (userId: string): Promise<ApiResponse<User>> => {
    const response = await fetchWrapper<ApiResponse<User>>(
      `${API_ENDPOINTS.REDEEM_BALANCE}/${userId}`,
      {
        method: "PUT",
      }
    );
    return response;
  },
};

export default loginServices;
