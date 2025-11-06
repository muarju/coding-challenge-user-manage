import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:4000/api"
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const sid = localStorage.getItem("sessionId");
    if (sid) (config.headers as any)["x-session-id"] = sid;
  }
  return config;
});

// Simple retry for transient startup/network errors so e2e is stable
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const config: any = error?.config || {};
    const shouldRetry =
      !error.response && // network/unreachable
      (!config.__retryCount || config.__retryCount < 5);
    if (shouldRetry) {
      config.__retryCount = (config.__retryCount || 0) + 1;
      const delay = 200 + config.__retryCount * 200; // 200ms, 400ms, ...
      await new Promise((r) => setTimeout(r, delay));
      return api.request(config);
    }
    return Promise.reject(error);
  }
);

export default api;
