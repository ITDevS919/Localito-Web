


import { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Store, MapPin, Phone, Heart, Share2, Image as ImageIcon, ArrowLeft, ChevronLeft } from "lucide-react";
import { BusinessLocationMap } from "@/components/location/BusinessLocationMap";
import { ProductCard } from "@/components/product/ProductCard";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/lib/product";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface BusinessProfile {
  id: string;
  business_name: string;
  username?: string;
  primary_category_name?: string;
  business_address?: string;
  postcode?: string;
  city?: string;
  phone?: string;
  latitude?: number | null;
  longitude?: number | null;
  banner_image?: string;
  follower_count: number;
  isFollowing?: boolean;
  is_approved?: boolean;
  is_suspended?: boolean;
}

interface BusinessPost {
  id: string;
  content: string;
  images: string[];
  created_at: string;
}

const isUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

export default function BusinessProfilePage() {
  const { businessId } = useParams();
  const [, setLocation] = useLocation();
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
    }
  }, [businessId, user]);

  const fetchBusinessProfile = async () => {
    try {
      // If user is admin, try admin endpoint first for unapproved businesses
      let res;
      if (isAuthenticated && user?.role === "admin") {
        try {
          res = await fetch(`${API_BASE_URL}/admin/businesses/${businessId}`, {
            credentials: "include",
          });
          const adminData = await res.json();
          if (res.ok && adminData.success) {
            // Transform admin business data to match BusinessProfile interface
            const biz = {
              id: adminData.data.id,
              business_name: adminData.data.business_name,
              username: adminData.data.username,
              primary_category_name: null,
              business_address: adminData.data.business_address,
              postcode: adminData.data.postcode,
              city: adminData.data.city,
              phone: adminData.data.phone,
              banner_image: undefined,
              follower_count: 0,
              isFollowing: false,
              is_approved: adminData.data.is_approved,
              is_suspended: adminData.data.is_suspended,
            };
            setBusiness(biz);
            setFollowing(false);
            fetchPosts(biz.id);
            fetchProducts(biz.id);
            if (biz.username && businessId && isUuid(businessId)) {
              window.history.replaceState(null, "", `/business/${biz.username}`);
            }
            return;
          }
        } catch (adminErr) {
          // Fall through to public endpoint
          console.log("Admin endpoint failed, trying public endpoint");
        }
      }
      
      // Try public endpoint
      res = await fetch(`${API_BASE_URL}/business/${businessId}/public`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const biz = data.data;
        setBusiness(biz);
        setFollowing(biz.isFollowing || false);
        fetchPosts(biz.id);
        fetchProducts(biz.id);
        if (biz.username && businessId && isUuid(businessId)) {
          window.history.replaceState(null, "", `/business/${biz.username}`);
        }
        if (isAuthenticated && user?.role === "business") {
          const profileRes = await fetch(`${API_BASE_URL}/business/profile`, { credentials: "include" });
          const profileData = await profileRes.json();
          if (profileRes.ok && profileData.success) setIsOwner(profileData.data.id === biz.id);
        }
      } else if (!res.ok && isAuthenticated && user?.role === "admin") {
        // If public endpoint fails and user is admin, try admin endpoint as fallback
        const adminRes = await fetch(`${API_BASE_URL}/admin/businesses/${businessId}`, {
          credentials: "include",
        });
        const adminData = await adminRes.json();
        if (adminRes.ok && adminData.success) {
          const biz = {
            id: adminData.data.id,
            business_name: adminData.data.business_name,
            username: adminData.data.username,
            primary_category_name: null,
            business_address: adminData.data.business_address,
            postcode: adminData.data.postcode,
            city: adminData.data.city,
            phone: adminData.data.phone,
            banner_image: undefined,
            follower_count: 0,
            isFollowing: false,
            is_approved: adminData.data.is_approved,
            is_suspended: adminData.data.is_suspended,
          };
          setBusiness(biz);
          setFollowing(false);
          fetchPosts(biz.id);
          fetchProducts(biz.id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch business profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async (resolvedId: string) => {
    const id = resolvedId || business?.id;
    if (!id) return;
    try {
      const res = await fetch(`${API_BASE_URL}/business/${id}/posts`);
      const data = await res.json();
      if (res.ok && data.success) {
        setPosts(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    }
  };

  const fetchProducts = async (resolvedId: string) => {
    const id = resolvedId || business?.id;
    if (!id) return;
    try {
      // Admins see all products, customers see only approved
      const isAdmin = user?.role === "admin";
      const approvalParam = isAdmin ? "" : "&isApproved=true";
      
      const res = await fetch(`${API_BASE_URL}/products?businessId=${id}${approvalParam}`);
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

  const handleShare = async () => {
    if (!business || !business.business_name) return;
    const slug = business.username || business.id;
    const url = `${window.location.origin}/business/${slug}`;
    const title = `${business.business_name} on Localito`;
    const text = `Check out ${business.business_name} on Localito`;

    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text,
          url,
        });
        toast({ title: "Shared", description: "Link shared successfully" });
      } else {
        await navigator.clipboard.writeText(url);
        toast({ title: "Link copied", description: "Profile link copied to clipboard" });
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        await navigator.clipboard.writeText(url).catch(() => {});
        toast({ title: "Link copied", description: "Profile link copied to clipboard" });
      }
    }
  };

  const handleFollowClick = () => {
    if (!isAuthenticated || user?.role !== "customer") {
      toast({
        title: "Log in to follow",
        description: "Log in to follow this shop and see their updates.",
      });
      const returnPath = `/business/${business?.username || business?.id || businessId}`;
      setLocation(`/login?redirect=${encodeURIComponent(returnPath)}`);
      return;
    }
    handleFollow();
  };

  const handleFollow = async () => {
    if (!business) return;

    setTogglingFollow(true);
    try {
      const method = following ? "DELETE" : "POST";
      const res = await fetch(`${API_BASE_URL}/business/${business.id}/follow`, {
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
                <h1 className="text-3xl font-bold mb-1">{business.business_name || "Business"}</h1>
                {business.username && (
                  <p className="text-sm text-muted-foreground mb-2">@{business.username}</p>
                )}
                <div className="flex items-center gap-2 mb-3">
                  {business.primary_category_name && (
                    <Badge variant="secondary" className="font-normal">
                      {business.primary_category_name}
                    </Badge>
                  )}
                  {user?.role === "admin" && business.is_suspended && (
                    <Badge className="bg-red-600">Suspended</Badge>
                  )}
                  {user?.role === "admin" && !business.is_approved && (
                    <Badge className="bg-yellow-600">Pending Approval</Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                  {(business.business_address || business.city || business.postcode) && (
                    <div className="w-full">
                      <BusinessLocationMap
                        business_address={business.business_address}
                        city={business.city}
                        postcode={business.postcode}
                        latitude={business.latitude}
                        longitude={business.longitude}
                        businessName={business.business_name}
                        showEmbed={true}
                      />
                    </div>
                  )}
                  {business.phone && (
                    <a
                      href={`tel:${business.phone.replace(/\s/g, "")}`}
                      className="flex items-center gap-1 hover:text-primary hover:underline focus:underline"
                    >
                      <Phone className="h-4 w-4 shrink-0" />
                      {business.phone}
                    </a>
                  )}
                </div>
                {/* Vinted-like: followers + Follow always visible (except owner) */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="text-sm text-muted-foreground">
                    <Heart className="h-4 w-4 inline-block align-middle mr-1 text-muted-foreground" />
                    {business.follower_count ?? 0} followers
                  </span>
                  {!isOwner && (
                    <Button
                      onClick={handleFollowClick}
                      disabled={isAuthenticated && user?.role === "customer" && togglingFollow}
                      variant={following ? "outline" : "default"}
                      size="sm"
                      className="shrink-0"
                    >
                      <Heart className={`h-4 w-4 mr-2 ${following ? "fill-current" : ""}`} />
                      {togglingFollow && isAuthenticated && user?.role === "customer"
                        ? "..."
                        : following
                          ? "Following"
                          : "Follow"}
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {isOwner && (
                  <Link href="/business/dashboard">
                    <Button variant="outline" className="bg-background/80 hover:bg-background">
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                  </Link>
                )}
                <Button variant="outline" onClick={handleShare}>
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