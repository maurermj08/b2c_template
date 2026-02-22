import Link from "next/link";

const appName = process.env.NEXT_PUBLIC_APP_NAME || "ReadWriting";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-center px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            Rw
          </div>
          <span className="text-lg font-semibold text-foreground">{appName}</span>
        </Link>
      </div>
    </header>
  );
}
