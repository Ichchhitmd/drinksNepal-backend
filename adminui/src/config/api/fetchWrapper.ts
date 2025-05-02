import { FetchOptions } from "@/types/config/fetchWrapper";
import Cookies from "js-cookie";

const fetchWrapper = async <T>(
  url: string,
  options: FetchOptions
): Promise<T> => {
  const { method, headers, body } = options;

  const token = Cookies.get("accessToken");

  try {
    const isFormData = body instanceof FormData;

    const response = await fetch(url, {
      method,
      headers: {
        ...(body && typeof body === "object" && !isFormData
          ? { "Content-Type": "application/json" }
          : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: isFormData ? body : body ? JSON.stringify(body) : undefined,
    });

    if (response.status === 401) {
      Cookies.remove("accessToken");
      window.location.href = "/login";
    }

    if (!response.ok) {
      console.error(
        `Fetch error! Status: ${response.status}, Body: ${response.statusText}`
      );
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get("Content-Type");

    if (contentType?.includes("text/csv")) {
      return response.blob() as Promise<T>;
    } else if (contentType?.includes("application/json")) {
      return response.json();
    } else {
      return response.text() as Promise<T>;
    }
  } catch (error) {
    console.error("Fetch Error:", error);
    throw error;
  }
};

export default fetchWrapper;
