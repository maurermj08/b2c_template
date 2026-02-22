"use client";

import { useState } from "react";
import { signInWithEmail } from "@/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    try {
      await signInWithEmail(email);
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message.includes("NEXT_REDIRECT") || (err as { digest?: string }).digest?.includes("NEXT_REDIRECT")) {
          throw err;
        }
      }
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        id="email"
        name="email"
        type="email"
        label="Email address"
        placeholder="you@example.com"
        required
        autoFocus
        autoComplete="email"
      />
      {error && (
        <p className="text-base text-destructive">{error}</p>
      )}
      <Button type="submit" loading={loading} className="w-full">
        Send Sign-In Link
      </Button>
    </form>
  );
}
