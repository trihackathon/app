import { firebaseAuth } from "@/lib/firebase/config";
import type { ApiResult, ErrorResponse } from "@/types/api";

// バックエンドAPIのURL
// プロキシ経由だとAuthorizationヘッダーが転送されない場合があるため直接アクセス
const API_URL = process.env.NEXT_PUBLIC_API_URL || "/proxy";

async function getAuthToken(): Promise<string | null> {
  let user = firebaseAuth.currentUser;
  let attempts = 0;

  while (!user && attempts < 6) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    user = firebaseAuth.currentUser;
    attempts++;
  }

  if (!user) {
    return null;
  }

  const token = await user.getIdToken(true);
  return token;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<ApiResult<T>> {
  try {
    const token = await getAuthToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const responseText = await res.text();

    let data;
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      return {
        ok: false,
        error: { error: `${res.status}: JSON parse error`, message: responseText },
      };
    }

    if (!res.ok) {
      const err = data as ErrorResponse;
      // ステータスコードをエラーに含める
      if (!err.error) {
        err.error = `HTTP ${res.status}`;
      }
      if (!err.message) {
        err.message = res.statusText || "Unknown error";
      }
      return { ok: false, error: err };
    }

    return { ok: true, data: data as T };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return { ok: false, error: { error: "network_error", message } };
  }
}

// application/x-www-form-urlencoded で送信（Echo の c.FormValue() で読める）
async function requestForm<T>(
  method: string,
  path: string,
  params: URLSearchParams,
): Promise<ApiResult<T>> {
  try {
    const token = await getAuthToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/x-www-form-urlencoded",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: params.toString(),
    });

    const responseText = await res.text();

    let data;
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      return {
        ok: false,
        error: { error: `${res.status}: JSON parse error`, message: responseText },
      };
    }

    if (!res.ok) {
      const err = data as ErrorResponse;
      if (!err.error) err.error = `HTTP ${res.status}`;
      if (!err.message) err.message = res.statusText || "Unknown error";
      return { ok: false, error: err };
    }

    return { ok: true, data: data as T };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return { ok: false, error: { error: "network_error", message } };
  }
}

// multipart/form-data で送信（ファイルアップロード対応）
async function requestMultipart<T>(
  method: string,
  path: string,
  formData: FormData,
): Promise<ApiResult<T>> {
  try {
    const token = await getAuthToken();
    const headers: Record<string, string> = {};
    // FormDataの場合、Content-Typeは自動設定されるため指定しない
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: formData,
    });

    const responseText = await res.text();

    let data;
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      return {
        ok: false,
        error: { error: `${res.status}: JSON parse error`, message: responseText },
      };
    }

    if (!res.ok) {
      const err = data as ErrorResponse;
      if (!err.error) err.error = `HTTP ${res.status}`;
      if (!err.message) err.message = res.statusText || "Unknown error";
      return { ok: false, error: err };
    }

    return { ok: true, data: data as T };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return { ok: false, error: { error: "network_error", message } };
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

export function del<T>(path: string): Promise<ApiResult<T>> {
  return request<T>("DELETE", path);
}

export function postForm<T>(path: string, params: URLSearchParams): Promise<ApiResult<T>> {
  return requestForm<T>("POST", path, params);
}

export function putForm<T>(path: string, params: URLSearchParams): Promise<ApiResult<T>> {
  return requestForm<T>("PUT", path, params);
}

export function postMultipart<T>(path: string, formData: FormData): Promise<ApiResult<T>> {
  return requestMultipart<T>("POST", path, formData);
}

export function putMultipart<T>(path: string, formData: FormData): Promise<ApiResult<T>> {
  return requestMultipart<T>("PUT", path, formData);
}
