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
    return <p className="font-sans text-sm text-ink/50 px-6 py-16">Loading…</p>;
  }

  if (user === null) {
    return (
      <main className="max-w-sm mx-auto px-6 py-16">
        <h1 className="font-display text-2xl text-ink mb-4">Sign in</h1>
        {sent ? (
          <p className="font-sans text-sm text-ink/70">Check your email for a sign-in link.</p>
        ) : (
          <form
            className="flex flex-col gap-3"
            onSubmit={async (e) => {
              e.preventDefault();
              await supabase.auth.signInWithOtp({ email });
              setSent(true);
            }}
          >
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-md border border-line bg-white/70 px-3 py-2 font-sans text-sm"
            />
            <button
              type="submit"
              className="rounded-md bg-agave text-white font-sans text-sm py-2 hover:bg-agave-dark transition-colors"
            >
              Send sign-in link
            </button>
          </form>
        )}
      </main>
    );
  }

  return <>{children(user)}</>;
}
