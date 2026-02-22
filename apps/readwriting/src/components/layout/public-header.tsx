import Link from "next/link";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const appName = process.env.NEXT_PUBLIC_APP_NAME || "My App";

export async function PublicHeader() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-base">
            {appName[0]}
          </div>
          <span className="text-lg font-semibold text-foreground">{appName}</span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link href="#features" className="hidden sm:block text-base text-muted-foreground hover:text-foreground transition-colors">
            Features
          </Link>
          <Link href="/support" className="hidden sm:block text-base text-muted-foreground hover:text-foreground transition-colors">
            Support
          </Link>
          {session ? (
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button>Sign In</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
