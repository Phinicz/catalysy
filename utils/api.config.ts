export const API_CONFIG = {
  baseUrl: "http://localhost:3000/api/snag",
  headers: {
    "Content-Type": "application/json",
    "X-API-KEY": process.env.NEXT_PUBLIC_SNAG_API_KEY || "",
  },
};
