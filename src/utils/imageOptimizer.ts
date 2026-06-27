/**
 * Image URL optimization utility.
 *
 * - Cloudinary URLs: injects `/q_auto,f_auto/` to auto-compress and serve
 *   modern formats (WebP/AVIF), cutting payload sizes by up to 80%.
 *
 * - AWS S3 URLs (production): returned as-is. S3 is raw object storage and
 *   doesn't support URL-level transformations. To optimize S3 images, set up
 *   CloudFront in front of your bucket, or run images through `sharp` on upload
 *   to pre-compress before storing.
 *
 * - All other URLs (Unsplash, etc.): returned as-is unless they support query params.
 */
export const optimizeCloudinaryUrl = (url: string | undefined): string => {
  if (!url) return "";

  // S3 signed URLs contain query params (X-Amz-*) — never modify them
  if (url.includes("amazonaws.com")) {
    return url;
  }

  // Cloudinary: inject quality + format auto flags
  if (url.includes("res.cloudinary.com") && url.includes("/image/upload/")) {
    if (url.includes("/q_auto,f_auto")) return url; // already optimized
    return url.replace("/image/upload/", "/image/upload/q_auto,f_auto/");
  }

  return url;
};

/**
 * Appends WebP format + quality params to Unsplash photo URLs.
 */
export const optimizeUnsplashUrl = (url: string | undefined): string => {
  if (!url) return "";
  if (!url.includes("unsplash.com")) return url;

  const base = url.split("?")[0];
  const params = new URLSearchParams(url.split("?")[1] ?? "");
  params.set("auto", "format");
  params.set("q", "80");
  return `${base}?${params.toString()}`;
};
