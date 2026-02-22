import { cn } from "@/lib/utils";
import { User } from "lucide-react";

function hashStringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    "bg-blue-600", "bg-green-600", "bg-purple-600", "bg-orange-600",
    "bg-pink-600", "bg-teal-600", "bg-indigo-600", "bg-cyan-600",
  ];
  return colors[Math.abs(hash) % colors.length];
}

interface AvatarProps {
  name?: string | null;
  email?: string | null;
  size?: "sm" | "default";
  className?: string;
}

function Avatar({ name, email, size = "default", className }: AvatarProps) {
  const initial = (name?.[0] || email?.[0] || "?").toUpperCase();
  const colorClass = hashStringToColor(email || name || "default");
  const sizeClass = size === "sm" ? "w-8 h-8 text-sm" : "w-10 h-10 text-base";

  if (!name && !email) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-muted text-muted-foreground",
          sizeClass,
          className
        )}
      >
        <User className="w-5 h-5" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full text-white font-medium",
        colorClass,
        sizeClass,
        className
      )}
    >
      {initial}
    </div>
  );
}

export { Avatar };
export type { AvatarProps };
