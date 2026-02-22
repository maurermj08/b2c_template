import sharp from "sharp";

const MAX_DIMENSION = 1568;
const TARGET_QUALITY = 85;
const MIN_DIMENSION = 100;

export interface PreprocessResult {
  buffer: Buffer;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  tokens: number;
}

export interface QualityCheck {
  tooSmall: boolean;
  tooBlurry: boolean;
  message?: string;
}

/**
 * Full image preprocessing pipeline:
 * 1. Format normalization (-> JPEG, fill transparency, fix EXIF rotation)
 * 2. Orientation correction (auto-rotate via EXIF)
 * 3. Contrast enhancement (CLAHE-like via sharp normalize + modulate)
 * 4. Smart resize for API (longest dimension <= 1568px)
 * 5. JPEG compression (quality 85)
 */
export async function preprocessImage(
  input: Buffer
): Promise<PreprocessResult> {
  // Get metadata for original dimensions
  const metadata = await sharp(input).metadata();
  const originalWidth = metadata.width || 0;
  const originalHeight = metadata.height || 0;

  let pipeline = sharp(input)
    // Auto-rotate based on EXIF orientation, then strip EXIF
    .rotate()
    // Flatten transparency to white background
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    // Normalize contrast (stretches the histogram - similar effect to CLAHE)
    .normalize()
    // Slight sharpening to counteract any softness from compression/resize
    .sharpen({ sigma: 0.5 });

  // Get dimensions after rotation
  const rotated = await sharp(input).rotate().metadata();
  let width = rotated.width || originalWidth;
  let height = rotated.height || originalHeight;

  // Smart resize: only if exceeds max dimension
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const scale = MAX_DIMENSION / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
    pipeline = pipeline.resize(width, height, {
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  // Output as JPEG
  const buffer = await pipeline
    .jpeg({ quality: TARGET_QUALITY, mozjpeg: true })
    .toBuffer();

  // Get final dimensions
  const finalMeta = await sharp(buffer).metadata();
  const finalWidth = finalMeta.width || width;
  const finalHeight = finalMeta.height || height;

  // Token estimate: (width * height) / 750
  const tokens = Math.ceil((finalWidth * finalHeight) / 750);

  return {
    buffer,
    width: finalWidth,
    height: finalHeight,
    originalWidth,
    originalHeight,
    tokens,
  };
}

/**
 * Check image quality before processing.
 * Returns warnings if image is too small or likely too blurry.
 */
export async function checkImageQuality(
  input: Buffer
): Promise<QualityCheck> {
  const metadata = await sharp(input).metadata();
  const width = metadata.width || 0;
  const height = metadata.height || 0;

  if (width < MIN_DIMENSION || height < MIN_DIMENSION) {
    return {
      tooSmall: true,
      tooBlurry: false,
      message:
        "This image is too small to read clearly. Try a higher resolution photo.",
    };
  }

  // Simple blur detection using the variance of the Laplacian
  // We convolve with a Laplacian kernel and check the standard deviation
  try {
    const stats = await sharp(input)
      .rotate()
      .greyscale()
      .convolve({
        width: 3,
        height: 3,
        kernel: [0, 1, 0, 1, -4, 1, 0, 1, 0],
      })
      .stats();

    // Standard deviation of the Laplacian - low value means blurry
    const stddev = stats.channels[0]?.stdev || 0;
    const isBlurry = stddev < 5;

    return {
      tooSmall: false,
      tooBlurry: isBlurry,
      message: isBlurry
        ? "This image looks a bit blurry. A clearer photo will give better results."
        : undefined,
    };
  } catch {
    // If blur detection fails, don't block the user
    return { tooSmall: false, tooBlurry: false };
  }
}

/**
 * Convert an image buffer to a base64-encoded JPEG data URL for thumbnails.
 */
export async function createThumbnail(
  input: Buffer,
  maxSize: number = 400
): Promise<string> {
  const buffer = await sharp(input)
    .rotate()
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .resize(maxSize, maxSize, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 70 })
    .toBuffer();

  return `data:image/jpeg;base64,${buffer.toString("base64")}`;
}
