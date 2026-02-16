"use client";

import { useState } from "react";
import {
  healthCheck,
  getMe,
  createMe,
  updateMe,
  createTeam,
  getMyTeam,
  getTeam,
  createInvite,
  joinTeam,
  createGoal,
  getGoal,
  updateGoal,
  startRunning,
  finishRunning,
  sendGPSPoints,
  getRunningActivity,
  createGymLocation,
  getGymLocations,
  deleteGymLocation,
  gymCheckin,
  gymCheckout,
  getGymActivity,
  getMyActivities,
  getTeamActivities,
  getTeamStatus,
  getEvaluations,
  getCurrentEvaluation,
  getMyPrediction,
} from "@/lib/api/endpoints";
import type { ApiResult } from "@/types/api";
import { JsonDisplay } from "./json-display";

// Reusable input component
function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder || label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
      />
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function SendButton({
  onClick,
  loading,
  method,
  label,
}: {
  onClick: () => void;
  loading: boolean;
  method: string;
  label?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
    >
      {loading ? "送信中..." : label || `${method} Send`}
    </button>
  );
}

function MethodBadge({ method }: { method: string }) {
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-bold ${methodColor(method)}`}>
      {method}
    </span>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-3 mt-6 first:mt-0 border-b border-zinc-200 dark:border-zinc-700 pb-2">
      {children}
    </h3>
  );
}

// Each API section as a component
function EndpointRow({
  method,
  path,
  auth,
  children,
  result,
}: {
  method: string;
  path: string;
  auth?: boolean;
  children: React.ReactNode;
  result: unknown;
}) {
  return (
    <div className="rounded-lg border border-zinc-100 p-4 dark:border-zinc-800 space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <MethodBadge method={method} />
        <code className="text-sm text-zinc-600 dark:text-zinc-400">{path}</code>
        {auth && (
          <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            Auth
          </span>
        )}
      </div>
      <div className="flex items-end gap-3 flex-wrap">{children}</div>
      {result !== undefined && <JsonDisplay data={result} />}
    </div>
  );
}

export function ApiTester() {
  const [results, setResults] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  // User form
  const [userName, setUserName] = useState("テストユーザー");
  const [userAge, setUserAge] = useState("25");
  const [exerciseLevel, setExerciseLevel] = useState("beginner");
  const [timezone, setTimezone] = useState("Asia/Tokyo");

  // Team form
  const [teamName, setTeamName] = useState("テストチーム");
  const [exerciseType, setExerciseType] = useState("running");
  const [strictness, setStrictness] = useState("normal");
  const [teamIdInput, setTeamIdInput] = useState("");

  // Invite form
  const [inviteTeamId, setInviteTeamId] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  // Goal form
  const [goalTeamId, setGoalTeamId] = useState("");
  const [targetDistanceKm, setTargetDistanceKm] = useState("15");
  const [targetVisitsPerWeek, setTargetVisitsPerWeek] = useState("3");
  const [targetMinDurationMin, setTargetMinDurationMin] = useState("60");
  const [goalExerciseType, setGoalExerciseType] = useState("running");

  // Activity (Running) form
  const [runLatitude, setRunLatitude] = useState("35.6812");
  const [runLongitude, setRunLongitude] = useState("139.7671");
  const [runActivityId, setRunActivityId] = useState("");
  const [finishLatitude, setFinishLatitude] = useState("35.6815");
  const [finishLongitude, setFinishLongitude] = useState("139.7675");

  // Gym Location form
  const [gymName, setGymName] = useState("テストジム");
  const [gymLatitude, setGymLatitude] = useState("35.6580");
  const [gymLongitude, setGymLongitude] = useState("139.7016");
  const [gymRadiusM, setGymRadiusM] = useState("100");
  const [gymLocationId, setGymLocationId] = useState("");
  const [gymActivityId, setGymActivityId] = useState("");

  // Team Status / Evaluation
  const [statusTeamId, setStatusTeamId] = useState("");
  const [evalWeek, setEvalWeek] = useState("");

  const run = async (key: string, fn: () => Promise<ApiResult<unknown>>) => {
    setLoading((prev) => ({ ...prev, [key]: true }));
    const result = await fn();
    setResults((prev) => ({ ...prev, [key]: result }));
    setLoading((prev) => ({ ...prev, [key]: false }));
  };

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        API Tester
      </h2>

      {/* ===== Debug ===== */}
      <SectionTitle>Debug</SectionTitle>
      <div className="space-y-4">
        <EndpointRow method="GET" path="/debug/health" result={results["health"]}>
          <SendButton onClick={() => run("health", healthCheck)} loading={!!loading["health"]} method="GET" />
        </EndpointRow>
      </div>

      {/* ===== User API ===== */}
      <SectionTitle>User API</SectionTitle>
      <div className="space-y-4">
        <EndpointRow method="GET" path="/api/users/me" auth result={results["getMe"]}>
          <SendButton onClick={() => run("getMe", getMe)} loading={!!loading["getMe"]} method="GET" />
        </EndpointRow>

        <EndpointRow method="POST" path="/api/users/me" auth result={results["createMe"]}>
          <Input label="name" value={userName} onChange={setUserName} />
          <Input label="age" value={userAge} onChange={setUserAge} type="number" />
          <Select label="exercise_level" value={exerciseLevel} onChange={setExerciseLevel} options={[
            { value: "beginner", label: "beginner" },
            { value: "intermediate", label: "intermediate" },
            { value: "advanced", label: "advanced" },
          ]} />
          <Input label="timezone" value={timezone} onChange={setTimezone} />
          <SendButton
            onClick={() => run("createMe", () => createMe({ name: userName, age: parseInt(userAge), exercise_level: exerciseLevel, timezone }))}
            loading={!!loading["createMe"]}
            method="POST"
          />
        </EndpointRow>

        <EndpointRow method="PUT" path="/api/users/me" auth result={results["updateMe"]}>
          <Input label="name" value={userName} onChange={setUserName} />
          <Input label="age" value={userAge} onChange={setUserAge} type="number" />
          <Select label="exercise_level" value={exerciseLevel} onChange={setExerciseLevel} options={[
            { value: "beginner", label: "beginner" },
            { value: "intermediate", label: "intermediate" },
            { value: "advanced", label: "advanced" },
          ]} />
          <SendButton
            onClick={() => run("updateMe", () => updateMe({ name: userName, age: parseInt(userAge), exercise_level: exerciseLevel, timezone }))}
            loading={!!loading["updateMe"]}
            method="PUT"
          />
        </EndpointRow>
      </div>

      {/* ===== Team API ===== */}
      <SectionTitle>Team API</SectionTitle>
      <div className="space-y-4">
        <EndpointRow method="POST" path="/api/teams" auth result={results["createTeam"]}>
          <Input label="name" value={teamName} onChange={setTeamName} />
          <Select label="exercise_type" value={exerciseType} onChange={setExerciseType} options={[
            { value: "running", label: "running" },
            { value: "gym", label: "gym" },
          ]} />
          <Select label="strictness" value={strictness} onChange={setStrictness} options={[
            { value: "loose", label: "loose" },
            { value: "normal", label: "normal" },
            { value: "sparta", label: "sparta" },
          ]} />
          <SendButton
            onClick={() => run("createTeam", () => createTeam({ name: teamName, exercise_type: exerciseType, strictness }))}
            loading={!!loading["createTeam"]}
            method="POST"
          />
        </EndpointRow>

        <EndpointRow method="GET" path="/api/teams/me" auth result={results["getMyTeam"]}>
          <SendButton onClick={() => run("getMyTeam", getMyTeam)} loading={!!loading["getMyTeam"]} method="GET" />
        </EndpointRow>

        <EndpointRow method="GET" path="/api/teams/:teamId" auth result={results["getTeam"]}>
          <Input label="teamId" value={teamIdInput} onChange={setTeamIdInput} placeholder="Team ID" />
          <SendButton
            onClick={() => run("getTeam", () => getTeam(teamIdInput))}
            loading={!!loading["getTeam"]}
            method="GET"
          />
        </EndpointRow>
      </div>

      {/* ===== Invite Code API ===== */}
      <SectionTitle>Invite Code API</SectionTitle>
      <div className="space-y-4">
        <EndpointRow method="POST" path="/api/teams/:teamId/invite" auth result={results["createInvite"]}>
          <Input label="teamId" value={inviteTeamId} onChange={setInviteTeamId} placeholder="Team ID" />
          <SendButton
            onClick={() => run("createInvite", () => createInvite(inviteTeamId))}
            loading={!!loading["createInvite"]}
            method="POST"
          />
        </EndpointRow>

        <EndpointRow method="POST" path="/api/teams/join" auth result={results["joinTeam"]}>
          <Input label="code" value={inviteCode} onChange={setInviteCode} placeholder="6桁招待コード" />
          <SendButton
            onClick={() => run("joinTeam", () => joinTeam({ code: inviteCode }))}
            loading={!!loading["joinTeam"]}
            method="POST"
          />
        </EndpointRow>
      </div>

      {/* ===== Goal API ===== */}
      <SectionTitle>Goal API</SectionTitle>
      <div className="space-y-4">
        <EndpointRow method="POST" path="/api/teams/:teamId/goal" auth result={results["createGoal"]}>
          <Input label="teamId" value={goalTeamId} onChange={setGoalTeamId} placeholder="Team ID" />
          <Select label="type" value={goalExerciseType} onChange={setGoalExerciseType} options={[
            { value: "running", label: "running" },
            { value: "gym", label: "gym" },
          ]} />
          {goalExerciseType === "running" ? (
            <Input label="target_distance_km" value={targetDistanceKm} onChange={setTargetDistanceKm} type="number" />
          ) : (
            <>
              <Input label="target_visits_per_week" value={targetVisitsPerWeek} onChange={setTargetVisitsPerWeek} type="number" />
              <Input label="target_min_duration_min" value={targetMinDurationMin} onChange={setTargetMinDurationMin} type="number" />
            </>
          )}
          <SendButton
            onClick={() => {
              const body = goalExerciseType === "running"
                ? { target_distance_km: parseFloat(targetDistanceKm) }
                : { target_visits_per_week: parseInt(targetVisitsPerWeek), target_min_duration_min: parseInt(targetMinDurationMin) };
              run("createGoal", () => createGoal(goalTeamId, body));
            }}
            loading={!!loading["createGoal"]}
            method="POST"
          />
        </EndpointRow>

        <EndpointRow method="GET" path="/api/teams/:teamId/goal" auth result={results["getGoal"]}>
          <Input label="teamId" value={goalTeamId} onChange={setGoalTeamId} placeholder="Team ID" />
          <SendButton onClick={() => run("getGoal", () => getGoal(goalTeamId))} loading={!!loading["getGoal"]} method="GET" />
        </EndpointRow>

        <EndpointRow method="PUT" path="/api/teams/:teamId/goal" auth result={results["updateGoal"]}>
          <Input label="teamId" value={goalTeamId} onChange={setGoalTeamId} placeholder="Team ID" />
          {goalExerciseType === "running" ? (
            <Input label="target_distance_km" value={targetDistanceKm} onChange={setTargetDistanceKm} type="number" />
          ) : (
            <>
              <Input label="target_visits_per_week" value={targetVisitsPerWeek} onChange={setTargetVisitsPerWeek} type="number" />
              <Input label="target_min_duration_min" value={targetMinDurationMin} onChange={setTargetMinDurationMin} type="number" />
            </>
          )}
          <SendButton
            onClick={() => {
              const body = goalExerciseType === "running"
                ? { target_distance_km: parseFloat(targetDistanceKm) }
                : { target_visits_per_week: parseInt(targetVisitsPerWeek), target_min_duration_min: parseInt(targetMinDurationMin) };
              run("updateGoal", () => updateGoal(goalTeamId, body));
            }}
            loading={!!loading["updateGoal"]}
            method="PUT"
          />
        </EndpointRow>
      </div>

      {/* ===== Activity (Running) ===== */}
      <SectionTitle>Activity API (Running)</SectionTitle>
      <div className="space-y-4">
        <EndpointRow method="POST" path="/api/activities/running/start" auth result={results["startRunning"]}>
          <Input label="latitude" value={runLatitude} onChange={setRunLatitude} type="number" />
          <Input label="longitude" value={runLongitude} onChange={setRunLongitude} type="number" />
          <SendButton
            onClick={() => run("startRunning", () => startRunning({ latitude: parseFloat(runLatitude), longitude: parseFloat(runLongitude) }))}
            loading={!!loading["startRunning"]}
            method="POST"
          />
        </EndpointRow>

        <EndpointRow method="POST" path="/api/activities/running/:activityId/finish" auth result={results["finishRunning"]}>
          <Input label="activityId" value={runActivityId} onChange={setRunActivityId} placeholder="Activity ID" />
          <Input label="latitude" value={finishLatitude} onChange={setFinishLatitude} type="number" />
          <Input label="longitude" value={finishLongitude} onChange={setFinishLongitude} type="number" />
          <SendButton
            onClick={() => run("finishRunning", () => finishRunning(runActivityId, { latitude: parseFloat(finishLatitude), longitude: parseFloat(finishLongitude) }))}
            loading={!!loading["finishRunning"]}
            method="POST"
          />
        </EndpointRow>

        <EndpointRow method="POST" path="/api/activities/running/:activityId/gps" auth result={results["sendGPS"]}>
          <Input label="activityId" value={runActivityId} onChange={setRunActivityId} placeholder="Activity ID" />
          <SendButton
            onClick={() =>
              run("sendGPS", () =>
                sendGPSPoints(runActivityId, {
                  points: [
                    { latitude: parseFloat(runLatitude), longitude: parseFloat(runLongitude), accuracy: 5.0, timestamp: new Date().toISOString() },
                    { latitude: parseFloat(finishLatitude), longitude: parseFloat(finishLongitude), accuracy: 5.0, timestamp: new Date(Date.now() + 60000).toISOString() },
                  ],
                })
              )
            }
            loading={!!loading["sendGPS"]}
            method="POST"
            label="Send Sample GPS"
          />
        </EndpointRow>

        <EndpointRow method="GET" path="/api/activities/running/:activityId" auth result={results["getRunning"]}>
          <Input label="activityId" value={runActivityId} onChange={setRunActivityId} placeholder="Activity ID" />
          <SendButton onClick={() => run("getRunning", () => getRunningActivity(runActivityId))} loading={!!loading["getRunning"]} method="GET" />
        </EndpointRow>
      </div>

      {/* ===== Gym Location & Activity ===== */}
      <SectionTitle>Gym Location & Activity API</SectionTitle>
      <div className="space-y-4">
        <EndpointRow method="POST" path="/api/gym-locations" auth result={results["createGym"]}>
          <Input label="name" value={gymName} onChange={setGymName} />
          <Input label="latitude" value={gymLatitude} onChange={setGymLatitude} type="number" />
          <Input label="longitude" value={gymLongitude} onChange={setGymLongitude} type="number" />
          <Input label="radius_m" value={gymRadiusM} onChange={setGymRadiusM} type="number" />
          <SendButton
            onClick={() => run("createGym", () => createGymLocation({ name: gymName, latitude: parseFloat(gymLatitude), longitude: parseFloat(gymLongitude), radius_m: parseInt(gymRadiusM) }))}
            loading={!!loading["createGym"]}
            method="POST"
          />
        </EndpointRow>

        <EndpointRow method="GET" path="/api/gym-locations" auth result={results["getGyms"]}>
          <SendButton onClick={() => run("getGyms", getGymLocations)} loading={!!loading["getGyms"]} method="GET" />
        </EndpointRow>

        <EndpointRow method="DELETE" path="/api/gym-locations/:locationId" auth result={results["deleteGym"]}>
          <Input label="locationId" value={gymLocationId} onChange={setGymLocationId} placeholder="Location ID" />
          <SendButton onClick={() => run("deleteGym", () => deleteGymLocation(gymLocationId))} loading={!!loading["deleteGym"]} method="DELETE" />
        </EndpointRow>

        <EndpointRow method="POST" path="/api/activities/gym/checkin" auth result={results["gymCheckin"]}>
          <Input label="gym_location_id" value={gymLocationId} onChange={setGymLocationId} placeholder="Location ID" />
          <Input label="latitude" value={gymLatitude} onChange={setGymLatitude} type="number" />
          <Input label="longitude" value={gymLongitude} onChange={setGymLongitude} type="number" />
          <SendButton
            onClick={() => run("gymCheckin", () => gymCheckin({ gym_location_id: gymLocationId, latitude: parseFloat(gymLatitude), longitude: parseFloat(gymLongitude) }))}
            loading={!!loading["gymCheckin"]}
            method="POST"
          />
        </EndpointRow>

        <EndpointRow method="POST" path="/api/activities/gym/:activityId/checkout" auth result={results["gymCheckout"]}>
          <Input label="activityId" value={gymActivityId} onChange={setGymActivityId} placeholder="Activity ID" />
          <Input label="latitude" value={gymLatitude} onChange={setGymLatitude} type="number" />
          <Input label="longitude" value={gymLongitude} onChange={setGymLongitude} type="number" />
          <SendButton
            onClick={() => run("gymCheckout", () => gymCheckout(gymActivityId, { latitude: parseFloat(gymLatitude), longitude: parseFloat(gymLongitude) }))}
            loading={!!loading["gymCheckout"]}
            method="POST"
          />
        </EndpointRow>

        <EndpointRow method="GET" path="/api/activities/gym/:activityId" auth result={results["getGymActivity"]}>
          <Input label="activityId" value={gymActivityId} onChange={setGymActivityId} placeholder="Activity ID" />
          <SendButton onClick={() => run("getGymActivity", () => getGymActivity(gymActivityId))} loading={!!loading["getGymActivity"]} method="GET" />
        </EndpointRow>
      </div>

      {/* ===== Activity (Common) ===== */}
      <SectionTitle>Activity (Common)</SectionTitle>
      <div className="space-y-4">
        <EndpointRow method="GET" path="/api/activities" auth result={results["myActivities"]}>
          <SendButton onClick={() => run("myActivities", getMyActivities)} loading={!!loading["myActivities"]} method="GET" />
        </EndpointRow>

        <EndpointRow method="GET" path="/api/teams/:teamId/activities" auth result={results["teamActivities"]}>
          <Input label="teamId" value={statusTeamId} onChange={setStatusTeamId} placeholder="Team ID" />
          <SendButton onClick={() => run("teamActivities", () => getTeamActivities(statusTeamId))} loading={!!loading["teamActivities"]} method="GET" />
        </EndpointRow>
      </div>

      {/* ===== Team Status ===== */}
      <SectionTitle>Team Status & Evaluation</SectionTitle>
      <div className="space-y-4">
        <EndpointRow method="GET" path="/api/teams/:teamId/status" auth result={results["teamStatus"]}>
          <Input label="teamId" value={statusTeamId} onChange={setStatusTeamId} placeholder="Team ID" />
          <SendButton onClick={() => run("teamStatus", () => getTeamStatus(statusTeamId))} loading={!!loading["teamStatus"]} method="GET" />
        </EndpointRow>

        <EndpointRow method="GET" path="/api/teams/:teamId/evaluations" auth result={results["evaluations"]}>
          <Input label="teamId" value={statusTeamId} onChange={setStatusTeamId} placeholder="Team ID" />
          <Input label="week (optional)" value={evalWeek} onChange={setEvalWeek} type="number" placeholder="" />
          <SendButton
            onClick={() => run("evaluations", () => getEvaluations(statusTeamId, evalWeek ? parseInt(evalWeek) : undefined))}
            loading={!!loading["evaluations"]}
            method="GET"
          />
        </EndpointRow>

        <EndpointRow method="GET" path="/api/teams/:teamId/evaluations/current" auth result={results["currentEval"]}>
          <Input label="teamId" value={statusTeamId} onChange={setStatusTeamId} placeholder="Team ID" />
          <SendButton onClick={() => run("currentEval", () => getCurrentEvaluation(statusTeamId))} loading={!!loading["currentEval"]} method="GET" />
        </EndpointRow>
      </div>

      {/* ===== Prediction ===== */}
      <SectionTitle>Prediction API</SectionTitle>
      <div className="space-y-4">
        <EndpointRow method="GET" path="/api/predictions/me" auth result={results["prediction"]}>
          <SendButton onClick={() => run("prediction", getMyPrediction)} loading={!!loading["prediction"]} method="GET" />
        </EndpointRow>
      </div>
    </section>
  );
}

function methodColor(method: string): string {
  switch (method) {
    case "GET":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200";
    case "POST":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "PUT":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
    case "DELETE":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    default:
      return "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200";
  }
}
