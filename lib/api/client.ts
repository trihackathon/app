import { firebaseAuth } from "@/lib/firebase/config";
import type { ApiResult, ErrorResponse } from "@/types/api";

// Use Next.js rewrites proxy to avoid CORS issues in dev
const API_URL = "/proxy";

async function getAuthHeaders(): Promise<HeadersInit> {
  const user = firebaseAuth.currentUser;
  if (!user) return { "Content-Type": "application/json" };

  const token = await user.getIdToken();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<ApiResult<T>> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json();

    if (!res.ok) {
      return { ok: false, error: data as ErrorResponse };
    }

    return { ok: true, data: data as T };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return { ok: false, error: { error: message } };
  }
}

export function get<T>(path: string): Promise<ApiResult<T>> {
  return request<T>("GET", path);
}

export function post<T>(path: string, body?: unknown): Promise<ApiResult<T>> {
  return request<T>("POST", path, body);
}

export function put<T>(path: string, body?: unknown): Promise<ApiResult<T>> {
  return request<T>("PUT", path, body);
}
