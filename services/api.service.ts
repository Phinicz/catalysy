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
  ): Promise<any> {
    return this.fetchApi(`/loyalty/rules/${ruleId}/complete`, {
      method: "POST",
      body: JSON.stringify({ walletAddress }),
    });
  }

  async getRuleProcessingStatus(
    walletAddress: string
  ): Promise<RuleProcessingStatus> {
    try {
      // First get the user data to extract the user ID
      const usersResponse = await this.getUsers();
      const user = usersResponse.data.find(
        (user) =>
          user.walletAddress.toLowerCase() === walletAddress.toLowerCase()
      );

      if (!user) {
        console.error("User not found for wallet address:", walletAddress);
        return { data: [] };
      }

      if (
        !process.env.NEXT_PUBLIC_WEBSITE_ID ||
        !process.env.NEXT_PUBLIC_ORGANIZATION_ID
      ) {
        throw new Error(
          "Missing required environment variables: NEXT_PUBLIC_WEBSITE_ID and/or NEXT_PUBLIC_ORGANIZATION_ID"
        );
      }

      const queryParams = new URLSearchParams({
        userId: user.id,
        websiteId: process.env.NEXT_PUBLIC_WEBSITE_ID,
        organizationId: process.env.NEXT_PUBLIC_ORGANIZATION_ID,
      });

      return this.fetchApi<RuleProcessingStatus>(
        `/loyalty/rules/status?${queryParams.toString()}`,
        {
          method: "GET",
        }
      );
    } catch (error) {
      console.error("Error fetching rule status:", error);
      return { data: [] };
    }
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
