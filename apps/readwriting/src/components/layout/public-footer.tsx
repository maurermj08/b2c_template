const appName = process.env.NEXT_PUBLIC_APP_NAME || "ReadWriting";

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-2xl px-6 py-6">
        <p className="text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {appName}. Upload your writing. Get your text.
        </p>
      </div>
    </footer>
  );
}
