"use client";

interface ProcessingStateProps {
  message: string;
  detail?: string;
  counts?: {
    processing: number;
    succeeded: number;
  } | null;
}

export function ProcessingState({
  message,
  detail,
  counts,
}: ProcessingStateProps) {
  return (
    <div className="flex flex-col items-center gap-6 py-12">
      {/* Gentle pulsing animation */}
      <div className="relative flex items-center justify-center">
        <div className="h-16 w-16 rounded-full bg-muted animate-pulse" />
        <div className="absolute h-10 w-10 rounded-full bg-primary/10 animate-ping" />
        <div className="absolute h-3 w-3 rounded-full bg-primary" />
      </div>

      <div className="text-center space-y-2">
        <p className="text-lg font-medium text-foreground">{message}</p>
        {detail && (
          <p className="text-sm text-muted-foreground">{detail}</p>
        )}
        {counts && counts.succeeded > 0 && (
          <p className="text-sm text-muted-foreground">
            Got {counts.succeeded} of {counts.succeeded + counts.processing}{" "}
            pages...
          </p>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        We&apos;ll show your results right here when they&apos;re ready.
      </p>
    </div>
  );
}
