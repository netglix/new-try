"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { EsHistoryRecord } from "@/lib/types";
import type { User } from "@supabase/supabase-js";

/** /history – shows the authenticated user's past analyses */
export default function HistoryPage() {
  const [user, setUser] = useState<User | null>(null);
  const [history, setHistory] = useState<EsHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const { data: userData } = await supabase.auth.getUser();
      setUser(userData.user);

      if (!userData.user) {
        setLoading(false);
        return;
      }

      // Fetch this user's history, newest first
      const { data, error } = await supabase
        .from("es_history")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setHistory(data as EsHistoryRecord[]);
      }
      setLoading(false);
    }

    load();

    // Keep in sync if auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => load());
    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <h1 className="mb-3 text-2xl font-bold text-zinc-900">
          Sign in to view history
        </h1>
        <p className="mb-6 text-sm text-zinc-500">
          Your analysis history is saved when you are signed in.
        </p>
        <Link
          href="/analyze"
          className="rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-700"
        >
          Go to Analyzer
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-3xl font-bold text-zinc-900">My History</h1>
      <p className="mb-8 text-sm text-zinc-500">
        Signed in as <strong>{user.email}</strong>
      </p>

      {history.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white px-8 py-16 text-center">
          <p className="mb-4 text-zinc-500">No analyses yet.</p>
          <Link
            href="/analyze"
            className="rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-700"
          >
            Analyze an ES
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((record) => {
            const scores = record.analysis_result.scores;
            const avg = Math.round(
              (scores.logicalClarity +
                scores.leadership +
                scores.problemSolving +
                scores.quantifiedResults +
                scores.impact) /
                5
            );
            const date = new Date(record.created_at).toLocaleDateString(
              "en-US",
              { year: "numeric", month: "short", day: "numeric" }
            );

            return (
              <div
                key={record.id}
                className="rounded-2xl border border-zinc-200 bg-white p-6"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-block rounded-full bg-zinc-100 px-3 py-0.5 text-xs font-medium text-zinc-700">
                      {record.company}
                    </span>
                    <p className="mt-2 text-xs text-zinc-400">{date}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-zinc-900">
                      {avg}
                    </span>
                    <span className="text-sm text-zinc-400">/10 avg</span>
                  </div>
                </div>
                <p className="mt-3 line-clamp-2 text-sm text-zinc-600">
                  {record.es_text}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
