import fetchWrapper from "@/config/api/fetchWrapper";
import { ApiResponse, Banner } from "@/types/types";
import API_ENDPOINTS from "../../api/endpoints";

interface BannersResponse {
  banners: Banner[];
}

const configService = {
  getBanners: async (): Promise<ApiResponse<BannersResponse>> => {
    const response = await fetchWrapper<ApiResponse<BannersResponse>>(
      API_ENDPOINTS.GET_BANNERS_URL,
      {
        method: "GET",
      }
    );
    return response;
  },

  uploadBanner: async (image: File): Promise<ApiResponse<BannersResponse>> => {
    const formData = new FormData();
    formData.append("image", image);

    const response = await fetchWrapper<ApiResponse<BannersResponse>>(
      API_ENDPOINTS.UPLOAD_BANNER_URL,
      {
        method: "POST",
        body: formData,
      }
    );
    return response;
  },

  deleteBanner: async (
    bannerId: string
  ): Promise<ApiResponse<BannersResponse>> => {
    const response = await fetchWrapper<ApiResponse<BannersResponse>>(
      `${API_ENDPOINTS.DELETE_BANNER_URL}/${bannerId}`,
      {
        method: "DELETE",
      }
    );
    return response;
  },

  reorderBanners: async (
    bannerIds: string[]
  ): Promise<ApiResponse<BannersResponse>> => {
    const response = await fetchWrapper<ApiResponse<BannersResponse>>(
      API_ENDPOINTS.REORDER_BANNERS_URL,
      {
        method: "PUT",
        body: { bannerIds },
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response;
  },
};

export default configService;
