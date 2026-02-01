


import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Store, MapPin, Phone, Heart, Share2, Image as ImageIcon, ArrowLeft, ChevronLeft } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/lib/product";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface BusinessProfile {
  id: string;
  business_name: string;
  primary_category_name?: string;
  business_address?: string;
  postcode?: string;
  city?: string;
  phone?: string;
  banner_image?: string;
  follower_count: number;
  isFollowing?: boolean;
}

interface BusinessPost {
  id: string;
  content: string;
  images: string[];
  created_at: string;
}

export default function BusinessProfilePage() {
  const { businessId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [posts, setPosts] = useState<BusinessPost[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [togglingFollow, setTogglingFollow] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (businessId) {
      fetchBusinessProfile();
      fetchPosts();
      fetchProducts();
      checkIfOwner();
    }
  }, [businessId, user]);

  const checkIfOwner = async () => {
    if (!isAuthenticated || user?.role !== "business") {
      setIsOwner(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/business/profile`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Check if the current business's ID matches the profile ID
        setIsOwner(data.data.id === businessId);
      }
    } catch (err) {
      console.error("Failed to check ownership:", err);
      setIsOwner(false);
    }
  };

  const fetchBusinessProfile = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/business/${businessId}/public`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBusiness(data.data);
        setFollowing(data.data.isFollowing || false);
      }
    } catch (err) {
      console.error("Failed to fetch business profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/business/${businessId}/posts`);
      const data = await res.json();
      if (res.ok && data.success) {
        setPosts(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/products?businessId=${businessId}&isApproved=true`);
      const data = await res.json();
      if (res.ok && data.success) {
        // Map API response to Product type structure (same as search page)
        if (Array.isArray(data.data)) {
          setProducts(
            data.data.map((p: any) => ({
              id: p.id,
              name: p.name,
              price: parseFloat(p.price) || 0,
              business: p.business_name || business?.business_name || "Business",
              image: p.images?.[0] || "/opengraph.jpg",
              category: p.category,
              rating: p.averageRating || 0,
              reviews: p.reviewCount || 0,
              pickupTime: "30 mins",
              businessPostcode: p.postcode,
              businessCity: p.city,
              retailerPostcode: p.postcode, // Legacy support
              retailerCity: p.city, // Legacy support
            }))
          );
        } else if (data.data?.products && Array.isArray(data.data.products)) {
          // Handle paginated response structure
          setProducts(
            data.data.products.map((p: any) => ({
              id: p.id,
              name: p.name,
              price: parseFloat(p.price) || 0,
              business: p.business_name || business?.business_name || "Business",
              image: p.images?.[0] || "/opengraph.jpg",
              category: p.category,
              rating: p.averageRating || 0,
              reviews: p.reviewCount || 0,
              pickupTime: "30 mins",
              businessPostcode: p.postcode,
              businessCity: p.city,
              retailerPostcode: p.postcode, // Legacy support
              retailerCity: p.city, // Legacy support
            }))
          );
        } else {
          setProducts([]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
  };

  const handleFollow = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please login to follow businesses",
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
        if (following) {
          setBusiness((prev) =>
            prev ? { ...prev, follower_count: (prev.follower_count || 0) - 1 } : null
          );
        } else {
          setBusiness((prev) =>
            prev ? { ...prev, follower_count: (prev.follower_count || 0) + 1 } : null
          );
        }
        toast({
          title: following ? "Unfollowed" : "Following",
          description: following
            ? "You've unfollowed this business"
            : "You're now following this business",
        });
      }
    } catch (err) {
      console.error("Failed to toggle follow:", err);
    } finally {
      setTogglingFollow(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Business not found</h1>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Banner */}
      <div className="relative h-64 md:h-80 bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10">     
        {business.banner_image ? (
          <img
            src={business.banner_image}
            alt={`${business.business_name} banner`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Store className="h-24 w-24 text-muted-foreground/40" />
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Business Info */}
        <Card className="mb-6 -mt-20 relative z-10 shadow-lg border-border/50">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{business.business_name}</h1>
                {business.primary_category_name && (
                  <Badge variant="secondary" className="mb-3 font-normal">
                    {business.primary_category_name}
                  </Badge>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                  {business.city && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {business.city}
                      {business.postcode && `, ${business.postcode}`}
                    </div>
                  )}
                  {business.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {business.phone}
                    </div>
                  )}
                </div>
                {business.business_address && (
                  <p className="text-sm text-muted-foreground mb-4">{business.business_address}</p>
                )}
                <div className="flex items-center gap-4">
                  <Badge variant="secondary" className="gap-1">
                    <Heart className="h-3 w-3" />
                    {business.follower_count || 0} followers
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                {isAuthenticated && user?.role === "customer" && (
                  <Button
                    onClick={handleFollow}
                    disabled={togglingFollow}
                    variant={following ? "outline" : "default"}
                  >
                    <Heart className={`h-4 w-4 mr-2 ${following ? "fill-current" : ""}`} />
                    {following ? "Following" : "Follow"}
                  </Button>
                )}
                     {/* Back Button - Floating in top-left corner */}
                {isOwner && (
                <Link href="/business/dashboard">
                    <Button 
                    variant="outline" 
                    className= "bg-background/80 hover:bg-background"
                    >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back
                    </Button>
                </Link>
                )}
                <Button variant="outline">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Posts Feed */}
        {posts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-foreground">Updates</h2>
            <div className="space-y-4">
              {posts.map((post) => (
                <Card key={post.id} className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <p className="whitespace-pre-wrap mb-4">{post.content}</p>
                    {post.images && post.images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {post.images.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt={`Post image ${idx + 1}`}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-4">
                      {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Products */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-foreground">Products</h2>
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <Card className="border-border/50">
              <CardContent className="pt-6 text-center text-muted-foreground">
                No products available
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}