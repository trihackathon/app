"use client";

type JsonDisplayProps = {
  data: unknown;
  label?: string;
};

export function JsonDisplay({ data, label }: JsonDisplayProps) {
  return (
    <div className="space-y-1">
      {label && (
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          {label}
        </p>
      )}
      <pre className="overflow-auto rounded-lg bg-zinc-900 p-4 text-sm text-green-400">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
