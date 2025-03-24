import { API_CONFIG } from "../utils/api.config";
import {
  ApiResponse,
  CreateUserData,
  UserCountResponse,
  UserCountParams,
  LoyaltyRulesResponse,
  RuleProcessingStatus,
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
    let allUsers: any[] = [];
    let startingAfter: string | null = null;
    let hasNextPage = true;

    while (hasNextPage) {
      // Construct the endpoint with pagination if needed
      let endpoint = "/users";
      if (startingAfter) {
        endpoint += `?startingAfter=${startingAfter}`;
      }

      // Fetch data from the API
      const response = await this.fetchApi<ApiResponse>(endpoint);

      // Append the fetched users to the array
      allUsers = [...allUsers, ...response.data];

      // Check if there is more data to fetch
      hasNextPage = response.hasNextPage;

      // Update cursor for the next request
      if (hasNextPage && response.data.length > 0) {
        startingAfter = response.data[response.data.length - 1].id;
      }
    }

    // Return all users
    return { data: allUsers, hasNextPage: false };
  }

  async createUser(userData: CreateUserData): Promise<any> {
    return this.fetchApi("/users/metadatas", {
      method: "POST",
      headers: {
        "X-API-KEY": process.env.NEXT_PUBLIC_SNAG_API_KEY || "",
      },
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

  async completeLoyaltyRule(
    ruleId: string,
    walletAddress: string
  ): Promise<{ message: string; rewarded: boolean }> {
    return this.fetchApi(`/loyalty/rules/${ruleId}/complete`, {
      method: "POST",
      headers: {
        "X-API-KEY": process.env.NEXT_PUBLIC_SNAG_API_KEY || "",
      },
      body: JSON.stringify({ walletAddress }),
    });
  }

  async getRuleProcessingStatus(
    walletAddress: string,
    ruleId: string
  ): Promise<{ message: string; rewarded: boolean }> {
    return this.fetchApi(`/loyalty/rules/${ruleId}/complete`, {
      method: "POST",
      headers: {
        "X-API-KEY": process.env.NEXT_PUBLIC_SNAG_API_KEY || "",
      },
      body: JSON.stringify({ walletAddress }),
    });
  }

  async getTransactionEntries(): Promise<any> {
    return this.fetchApi("/loyalty/transaction_entries", {
      method: "GET",
      headers: {
        "X-API-KEY": process.env.NEXT_PUBLIC_SNAG_API_KEY || "",
      },
    });
  }
}

export const apiService = new ApiService();
