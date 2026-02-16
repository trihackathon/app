import { firebaseAuth } from "@/lib/firebase/config";
import type { ApiResult, ErrorResponse } from "@/types/api";

// Use Next.js rewrites proxy to avoid CORS issues in dev
const API_URL = "/proxy";

async function getAuthHeaders(): Promise<HeadersInit> {
  // currentUserが設定されるまで少し待つ（最大3秒）
  let user = firebaseAuth.currentUser;
  let attempts = 0;
  
  console.log("[AUTH] Initial currentUser:", user?.uid || "null");
  
  while (!user && attempts < 6) {
    console.log(`[AUTH] Waiting for currentUser... attempt ${attempts + 1}/6`);
    await new Promise((resolve) => setTimeout(resolve, 500));
    user = firebaseAuth.currentUser;
    attempts++;
  }
  
  if (!user) {
    console.error("[AUTH] No authenticated user found after waiting");
    return { "Content-Type": "application/json" };
  }

  console.log("[AUTH] User found:", user.uid);
  const token = await user.getIdToken(true); // 強制的に新しいトークンを取得
  console.log("[AUTH] Token acquired:", token.substring(0, 50) + "...");
  
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  isFormData?: boolean,
): Promise<ApiResult<T>> {
  try {
    const headers = await getAuthHeaders();

    // FormDataの場合はContent-Typeを削除（ブラウザが自動設定）
    if (isFormData) {
      delete (headers as Record<string, string>)["Content-Type"];
    }

    console.log(`[API] ${method} ${API_URL}${path}`);
    if (body) {
      console.log("[API] Request body:", body);
    }
    console.log("[API] Headers:", headers);

    const res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: isFormData ? (body as FormData) : body ? JSON.stringify(body) : undefined,
    });

    console.log(`[API] Response status: ${res.status} ${res.statusText}`);
    
    const contentType = res.headers.get("content-type");
    console.log(`[API] Response content-type: ${contentType}`);
    
    // レスポンスのテキストを取得
    const responseText = await res.text();
    console.log(`[API] Response text:`, responseText);
    
    // JSONパース
    let data;
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch (parseError) {
      console.error("[API] JSON parse error:", parseError);
      return { 
        ok: false, 
        error: { 
          error: `JSON parse error: ${responseText}` 
        } 
      };
    }

    if (!res.ok) {
      console.error(`[API] Error response:`, data);
      return { ok: false, error: data as ErrorResponse };
    }

    console.log(`[API] Success response:`, data);
    return { ok: true, data: data as T };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error(`[API] Exception:`, e);
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

export function del<T>(path: string): Promise<ApiResult<T>> {
  return request<T>("DELETE", path);
}

export function postForm<T>(path: string, formData: FormData): Promise<ApiResult<T>> {
  return request<T>("POST", path, formData, true);
}

export function putForm<T>(path: string, formData: FormData): Promise<ApiResult<T>> {
  return request<T>("PUT", path, formData, true);
}
