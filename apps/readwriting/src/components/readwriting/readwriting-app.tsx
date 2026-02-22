"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { UploadZone } from "./upload-zone";
import { FilePreview } from "./file-preview";
import { ResultsDisplay } from "./results-display";
import { ProcessingState } from "./processing-state";
import { Button } from "@/components/ui/button";

type AppState =
  | "idle"
  | "previewing"
  | "uploading"
  | "processing"
  | "complete"
  | "error";

interface TranscriptionResult {
  text: string;
  pages: { index: number; text: string; error?: string }[];
  pageCount: number;
  confidence: {
    lowConfidence: boolean;
    illegibleCount: number;
    uncertainCount: number;
  };
}

export function ReadWritingApp() {
  const [state, setState] = useState<AppState>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [context, setContext] = useState("");
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [qualityWarning, setQualityWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const [, setBatchId] = useState<string | null>(null);
  const [processingCounts, setProcessingCounts] = useState<{
    processing: number;
    succeeded: number;
  } | null>(null);
  const pollingRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearTimeout(pollingRef.current);
    };
  }, []);

  const handleFileSelected = useCallback((selectedFile: File) => {
    setFile(selectedFile);
    setThumbnails([]);
    setQualityWarning(null);
    setError(null);
    setResult(null);
    setBatchId(null);
    setProcessingCounts(null);
    setState("previewing");
  }, []);

  const handleReset = useCallback(() => {
    if (pollingRef.current) clearTimeout(pollingRef.current);
    setFile(null);
    setContext("");
    setThumbnails([]);
    setQualityWarning(null);
    setError(null);
    setResult(null);
    setBatchId(null);
    setProcessingCounts(null);
    setState("idle");
  }, []);

  const pollForResults = useCallback(
    (id: string) => {
      const poll = async () => {
        try {
          const res = await fetch(`/api/batch-status?id=${encodeURIComponent(id)}`);
          const data = await res.json();

          if (data.error) {
            setError(data.error);
            setState("error");
            return;
          }

          if (data.status === "processing") {
            setProcessingCounts(data.requestCounts || null);
            // Poll again in 3 seconds
            pollingRef.current = setTimeout(poll, 3000);
            return;
          }

          if (data.status === "complete") {
            setResult({
              text: data.text,
              pages: data.pages,
              pageCount: data.pageCount,
              confidence: data.confidence,
            });
            setState("complete");
            return;
          }
        } catch {
          setError(
            "We're having trouble checking your results. Please try again in a moment."
          );
          setState("error");
        }
      };

      poll();
    },
    []
  );

  const handleSubmit = useCallback(
    async (model?: string) => {
      if (!file) return;

      setState("uploading");
      setError(null);

      try {
        const formData = new FormData();
        formData.append("file", file);
        if (context.trim()) {
          formData.append("context", context.trim());
        }
        if (model) {
          formData.append("model", model);
        }

        const res = await fetch("/api/transcribe", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (data.error) {
          setError(data.error);
          setState("error");
          return;
        }

        setThumbnails(data.thumbnails || []);
        setQualityWarning(data.qualityWarning || null);
        setBatchId(data.batchId);
        setState("processing");

        // Start polling
        pollForResults(data.batchId);
      } catch {
        setError(
          "We're having trouble processing this right now. Please try again in a moment."
        );
        setState("error");
      }
    },
    [file, context, pollForResults]
  );

  const handleEnhancedMode = useCallback(() => {
    if (pollingRef.current) clearTimeout(pollingRef.current);
    setResult(null);
    setBatchId(null);
    setProcessingCounts(null);
    handleSubmit("enhanced");
  }, [handleSubmit]);

  return (
    <section className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-16">
      {/* Title */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Upload your writing. Get your text.
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          Take a photo or upload a file. ReadWriting turns handwriting into
          text you can copy and save.
        </p>
      </div>

      {/* Idle: Upload zone */}
      {state === "idle" && <UploadZone onFileSelected={handleFileSelected} />}

      {/* Previewing: show preview + context + submit */}
      {state === "previewing" && file && (
        <div className="space-y-6">
          <FilePreview file={file} thumbnails={thumbnails} />

          {/* Context input */}
          <div className="space-y-2">
            <label
              htmlFor="context-input"
              className="block text-sm font-medium text-foreground"
            >
              Context{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </label>
            <input
              id="context-input"
              type="text"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder={'e.g. "doctor\'s prescription", "meeting notes", "French recipe"'}
              className="flex h-12 w-full rounded-lg border border-border bg-background px-4 text-base text-foreground placeholder:text-muted-foreground transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            />
            <p className="text-sm text-muted-foreground">
              Adding context helps ReadWriting understand unclear words.
            </p>
          </div>

          {/* Submit button */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex-shrink-0"
            >
              Cancel
            </Button>
            <Button onClick={() => handleSubmit()} className="flex-1">
              Read My Writing
            </Button>
          </div>

          {/* Trust line */}
          <p className="text-center text-sm text-muted-foreground">
            Your uploads are processed and not stored.
          </p>
        </div>
      )}

      {/* Uploading */}
      {state === "uploading" && (
        <ProcessingState message="Uploading your file..." />
      )}

      {/* Processing */}
      {state === "processing" && (
        <ProcessingState
          message="Reading your writing..."
          detail="This usually takes under a minute but can take a few minutes."
          counts={processingCounts}
        />
      )}

      {/* Error */}
      {state === "error" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
            <p className="text-base text-foreground">{error}</p>
          </div>
          <div className="flex justify-center">
            <Button onClick={handleReset}>Try Again</Button>
          </div>
        </div>
      )}

      {/* Complete: show results */}
      {state === "complete" && result && (
        <ResultsDisplay
          result={result}
          qualityWarning={qualityWarning}
          onReset={handleReset}
          onEnhancedMode={handleEnhancedMode}
        />
      )}
    </section>
  );
}
