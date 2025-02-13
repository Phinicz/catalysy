import { useState, useEffect } from "react";
import { useApi } from "../context/ApiContext";
import { ApiResponse } from "../types/api.types";

export const useUsers = () => {
  const { getUsers } = useApi();
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const result = await getUsers();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [getUsers]);

  return { data, error, isLoading };
};
