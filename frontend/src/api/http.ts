// Importamos axios para hacer peticiones HTTP al backend
import axios from "axios";

/**
 * Creamos una instancia personalizada de axios.
 */
export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

/**
 *  INTERCEPTOR
 * Agrega automáticamente el token si existe en localStorage
 */
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    // axios a veces tipa headers como readonly / AxiosHeaders
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }

  return config;
});

/**
 * Tipo estándar para manejar errores en frontend.
 */
export type ApiError = {
  status: number;
  message: string;
  details?: unknown;
};

export function toApiError(err: any): ApiError {
  const status = err?.response?.status ?? 0;
  const data = err?.response?.data;

  const message = data?.message || data?.error || err?.message || "Unexpected error";
  const details = data?.details;

  return { status, message, details };
}

/**
 * Soporta APIs que devuelven:
 * - { data: {...} }
 * - { ok: true, data: {...} }
 * - {...} directo
 */
export function unwrap<T>(payload: any): T {
  if (payload && typeof payload === "object") {
    if ("data" in payload) return (payload as any).data as T;
    if ("ok" in payload && "data" in payload) return (payload as any).data as T;
  }
  return payload as T;
}