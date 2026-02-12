import { useEffect, useState } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BackButton } from "@/components/navigation/BackButton";
import { Loader2, Star, StarHalf, Store, Heart, MapPin, Navigation } from "lucide-react";
import { getGoogleMapsDirectionsUrl, buildAddressString } from "@/lib/maps";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { Label } from "@/components/ui/label";
import { MessageCircle } from "lucide-react";
import { startChatWithBusiness } from "@/utils/chatHelpers";
import { Badge } from "@/components/ui/badge";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  images: string[];
  businessId: string; // Formerly retailerId
  retailerId?: string; // Legacy support
  isApproved: boolean;
  reviewCount?: number;
  averageRating?: number;
  business_name?: string;
  business_username?: string;
  business_address?: string | null;
  city?: string;
  postcode?: string;
  business_latitude?: number | null;
  business_longitude?: number | null;
}

interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  username: string;
  email: string;
}

export default function ProductDetailPage() {
  const [match, params] = useRoute("/product/:id");
  const productId = params?.id;
  const { user, isAuthenticated } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [adding, setAdding] = useState(false);
  const [following, setFollowing] = useState(false);
  const [togglingFollow, setTogglingFollow] = useState(false);
  const [checkingFollowStatus, setCheckingFollowStatus] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [zoomedImageIndex, setZoomedImageIndex] = useState<number | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const businessSlug = product?.business_username || product?.businessId || product?.retailerId;
  const businessId = product?.businessId || product?.retailerId;

  // Determine if current user is the owner of this business (business role only)
  useEffect(() => {
    const checkOwnership = async () => {
      if (!isAuthenticated || user?.role !== "business" || !businessId) {
        setIsOwner(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/business/profile`, {
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok && data.success && data.data?.id) {
          setIsOwner(data.data.id === businessId);
        } else {
          setIsOwner(false);
        }
      } catch (err) {
        console.error("Failed to check business ownership:", err);
        setIsOwner(false);
      }
    };

    checkOwnership();
  }, [isAuthenticated, user?.role, businessId]);

  // Check follow status when product loads (only for authenticated customers)
  useEffect(() => {
    if (!product || !businessId || !isAuthenticated || user?.role !== "customer") {
      setFollowing(false);
      return;
    }

    const checkFollowStatus = async () => {
      setCheckingFollowStatus(true);
      try {
        const res = await fetch(`${API_BASE_URL}/business/${businessId}/follow`, {
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setFollowing(data.data?.isFollowing || false);
        }
      } catch (err) {
        console.error("Failed to check follow status:", err);
      } finally {
        setCheckingFollowStatus(false);
      }
    };

    checkFollowStatus();
  }, [product, businessId, isAuthenticated, user?.role]);

  const handleFollowShop = async () => {
    if (!businessId) return;

    // Guest: prompt login to customer account and keep context on this product
    if (!isAuthenticated) {
      toast({
        title: "Log in to follow",
        description: "Log in to follow this shop and see their updates.",
      });
      const returnPath = `/product/${productId}`;
      setLocation(`/login/customer?redirect=${encodeURIComponent(returnPath)}`);
      return;
    }

    // Authenticated but not a customer (business/admin) – no follow, just info
    if (!user || user.role !== "customer") {
      toast({
        title: "Customers only",
        description: "Only customers can follow shops.",
        variant: "destructive",
      });
      return;
    }

    setTogglingFollow(true);
    try {
      const method = following ? "DELETE" : "POST";
      const res = await fetch(`${API_BASE_URL}/business/${businessId}/follow`, {
        method,
        credentials: "include",
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setFollowing(!following);
        toast({
          title: following ? "Unfollowed" : "Following",
          description: following
            ? "You've unfollowed this business"
            : "You're now following this business",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update follow status",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error("Failed to toggle follow:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to update follow status",
        variant: "destructive",
      });
    } finally {
      setTogglingFollow(false);
    }
  };

  useEffect(() => {
    if (!productId) return;
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/products/${productId}`);
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to load product");
        }
        setProduct(data.data);
        // Reset image state when product changes
        setImageError(false);
        setImageLoading(true);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  // Keyboard navigation for zoomed image
  useEffect(() => {
    if (zoomedImageIndex === null || !product?.images) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setZoomedImageIndex(null);
      } else if (e.key === "ArrowLeft" && product.images.length > 1) {
        e.preventDefault();
        setZoomedImageIndex((zoomedImageIndex - 1 + product.images.length) % product.images.length);
      } else if (e.key === "ArrowRight" && product.images.length > 1) {
        e.preventDefault();
        setZoomedImageIndex((zoomedImageIndex + 1) % product.images.length);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [zoomedImageIndex, product?.images]);

  useEffect(() => {
    if (!productId) return;
    const fetchReviews = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/products/${productId}/reviews`);
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
  }, [productId]);

  const handleSubmitReview = async () => {
    if (!isAuthenticated || !user || user.role !== "customer") {
      setError("You must be logged in as a customer to submit a review");
      return;
    }

    if (reviewForm.rating < 1 || reviewForm.rating > 5) {
      setError("Please select a rating between 1 and 5");
      return;
    }

    setSubmittingReview(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          rating: reviewForm.rating,
          comment: reviewForm.comment || null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to submit review");
      }

      // Reload product and reviews
      const productRes = await fetch(`${API_BASE_URL}/products/${productId}`);
      const productData = await productRes.json();
      if (productRes.ok && productData.success) {
        setProduct(productData.data);
      }

      const reviewsRes = await fetch(`${API_BASE_URL}/products/${productId}/reviews`);
      const reviewsData = await reviewsRes.json();
      if (reviewsRes.ok && reviewsData.success) {
        setReviews(reviewsData.data || []);
      }

      setReviewDialogOpen(false);
      setReviewForm({ rating: 5, comment: "" });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    if (!isAuthenticated) {
      toast({
        title: "Log in to add to cart",
        description: "Please log in to add items to your cart.",
      });
      setLocation(`/login/customer?redirect=/product/${productId}`);
      return;
    }
    
    if (!user || user.role !== "customer") {
      toast({
        title: "Customers only",
        description: "Only customers can add items to cart.",
        variant: "destructive",
      });
      return;
    }

    if (product.stock <= 0) {
      toast({
        title: "Out of stock",
        description: "This product is currently out of stock.",
        variant: "destructive",
      });
      return;
    }

    setAdding(true);
    try {
      const res = await fetch(`${API_BASE_URL}/cart`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to add to cart");
      }
      toast({
        title: "Added to cart",
        description: `${product.name} was added to your cart.`,
      });
    } catch (err: any) {
      if (err?.message?.toLowerCase().includes("401")) {
        setLocation(`/login/customer?redirect=/product/${productId}`);
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
      setLocation(`/login/customer?redirect=/product/${productId}`);
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

    if (!product?.businessId && !product?.retailerId) return;

    try {
      await startChatWithBusiness(product.businessId || product.retailerId || "", user, setLocation);
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
        <span className="ml-1 text-sm text-muted-foreground">({rating.toFixed(1)})</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="container mx-auto px-4 pt-28 md:pt-32 pb-10">
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
        {!loading && !error && product && (
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="space-y-4">
              <div 
                className="aspect-square w-full overflow-hidden rounded-2xl border border-border bg-muted relative cursor-pointer group"
                onClick={() => setZoomedImageIndex(0)}
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
                  src={imageError ? "/opengraph.jpg" : (product.images?.[0] || "/opengraph.jpg")}
                  alt={product.name}
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
              <div className="grid grid-cols-4 gap-2">
                {(product.images || []).slice(0, 4).map((img, idx) => (
                  <div 
                    key={idx} 
                    className="aspect-square w-full overflow-hidden rounded-lg border border-border bg-muted cursor-pointer hover:border-primary transition-colors"
                    onClick={() => setZoomedImageIndex(idx)}
                  >
                    <img
                      src={img}
                      alt={`${product.name}-${idx}`}
                      className="h-full w-full object-cover block"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/opengraph.jpg";
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{product.category}</p>
                <h1 className="text-3xl font-bold">{product.name}</h1>
                {product.averageRating && product.averageRating > 0 && (
                  <div className="mt-2">
                    {renderStars(product.averageRating)}
                    <span className="text-sm text-muted-foreground ml-2">
                      {product.reviewCount || 0} review{product.reviewCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-lg text-muted-foreground whitespace-pre-line break-words">
                {product.description}
              </p>
              <div className="text-3xl font-semibold text-primary">£{product.price.toFixed(2)}</div>
              {product.stock > 0 && product.stock <= 5 && (
                <Badge variant="outline" className="mb-2 border-orange-500 text-orange-600 dark:text-orange-400">
                  ⚠️ Only {product.stock} left in stock!
                </Badge>
              )}
              <p className="text-sm text-muted-foreground">
                Stock: {product.stock > 0 ? product.stock : "Out of stock"}
              </p>
              <div className="flex gap-2">
                <Button 
                  onClick={handleAddToCart} 
                  disabled={adding || product.stock <= 0}
                  className="flex-1"
                >
                  {adding ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : product.stock <= 0 ? (
                    "Out of Stock"
                  ) : (
                    "Add to Cart"
                  )}
                </Button>
                <Button onClick={handleMessageSeller} variant="outline">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message Seller
                </Button>
              </div>
              <div className="pt-4">
                <h3 className="font-semibold mb-2">Sold by</h3>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Store className="h-10 w-10 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <Link
                            href={`/business/${product.business_username || product.businessId || product.retailerId}`}
                            className="font-semibold text-primary hover:underline focus:underline"
                          >
                            {product.business_name || "Business"}
                          </Link>
                          {product.business_username && (
                            <p className="text-sm text-muted-foreground">@{product.business_username}</p>
                          )}
                          {(product.city || product.postcode || product.business_address) && (
                            <p className="text-sm text-muted-foreground">
                              {buildAddressString({
                                business_address: product.business_address,
                                city: product.city,
                                postcode: product.postcode,
                              }) || [product.city, product.postcode].filter(Boolean).join(", ")}
                            </p>
                          )}
                          {(product.business_address || product.city || product.postcode) && (
                            <a
                              href={getGoogleMapsDirectionsUrl(
                                buildAddressString({
                                  business_address: product.business_address,
                                  city: product.city,
                                  postcode: product.postcode,
                                }),
                                product.business_latitude,
                                product.business_longitude
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mt-1"
                            >
                              <Navigation className="h-4 w-4" />
                              Get directions
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Link 
                          href={`/business/${businessSlug}`}
                          onClick={() => {
                            // Store current product page for back navigation
                            if (productId) {
                              sessionStorage.setItem('lastProductPage', `/product/${productId}`);
                            }
                          }}
                        >
                          <Button variant="outline">
                            <Store className="h-4 w-4 mr-2" />
                            View Shop
                          </Button>
                        </Link>
                        {/* Follow is a customer-only action and not shown to the owner */}
                        {!isOwner && (!isAuthenticated || user?.role === "customer") && (
                          <Button
                            variant="outline"
                            onClick={handleFollowShop}
                            disabled={togglingFollow || checkingFollowStatus || !businessId}
                          >
                            <Heart className={`h-4 w-4 mr-2 ${following ? "fill-current" : ""}`} />
                            {togglingFollow || checkingFollowStatus
                              ? "..."
                              : following
                                ? "Following"
                                : "Follow shop"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Reviews Section */}
        {!loading && !error && product && (
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
                        Share your experience with this product
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
                      {error && <p className="text-sm text-destructive">{error}</p>}
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
                    No reviews yet. Be the first to review this product!
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
              {zoomedImageIndex !== null && product?.images && product.images.length > 0 && (
                <>
                  <img
                    src={product.images[zoomedImageIndex] || "/opengraph.jpg"}
                    alt={`${product.name} - Image ${zoomedImageIndex + 1}`}
                    className="max-w-full max-h-[90vh] object-contain"
                  />
                  
                  {/* Navigation Arrows */}
                  {product.images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setZoomedImageIndex((zoomedImageIndex - 1 + product.images.length) % product.images.length);
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-colors backdrop-blur-sm"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setZoomedImageIndex((zoomedImageIndex + 1) % product.images.length);
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-colors backdrop-blur-sm"
                        aria-label="Next image"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>
                      
                      {/* Image Counter */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm">
                        {zoomedImageIndex + 1} / {product.images.length}
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

