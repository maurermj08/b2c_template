"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, HelpCircle, Settings } from "lucide-react";
import { SignOutButton } from "@/components/auth/signout-button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/support", label: "Help", icon: HelpCircle },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden h-16 items-center justify-around border-t border-border bg-background">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-[44px] transition-colors",
              isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        );
      })}
      <SignOutButton variant="mobile-nav" />
    </nav>
  );
}
