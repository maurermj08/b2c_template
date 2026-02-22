import { NextRequest, NextResponse } from "next/server";
import { pollBatch, checkConfidence } from "@/lib/readwriting/claude-api";

export async function GET(request: NextRequest) {
  const batchId = request.nextUrl.searchParams.get("id");

  if (!batchId) {
    return NextResponse.json(
      { error: "Missing batch ID." },
      { status: 400 }
    );
  }

  try {
    const result = await pollBatch(batchId);

    if (result.status !== "ended") {
      return NextResponse.json({
        status: "processing",
        requestCounts: result.requestCounts,
      });
    }

    // Batch completed — assemble the text
    const pages = result.results || [];
    const combinedText = pages
      .map((p) => p.text)
      .filter(Boolean)
      .join("\n\n---\n\n");

    const errorPages = pages.filter((p) => p.error);

    // Check confidence
    const confidence = checkConfidence(combinedText);

    return NextResponse.json({
      status: "complete",
      text: combinedText,
      pages: pages.map((p) => ({
        index: p.index,
        text: p.text,
        error: p.error,
      })),
      pageCount: pages.length,
      errorCount: errorPages.length,
      confidence: {
        lowConfidence: confidence.lowConfidence,
        illegibleCount: confidence.illegibleCount,
        uncertainCount: confidence.uncertainCount,
      },
    });
  } catch (err) {
    console.error("Batch status error:", err);
    return NextResponse.json(
      {
        error:
          "We're having trouble checking your results. Please try again in a moment.",
      },
      { status: 500 }
    );
  }
}
