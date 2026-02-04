/**
 * Map helpers for Google Maps and Mapbox.
 * Supports both providers via env: VITE_GOOGLE_MAPS_API_KEY, VITE_MAPBOX_ACCESS_TOKEN
 */

/**
 * Build a full address string from parts
 */
export function buildAddressString(parts: {
  business_address?: string | null;
  city?: string | null;
  postcode?: string | null;
}): string {
  return [parts.business_address, parts.city, parts.postcode].filter(Boolean).join(", ") || "";
}

/**
 * Google Maps: search / view location (opens in new tab or app)
 */
export function getGoogleMapsSearchUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

/**
 * Google Maps: directions to destination (opens in new tab or app)
 */
export function getGoogleMapsDirectionsUrl(
  address: string,
  lat?: number | null,
  lng?: number | null
): string {
  if (lat != null && lng != null && !isNaN(lat) && !isNaN(lng)) {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}

/**
 * Google Maps Embed: iframe src (requires VITE_GOOGLE_MAPS_API_KEY)
 */
export function getGoogleMapsEmbedUrl(
  address: string,
  lat?: number | null,
  lng?: number | null
): string | null {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!key) return null;
  const q = lat != null && lng != null && !isNaN(lat) && !isNaN(lng) ? `${lat},${lng}` : encodeURIComponent(address);
  return `https://www.google.com/maps/embed/v1/place?key=${key}&q=${q}`;
}

/**
 * Mapbox: static map image URL (requires VITE_MAPBOX_ACCESS_TOKEN)
 */
export function getMapboxStaticImageUrl(
  lat: number,
  lng: number,
  width: number = 600,
  height: number = 300,
  zoom: number = 14
): string | null {
  const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
  if (!token) return null;
  return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-l+e74c3c(${lng},${lat})/${lng},${lat},${zoom}/${width}x${height}@2x?access_token=${token}`;
}

export const MAPS = {
  hasGoogleMapsKey: !!import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  hasMapboxToken: !!import.meta.env.VITE_MAPBOX_ACCESS_TOKEN,
};
