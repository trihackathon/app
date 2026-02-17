import { get, post, put, del, postForm, putForm, postMultipart, putMultipart } from "@/lib/api/client";
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
  DisbandVoteResponse,
  ActivityReviewResponse,
  PostActivityReviewRequest,
} from "@/types/api";

// Debug
export function healthCheck() {
  return get<HealthResponse>("/debug/health");
}

export function debugToken(uid: string) {
  return get<DebugTokenResponse>(`/debug/token?uid=${encodeURIComponent(uid)}`);
}

export function cleanupDisbandedTeams() {
  return post<{
    message: string;
    disbanded_teams: number;
    deleted_votes: number;
    deleted_members: number;
    team_ids: string[];
  }>("/debug/cleanup-disbanded-teams");
}

export function getUserTeamStatus(uid: string) {
  return get<{
    user_id: string;
    total_memberships: number;
    active_memberships: number;
    all_memberships: Array<{
      member_id: string;
      team_id: string;
      team_name: string;
      team_status: string;
      role: string;
      joined_at: string;
    }>;
    can_create_new_team: boolean;
  }>(`/debug/user-team-status?uid=${encodeURIComponent(uid)}`);
}

// User
export function getMe() {
  return get<UserResponse>("/api/users/me");
}

export function createMe(body: CreateUserRequest) {
  // ファイルがある場合はFormDataを使用
  if (body.avatar) {
    const formData = new FormData();
    formData.append("name", body.name);
    formData.append("age", String(body.age));
    formData.append("gender", body.gender);
    formData.append("weight", String(body.weight));
    formData.append("chronotype", body.chronotype);
    formData.append("avatar", body.avatar);
    return postMultipart<UserResponse>("/api/users/me", formData);
  }
  
  // ファイルがない場合は従来通りURLSearchParams
  const params = new URLSearchParams();
  params.append("name", body.name);
  params.append("age", String(body.age));
  params.append("gender", body.gender);
  params.append("weight", String(body.weight));
  params.append("chronotype", body.chronotype);
  return postForm<UserResponse>("/api/users/me", params);
}

export function updateMe(body: UpdateUserRequest) {
  // ファイルがある場合はFormDataを使用
  if (body.avatar) {
    const formData = new FormData();
    if (body.name !== undefined) formData.append("name", body.name);
    if (body.age !== undefined) formData.append("age", String(body.age));
    if (body.gender !== undefined) formData.append("gender", body.gender);
    if (body.weight !== undefined) formData.append("weight", String(body.weight));
    if (body.chronotype !== undefined) formData.append("chronotype", body.chronotype);
    formData.append("avatar", body.avatar);
    return putMultipart<UserResponse>("/api/users/me", formData);
  }
  
  // ファイルがない場合は従来通りURLSearchParams
  const params = new URLSearchParams();
  if (body.name !== undefined) params.append("name", body.name);
  if (body.age !== undefined) params.append("age", String(body.age));
  if (body.gender !== undefined) params.append("gender", body.gender);
  if (body.weight !== undefined) params.append("weight", String(body.weight));
  if (body.chronotype !== undefined) params.append("chronotype", body.chronotype);
  return putForm<UserResponse>("/api/users/me", params);
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

// Disband Vote
export function voteDisband(teamId: string) {
  return post<DisbandVoteResponse>(`/api/teams/${teamId}/disband-vote`);
}

export function cancelDisbandVote(teamId: string) {
  return del<DisbandVoteResponse>(`/api/teams/${teamId}/disband-vote`);
}

export function getDisbandVotes(teamId: string) {
  return get<DisbandVoteResponse>(`/api/teams/${teamId}/disband-votes`);
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

// Activity Review
export function postActivityReview(activityId: string, body: PostActivityReviewRequest) {
  return post<ActivityReviewResponse>(`/api/activities/${activityId}/review`, body);
}

export function getActivityReviews(activityId: string) {
  return get<ActivityReviewResponse[]>(`/api/activities/${activityId}/reviews`);
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
