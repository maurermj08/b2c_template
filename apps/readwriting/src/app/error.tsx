"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
          <AlertCircle className="w-6 h-6 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
        <p className="mt-2 text-base text-muted-foreground">
          An unexpected error occurred. Please try again.
        </p>
        <div className="mt-8">
          <Button onClick={reset}>Try Again</Button>
        </div>
      </div>
    </div>
  );
}
