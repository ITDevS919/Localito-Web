/**
 * Image URL helpers for Cloudinary CDN and API-backed images.
 * Cloudinary URLs support on-the-fly transforms for faster, optimized delivery.
 */

/** Add Cloudinary transform for size/quality. Use for detail view (w_1200) or list (w_300). */
export function getOptimizedImageUrl(
  url: string | undefined,
  options: { width?: number; forDetail?: boolean } = {}
): string {
  if (!url) return "";
  if (!url.includes("res.cloudinary.com")) return url;
  const width = options.width ?? (options.forDetail ? 1200 : 300);
  const transform = `w_${width},f_auto,q_auto`;
  return url.replace("/image/upload/", `/image/upload/${transform}/`);
}
