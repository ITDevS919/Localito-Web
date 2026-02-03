import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Loader2, Calendar, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  images: string[];
  duration_minutes: number;
  business_name: string; // Formerly retailer_name
  retailer_name?: string; // Legacy support
  business_id: string; // Formerly retailer_id
  retailer_id?: string; // Legacy support
  reviewCount?: number;
  averageRating?: number;
}

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [adding, setAdding] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  // Guard against missing service data
  if (!service || !service.id) {
    return null;
  }

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setLocation(`/login/customer?redirect=/service/${service.id}`);
      return;
    }
    setAdding(true);
    try {
      const res = await fetch(`${API_BASE_URL}/cart/services/${service.id}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: 1 }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to add to cart");
      }
      toast({
        title: "Added to cart",
        description: `${service.name} was added to your cart.`,
      });
    } catch (err: any) {
      if (err?.message?.toLowerCase().includes("401")) {
        setLocation(`/login/customer?redirect=/service/${service.id}`);
      } else {
        toast({
          title: "Could not add to cart",
          description: err?.message || "Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setAdding(false);
    }
  };

  return (
    <Link href={`/service/${service.id}`} className="block">
      <Card className="group overflow-hidden rounded-xl border-border/60 bg-card transition-all hover:shadow-lg hover:border-primary/20">
        {/* Image Container */}
        <div className="relative group aspect-square overflow-hidden">
          <img
            src={service.images?.[0] || "/opengraph.jpg"}
            alt={service.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <Badge className="absolute left-3 top-3 bg-primary text-primary-foreground hover:bg-primary font-medium">
            Service
          </Badge>
        </div>

        <CardContent className="p-4">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span className="truncate max-w-[120px]">{service.business_name || service.retailer_name || "Business"}</span>
            </div>
            {service.averageRating && service.averageRating > 0 ? (
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="h-3 w-3 fill-current" />
                <span className="font-medium text-foreground">{Number(service.averageRating).toFixed(1)}</span>
                <span className="text-muted-foreground">({service.reviewCount || 0})</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-blue-500">
                <Calendar className="h-3 w-3" />
                <span className="font-medium text-foreground">Bookable</span>
              </div>
            )}
          </div>

          <h3 className="font-heading text-lg font-semibold leading-tight text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {service.name || "Unnamed Service"}
          </h3>

          <div className="flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 w-fit px-2 py-1 rounded-md">
            <Clock className="h-3 w-3" />
            {service.duration_minutes || 60} min
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Price</span>
            <span className="text-lg font-bold text-primary">£{(service.price || 0).toFixed(2)}</span>
          </div>
          <Button
            size="sm"
            className="rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80"
            onClick={handleAddToCart}
            disabled={adding}
          >
            {adding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              "Book Now"
            )}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}

