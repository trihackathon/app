// API Response types

export type UserResponse = {
  id: string;
  firebase_uid: string;
  name: string;
  age: number;
  created_at: string;
  updated_at: string;
};

export type ErrorResponse = {
  error: string;
};

export type DebugTokenResponse = {
  custom_token: string;
};

export type HealthResponse = {
  status: string;
};

// API Request types

export type CreateUserRequest = {
  name: string;
  age: number;
};

export type UpdateUserRequest = {
  name: string;
  age: number;
};

// Discriminated union for type-safe error handling

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ErrorResponse };
