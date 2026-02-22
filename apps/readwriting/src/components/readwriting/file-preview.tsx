"use client";

import { useMemo, useEffect, useRef } from "react";
import { FileText, Archive, Image as ImageIcon } from "lucide-react";

interface FilePreviewProps {
  file: File;
  thumbnails?: string[];
}

export function FilePreview({ file, thumbnails }: FilePreviewProps) {
  const isImage = file.type.startsWith("image/");
  const isPdf = file.type === "application/pdf";
  const isZip =
    file.type === "application/zip" ||
    file.type === "application/x-zip-compressed" ||
    file.name.endsWith(".zip");

  const previewUrl = useMemo(
    () => (isImage ? URL.createObjectURL(file) : null),
    [file, isImage]
  );

  const prevUrlRef = useRef<string | null>(null);
  useEffect(() => {
    // Revoke the previous URL when a new one is created
    if (prevUrlRef.current && prevUrlRef.current !== previewUrl) {
      URL.revokeObjectURL(prevUrlRef.current);
    }
    prevUrlRef.current = previewUrl;
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="rounded-xl border border-border bg-background overflow-hidden">
      {/* Image preview */}
      {isImage && previewUrl && (
        <div className="flex items-center justify-center bg-muted/30 p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Preview of uploaded file"
            className="max-h-64 rounded-lg object-contain"
          />
        </div>
      )}

      {/* PDF icon */}
      {isPdf && !thumbnails?.length && (
        <div className="flex items-center justify-center bg-muted/30 p-8">
          <div className="flex flex-col items-center gap-2">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">PDF Document</span>
          </div>
        </div>
      )}

      {/* ZIP icon */}
      {isZip && !thumbnails?.length && (
        <div className="flex items-center justify-center bg-muted/30 p-8">
          <div className="flex flex-col items-center gap-2">
            <Archive className="h-12 w-12 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">ZIP Archive</span>
          </div>
        </div>
      )}

      {/* Server-generated thumbnails (for PDFs and ZIPs after upload) */}
      {thumbnails && thumbnails.length > 0 && (
        <div className="bg-muted/30 p-4">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {thumbnails.map((thumb, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={thumb}
                alt={`Page ${i + 1}`}
                className="rounded-lg border border-border object-cover aspect-[3/4]"
              />
            ))}
          </div>
        </div>
      )}

      {/* File info bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-t border-border">
        {isImage ? (
          <ImageIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        ) : isPdf ? (
          <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <Archive className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        )}
        <span className="text-sm text-foreground truncate">{file.name}</span>
        <span className="text-sm text-muted-foreground flex-shrink-0">
          {formatFileSize(file.size)}
        </span>
      </div>
    </div>
  );
}
