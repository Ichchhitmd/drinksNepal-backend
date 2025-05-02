import API_ENDPOINTS from "@/config/api/endpoints";
import fetchWrapper from "@/config/api/fetchWrapper";
import { AnalyticsData, ApiResponse } from "@/types/types";

const analyticsService = {
  getAnalytics: async (): Promise<ApiResponse<AnalyticsData>> => {
    const response = await fetchWrapper<ApiResponse<AnalyticsData>>(
      API_ENDPOINTS.ANALYTICS,
      {
        method: "GET",
      }
    );

    return response;
  },
};

export default analyticsService;
