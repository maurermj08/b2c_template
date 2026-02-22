"use client";

import { usePathname } from "next/navigation";
import { UserMenu } from "./user-menu";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/settings": "Settings",
  "/support": "Support",
};

interface AppHeaderProps {
  userName?: string | null;
  userEmail?: string | null;
}

export function AppHeader({ userName, userEmail }: AppHeaderProps) {
  const pathname = usePathname();
  const title = pageTitles[pathname] || "Page";

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background px-6 md:px-8">
      <div className="flex items-center gap-3 md:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
          {(process.env.NEXT_PUBLIC_APP_NAME || "My App")[0]}
        </div>
        <span className="text-base font-semibold text-foreground">
          {process.env.NEXT_PUBLIC_APP_NAME || "My App"}
        </span>
      </div>
      <h1 className="hidden md:block text-xl font-semibold text-foreground">{title}</h1>
      <UserMenu name={userName} email={userEmail} />
    </header>
  );
}
