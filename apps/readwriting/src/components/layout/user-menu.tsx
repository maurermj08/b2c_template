"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Settings } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { SignOutButton } from "@/components/auth/signout-button";

interface UserMenuProps {
  name?: string | null;
  email?: string | null;
}

export function UserMenu({ name, email }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg p-1 hover:bg-accent transition-colors duration-150 cursor-pointer"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Avatar name={name} email={email} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-border bg-background shadow-lg z-50">
          <div className="px-4 py-3 border-b border-border">
            {name && <p className="text-base font-medium text-foreground truncate">{name}</p>}
            <p className="text-base text-muted-foreground truncate">{email}</p>
          </div>
          <div className="p-2">
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 h-12 text-base text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Settings className="w-5 h-5" />
              Settings
            </Link>
            <SignOutButton variant="sidebar" />
          </div>
        </div>
      )}
    </div>
  );
}
