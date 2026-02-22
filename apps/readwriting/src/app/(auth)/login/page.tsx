import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginForm } from "@/components/auth/login-form";
import { Card } from "@/components/ui/card";
import Link from "next/link";

const appName = process.env.NEXT_PUBLIC_APP_NAME || "ReadWriting";

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <Card className="p-8">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-xl">
          {appName[0]}
        </div>
        <h1 className="text-2xl font-bold text-foreground">Sign in to {appName}</h1>
        <p className="mt-2 text-base text-muted-foreground">
          Enter your email and we&apos;ll send you a sign-in link. No password needed!
        </p>
      </div>
      <LoginForm />
      <div className="mt-6 text-center">
        <Link href="/" className="text-base text-muted-foreground hover:text-foreground transition-colors">
          &larr; Back to home
        </Link>
      </div>
    </Card>
  );
}
