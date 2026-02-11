import { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Calendar, Clock, MapPin, MessageCircle, Star, StarHalf, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { startChatWithBusiness } from "@/utils/chatHelpers";
import { BackButton } from "@/components/navigation/BackButton";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  images: string[];
  duration_minutes: number;
  max_participants: number;
  requires_staff: boolean;
  location_type: 'onsite' | 'customer_address' | 'online';
  business_id: string; // Formerly retailer_id
  retailer_id?: string; // Legacy support
  business_name?: string; // Formerly retailer_name
  retailer_name?: string; // Legacy support
  reviewCount?: number;
  averageRating?: number;
}

interface Review {
  id: string;
  service_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  username: string;
  email: string;
}

export default function ServiceDetailPage() {
  const [, params] = useRoute("/service/:id");
  const serviceId = params?.id;
  const { user, isAuthenticated } = useAuth();
  const [service, setService] = useState<Service | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [zoomedImageIndex, setZoomedImageIndex] = useState<number | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (!serviceId) return;
    const fetchService = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/services/${serviceId}`);
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to load service");
        }
        setService(data.data);
        // Reset image state when service changes
        setImageError(false);
        setImageLoading(true);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [serviceId]);

  useEffect(() => {
    if (!serviceId) return;
    const fetchReviews = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/services/${serviceId}/reviews`);
        const data = await res.json();
        if (res.ok && data.success) {
          setReviews(data.data || []);
        }
      } catch (err) {
        console.error("Failed to load reviews:", err);
      } finally {
        setReviewsLoading(false);
      }
    };
    fetchReviews();
  }, [serviceId]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      setLocation(`/login/customer?redirect=/service/${serviceId}`);
      return;
    }
    setAdding(true);
    try {
      const res = await fetch(`${API_BASE_URL}/cart/services/${serviceId}`, {
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
        description: `${service?.name} was added to your cart. You'll select a booking time at checkout.`,
      });
    } catch (err: any) {
      if (err?.message?.toLowerCase().includes("401")) {
        setLocation(`/login/customer?redirect=/service/${serviceId}`);
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

  const handleMessageSeller = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Log in to message",
        description: "Please log in to send a message to the seller.",
      });
      setLocation(`/login/customer?redirect=/service/${serviceId}`);
      return;
    }
    if (!user || user.role !== "customer") {
      toast({
        title: "Customers only",
        description: "Only customers can message sellers.",
        variant: "destructive",
      });
      return;
    }

    if (!service?.business_id && !service?.retailer_id) return;

    try {
      await startChatWithBusiness(service.business_id || service.retailer_id || "", user, setLocation);
      toast({
        title: "Chat started",
        description: "You can now message the seller",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start chat",
        variant: "destructive",
      });
    }
  };

  const handleSubmitReview = async () => {
    if (!isAuthenticated || user?.role !== "customer") {
      toast({
        title: "Error",
        description: "You must be logged in as a customer to submit a review",
        variant: "destructive",
      });
      return;
    }

    if (!serviceId) return;

    if (reviewForm.rating < 1 || reviewForm.rating > 5) {
      toast({
        title: "Error",
        description: "Please select a rating between 1 and 5",
        variant: "destructive",
      });
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch(`${API_BASE_URL}/services/${serviceId}/reviews`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: reviewForm.rating,
          comment: reviewForm.comment || null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to submit review");
      }

      // Reload service to get updated rating
      const serviceRes = await fetch(`${API_BASE_URL}/services/${serviceId}`);
      const serviceData = await serviceRes.json();
      if (serviceRes.ok && serviceData.success) {
        setService(serviceData.data);
      }

      // Reload reviews
      const reviewsRes = await fetch(`${API_BASE_URL}/services/${serviceId}/reviews`);
      const reviewsData = await reviewsRes.json();
      if (reviewsRes.ok && reviewsData.success) {
        setReviews(reviewsData.data || []);
      }

      setReviewDialogOpen(false);
      setReviewForm({ rating: 5, comment: "" });
      toast({
        title: "Success",
        description: "Review submitted successfully",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to submit review",
        variant: "destructive",
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />;
          } else if (i === fullStars && hasHalfStar) {
            return <StarHalf key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />;
          } else {
            return <Star key={i} className="h-4 w-4 text-gray-300" />;
          }
        })}
        <span className="text-sm text-muted-foreground ml-1">({rating.toFixed(1)})</span>
      </div>
    );
  };

  const getLocationTypeLabel = (type: string) => {
    switch (type) {
      case 'onsite':
        return 'At Business Location';
      case 'customer_address':
        return 'At Your Address';
      case 'online':
        return 'Online';
      default:
        return type;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="container mx-auto px-4 pt-32 md:pt-40 pb-10">
        {!loading && !error && (
          <div className="mb-6">
            <BackButton fallbackHref="/search" label="Back" variant="ghost" />
          </div>
        )}
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}
        {error && (
          <div className="text-center text-destructive py-10">{error}</div>
        )}
        {!loading && !error && service && (
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="space-y-4">
              <div 
                className="aspect-square w-full overflow-hidden rounded-2xl border border-border bg-muted relative cursor-pointer group"
                onClick={() => setZoomedImageIndex(selectedImage)}
              >
                {imageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-colors z-20">
                  <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <img
                  src={imageError ? "/opengraph.jpg" : (service.images?.[selectedImage] || service.images?.[0] || "/opengraph.jpg")}
                  alt={service.name}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                  onLoad={() => setImageLoading(false)}
                  onError={() => {
                    setImageError(true);
                    setImageLoading(false);
                  }}
                />
              </div>
              {service.images && service.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {service.images.slice(0, 4).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedImage(idx);
                        setImageError(false);
                        setImageLoading(true);
                      }}
                      onDoubleClick={() => {
                        setZoomedImageIndex(idx);
                      }}
                      className={`aspect-square w-full overflow-hidden rounded-lg border-2 transition-all cursor-pointer ${
                        selectedImage === idx
                          ? "border-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${service.name}-${idx}`}
                        className="h-full w-full object-cover block"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/opengraph.jpg";
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{service.category}</p>
                <h1 className="text-3xl font-bold">{service.name}</h1>
                {service.averageRating && service.averageRating > 0 && (
                  <div className="mt-2">
                    {renderStars(service.averageRating)}
                    <span className="text-sm text-muted-foreground ml-2">
                      {service.reviewCount || 0} review{service.reviewCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-lg text-muted-foreground whitespace-pre-line break-words">
                {service.description || "No description available."}
              </p>
              <div className="text-3xl font-semibold text-primary">£{Number(service.price).toFixed(2)}</div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">{service.duration_minutes} minutes</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-medium">{getLocationTypeLabel(service.location_type)}</span>
                </div>
                {service.max_participants > 1 && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Max Participants:</span>
                    <span className="font-medium">{service.max_participants}</span>
                  </div>
                )}
                {service.requires_staff && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Requires Staff:</span>
                    <span className="font-medium">Yes</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddToCart} disabled={adding}>
                  {adding ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Calendar className="mr-2 h-4 w-4" />
                      Book Now
                    </>
                  )}
                </Button>
                <Button onClick={handleMessageSeller} variant="outline">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message Seller
                </Button>
              </div>
              <div className="pt-4">
                <h3 className="font-semibold mb-2">Service Provider</h3>
                <p className="text-sm text-muted-foreground">
                  {service.business_name || service.retailer_name || `Business ID: ${service.business_id || service.retailer_id}`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Reviews Section */}
        {!loading && !error && service && (
          <div className="mt-12 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Reviews</h2>
              {isAuthenticated && user?.role === "customer" && (
                <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>Write a Review</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Write a Review</DialogTitle>
                      <DialogDescription>
                        Share your experience with this service
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Rating</Label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              type="button"
                              onClick={() => setReviewForm({ ...reviewForm, rating })}
                              className={`p-2 rounded ${
                                reviewForm.rating >= rating
                                  ? "bg-yellow-400"
                                  : "bg-gray-200 hover:bg-gray-300"
                              }`}
                            >
                              <Star
                                className={`h-6 w-6 ${
                                  reviewForm.rating >= rating
                                    ? "fill-yellow-600 text-yellow-600"
                                    : "text-gray-400"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="comment">Comment (optional)</Label>
                        <Textarea
                          id="comment"
                          placeholder="Share your thoughts..."
                          value={reviewForm.comment}
                          onChange={(e) =>
                            setReviewForm({ ...reviewForm, comment: e.target.value })
                          }
                          rows={4}
                        />
                      </div>
                      <Button
                        onClick={handleSubmitReview}
                        disabled={submittingReview}
                        className="w-full"
                      >
                        {submittingReview ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          "Submit Review"
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {reviewsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : reviews.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground py-8">
                    No reviews yet. Be the first to review this service!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{review.username}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString("en-GB", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                        {renderStars(review.rating)}
                      </div>
                    </CardHeader>
                    {review.comment && (
                      <CardContent>
                        <p className="text-muted-foreground whitespace-pre-line break-words">{review.comment}</p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Image Zoom Modal */}
        <Dialog open={zoomedImageIndex !== null} onOpenChange={(open) => !open && setZoomedImageIndex(null)}>
          <DialogContent className="max-w-7xl w-full h-full max-h-[90vh] p-0 bg-black/95 border-none">
            <div className="relative w-full h-full flex items-center justify-center">
              {zoomedImageIndex !== null && service?.images && service.images.length > 0 && (
                <>
                  <img
                    src={service.images[zoomedImageIndex] || "/opengraph.jpg"}
                    alt={`${service.name} - Image ${zoomedImageIndex + 1}`}
                    className="max-w-full max-h-[90vh] object-contain"
                  />
                  
                  {/* Navigation Arrows */}
                  {service.images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setZoomedImageIndex((zoomedImageIndex - 1 + service.images.length) % service.images.length);
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-colors backdrop-blur-sm"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setZoomedImageIndex((zoomedImageIndex + 1) % service.images.length);
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-colors backdrop-blur-sm"
                        aria-label="Next image"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>
                      
                      {/* Image Counter */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm">
                        {zoomedImageIndex + 1} / {service.images.length}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

