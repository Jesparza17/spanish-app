"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

export default function AuthGate({ children }: { children: (user: User) => React.ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined); // undefined = loading
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (user === undefined) {
    return (
      <main className="min-h-screen bg-ink-shell flex items-center justify-center safe-top">
        <p className="font-sans text-sm text-white/40">Loading…</p>
      </main>
    );
  }

  if (user === null) {
    return (
      <main className="min-h-screen bg-ink-shell flex items-center safe-top">
        <div className="max-w-sm mx-auto px-6 w-full">
          <p className="font-sans text-xs tracking-[0.2em] text-marigold uppercase mb-2">Cuaderno</p>
          <h1 className="font-display text-3xl text-white mb-8">Sign in</h1>
          {sent ? (
            <div className="rounded-2xl bg-card shadow-card px-5 py-5">
              <p className="font-sans text-sm text-ink/70">Check your email for a sign-in link.</p>
            </div>
          ) : (
            <form
              className="flex flex-col gap-3 rounded-2xl bg-card shadow-card p-5"
              onSubmit={async (e) => {
                e.preventDefault();
                await supabase.auth.signInWithOtp({
                  email,
                  options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                  },
                });
                setSent(true);
              }}
            >
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-lg border border-line px-3.5 py-2.5 font-sans text-sm"
              />
              <button
                type="submit"
                className="rounded-full bg-marigold text-white font-sans text-sm font-medium py-3 active:scale-[0.98] transition-transform"
              >
                Send sign-in link
              </button>
            </form>
          )}
        </div>
      </main>
    );
  }

  return <>{children(user)}</>;
}