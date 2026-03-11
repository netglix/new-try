"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import LoginModal from "@/app/components/LoginModal";
import { COMPANIES, Company, AnalysisResult } from "@/lib/types";
import type { User } from "@supabase/supabase-js";

const RECOMMENDED_LENGTH = 400;

/** /analyze – ES input form with company selection and optional auth */
export default function AnalyzePage() {
  const router = useRouter();
  const [esText, setEsText] = useState("");
  const [company, setCompany] = useState<Company>(COMPANIES[0]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(false);

  // Check current auth state on mount and subscribe to changes
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleAnalyze() {
    if (!esText.trim()) {
      toast.error("Please enter your entry sheet text.");
      return;
    }
    setLoading(true);

    // Attach the user's auth token if logged in so the API can save history
    const supabase = createClient();
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ company, esText }),
      });

      const json = (await res.json()) as
        | { analysis: AnalysisResult }
        | { error: string };

      if (!res.ok || "error" in json) {
        toast.error("error" in json ? json.error : "Analysis failed.");
        return;
      }

      // Store result in sessionStorage to pass to the result page
      sessionStorage.setItem(
        "escope_result",
        JSON.stringify({ company, analysis: json.analysis })
      );
      toast.success("Analysis complete!");
      router.push("/result");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Signed out.");
  }

  const charCount = esText.length;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-2 text-3xl font-bold text-zinc-900">ES Analyzer</h1>
      <p className="mb-8 text-sm text-zinc-500">
        Paste your Entry Sheet below and select a target company to get
        AI-powered scoring and feedback.
      </p>

      {/* Company selector */}
      <label className="mb-1 block text-sm font-medium text-zinc-700">
        Target company
      </label>
      <select
        value={company}
        onChange={(e) => setCompany(e.target.value as Company)}
        className="mb-6 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
      >
        {COMPANIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      {/* ES text area */}
      <label className="mb-1 block text-sm font-medium text-zinc-700">
        Entry Sheet text
        <span className="ml-2 font-normal text-zinc-400">
          ({RECOMMENDED_LENGTH} chars recommended)
        </span>
      </label>
      <textarea
        value={esText}
        onChange={(e) => setEsText(e.target.value)}
        rows={10}
        placeholder="During my internship I identified an inefficiency in the reporting process..."
        className="mb-1 w-full resize-y rounded-lg border border-zinc-300 px-4 py-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-zinc-900"
      />
      {/* Character counter */}
      <p
        className={`mb-6 text-right text-xs ${
          charCount >= RECOMMENDED_LENGTH ? "text-emerald-600" : "text-zinc-400"
        }`}
      >
        {charCount} / {RECOMMENDED_LENGTH}+ chars
      </p>

      {/* Auth section */}
      <div className="mb-6 flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-5 py-4 text-sm">
        {user ? (
          <>
            <span className="text-zinc-600">
              Signed in as <strong>{user.email}</strong> — history will be saved.
            </span>
            <button
              onClick={handleSignOut}
              className="ml-4 text-zinc-400 underline hover:text-zinc-700"
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <span className="text-zinc-500">
              Sign in to save your analysis history.
            </span>
            <button
              onClick={() => setShowLogin(true)}
              className="ml-4 rounded-lg bg-zinc-900 px-4 py-2 text-xs font-medium text-white hover:bg-zinc-700"
            >
              Sign in
            </button>
          </>
        )}
      </div>

      {/* Submit */}
      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-zinc-900 py-3 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-50"
      >
        {loading ? (
          <>
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Analyzing…
          </>
        ) : (
          "Analyze ES"
        )}
      </button>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  );
}
