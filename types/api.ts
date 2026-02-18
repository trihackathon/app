// API Response types

export type UserResponse = {
  id: string;
  name: string;
  age: number;
  gender: string;
  weight: number;
  chronotype: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
};

export type ErrorResponse = {
  error: string;
  message?: string;
};

export type DebugTokenResponse = {
  custom_token: string;
};

export type HealthResponse = {
  status: string;
};

// Team
export type TeamMemberResponse = {
  user_id: string;
  name: string;
  role: string;
  joined_at: string;
  avatar_url?: string;
};

export type GoalResponse = {
  id: string;
  team_id: string;
  exercise_type: string;
  target_distance_km: number | null;
  target_visits_per_week: number | null;
  target_min_duration_min: number | null;
  created_at: string;
  updated_at: string;
};

export type TeamResponse = {
  id: string;
  name: string;
  exercise_type: string;
  strictness: string;
  status: string;
  max_hp: number;
  current_hp: number;
  current_week: number;
  started_at: string | null;
  members: TeamMemberResponse[];
  goal?: GoalResponse;
  created_at: string;
  updated_at: string;
};

// Invite Code
export type InviteCodeResponse = {
  code: string;
  team_id: string;
  team_name: string;
  exercise_type: string;
  expires_at: string;
  current_member_count: number;
};

export type JoinTeamResponse = {
  team: TeamResponse;
  team_ready: boolean;
};

// Activity
export type GPSPointResponse = {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
};

export type ActivityResponse = {
  id: string;
  user_id: string;
  user_name?: string;
  team_id: string;
  exercise_type: string;
  status: string;
  review_status?: string;
  started_at: string;
  ended_at: string | null;
  distance_km?: number;
  gym_location_id?: string | null;
  gym_location_name?: string | null;
  auto_detected?: boolean;
  duration_min: number;
  gps_points?: GPSPointResponse[];
  created_at: string;
  updated_at: string;
};

export type ActivityReviewResponse = {
  id: string;
  activity_id: string;
  reviewer_id: string;
  reviewer_name: string;
  status: string;
  comment: string;
  created_at: string;
};

export type PostActivityReviewRequest = {
  status: string;
  comment?: string;
};

export type SendGPSPointsResponse = {
  saved_count: number;
  current_distance_km: number;
};

// Gym Location
export type GymLocationResponse = {
  id: string;
  user_id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius_m: number;
  created_at: string;
  updated_at: string;
};

// Team Status
export type HPChangeEntry = {
  user_id: string;
  user_name: string;
  hp_change: number;
  target_met: boolean;
};

export type WeekHPHistory = {
  week: number;
  hp_start: number;
  hp_end: number;
  changes: HPChangeEntry[];
};

export type MemberProgress = {
  user_id: string;
  user_name: string;
  current_week_distance_km: number | null;
  current_week_visits: number | null;
  current_week_duration_min: number | null;
  target_progress_percent: number;
  avatar_url?: string;
};

export type TeamStatusResponse = {
  team_id: string;
  status: string;
  current_hp: number;
  max_hp: number;
  current_week: number;
  started_at: string;
  hp_history: WeekHPHistory[];
  members_progress: MemberProgress[];
};

// Weekly Evaluation
export type WeeklyEvaluationResponse = {
  id: string;
  team_id: string;
  user_id: string;
  user_name: string;
  week_number: number;
  target_met: boolean;
  total_distance_km: number;
  total_visits: number;
  total_duration_min: number;
  hp_change: number;
  evaluated_at: string;
};

export type WeekActivitySummary = {
  id: string;
  date: string;
  distance_km?: number;
  duration_min: number;
};

export type CurrentWeekMemberProgress = {
  user_id: string;
  user_name: string;
  total_distance_km: number;
  total_visits: number;
  qualified_visits: number; // 滞在時間目標を満たした訪問回数
  total_duration_min: number;
  target_progress_percent: number;
  on_track: boolean;
  target_multiplier: number; // 1.0=通常, 1.5=前週未達成ペナルティ
  activities_this_week: WeekActivitySummary[];
  avatar_url?: string;
};

export type CurrentWeekEvaluationResponse = {
  team_id: string;
  week_number: number;
  week_start: string;
  week_end: string;
  days_remaining: number;
  members: CurrentWeekMemberProgress[];
};

// Prediction
export type DailyStat = {
  day_of_week: number;
  day_name: string;
  success_rate: number;
  activity_count: number;
  is_danger: boolean;
};

export type PredictionResponse = {
  user_id: string;
  analysis_period_weeks: number;
  daily_stats: DailyStat[];
  danger_days: string[];
  recommendation: string;
};

// Disband Vote
export type DisbandVoteResponse = {
  team_id: string;
  total_count: number;
  voted_count: number;
  voted_users: string[];
  disbanded: boolean;
};

// API Request types

export type CreateUserRequest = {
  name: string;
  age: number;
  gender: string;
  weight: number;
  chronotype: string;
  avatar?: File;
};

export type UpdateUserRequest = {
  name?: string;
  age?: number;
  gender?: string;
  weight?: number;
  chronotype?: string;
  avatar?: File;
};

export type CreateTeamRequest = {
  name: string;
  exercise_type: string;
  strictness?: string;
};

export type JoinTeamRequest = {
  code: string;
};

export type CreateGoalRequest = {
  target_distance_km?: number;
  target_visits_per_week?: number;
  target_min_duration_min?: number;
};

export type StartRunningRequest = {
  latitude: number;
  longitude: number;
};

export type FinishRunningRequest = {
  latitude: number;
  longitude: number;
};

export type GPSPointRequest = {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: string;
};

export type SendGPSPointsRequest = {
  points: GPSPointRequest[];
};

export type CreateGymLocationRequest = {
  name: string;
  latitude: number;
  longitude: number;
  radius_m?: number;
};

export type GymCheckinRequest = {
  gym_location_id: string;
  latitude: number;
  longitude: number;
  auto_detected?: boolean;
};

export type GymCheckoutRequest = {
  latitude: number;
  longitude: number;
};

// Discriminated union for type-safe error handling

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ErrorResponse };
