"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface LoginModalProps {
  onClose: () => void;
}

/** Magic-link login modal using Supabase Auth */
export default function LoginModal({ onClose }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSend() {
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // After clicking the link, redirect to the analyze page
        emailRedirectTo: `${window.location.origin}/analyze`,
      },
    });
    setLoading(false);
    if (error) {
      toast.error(`Failed to send Magic Link: ${error.message}`);
    } else {
      setSent(true);
      toast.success("Magic Link sent! Check your inbox.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-700"
          aria-label="Close"
        >
          ✕
        </button>

        <h2 className="mb-1 text-xl font-semibold text-zinc-900">Sign in</h2>
        <p className="mb-6 text-sm text-zinc-500">
          We&apos;ll email you a Magic Link — no password needed.
        </p>

        {sent ? (
          <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Check your inbox for the sign-in link.
          </p>
        ) : (
          <>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="mb-4 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
            <button
              onClick={handleSend}
              disabled={loading}
              className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
            >
              {loading ? "Sending…" : "Send Magic Link"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
