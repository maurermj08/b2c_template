const appName = process.env.NEXT_PUBLIC_APP_NAME || "My App";

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <p className="text-center text-base text-muted-foreground">
          &copy; {new Date().getFullYear()} {appName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
