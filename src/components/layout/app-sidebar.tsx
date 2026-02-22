"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, HelpCircle, Settings } from "lucide-react";
import { SignOutButton } from "@/components/auth/signout-button";
import { cn } from "@/lib/utils";

const appName = process.env.NEXT_PUBLIC_APP_NAME || "My App";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/support", label: "Support", icon: HelpCircle },
];

const bottomItems = [
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-border bg-background">
      <div className="flex h-16 items-center gap-3 px-6 border-b border-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-base">
          {appName[0]}
        </div>
        <span className="text-lg font-semibold text-foreground">{appName}</span>
      </div>

      <nav className="flex flex-1 flex-col justify-between px-4 py-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 h-12 text-base transition-colors duration-150",
                  isActive
                    ? "bg-accent text-accent-foreground font-semibold"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="space-y-1">
          <div className="mb-2 border-t border-border" />
          {bottomItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 h-12 text-base transition-colors duration-150",
                  isActive
                    ? "bg-accent text-accent-foreground font-semibold"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
          <SignOutButton variant="sidebar" />
        </div>
      </nav>
    </aside>
  );
}
