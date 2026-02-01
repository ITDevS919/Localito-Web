import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle2, 
  Store, 
  MapPin, 
  Phone, 
  CreditCard, 
  Package, 
  Wallet,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Info
} from "lucide-react";
import { useRequireRole } from "@/hooks/useRequireRole";
import { useAuth } from "@/contexts/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface Category {
  id: string;
  name: string;
  description: string | null;
}

interface OnboardingStatus {
  profileComplete: boolean;
  squareConnected: boolean;
  hasProducts: boolean;
  stripeSetup: boolean;
  onboardingCompletedAt: string | null;
  allComplete: boolean;
}

export default function BusinessOnboardingPage() {
  useRequireRole("business", "/login/business");
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  
  // Step 1: Business details
  const [formData, setFormData] = useState({
    businessName: "",
    businessAddress: "",
    postcode: "",
    city: "",
    phone: "",
    businessType: "" as "product" | "service" | "",
    primaryCategoryId: "" as string,
  });
  const [categories, setCategories] = useState<Category[]>([]);

  // Step 2: Square
  const [squareData, setSquareData] = useState({
    accessToken: "",
    locationId: "",
  });

  const totalSteps = 4;

  useEffect(() => {
    loadOnboardingStatus();
  }, []);

  const loadOnboardingStatus = async () => {
    try {
      // Load onboarding status
      const statusRes = await fetch(`${API_BASE_URL}/business/onboarding-status`, {
        credentials: "include",
      });
      const statusData = await statusRes.json();
      if (statusRes.ok && statusData.success) {
        setStatus(statusData.data);
        
        // If already completed onboarding, redirect to dashboard
        if (statusData.data.onboardingCompletedAt) {
          setLocation("/business/dashboard");
          return;
        }
      }

      // Load business profile
      const profileRes = await fetch(`${API_BASE_URL}/business/profile`, {
        credentials: "include",
      });
      const profileData = await profileRes.json();
      if (profileRes.ok && profileData.success) {
        const business = profileData.data;
        setFormData({
          businessName: business.business_name || "",
          businessAddress: business.business_address || "",
          postcode: business.postcode || "",
          city: business.city || "",
          phone: business.phone || "",
          businessType: business.business_type || "",
          primaryCategoryId: business.primary_category_id || "",
        });
        
        // If business_type is already set, load categories for that type
        if (business.business_type) {
          await loadCategories(business.business_type);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async (type: "product" | "service") => {
    try {
      const catRes = await fetch(`${API_BASE_URL}/categories?for=${type}`);
      const catData = await catRes.json();
      if (catRes.ok && catData.success && Array.isArray(catData.data)) {
        setCategories(catData.data);
      }
    } catch (err: any) {
      console.error("Failed to load categories:", err);
    }
  };

  const handleSaveProfile = async () => {
    if (!formData.businessName.trim()) {
      setError("Business name is required");
      return false;
    }
    if (!formData.postcode.trim() && !formData.city.trim()) {
      setError("Please provide either postcode or city");
      return false;
    }
    if (!formData.businessType) {
      setError("Please select your business type (Products/Retail or Services)");
      return false;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/business/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          primaryCategoryId: formData.primaryCategoryId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save profile");
      }
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleConnectSquare = async () => {
    if (!squareData.accessToken.trim() || !squareData.locationId.trim()) {
      setError("Please enter both access token and location ID");
      return false;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/business/square/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(squareData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to connect Square");
      }
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    setError(null);

    if (currentStep === 1) {
      const saved = await handleSaveProfile();
      if (!saved) return;
    } else if (currentStep === 2 && squareData.accessToken && squareData.locationId) {
      const connected = await handleConnectSquare();
      if (!connected) return;
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      await handleFinish();
    }
  };

  const handleSkip = () => {
    setError(null);
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    try {
      await fetch(`${API_BASE_URL}/business/onboarding-complete`, {
        method: "POST",
        credentials: "include",
      });
      
      // Clear tour flag if present
      localStorage.removeItem("localito_show_business_tour");
      
      setLocation("/business/dashboard");
    } catch (err: any) {
      console.error("Error marking onboarding complete:", err);
      setLocation("/business/dashboard");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Welcome to Localito!</h1>
          <p className="text-muted-foreground">Let's get your business set up in just a few steps</p>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step Content */}
        <Card>
          <CardHeader>
            {currentStep === 1 && (
              <>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Business Details
                </CardTitle>
                <CardDescription>
                  Tell us about your business so customers can find you
                </CardDescription>
              </>
            )}
            {currentStep === 2 && (
              <>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Square Integration (Optional)
                </CardTitle>
                <CardDescription>
                  Connect your Square POS for automatic stock synchronization
                </CardDescription>
              </>
            )}
            {currentStep === 3 && (
              <>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Add Your First Product
                </CardTitle>
                <CardDescription>
                  List products so customers can discover and buy from you
                </CardDescription>
              </>
            )}
            {currentStep === 4 && (
              <>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Set Up Payouts
                </CardTitle>
                <CardDescription>
                  Connect Stripe to receive instant payouts when customers pick up orders
                </CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Step 1: Business Details */}
            {currentStep === 1 && (
              <>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Required:</strong> Business type, business name, and either postcode or city. Address and phone help customers reach you.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name *</Label>
                    <div className="relative">
                      <Store className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="businessName"
                        className="pl-9"
                        placeholder="e.g. Pollen Bakery"
                        value={formData.businessName}
                        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>What type of business do you operate? *</Label>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, businessType: "product", primaryCategoryId: "" });
                          loadCategories("product");
                        }}
                        className={`flex-1 p-4 border-2 rounded-lg text-left transition-all ${
                          formData.businessType === "product"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              formData.businessType === "product"
                                ? "border-primary"
                                : "border-muted-foreground"
                            }`}
                          >
                            {formData.businessType === "product" && (
                              <div className="w-2 h-2 rounded-full bg-primary" />
                            )}
                          </div>
                          <span className="font-medium">Products/Retail</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 ml-6">
                          Physical goods, merchandise, food & drink, etc.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, businessType: "service", primaryCategoryId: "" });
                          loadCategories("service");
                        }}
                        className={`flex-1 p-4 border-2 rounded-lg text-left transition-all ${
                          formData.businessType === "service"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              formData.businessType === "service"
                                ? "border-primary"
                                : "border-muted-foreground"
                            }`}
                          >
                            {formData.businessType === "service" && (
                              <div className="w-2 h-2 rounded-full bg-primary" />
                            )}
                          </div>
                          <span className="font-medium">Services</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 ml-6">
                          Cleaning, hair, massage, repairs, consultations, etc.
                        </p>
                      </button>
                    </div>
                  </div>

                  {formData.businessType && (
                    <div className="space-y-2">
                      <Label>Business category (optional)</Label>
                      <Select
                        value={formData.primaryCategoryId || "none"}
                        onValueChange={(v) => setFormData({ ...formData, primaryCategoryId: v === "none" ? "" : v })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        {formData.businessType === "product" 
                          ? "e.g. Food & Drink, Fashion, Books"
                          : "e.g. Cleaners, Hairdressers, Massage Therapists"}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="businessAddress">Business Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="businessAddress"
                        className="pl-9"
                        placeholder="e.g. 123 High Street"
                        value={formData.businessAddress}
                        onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="postcode">Postcode *</Label>
                      <Input
                        id="postcode"
                        placeholder="e.g. M1 1AA"
                        value={formData.postcode}
                        onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        placeholder="e.g. Manchester"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="phone"
                        className="pl-9"
                        type="tel"
                        placeholder="e.g. 0161 234 5678"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Square Integration */}
            {currentStep === 2 && (
              <>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    This step is optional. You can connect Square now or skip and set it up later in Settings.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="accessToken">Square Access Token</Label>
                    <Input
                      id="accessToken"
                      placeholder="Enter your Square API access token"
                      value={squareData.accessToken}
                      onChange={(e) => setSquareData({ ...squareData, accessToken: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      You can find this in your Square Developer Dashboard
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="locationId">Square Location ID</Label>
                    <Input
                      id="locationId"
                      placeholder="Enter your Square location ID"
                      value={squareData.locationId}
                      onChange={(e) => setSquareData({ ...squareData, locationId: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      The location ID where your inventory is managed
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Step 3: Products */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="rounded-lg border p-6 text-center space-y-4">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="font-semibold mb-2">Ready to add your products?</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Head to the Products page to add your first listing. The more products you add, the more customers can discover your business.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        localStorage.setItem("localito_return_to_onboarding", "true");
                        setLocation("/business/products");
                      }}
                    >
                      <Package className="mr-2 h-4 w-4" />
                      Go to Products
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Or skip for now and add products later
                  </p>
                </div>

                {status?.hasProducts && (
                  <Alert className="border-green-500 bg-green-50">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Great! You've added products. You can add more anytime from the Products page.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Step 4: Payouts */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="rounded-lg border p-6 text-center space-y-4">
                  <Wallet className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="font-semibold mb-2">Connect Stripe for Payouts</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Set up Stripe to receive instant payouts when customers pick up their orders. This is required to accept payments.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        localStorage.setItem("localito_return_to_onboarding", "true");
                        setLocation("/business/payouts");
                      }}
                    >
                      <Wallet className="mr-2 h-4 w-4" />
                      Set Up Stripe
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Or skip for now and set up payments later
                  </p>
                </div>

                {status?.stripeSetup && (
                  <Alert className="border-green-500 bg-green-50">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Perfect! Your Stripe account is set up and ready to receive payments.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={currentStep === 1 || saving}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>

              <div className="flex gap-2">
                {currentStep < totalSteps && (
                  <Button
                    variant="outline"
                    onClick={handleSkip}
                    disabled={saving}
                  >
                    Skip
                  </Button>
                )}
                
                <Button onClick={handleNext} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : currentStep === totalSteps ? (
                    <>
                      Go to Dashboard
                      <CheckCircle2 className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
