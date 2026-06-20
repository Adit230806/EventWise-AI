import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

export const API_BASE_URL = "https://eventwise-ai-1.onrender.com";

const BASE_URL = import.meta.env.VITE_API_URL ?? API_BASE_URL;
const TIMEOUT_MS = 15_000;

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Attach auth token when available
    const token = typeof localStorage !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      const message =
        typeof error.response.data === "object" &&
        error.response.data !== null &&
        "message" in error.response.data
          ? String((error.response.data as { message: string }).message)
          : error.message;
      return Promise.reject(new Error(`API ${status}: ${message}`));
    }
    if (error.code === "ECONNABORTED") {
      return Promise.reject(new Error(`API timeout after ${TIMEOUT_MS}ms`));
    }
    if (error.request) {
      return Promise.reject(new Error("API unreachable — check network or backend status."));
    }
    return Promise.reject(error);
  },
);

export default api;
