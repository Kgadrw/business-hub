// In dev, Vite proxies `/api` + `/health` to the backend (see `vite.config.ts`).
// In prod, set `VITE_API_URL` to your backend origin (e.g. https://api.example.com).
import { getAuthToken } from "@/lib/auth";

// Default production backend (can be overridden via VITE_API_URL).
const DEFAULT_API_URL = "https://wegomanage-backend.onrender.com";

export const API_URL = (import.meta as any).env?.VITE_API_URL ?? DEFAULT_API_URL;

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

function errorMessageFromBody(body: unknown) {
  if (body && typeof body === "object" && "error" in body && typeof (body as any).error === "string") {
    return (body as any).error as string;
  }
  return null;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  });

  const text = await res.text();
  const body = text ? (() => { try { return JSON.parse(text); } catch { return text; } })() : null;

  if (!res.ok) {
    const hint = errorMessageFromBody(body);
    throw new ApiError(hint ? `${hint} (${res.status})` : `Request failed: ${res.status}`, res.status, body);
  }
  return body as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data: unknown) => request<T>(path, { method: "POST", body: JSON.stringify(data) }),
  put: <T>(path: string, data: unknown) => request<T>(path, { method: "PUT", body: JSON.stringify(data) }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

