import { get, post, put, del } from "@/lib/api/client";
import type {
  UserResponse,
  CreateUserRequest,
  UpdateUserRequest,
  HealthResponse,
  DebugTokenResponse,
  TeamResponse,
  CreateTeamRequest,
  InviteCodeResponse,
  JoinTeamResponse,
  JoinTeamRequest,
  GoalResponse,
  CreateGoalRequest,
  ActivityResponse,
  StartRunningRequest,
  FinishRunningRequest,
  SendGPSPointsRequest,
  SendGPSPointsResponse,
  GymLocationResponse,
  CreateGymLocationRequest,
  GymCheckinRequest,
  GymCheckoutRequest,
  TeamStatusResponse,
  WeeklyEvaluationResponse,
  CurrentWeekEvaluationResponse,
  PredictionResponse,
} from "@/types/api";

// Debug
export function healthCheck() {
  return get<HealthResponse>("/debug/health");
}

export function debugToken(uid: string) {
  return get<DebugTokenResponse>(`/debug/token?uid=${encodeURIComponent(uid)}`);
}

// User
export function getMe() {
  return get<UserResponse>("/api/users/me");
}

export function createMe(body: CreateUserRequest) {
  return post<UserResponse>("/api/users/me", body);
}

export function updateMe(body: UpdateUserRequest) {
  return put<UserResponse>("/api/users/me", body);
}

// Team
export function createTeam(body: CreateTeamRequest) {
  return post<TeamResponse>("/api/teams", body);
}

export function getMyTeam() {
  return get<TeamResponse>("/api/teams/me");
}

export function getTeam(teamId: string) {
  return get<TeamResponse>(`/api/teams/${teamId}`);
}

// Invite Code
export function createInvite(teamId: string) {
  return post<InviteCodeResponse>(`/api/teams/${teamId}/invite`);
}

export function joinTeam(body: JoinTeamRequest) {
  return post<JoinTeamResponse>("/api/teams/join", body);
}

// Goal
export function createGoal(teamId: string, body: CreateGoalRequest) {
  return post<GoalResponse>(`/api/teams/${teamId}/goal`, body);
}

export function getGoal(teamId: string) {
  return get<GoalResponse>(`/api/teams/${teamId}/goal`);
}

export function updateGoal(teamId: string, body: CreateGoalRequest) {
  return put<GoalResponse>(`/api/teams/${teamId}/goal`, body);
}

// Activity (Running)
export function startRunning(body: StartRunningRequest) {
  return post<ActivityResponse>("/api/activities/running/start", body);
}

export function finishRunning(activityId: string, body: FinishRunningRequest) {
  return post<ActivityResponse>(`/api/activities/running/${activityId}/finish`, body);
}

export function sendGPSPoints(activityId: string, body: SendGPSPointsRequest) {
  return post<SendGPSPointsResponse>(`/api/activities/running/${activityId}/gps`, body);
}

export function getRunningActivity(activityId: string) {
  return get<ActivityResponse>(`/api/activities/running/${activityId}`);
}

// Activity (Gym)
export function createGymLocation(body: CreateGymLocationRequest) {
  return post<GymLocationResponse>("/api/gym-locations", body);
}

export function getGymLocations() {
  return get<GymLocationResponse[]>("/api/gym-locations");
}

export function deleteGymLocation(locationId: string) {
  return del<void>(`/api/gym-locations/${locationId}`);
}

export function gymCheckin(body: GymCheckinRequest) {
  return post<ActivityResponse>("/api/activities/gym/checkin", body);
}

export function gymCheckout(activityId: string, body: GymCheckoutRequest) {
  return post<ActivityResponse>(`/api/activities/gym/${activityId}/checkout`, body);
}

export function getGymActivity(activityId: string) {
  return get<ActivityResponse>(`/api/activities/gym/${activityId}`);
}

// Activity (Common)
export function getMyActivities() {
  return get<ActivityResponse[]>("/api/activities");
}

export function getTeamActivities(teamId: string) {
  return get<ActivityResponse[]>(`/api/teams/${teamId}/activities`);
}

// Team Status
export function getTeamStatus(teamId: string) {
  return get<TeamStatusResponse>(`/api/teams/${teamId}/status`);
}

// Weekly Evaluation
export function getEvaluations(teamId: string, week?: number) {
  const query = week !== undefined ? `?week=${week}` : "";
  return get<WeeklyEvaluationResponse[]>(`/api/teams/${teamId}/evaluations${query}`);
}

export function getCurrentEvaluation(teamId: string) {
  return get<CurrentWeekEvaluationResponse>(`/api/teams/${teamId}/evaluations/current`);
}

// Prediction
export function getMyPrediction() {
  return get<PredictionResponse>("/api/predictions/me");
}
