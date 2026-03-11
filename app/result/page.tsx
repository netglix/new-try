"use client";

import { useSyncExternalStore, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ScoreBar from "@/app/components/ScoreBar";
import { AnalysisResult } from "@/lib/types";

interface StoredResult {
  company: string;
  analysis: AnalysisResult;
}

const STORAGE_KEY = "escope_result";

/** Read the stored result from sessionStorage (returns null on server or when missing) */
function getSnapshot(): StoredResult | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredResult;
  } catch {
    return null;
  }
}

/** Server-side snapshot – always null to avoid hydration mismatch */
const getServerSnapshot = (): null => null;

/** Subscribe to storage events so the component stays in sync */
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

const SCORE_LABELS: Record<keyof AnalysisResult["scores"], string> = {
  logicalClarity: "Logical Clarity",
  leadership: "Leadership",
  problemSolving: "Problem Solving",
  quantifiedResults: "Quantified Results",
  impact: "Impact",
};

/** /result – displays scores, feedback and improved ES from sessionStorage */
export default function ResultPage() {
  const router = useRouter();

  // useSyncExternalStore is the React-recommended way to read from external
  // stores (like sessionStorage) without calling setState inside an effect.
  const result = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Redirect to /analyze if there is nothing to display
  useEffect(() => {
    if (result === null) {
      router.replace("/analyze");
    }
  }, [result, router]);

  if (!result) {
    return (
      <div className="flex h-48 items-center justify-center">
        <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
      </div>
    );
  }

  const { company, analysis } = result;

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      {/* Header */}
      <div>
        <p className="mb-1 text-sm font-medium uppercase tracking-widest text-zinc-400">
          {company}
        </p>
        <h1 className="text-3xl font-bold text-zinc-900">Analysis Result</h1>
      </div>

      {/* Scores */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-5 text-base font-semibold text-zinc-900">Scores</h2>
        <div className="space-y-4">
          {(Object.keys(analysis.scores) as (keyof AnalysisResult["scores"])[]).map(
            (key) => (
              <ScoreBar
                key={key}
                label={SCORE_LABELS[key]}
                value={analysis.scores[key]}
              />
            )
          )}
        </div>
      </section>

      {/* Feedback */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-3 text-base font-semibold text-zinc-900">Feedback</h2>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
          {analysis.feedback}
        </p>
      </section>

      {/* Improvements */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-3 text-base font-semibold text-zinc-900">
          Improvement Suggestions
        </h2>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
          {analysis.improvements}
        </p>
      </section>

      {/* Improved ES */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-3 text-base font-semibold text-zinc-900">
          Improved ES (STAR Format)
        </h2>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
          {analysis.improvedEs}
        </p>
      </section>

      {/* Actions */}
      <div className="flex gap-4">
        <Link
          href="/analyze"
          className="rounded-full border border-zinc-300 px-6 py-2.5 text-sm font-medium text-zinc-700 hover:border-zinc-500 hover:text-zinc-900"
        >
          ← Analyze Another
        </Link>
        <Link
          href="/history"
          className="rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-700"
        >
          View History
        </Link>
      </div>
    </div>
  );
}
