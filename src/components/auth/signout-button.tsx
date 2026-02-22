"use client";

import { signOutAction } from "@/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface SignOutButtonProps {
  variant?: "default" | "ghost" | "sidebar" | "mobile-nav";
  className?: string;
}

export function SignOutButton({ variant = "default", className }: SignOutButtonProps) {
  if (variant === "sidebar") {
    return (
      <button
        onClick={() => signOutAction()}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-3 h-12 text-base text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-150 cursor-pointer",
          className
        )}
      >
        <LogOut className="w-5 h-5" />
        Sign Out
      </button>
    );
  }

  if (variant === "mobile-nav") {
    return (
      <button
        onClick={() => signOutAction()}
        className={cn(
          "flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-[44px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer",
          className
        )}
      >
        <LogOut className="w-6 h-6" />
        <span className="text-sm">Sign Out</span>
      </button>
    );
  }

  return (
    <Button variant="ghost" onClick={() => signOutAction()} className={className}>
      <LogOut className="w-5 h-5" />
      Sign Out
    </Button>
  );
}
