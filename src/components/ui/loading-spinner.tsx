import { cn } from "@/lib/utils";

const sizes = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
};

interface LoadingSpinnerProps {
  size?: keyof typeof sizes;
  className?: string;
}

function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-current border-t-transparent",
        sizes[size],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export { LoadingSpinner };
export type { LoadingSpinnerProps };
