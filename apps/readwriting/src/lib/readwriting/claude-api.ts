import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `You are a handwriting transcription specialist. Your job is to read handwritten text from images and convert it to clean, accurate digital text.

Rules:
- Transcribe EXACTLY what is written. Do not correct spelling or grammar unless the context instructions say to.
- Preserve the original structure: line breaks, paragraphs, lists, etc.
- If you cannot read a word, use [illegible] as a placeholder.
- If you're unsure about a word, transcribe your best guess and mark it with [?] after it.
- For crossed-out text, include it as [crossed out: word].
- For drawings or non-text elements, note them as [drawing] or [diagram].
- Output ONLY the transcribed text. No commentary, no explanations.`;

export interface TranscriptionRequest {
  imageBase64: string;
  context?: string;
  model?: "claude-haiku-4-5-20241022" | "claude-sonnet-4-5-20241022";
}

export interface BatchSubmission {
  batchId: string;
  requestCount: number;
}

export interface BatchResult {
  status: "in_progress" | "ended" | "canceling" | "canceled" | "expired" | "failed";
  results?: PageResult[];
  requestCounts?: {
    processing: number;
    succeeded: number;
    errored: number;
    canceled: number;
    expired: number;
  };
}

export interface PageResult {
  index: number;
  text: string;
  error?: string;
}

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY environment variable is not set");
  }
  return new Anthropic({ apiKey });
}

function buildMessages(
  imageBase64: string
): Anthropic.MessageCreateParams["messages"] {
  return [
    {
      role: "user",
      content: [
        {
          type: "image",
          source: {
            type: "base64",
            media_type: "image/jpeg",
            data: imageBase64,
          },
        },
        {
          type: "text",
          text: "Transcribe the handwritten text in this image.",
        },
      ],
    },
  ];
}

function buildSystemPrompt(context?: string): string {
  if (!context) return SYSTEM_PROMPT;
  return `${SYSTEM_PROMPT}

Context for this document: ${context}
Use this context to help disambiguate unclear words. For example, if this is medical notes, interpret ambiguous text in a medical context.`;
}

/**
 * Submit images to the Claude Batch API for transcription.
 * Returns a batch ID that can be polled for results.
 */
export async function submitBatch(
  images: { base64: string; index: number }[],
  context?: string,
  model: string = "claude-haiku-4-5-20241022"
): Promise<BatchSubmission> {
  const client = getClient();
  const systemPrompt = buildSystemPrompt(context);

  const requests: Anthropic.Messages.BatchCreateParams.Request[] = images.map(
    (img) => ({
      custom_id: `page_${img.index}`,
      params: {
        model,
        max_tokens: 4096,
        system: [
          {
            type: "text" as const,
            text: systemPrompt,
            cache_control: { type: "ephemeral" as const },
          },
        ],
        messages: buildMessages(img.base64),
      },
    })
  );

  const batch = await client.messages.batches.create({ requests });

  return {
    batchId: batch.id,
    requestCount: images.length,
  };
}

/**
 * Poll the Batch API for results.
 */
export async function pollBatch(batchId: string): Promise<BatchResult> {
  const client = getClient();
  const batch = await client.messages.batches.retrieve(batchId);

  if (batch.processing_status !== "ended") {
    return {
      status: batch.processing_status,
      requestCounts: batch.request_counts,
    };
  }

  // Batch is done — retrieve results
  const results: PageResult[] = [];

  const resultsStream = await client.messages.batches.results(batchId);
  for await (const result of resultsStream) {
    const index = parseInt(result.custom_id.replace("page_", ""), 10);

    if (result.result.type === "succeeded") {
      const message = result.result.message;
      const text = message.content
        .filter((block): block is Anthropic.Messages.TextBlock => block.type === "text")
        .map((block) => block.text)
        .join("\n");
      results.push({ index, text });
    } else {
      results.push({
        index,
        text: "",
        error: "Failed to process this page.",
      });
    }
  }

  // Sort by page index
  results.sort((a, b) => a.index - b.index);

  return {
    status: "ended",
    results,
    requestCounts: batch.request_counts,
  };
}

/**
 * Process a single image using the standard (non-batch) API.
 * Used as a fallback or for "Enhanced Mode" with Sonnet.
 */
export async function transcribeSingle(
  imageBase64: string,
  context?: string,
  model: string = "claude-haiku-4-5-20241022"
): Promise<string> {
  const client = getClient();
  const systemPrompt = buildSystemPrompt(context);

  const response = await client.messages.create({
    model,
    max_tokens: 4096,
    system: [
      {
        type: "text",
        text: systemPrompt,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: buildMessages(imageBase64),
  });

  return response.content
    .filter((block): block is Anthropic.Messages.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n");
}

/**
 * Check if the transcription output has low confidence
 * by counting [illegible] and [?] markers.
 */
export function checkConfidence(text: string): {
  lowConfidence: boolean;
  illegibleCount: number;
  uncertainCount: number;
} {
  const illegibleMatches = text.match(/\[illegible\]/gi) || [];
  const uncertainMatches = text.match(/\[\?\]/g) || [];
  const wordCount = text.split(/\s+/).length;

  const illegibleCount = illegibleMatches.length;
  const uncertainCount = uncertainMatches.length;
  const totalIssues = illegibleCount + uncertainCount;

  // Low confidence if more than 10% of words are uncertain/illegible
  const lowConfidence = wordCount > 0 && totalIssues / wordCount > 0.1;

  return { lowConfidence, illegibleCount, uncertainCount };
}
