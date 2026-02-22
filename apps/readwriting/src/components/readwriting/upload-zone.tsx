"use client";

import { useState, useCallback, useRef, useSyncExternalStore } from "react";
import { Upload, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
}

const ACCEPTED_TYPES =
  "image/jpeg,image/png,image/webp,image/heic,image/heif,image/tiff,image/bmp,image/gif,application/pdf,application/zip";

function checkIsMobile() {
  if (typeof window === "undefined") return false;
  return (
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    ("ontouchstart" in window && window.innerWidth < 768)
  );
}

function subscribeToResize(callback: () => void) {
  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
}

export function UploadZone({ onFileSelected }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const isMobile = useSyncExternalStore(
    subscribeToResize,
    checkIsMobile,
    () => false // Server snapshot
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  const handleFile = useCallback(
    (file: File) => {
      onFileSelected(file);
    },
    [onFileSelected]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounterRef.current = 0;

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
      // Reset the input so the same file can be re-selected
      e.target.value = "";
    },
    [handleFile]
  );

  return (
    <div className="space-y-4">
      {/* Drop zone (desktop) / Upload area */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`relative rounded-xl border-2 border-dashed p-8 sm:p-12 text-center transition-colors duration-200 ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-muted-foreground/50"
        }`}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>

          <div>
            <p className="text-base font-medium text-foreground">
              {isDragging
                ? "Drop your file here"
                : isMobile
                  ? "Upload a photo or file"
                  : "Drag and drop your file here"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              JPEG, PNG, HEIC, PDF, ZIP, and more
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3 sm:flex-row">
            {isMobile && (
              <Button
                size="lg"
                onClick={() => cameraInputRef.current?.click()}
                className="gap-2"
              >
                <Camera className="h-5 w-5" />
                Take Photo
              </Button>
            )}
            <Button
              size={isMobile ? "lg" : "default"}
              variant={isMobile ? "outline" : "default"}
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
            >
              <Upload className="h-5 w-5" />
              {isMobile ? "Upload File" : "Choose File"}
            </Button>
          </div>
        </div>

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          onChange={handleInputChange}
          className="hidden"
        />
        {isMobile && (
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleInputChange}
            className="hidden"
          />
        )}
      </div>

      {/* Trust line */}
      <p className="text-center text-sm text-muted-foreground">
        Your uploads are processed and not stored.
      </p>
    </div>
  );
}
