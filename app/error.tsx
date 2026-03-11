"use client";

import { useEffect } from "react";
import Link from "next/link";

/** Global error boundary for the App Router */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to your error tracking service here
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="mb-2 text-2xl font-bold text-zinc-900">
        Something went wrong
      </h1>
      <p className="mb-6 max-w-sm text-sm text-zinc-500">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-700"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-full border border-zinc-300 px-6 py-2.5 text-sm font-medium text-zinc-700 hover:border-zinc-500"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
