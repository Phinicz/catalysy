import React, { createContext, useContext, ReactNode } from "react";
import { apiService } from "../services/api.service";
import {
  ApiResponse,
  CreateUserData,
  UserCountResponse,
  UserCountParams,
  LoyaltyRulesResponse,
  RuleProcessingStatus,
} from "../types/api.types";

interface ApiContextType {
  getUsers: () => Promise<ApiResponse>;
  createUser: (userData: CreateUserData) => Promise<any>;
  getUserCount: (params: UserCountParams) => Promise<UserCountResponse>;
  getLoyaltyRules: () => Promise<LoyaltyRulesResponse>;
  completeLoyaltyRule: (ruleId: string, walletAddress: string) => Promise<any>;
  getRuleProcessingStatus: (
    walletAddress: string,
    ruleId: string
  ) => Promise<RuleProcessingStatus>;
  getTransactionEntries: () => Promise<any>;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export const ApiProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const value = {
    getUsers: apiService.getUsers.bind(apiService),
    createUser: apiService.createUser.bind(apiService),
    getUserCount: apiService.getUserCount.bind(apiService),
    getLoyaltyRules: apiService.getLoyaltyRules.bind(apiService),
    completeLoyaltyRule: apiService.completeLoyaltyRule.bind(apiService),
    getRuleProcessingStatus:
      apiService.getRuleProcessingStatus.bind(apiService),
    getTransactionEntries: apiService.getTransactionEntries.bind(apiService),
  };

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};

export const useApi = () => {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error("useApi must be used within an ApiProvider");
  }
  return context;
};
