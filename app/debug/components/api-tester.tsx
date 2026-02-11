"use client";

import { useState } from "react";
import {
  healthCheck,
  getMe,
  createMe,
  updateMe,
} from "@/lib/api/endpoints";
import type { ApiResult } from "@/types/api";
import { JsonDisplay } from "./json-display";

type EndpointConfig = {
  label: string;
  method: string;
  path: string;
  auth: boolean;
  hasBody: boolean;
  run: (body?: { name: string; age: number }) => Promise<ApiResult<unknown>>;
};

const endpoints: EndpointConfig[] = [
  {
    label: "Health Check",
    method: "GET",
    path: "/debug/health",
    auth: false,
    hasBody: false,
    run: () => healthCheck(),
  },
  {
    label: "Get Me",
    method: "GET",
    path: "/api/users/me",
    auth: true,
    hasBody: false,
    run: () => getMe(),
  },
  {
    label: "Create Me",
    method: "POST",
    path: "/api/users/me",
    auth: true,
    hasBody: true,
    run: (body) => createMe(body!),
  },
  {
    label: "Update Me",
    method: "PUT",
    path: "/api/users/me",
    auth: true,
    hasBody: true,
    run: (body) => updateMe(body!),
  },
];

export function ApiTester() {
  const [results, setResults] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [name, setName] = useState("テストユーザー");
  const [age, setAge] = useState("25");

  const handleRun = async (ep: EndpointConfig) => {
    setLoading((prev) => ({ ...prev, [ep.label]: true }));

    const body = ep.hasBody
      ? { name, age: parseInt(age, 10) }
      : undefined;
    const result = await ep.run(body);

    setResults((prev) => ({ ...prev, [ep.label]: result }));
    setLoading((prev) => ({ ...prev, [ep.label]: false }));
  };

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        API Tester
      </h2>

      <div className="mb-6 space-y-3">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Request Body (POST/PUT用)
        </p>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <input
            type="number"
            placeholder="age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-24 rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>
      </div>

      <div className="space-y-4">
        {endpoints.map((ep) => (
          <div
            key={ep.label}
            className="rounded-lg border border-zinc-100 p-4 dark:border-zinc-800"
          >
            <div className="mb-3 flex items-center gap-3">
              <span
                className={`inline-block rounded px-2 py-0.5 text-xs font-bold ${methodColor(ep.method)}`}
              >
                {ep.method}
              </span>
              <code className="text-sm text-zinc-600 dark:text-zinc-400">
                {ep.path}
              </code>
              {ep.auth && (
                <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  Auth
                </span>
              )}
              <button
                onClick={() => handleRun(ep)}
                disabled={loading[ep.label]}
                className="ml-auto rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading[ep.label] ? "送信中..." : "Send"}
              </button>
            </div>
            {results[ep.label] !== undefined && (
              <JsonDisplay data={results[ep.label]} />
            )}
          </div>
        ))}
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
    default:
      return "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200";
  }
}
