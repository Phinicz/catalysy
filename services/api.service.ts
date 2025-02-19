import { API_CONFIG } from "../utils/api.config";
import {
  ApiResponse,
  CreateUserData,
  UserCountResponse,
  UserCountParams,
  LoyaltyRulesResponse,
} from "../types/api.types";

class ApiService {
  private async fetchApi<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...API_CONFIG.headers,
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "API request failed");
    }

    return response.json();
  }

  async getUsers(): Promise<ApiResponse> {
    return this.fetchApi<ApiResponse>("/users");
  }

  async createUser(userData: CreateUserData): Promise<any> {
    return this.fetchApi("/users/metadatas", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async getUserCount(params: UserCountParams): Promise<UserCountResponse> {
    const queryParams = new URLSearchParams();
    if (params.organizationId) {
      queryParams.append("organizationId", params.organizationId);
    }
    if (params.websiteId) {
      queryParams.append("websiteId", params.websiteId);
    }

    const queryString = queryParams.toString();
    const endpoint = `/users/count${queryString ? `?${queryString}` : ""}`;

    return this.fetchApi<UserCountResponse>(endpoint, {
      method: "GET",
    });
  }

  async getLoyaltyRules(): Promise<LoyaltyRulesResponse> {
    return this.fetchApi<LoyaltyRulesResponse>("/loyalty/rules");
  }
}

export const apiService = new ApiService();
