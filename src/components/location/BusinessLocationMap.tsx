import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  buildAddressString,
  getGoogleMapsSearchUrl,
  getGoogleMapsDirectionsUrl,
  getGoogleMapsEmbedUrl,
  getMapboxStaticImageUrl,
  MAPS,
} from "@/lib/maps";

export interface BusinessLocationMapProps {
  business_address?: string | null;
  city?: string | null;
  postcode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  businessName?: string;
  /** Show embedded map when API key is available */
  showEmbed?: boolean;
  className?: string;
}

export function BusinessLocationMap({
  business_address,
  city,
  postcode,
  latitude,
  longitude,
  businessName,
  showEmbed = true,
  className = "",
}: BusinessLocationMapProps) {
  const address = buildAddressString({ business_address, city, postcode });
  if (!address && (latitude == null || longitude == null)) return null;

  const searchUrl = address ? getGoogleMapsSearchUrl(address) : getGoogleMapsDirectionsUrl("", latitude ?? null, longitude ?? null);
  const directionsUrl = getGoogleMapsDirectionsUrl(address, latitude, longitude);
  const embedUrl = address ? getGoogleMapsEmbedUrl(address, latitude, longitude) : null;
  const mapboxImageUrl =
    latitude != null && longitude != null && !isNaN(latitude) && !isNaN(longitude)
      ? getMapboxStaticImageUrl(latitude, longitude)
      : null;

  const hasEmbed = showEmbed && (embedUrl || mapboxImageUrl);

  return (
    <div className={`space-y-3 ${className}`}>
      {address && (
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{address}</span>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <a
          href={searchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex"
        >
          <Button variant="outline" size="sm" className="gap-2">
            <MapPin className="h-4 w-4" />
            View on map
          </Button>
        </a>
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex"
        >
          <Button variant="outline" size="sm" className="gap-2">
            <Navigation className="h-4 w-4" />
            Get directions
          </Button>
        </a>
      </div>
      {hasEmbed && (
        <div className="rounded-lg overflow-hidden border border-border bg-muted">
          {embedUrl && MAPS.hasGoogleMapsKey && (
            <iframe
              title={businessName ? `Map: ${businessName}` : "Location map"}
              src={embedUrl}
              className="w-full h-[240px] border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          )}
          {mapboxImageUrl && !embedUrl && MAPS.hasMapboxToken && (
            <a href={searchUrl} target="_blank" rel="noopener noreferrer" className="block">
              <img
                src={mapboxImageUrl}
                alt={businessName ? `Map: ${businessName}` : "Location map"}
                className="w-full h-[240px] object-cover"
              />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
