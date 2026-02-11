import { get, post, put } from "@/lib/api/client";
import type {
  UserResponse,
  CreateUserRequest,
  UpdateUserRequest,
  HealthResponse,
  DebugTokenResponse,
} from "@/types/api";

export function getMe() {
  return get<UserResponse>("/api/users/me");
}

export function createMe(body: CreateUserRequest) {
  return post<UserResponse>("/api/users/me", body);
}

export function updateMe(body: UpdateUserRequest) {
  return put<UserResponse>("/api/users/me", body);
}

export function healthCheck() {
  return get<HealthResponse>("/debug/health");
}

export function debugToken(uid: string) {
  return get<DebugTokenResponse>(`/debug/token?uid=${encodeURIComponent(uid)}`);
}
