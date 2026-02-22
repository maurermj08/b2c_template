"use client";

import { useState, useCallback } from "react";
import { Copy, Download, Check, AlertTriangle, Sparkles, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

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

interface ResultsDisplayProps {
  result: TranscriptionResult;
  qualityWarning: string | null;
  onReset: () => void;
  onEnhancedMode: () => void;
}

export function ResultsDisplay({
  result,
  qualityWarning,
  onReset,
  onEnhancedMode,
}: ResultsDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"combined" | "pages">("combined");
  const [editableText, setEditableText] = useState(result.text);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(editableText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = editableText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [editableText]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([editableText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "readwriting-transcription.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [editableText]);

  const noTextDetected =
    result.text.trim().length === 0 ||
    result.text.trim() === "[illegible]";

  return (
    <div className="space-y-4">
      {/* Quality warning */}
      {qualityWarning && (
        <div className="flex items-start gap-3 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-800">{qualityWarning}</p>
        </div>
      )}

      {/* Low confidence suggestion */}
      {result.confidence.lowConfidence && !noTextDetected && (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-foreground flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Some words were hard to read
              </p>
              <p className="text-sm text-muted-foreground">
                {result.confidence.illegibleCount > 0 &&
                  `${result.confidence.illegibleCount} illegible`}
                {result.confidence.illegibleCount > 0 &&
                  result.confidence.uncertainCount > 0 &&
                  ", "}
                {result.confidence.uncertainCount > 0 &&
                  `${result.confidence.uncertainCount} uncertain`}
                {" "}words found. Try Enhanced Mode for better accuracy.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={onEnhancedMode}
            className="flex-shrink-0 gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Try Enhanced Mode
          </Button>
        </div>
      )}

      {/* No text detected */}
      {noTextDetected && (
        <div className="rounded-xl border border-border bg-muted/30 p-6 text-center">
          <p className="text-base text-foreground">
            ReadWriting couldn&apos;t find any handwriting in this image.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Make sure the writing is visible and try again.
          </p>
        </div>
      )}

      {/* View mode toggle for multi-page */}
      {!noTextDetected && result.pageCount > 1 && (
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("combined")}
            className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
              viewMode === "combined"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            Combined
          </button>
          <button
            onClick={() => setViewMode("pages")}
            className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
              viewMode === "pages"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            By Page ({result.pageCount})
          </button>
        </div>
      )}

      {/* Text results */}
      {!noTextDetected && (
        <>
          {viewMode === "combined" ? (
            <textarea
              value={editableText}
              onChange={(e) => setEditableText(e.target.value)}
              className="w-full min-h-[300px] rounded-xl border border-border bg-background p-4 text-base text-foreground font-mono leading-relaxed resize-y focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              spellCheck={false}
            />
          ) : (
            <div className="space-y-4">
              {result.pages.map((page) => (
                <div
                  key={page.index}
                  className="rounded-xl border border-border overflow-hidden"
                >
                  <div className="bg-muted/50 px-4 py-2 border-b border-border">
                    <span className="text-sm font-medium text-foreground">
                      Page {page.index + 1}
                    </span>
                    {page.error && (
                      <span className="ml-2 text-sm text-destructive">
                        {page.error}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <pre className="text-base text-foreground font-mono leading-relaxed whitespace-pre-wrap">
                      {page.text || "(No text detected)"}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleCopy} variant="outline" className="gap-2">
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy to Clipboard
                </>
              )}
            </Button>
            <Button
              onClick={handleDownload}
              variant="outline"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download .txt
            </Button>
            <Button onClick={onReset} variant="ghost" className="gap-2 ml-auto">
              <RotateCcw className="h-4 w-4" />
              New Upload
            </Button>
          </div>
        </>
      )}

      {/* Start over for no-text case */}
      {noTextDetected && (
        <div className="flex justify-center">
          <Button onClick={onReset} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
