import * as React from "react";
import { cn } from "./utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "secondary";
}

export function Button({
  className,
  variant = "default",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50",
        variant === "default" && "bg-blue-600 text-white hover:bg-blue-700",
        variant === "destructive" && "bg-red-600 text-white hover:bg-red-700",
        variant === "secondary" &&
          "bg-gray-100 text-gray-900 hover:bg-gray-200",
        className,
      )}
      {...props}
    />
  );
}
