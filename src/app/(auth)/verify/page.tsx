import { Card } from "@/components/ui/card";
import { MailCheck } from "lucide-react";
import Link from "next/link";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <Card className="p-8 text-center">
      <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <MailCheck className="w-6 h-6 text-foreground" />
      </div>
      <h1 className="text-2xl font-bold text-foreground">Check your email</h1>
      <p className="mt-4 text-base text-muted-foreground">
        We sent a sign-in link to{" "}
        {email ? (
          <strong className="text-foreground">{email}</strong>
        ) : (
          "your email"
        )}
        . Click the link in the email to continue.
      </p>
      <p className="mt-4 text-base text-muted-foreground">
        <strong>Can&apos;t find it?</strong> Check your spam or junk folder. The link expires in 24 hours.
      </p>
      <div className="mt-8 space-y-3">
        <Link
          href="/login"
          className="block text-base text-muted-foreground hover:text-foreground transition-colors"
        >
          Try again with a different email
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
