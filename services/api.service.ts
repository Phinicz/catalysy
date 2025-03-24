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

    // Get the response text first
    const responseText = await response.text();

    // If the response is empty, throw an error
    if (!responseText) {
      throw new Error("Empty response from server");
    }

    try {
      // Try to parse the response as JSON
      const data = JSON.parse(responseText);

      if (!response.ok) {
        throw new Error(data.message || "API request failed");
      }

      return data;
    } catch (parseError) {
      // If JSON parsing fails, throw a more descriptive error
      throw new Error(`Invalid response from server: ${responseText}`);
    }
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
