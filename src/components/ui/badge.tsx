import { cn } from "@/lib/utils";

const variants = {
  default: "bg-primary text-primary-foreground",
  success: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  destructive: "bg-red-100 text-red-800",
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variants;
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
export type { BadgeProps };
