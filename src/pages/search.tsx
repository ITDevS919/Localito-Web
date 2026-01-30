import { useEffect, useState, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { ProductCard } from "@/components/product/ProductCard";
import { ServiceCard } from "@/components/product/ServiceCard";
import { type Product } from "@/lib/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Filter, MapPin, Loader2, Search, Navigation } from "lucide-react";
import { useLocation } from "wouter";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
interface Category {
  id: string;
  name: string;
  description: string | null;
}

export default function SearchPage() {
  const [location, setLocation] = useLocation();
  
  // Extract URL params using useMemo to prevent recreation
  // Get query string from window.location to ensure we get the full URL
  const { query, locationQuery } = useMemo(() => {
    // Use window.location.search to get the query string directly
    const searchParams = new URLSearchParams(window.location.search);
    const extracted = {
      query: searchParams.get("q") || "",
      locationQuery: searchParams.get("loc") || "",
    };
    console.log("[SearchPage] URL params extracted:", { 
      location,
      windowLocationSearch: window.location.search,
      extracted 
    });
    return extracted;
  }, [location]);
  
  // Filter states
  const [searchInput, setSearchInput] = useState(query);
  const [filterLocation, setFilterLocation] = useState(locationQuery);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortBy, setSortBy] = useState("featured");
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "products" | "services">("all");

  // Use my location (geolocation) for nearest/furthest
  const [useMyLocation, setUseMyLocation] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/categories`);
        const data = await res.json();
        if (res.ok && data.success) {
          setCategories(data.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Update local state when URL params change
  useEffect(() => {
    setSearchInput(query);
    setFilterLocation(locationQuery);
  }, [query, locationQuery]);

  // Use my location: request geolocation when toggle is turned on
  const handleUseMyLocationChange = (checked: boolean) => {
    if (!checked) {
      setUseMyLocation(false);
      setUserCoords(null);
      setLocationError(null);
      return;
    }
    setLocationError(null);
    setIsLoadingLocation(true);
    if (!navigator.geolocation) {
      setLocationError("Location not supported by your browser");
      setIsLoadingLocation(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
        setUseMyLocation(true);
        setLocationError(null);
        setIsLoadingLocation(false);
      },
      (err) => {
        setUseMyLocation(false);
        setUserCoords(null);
        setLocationError(err.code === 1 ? "Location denied" : "Location unavailable");
        setIsLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  // Reset distance sort when "Use my location" is turned off
  useEffect(() => {
    if (!userCoords && (sortBy === "distance-nearest" || sortBy === "distance-furthest")) {
      setSortBy("featured");
    }
  }, [userCoords, sortBy]);
  
  // Listen for URL changes (browser back/forward, direct navigation)
  useEffect(() => {
    const handlePopState = () => {
      console.log("[SearchPage] PopState event - URL changed");
      // Force re-extraction of URL params
      const searchParams = new URLSearchParams(window.location.search);
      const newQuery = searchParams.get("q") || "";
      const newLocationQuery = searchParams.get("loc") || "";
      console.log("[SearchPage] New URL params from popstate:", { newQuery, newLocationQuery });
      setSearchInput(newQuery);
      setFilterLocation(newLocationQuery);
    };
    
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Fetch products when URL params or user location change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (query && query.trim()) {
          params.append("search", query.trim());
        }
        // Use lat/lng/radius when "Use my location" is on; otherwise text location
        if (userCoords) {
          params.append("latitude", String(userCoords.lat));
          params.append("longitude", String(userCoords.lng));
          params.append("radiusKm", "50"); // 50 km default radius for "near me"
        } else if (locationQuery && locationQuery.trim()) {
          params.append("location", locationQuery.trim());
          params.append("radiusKm", "0");
        }

        const apiUrl = `${API_BASE_URL}/products${params.toString() ? `?${params.toString()}` : ""}`;
        
        const res = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error("[SearchPage] API error response:", errorText);
          throw new Error(`API error: ${res.status} ${res.statusText}`);
        }
        
        const data = await res.json();
        
        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to load products");
        }
        if (Array.isArray(data.data) && data.data.length > 0) {
          setProducts(
            data.data.map((p: any) => ({
              id: p.id,
              name: p.name,
              price: parseFloat(p.price) || 0,
              business: p.business_name || "Business",
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
      } catch (err: any) {
        console.error("[SearchPage] API error:", err);
          setError(err.message);
          setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchServices = async () => {
      setLoadingServices(true);
      try {
        const params = new URLSearchParams();
        if (query && query.trim()) {
          params.append("search", query.trim());
        }
        
        const apiUrl = `${API_BASE_URL}/services${params.toString() ? `?${params.toString()}` : ""}`;
        const res = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.data)) {
            // Transform API data to match ServiceCard interface
            const transformedServices = data.data.map((s: any) => ({
              id: s.id,
              name: s.name || "",
              description: s.description || "",
              price: parseFloat(s.price) || 0,
              category: s.category || "",
              images: Array.isArray(s.images) ? s.images : (s.images ? [s.images] : []),
              duration_minutes: parseInt(s.duration_minutes) || 60,
              business_name: s.business_name || s.retailer_name || "Business",
              retailer_name: s.business_name || s.retailer_name || "Business", // Legacy support
              business_id: s.business_id || s.retailer_id || "",
              retailer_id: s.business_id || s.retailer_id || "", // Legacy support
              reviewCount: s.review_count || s.reviewCount || 0,
              averageRating: s.average_rating || s.averageRating || 0,
            }));
            setServices(transformedServices);
          } else {
            setServices([]);
          }
        }
      } catch (err) {
        console.error("Failed to load services:", err);
        setServices([]);
      } finally {
        setLoadingServices(false);
      }
    };

    fetchProducts();
    fetchServices();
  }, [query, locationQuery, location, API_BASE_URL, userCoords]);

  // Handle category toggle
  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Build search URL from current state
  const buildSearchUrl = (overrides?: { q?: string; loc?: string; categories?: string[] }) => {
    const params = new URLSearchParams();
    const q = overrides?.q !== undefined ? overrides.q : searchInput.trim();
    const loc = overrides?.loc !== undefined ? overrides.loc : filterLocation.trim();
    const cats = overrides?.categories ?? selectedCategories;
    if (q) params.append("q", q);
    if (loc) params.append("loc", loc);
    if (cats.length > 0) params.append("categories", cats.join(","));
    const queryString = params.toString();
    return `/search${queryString ? `?${queryString}` : ""}`;
  };

  const handleMarketplaceSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLocation(buildSearchUrl());
  };

  const handleApplyFilters = () => {
    setLocation(buildSearchUrl());
  };

  // Quick filter pills: apply sort or price in one click
  const handleQuickFilter = (filter: "nearest" | "top-rated" | "under-50") => {
    if (filter === "nearest") {
      setSortBy("distance-nearest");
      if (!userCoords) handleUseMyLocationChange(true);
    } else if (filter === "top-rated") {
      setSortBy("rating");
    } else if (filter === "under-50") {
      setPriceRange([0, 50]);
    }
  };

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];
    // Apply category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(p => 
        selectedCategories.some(catId => {
          const cat = categories.find(c => c.id === catId);
          return cat && p.category === cat.name;
        })
      );
    }


    // Apply price filter
    filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Apply sorting
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        filtered.sort((a, b) => {
          const aNew = a.isNew ? 1 : 0;
          const bNew = b.isNew ? 1 : 0;
          return bNew - aNew;
        });
        break;
      case "distance-nearest":
        // API already returns nearest first when using user location; keep order
        break;
      case "distance-furthest":
        // Reverse so furthest first (when using "Use my location")
        if (userCoords) filtered.reverse();
        break;
      default: // featured
        break;
    }

    return filtered;
  }, [products, selectedCategories, priceRange, sortBy, userCoords]);

  console.log("Filtered and sorted products:", filteredAndSortedProducts);


  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-28 md:pt-32 pb-8">
        {/* Marketplace search bar - prominent, modern */}
        <form onSubmit={handleMarketplaceSearch} className="mb-10">
          <div className="rounded-2xl border border-border bg-card shadow-sm p-4 md:p-5 flex flex-col sm:flex-row gap-3 md:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search products and services..."
                className="pl-11 h-12 text-base border-0 bg-muted/50 focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
                aria-label="Search"
              />
            </div>
            <div className="flex-1 sm:max-w-[220px] relative">
              <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                placeholder="Postcode or city"
                className="pl-11 h-12 text-base border-0 bg-muted/50 focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
                aria-label="Location"
                disabled={useMyLocation}
              />
            </div>
            <Button type="submit" size="lg" className="h-12 px-8 bg-primary hover:bg-primary/90 rounded-xl shrink-0">
              <Search className="h-5 w-5 sm:mr-2" />
              <span className="hidden sm:inline">Search</span>
            </Button>
          </div>
          {/* Use my location toggle */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border/50 mt-2">
            <div className="flex items-center gap-2">
              <Switch
                id="use-my-location"
                checked={useMyLocation}
                onCheckedChange={handleUseMyLocationChange}
                disabled={isLoadingLocation}
              />
              <Label htmlFor="use-my-location" className="text-sm font-medium cursor-pointer flex items-center gap-1.5">
                <Navigation className="h-4 w-4 text-muted-foreground" />
                {isLoadingLocation ? "Getting location…" : useMyLocation ? "Using your location" : "Use my location"}
              </Label>
            </div>
            {locationError && (
              <span className="text-xs text-destructive" role="alert">{locationError}</span>
            )}
            {useMyLocation && (
              <span className="text-xs text-muted-foreground">Nearest first within 50 km — change sort to see furthest</span>
            )}
          </div>
        </form>

        {/* Results header with count and sort */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-primary">
              {query ? `Results for "${query}"` : "Marketplace"}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {products.length > 0 || services.length > 0 ? (
                locationQuery 
                  ? `${products.length + services.length} result${products.length + services.length !== 1 ? "s" : ""} near ${locationQuery}`
                  : `${products.length + services.length} result${products.length + services.length !== 1 ? "s" : ""}`
              ) : (
                locationQuery 
                  ? `No results near ${locationQuery}`
                  : "No results yet — try a search above"
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Sort by</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] rounded-lg border-border bg-background">
                <SelectValue placeholder="Featured" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                {userCoords && (
                  <>
                    <SelectItem value="distance-nearest">Nearest</SelectItem>
                    <SelectItem value="distance-furthest">Furthest</SelectItem>
                  </>
                )}
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Top Rated</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-4">
          {/* Sidebar Filters – modern layout */}
          <aside className="lg:col-span-1">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
              {/* Quick Filters – pill buttons */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  QUICK FILTERS
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickFilter("nearest")}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      sortBy === "distance-nearest" && userCoords
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    Nearest
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFilter("top-rated")}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      sortBy === "rating"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    Top Rated
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFilter("under-50")}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      priceRange[1] <= 50
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    Under £50
                  </button>
                </div>
              </div>

              {/* Price Range – match reference order */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  PRICE RANGE
                </h3>
                <Slider 
                  value={priceRange} 
                  onValueChange={(vals) => setPriceRange([vals[0], vals[1]])}
                  max={1000} 
                  step={1} 
                  min={0}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>£{priceRange[0]}</span>
                  <span>£{priceRange[1]}</span>
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  CATEGORIES
                </h3>
                {loadingCategories ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {categories.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No categories available</p>
                    ) : (
                      categories.map((cat) => (
                        <label
                          key={cat.id}
                          htmlFor={`cat-${cat.id}`}
                          className="flex items-center gap-2 cursor-pointer rounded-md py-1.5 -mx-1 px-1 hover:bg-muted/50"
                        >
                          <Checkbox 
                            id={`cat-${cat.id}`}
                            checked={selectedCategories.includes(cat.id)}
                            onCheckedChange={() => handleCategoryToggle(cat.id)}
                          />
                          <span className="text-sm font-medium select-none">{cat.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Location */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  LOCATION
                </h3>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-9 h-10 rounded-lg border-border bg-muted/30"
                    placeholder="e.g. SW1A 1AA or London"
                    value={filterLocation}
                    onChange={(e) => setFilterLocation(e.target.value)}
                    disabled={useMyLocation}
                  />
                </div>
              </div>

              <Button 
                type="button"
                onClick={handleApplyFilters}
                className="w-full bg-primary cursor-pointer"
              >
                Apply Filters
              </Button>
            </div>
          </aside>

          {/* Results Grid */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="all">
                  All ({products.length + services.length})
                </TabsTrigger>
                <TabsTrigger value="products">
                  Products ({products.length})
                </TabsTrigger>
                <TabsTrigger value="services">
                  Services ({services.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-0">
                {(loading || loadingServices) && (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                )}
                {error && (
                  <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
                    {error}
                  </div>
                )}
                {!loading && !loadingServices && !error && (
                  <>
                    {products.length === 0 && services.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <p className="text-lg font-semibold text-muted-foreground">No results found</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Try adjusting your search or filters
                        </p>
                      </div>
                    ) : (
                      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredAndSortedProducts.map((product, index) => (
                          <ProductCard key={`product-${product.id}-${index}`} product={product} />
                        ))}
                        {services.map((service, index) => (
                          <ServiceCard key={`service-${service.id}-${index}`} service={service} />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </TabsContent>

              <TabsContent value="products" className="mt-0">
                {loading && (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                )}
                {error && (
                  <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
                    {error}
                  </div>
                )}
                {!loading && !error && (
                  <>
                    {products.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <p className="text-lg font-semibold text-muted-foreground">No products found</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Try adjusting your search or filters
                        </p>
                      </div>
                    ) : (
                      <>
                        {filteredAndSortedProducts.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12 text-center">
                            <p className="text-lg font-semibold text-muted-foreground">No products match your filters</p>
                            <p className="text-sm text-muted-foreground mt-2">
                              Try adjusting your filters
                            </p>
                          </div>
                        ) : (
                          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredAndSortedProducts.map((product, index) => (
                              <ProductCard key={`product-${product.id}-${index}`} product={product} />
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </TabsContent>

              <TabsContent value="services" className="mt-0">
                {loadingServices && (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                )}
                {!loadingServices && (
                  <>
                    {services.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <p className="text-lg font-semibold text-muted-foreground">No services found</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Try adjusting your search
                        </p>
                      </div>
                    ) : (
                      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {services.map((service, index) => (
                          <ServiceCard key={`service-${service.id}-${index}`} service={service} />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
