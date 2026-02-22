import { NextRequest, NextResponse } from "next/server";
import { validateFile, extractImages, inferContext } from "@/lib/readwriting/file-handling";
import {
  preprocessImage,
  checkImageQuality,
  createThumbnail,
} from "@/lib/readwriting/image-preprocessing";
import { submitBatch } from "@/lib/readwriting/claude-api";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const context = formData.get("context") as string | null;
    const model = formData.get("model") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided." },
        { status: 400 }
      );
    }

    // Validate file
    const validation = validateFile(file.name, file.size, file.type);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract images from the file (handles images, PDFs, ZIPs)
    const extraction = await extractImages(
      buffer,
      file.name,
      validation.fileType as "image" | "pdf" | "zip"
    );

    if (extraction.error || extraction.images.length === 0) {
      return NextResponse.json(
        {
          error:
            extraction.error ||
            "ReadWriting couldn't find any readable content in this file.",
        },
        { status: 400 }
      );
    }

    // Check quality of first image as a representative sample
    const qualityCheck = await checkImageQuality(extraction.images[0].buffer);
    const qualityWarning = qualityCheck.message || null;

    // Preprocess all images and generate thumbnails
    const processedImages: { base64: string; index: number }[] = [];
    const thumbnails: string[] = [];

    for (const img of extraction.images) {
      const preprocessed = await preprocessImage(img.buffer);
      processedImages.push({
        base64: preprocessed.buffer.toString("base64"),
        index: img.index,
      });

      // Generate thumbnail for preview
      const thumbnail = await createThumbnail(img.buffer);
      thumbnails.push(thumbnail);
    }

    // Determine context: user-provided takes priority, then auto-detected
    const finalContext =
      context?.trim() || inferContext(file.name) || undefined;

    // Determine model
    const modelId =
      model === "enhanced"
        ? "claude-sonnet-4-5-20241022"
        : "claude-haiku-4-5-20241022";

    // Submit to Batch API
    const batch = await submitBatch(processedImages, finalContext, modelId);

    return NextResponse.json({
      batchId: batch.batchId,
      pageCount: batch.requestCount,
      thumbnails,
      qualityWarning,
    });
  } catch (err) {
    console.error("Transcribe error:", err);
    return NextResponse.json(
      {
        error:
          "We're having trouble processing this right now. Please try again in a moment.",
      },
      { status: 500 }
    );
  }
}
