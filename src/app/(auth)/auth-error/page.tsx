import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

function getErrorMessage(error?: string): string {
  switch (error) {
    case "Verification":
      return "Your sign-in link has expired or has already been used. Please request a new one.";
    case "Configuration":
      return "There was a problem with the server configuration. Please try again later.";
    default:
      return "An unexpected error occurred during sign-in. Please try again.";
  }
}

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <Card className="p-8 text-center">
      <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
        <AlertCircle className="w-6 h-6 text-destructive" />
      </div>
      <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
      <p className="mt-4 text-base text-muted-foreground">
        {getErrorMessage(error)}
      </p>
      <div className="mt-8 space-y-3">
        <Link href="/login">
          <Button className="w-full">Try Again</Button>
        </Link>
        <Link
          href="/"
          className="block text-base text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; Back to home
        </Link>
      </div>
    </Card>
  );
}
