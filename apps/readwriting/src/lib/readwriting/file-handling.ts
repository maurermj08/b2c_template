import AdmZip from "adm-zip";
import sharp from "sharp";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

const SUPPORTED_IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".heic",
  ".heif",
  ".tiff",
  ".tif",
  ".bmp",
  ".gif",
]);

export interface ExtractedImage {
  buffer: Buffer;
  filename: string;
  index: number;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  fileType: "image" | "pdf" | "zip" | "unknown";
}

/**
 * Validate an uploaded file for type and size.
 */
export function validateFile(
  filename: string,
  size: number,
  mimeType: string
): ValidationResult {
  if (size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: "This file is too large. Try a smaller file or compress your images.",
      fileType: "unknown",
    };
  }

  if (size === 0) {
    return {
      valid: false,
      error: "This file appears to be empty.",
      fileType: "unknown",
    };
  }

  const ext = getExtension(filename);
  const fileType = categorizeFile(ext, mimeType);

  if (fileType === "unknown") {
    return {
      valid: false,
      error:
        "ReadWriting doesn't recognize this file type. Try JPEG, PNG, PDF, or ZIP.",
      fileType: "unknown",
    };
  }

  return { valid: true, fileType };
}

/**
 * Extract images from different file types.
 * - Images: returns as-is
 * - PDFs: rasterizes each page
 * - ZIPs: extracts all supported images
 */
export async function extractImages(
  buffer: Buffer,
  filename: string,
  fileType: "image" | "pdf" | "zip"
): Promise<{ images: ExtractedImage[]; error?: string }> {
  switch (fileType) {
    case "image":
      return { images: [{ buffer, filename, index: 0 }] };
    case "pdf":
      return extractFromPdf(buffer, filename);
    case "zip":
      return extractFromZip(buffer);
    default:
      return { images: [], error: "Unsupported file type." };
  }
}

/**
 * Extract images from a PDF by rasterizing each page.
 * Uses sharp to detect pages (for single-image PDFs) or
 * falls back to a page-by-page approach.
 */
async function extractFromPdf(
  buffer: Buffer,
  filename: string
): Promise<{ images: ExtractedImage[]; error?: string }> {
  try {
    // Sharp can read PDFs if libvips was compiled with poppler/pdfium support.
    // We try to read each page. Sharp reads page 0 by default.
    const metadata = await sharp(buffer, { density: 300 }).metadata();
    const pageCount = metadata.pages || 1;

    const images: ExtractedImage[] = [];
    for (let i = 0; i < pageCount; i++) {
      try {
        const pageBuffer = await sharp(buffer, { page: i, density: 300 })
          .flatten({ background: { r: 255, g: 255, b: 255 } })
          .jpeg({ quality: 90 })
          .toBuffer();
        images.push({
          buffer: pageBuffer,
          filename: `${filename}_page_${i + 1}.jpg`,
          index: i,
        });
      } catch {
        // Skip unreadable pages
        continue;
      }
    }

    if (images.length === 0) {
      return {
        images: [],
        error: "Something's wrong with this file. Try uploading it again.",
      };
    }

    return { images };
  } catch {
    return {
      images: [],
      error: "Something's wrong with this file. Try uploading it again.",
    };
  }
}

/**
 * Extract supported images from a ZIP archive.
 */
async function extractFromZip(
  buffer: Buffer
): Promise<{ images: ExtractedImage[]; error?: string }> {
  try {
    const zip = new AdmZip(buffer);
    const entries = zip.getEntries();

    // Check for password-protected ZIP
    for (const entry of entries) {
      if (entry.header.encripted) {
        return {
          images: [],
          error:
            "This ZIP file is password-protected. Please extract the files and upload them directly.",
        };
      }
    }

    const images: ExtractedImage[] = [];
    let index = 0;

    // Sort entries by name for consistent ordering
    const sortedEntries = entries
      .filter((e) => !e.isDirectory)
      .sort((a, b) => a.entryName.localeCompare(b.entryName));

    for (const entry of sortedEntries) {
      const ext = getExtension(entry.entryName);

      // Reject nested ZIPs
      if (ext === ".zip") {
        return {
          images: [],
          error:
            "ReadWriting doesn't support ZIPs inside ZIPs. Please extract the files and upload them directly.",
        };
      }

      // Check for supported PDF within ZIP
      if (ext === ".pdf") {
        const pdfBuffer = entry.getData();
        const pdfResult = await extractFromPdf(pdfBuffer, entry.entryName);
        for (const img of pdfResult.images) {
          images.push({ ...img, index: index++ });
        }
        continue;
      }

      // Check for supported image types
      if (SUPPORTED_IMAGE_EXTENSIONS.has(ext)) {
        const imgBuffer = entry.getData();
        images.push({
          buffer: imgBuffer,
          filename: entry.entryName,
          index: index++,
        });
      }
      // Silently ignore unsupported files
    }

    if (images.length === 0) {
      return {
        images: [],
        error: "This ZIP doesn't seem to contain any images ReadWriting can work with.",
      };
    }

    return { images };
  } catch (err) {
    // Check if it's our own error message
    if (err instanceof Error && err.message.includes("ReadWriting")) {
      return { images: [], error: err.message };
    }
    return {
      images: [],
      error: "Something's wrong with this file. Try uploading it again.",
    };
  }
}

/**
 * Infer context from filename and basic metadata.
 */
export function inferContext(filename: string): string | null {
  const lower = filename.toLowerCase();

  const contextPatterns: [RegExp, string][] = [
    [/prescription|rx|med/i, "medical prescription or notes"],
    [/recipe/i, "recipe or cooking instructions"],
    [/meeting|minutes|notes/i, "meeting notes"],
    [/grocery|shopping|list/i, "shopping or grocery list"],
    [/letter/i, "personal letter or correspondence"],
    [/invoice|receipt|bill/i, "invoice, receipt, or bill"],
    [/journal|diary/i, "journal or diary entry"],
    [/lecture|class|school/i, "class or lecture notes"],
  ];

  for (const [pattern, context] of contextPatterns) {
    if (pattern.test(lower)) {
      return context;
    }
  }

  return null;
}

function getExtension(filename: string): string {
  const dot = filename.lastIndexOf(".");
  if (dot === -1) return "";
  return filename.slice(dot).toLowerCase();
}

function categorizeFile(
  ext: string,
  mimeType: string
): "image" | "pdf" | "zip" | "unknown" {
  if (ext === ".pdf" || mimeType === "application/pdf") return "pdf";
  if (
    ext === ".zip" ||
    mimeType === "application/zip" ||
    mimeType === "application/x-zip-compressed"
  )
    return "zip";
  if (
    SUPPORTED_IMAGE_EXTENSIONS.has(ext) ||
    mimeType.startsWith("image/")
  )
    return "image";
  return "unknown";
}
