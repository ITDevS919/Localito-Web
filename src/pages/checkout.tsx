import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, Tag, Coins, CheckCircle2, X, Calendar, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  name: string;
  price: number;
  images: string[];
  stock: number;
  business_name: string;
  business_id: string;
}

interface CartServiceItem {
  id: string;
  service_id: string;
  quantity: number;
  name: string;
  price: number;
  images: string[];
  category: string;
  duration_minutes: number;
  business_name: string;
  business_id: string;
}

interface OrderGroup {
  business_id: string;
  business_name: string;
  items: CartItem[];
  subtotal: number;
}

interface ServiceGroup {
  business_id: string;
  business_name: string;
  items: CartServiceItem[];
  subtotal: number;
}

interface UserPoints {
  balance: number;
  totalEarned: number;
  totalRedeemed: number;
}

export default function CheckoutPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<CartItem[]>([]);
  const [serviceItems, setServiceItems] = useState<CartServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; amount: number } | null>(null);
  const [validatingDiscount, setValidatingDiscount] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  // Support per-business bookings for services
  const [businessBookings, setBusinessBookings] = useState<Record<string, { date: string; time: string }>>({});
  // Backward compatibility: single booking (for when all services are from one business)
  const [bookingDate, setBookingDate] = useState<string>("");
  const [bookingTime, setBookingTime] = useState<string>("");
  const [lockingSlot, setLockingSlot] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.username || "",
    email: user?.email || "",
    pickupInstructions: "",
  });
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancellingOrders, setCancellingOrders] = useState(false);
  const hasPendingOrders = useRef(false);
  const isNavigatingAway = useRef(false);

  useEffect(() => {
    loadCart();
    if (user) {
      loadUserPoints();
      // Auto-fill form fields if they're empty and user data is available
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.username || "",
        email: prev.email || user.email || "",
      }));
    }
    
    // Check for canceled payment query parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('canceled') === 'true') {
      toast({
        title: "Payment canceled",
        description: "Your payment was canceled. You can try again or continue shopping.",
        variant: "destructive",
      });
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }

    // Check if we have pending orders from sessionStorage
    const pendingOrders = sessionStorage.getItem('pendingOrderIds');
    if (pendingOrders) {
      try {
        const orderIds = JSON.parse(pendingOrders);
        if (orderIds.length > 0) {
          hasPendingOrders.current = true;
        }
      } catch (e) {
        // Invalid JSON, ignore
      }
    }

    // Back button detection using popstate
    const handlePopState = (e: PopStateEvent) => {
      if (hasPendingOrders.current && !isNavigatingAway.current) {
        e.preventDefault();
        setShowCancelDialog(true);
        // Push state back to prevent navigation
        window.history.pushState(null, '', window.location.href);
      }
    };

    // Before unload warning
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasPendingOrders.current && !isNavigatingAway.current) {
        e.preventDefault();
        e.returnValue = 'You have pending orders. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Push state to track back button
    window.history.pushState(null, '', window.location.href);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user]);

  const loadCart = async () => {
    try {
      // Load product cart items
      const res = await fetch(`${API_BASE_URL}/cart`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to load cart");
      setItems(data.data);

      // Load service cart items
      const serviceRes = await fetch(`${API_BASE_URL}/cart/services`, { credentials: "include" });
      const serviceData = await serviceRes.json();
      if (serviceRes.ok && serviceData.success) {
        // Ensure business_id is present in each service item
        const services = (serviceData.data || []).map((item: any) => ({
          ...item,
          business_id: item.business_id || item.businessId || '',
        }));
        setServiceItems(services);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadUserPoints = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/user/points`, { credentials: "include" });
      const data = await res.json();
      if (res.ok && data.success) {
        setUserPoints(data.data);
      }
    } catch (err) {
      console.error("Failed to load user points:", err);
    }
  };

  const handleValidateDiscount = async () => {
    if (!discountCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a discount code",
        variant: "destructive",
      });
      return;
    }

    setValidatingDiscount(true);
    try {
      const total =
        items.reduce((sum, i) => sum + i.price * i.quantity, 0) +
        serviceItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const businessIds = [
        ...new Set([
          ...items.map((i) => i.business_id),
          ...serviceItems.map((i) => i.business_id),
        ]),
      ];
      const businessTotals: Record<string, number> = {};
      items.forEach((i) => {
        businessTotals[i.business_id] = (businessTotals[i.business_id] || 0) + i.price * i.quantity;
      });
      serviceItems.forEach((i) => {
        businessTotals[i.business_id] = (businessTotals[i.business_id] || 0) + i.price * i.quantity;
      });
      const res = await fetch(`${API_BASE_URL}/discount-codes/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          code: discountCode.trim(),
          orderTotal: total,
          businessIds,
          businessTotals,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.data.valid) {
        setAppliedDiscount({
          code: discountCode.trim().toUpperCase(),
          amount: data.data.discount.amount,
        });
        toast({
          title: "Discount applied",
          description: `You saved £${data.data.discount.amount.toFixed(2)}!`,
        });
      } else {
        toast({
          title: "Invalid code",
          description: data.data?.message || "This discount code is not valid",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to validate discount code",
        variant: "destructive",
      });
    } finally {
      setValidatingDiscount(false);
    }
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode("");
  };

  const handleMaxPoints = () => {
    if (userPoints && userPoints.balance > 0) {
      const total = orderGroups.reduce((sum, group) => sum + group.subtotal, 0);
      const discountAmount = appliedDiscount?.amount || 0;
      const maxRedeemable = Math.min(userPoints.balance, total - discountAmount);
      setPointsToRedeem(maxRedeemable);
    }
  };

  // Group items by business
  const orderGroups: OrderGroup[] = items.reduce((groups, item) => {
    const businessId = item.business_id;
    const existingGroup = groups.find((g) => g.business_id === businessId);

    if (existingGroup) {
      existingGroup.items.push(item);
      existingGroup.subtotal += item.price * item.quantity;
    } else {
      groups.push({
        business_id: businessId,
        business_name: item.business_name,
        items: [item],
        subtotal: item.price * item.quantity,
      });
    }

    return groups;
  }, [] as OrderGroup[]);

  // Group services by business
  const serviceGroups = serviceItems.reduce((groups, item) => {
    const businessId = item.business_id;
    const existingGroup = groups.find((g) => g.business_id === businessId);

    if (existingGroup) {
      existingGroup.items.push(item);
      existingGroup.subtotal += item.price * item.quantity;
    } else {
      groups.push({
        business_id: businessId,
        business_name: item.business_name,
        items: [item],
        subtotal: item.price * item.quantity,
      });
    }

    return groups;
  }, [] as ServiceGroup[]);

  // Calculate service subtotal
  const serviceSubtotal = serviceItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const subtotal = orderGroups.reduce((sum, group) => sum + group.subtotal, 0) + serviceSubtotal;

  // All businesses that need a date/time (booking for services, pickup for products)
  const allCheckoutBusinessIds = new Set([
    ...orderGroups.map((g) => g.business_id),
    ...serviceGroups.map((g) => g.business_id),
  ]);
  const checkoutBusinesses = Array.from(allCheckoutBusinessIds).map((businessId) => {
    const orderGroup = orderGroups.find((g) => g.business_id === businessId);
    const serviceGroup = serviceGroups.find((g) => g.business_id === businessId);
    const hasProducts = !!orderGroup;
    const hasServices = !!serviceGroup;
    const durationMinutes = serviceGroup
      ? Math.max(...serviceGroup.items.map((item) => item.duration_minutes))
      : 30;
    const businessName = orderGroup?.business_name || serviceGroup?.business_name || "Business";
    return { businessId, businessName, hasProducts, hasServices, durationMinutes };
  });

  const uniqueServiceBusinesses = new Set(serviceItems.map((item) => item.business_id));
  const isSingleBusinessServices = uniqueServiceBusinesses.size === 1;
  const discountAmount = appliedDiscount?.amount || 0;
  const pointsDiscount = pointsToRedeem || 0;
  const total = Math.max(0, subtotal - discountAmount - pointsDiscount);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0 && serviceItems.length === 0) {
      setError("Your cart is empty");
      return;
    }

    if (!formData.fullName || !formData.email) {
      setError("Please fill in all required fields");
      return;
    }

    if (!validateEmail(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    // Check if total is zero (free order after discounts/points)
    if (total <= 0) {
      setError("Order total must be greater than zero. Please remove some discounts or points.");
      return;
    }

    // Validate date/time for all businesses (services = booking, products = pickup)
    const missingSlots: string[] = [];
    for (const { businessId, businessName, hasServices } of checkoutBusinesses) {
      const booking = businessBookings[businessId];
      const hasSlot = booking?.date && booking?.time;
      const legacySlot = checkoutBusinesses.length === 1 && bookingDate && bookingTime;
      if (!hasSlot && !legacySlot) {
        missingSlots.push(`${businessName} (${hasServices ? "booking" : "pickup"})`);
      }
    }
    if (missingSlots.length > 0) {
      setError(`Please select a date and time for: ${missingSlots.join(", ")}`);
      return;
    }

    // Lock service booking slots (product pickup slots are not locked)
    if (serviceItems.length > 0) {
      // Lock the booking slots before placing order
      setLockingSlot(true);
      try {
        for (const businessId of uniqueServiceBusinesses) {
          let bookingDateToUse: string;
          let bookingTimeToUse: string;

          // Get booking for this business
          if (businessBookings[businessId]) {
            bookingDateToUse = businessBookings[businessId].date;
            bookingTimeToUse = businessBookings[businessId].time;
          } else if (isSingleBusinessServices && bookingDate && bookingTime) {
            // Backward compatibility: use single booking
            bookingDateToUse = bookingDate;
            bookingTimeToUse = bookingTime;
          } else {
            throw new Error(`Booking date and time required for business ${businessId}`);
          }

          const lockRes = await fetch(`${API_BASE_URL}/bookings/lock`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              businessId,
              date: bookingDateToUse,
              time: bookingTimeToUse,
            }),
          });

          const lockData = await lockRes.json();
          if (!lockRes.ok || !lockData.success) {
            const businessName = serviceGroups.find(g => g.business_id === businessId)?.business_name || 'this business';
            throw new Error(lockData.message || `The selected time slot is no longer available for ${businessName}. Please choose another time.`);
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to lock booking slot");
        setLockingSlot(false);
        return;
      } finally {
        setLockingSlot(false);
      }
    }

    setPlacingOrder(true);
    setError(null);

    try {
      // Send date/time for every business (booking for services, pickup for products)
      const bookingData: Record<string, unknown> =
        Object.keys(businessBookings).length > 0
          ? { businessBookings }
          : checkoutBusinesses.length === 1 && bookingDate && bookingTime
            ? { bookingDate, bookingTime }
            : {};

      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          pickupInstructions: formData.pickupInstructions || null,
          discountCode: appliedDiscount?.code || null,
          pointsToRedeem: pointsToRedeem > 0 ? pointsToRedeem : null,
          ...bookingData,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create order");
      }

      // Show confirmation with booking or pickup time
      if (serviceItems.length > 0) {
        if (Object.keys(businessBookings).length > 0) {
          const bookingCount = Object.keys(businessBookings).length;
          toast({
            title: "Bookings Confirmed",
            description: `Your ${bookingCount} service ${bookingCount > 1 ? "bookings" : "booking"} ${bookingCount > 1 ? "have" : "has"} been confirmed. You'll receive a confirmation email shortly.`,
          });
        } else if (bookingDate && bookingTime) {
          toast({
            title: "Booking Confirmed",
            description: `Your service is booked for ${new Date(bookingDate).toLocaleDateString("en-GB", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })} at ${bookingTime}. You'll receive a confirmation email shortly.`,
          });
        }
      } else if (items.length > 0 && Object.keys(businessBookings).length > 0) {
        const first = Object.values(businessBookings)[0] as { date: string; time: string };
        if (first?.date && first?.time) {
          toast({
            title: "Order Confirmed",
            description: `Pickup: ${new Date(first.date).toLocaleDateString("en-GB", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })} at ${first.time}. You'll receive a confirmation email shortly.`,
          });
        }
      }

      // Store order IDs for back button tracking
      if (data.data.orders && Array.isArray(data.data.orders)) {
        const orderIds = data.data.orders.map((o: any) => o.id);
        sessionStorage.setItem('pendingOrderIds', JSON.stringify(orderIds));
        hasPendingOrders.current = true;
      }

      // Check if Stripe checkout is required
      if (data.data.checkoutSessions && data.data.checkoutSessions.length > 0) {
        // Handle multiple checkout sessions (multiple businesses)
        if (data.data.checkoutSessions.length > 1) {
          // Store remaining checkout sessions in sessionStorage for sequential processing
          const remainingSessions = data.data.checkoutSessions.slice(1);
          sessionStorage.setItem('pendingCheckoutSessions', JSON.stringify(remainingSessions));
          sessionStorage.setItem('completedOrderIds', JSON.stringify([]));
        }
        
        // Mark that we're navigating away (so back button handler doesn't trigger)
        isNavigatingAway.current = true;
        
        // Redirect to first Stripe Checkout
        const checkoutUrl = data.data.checkoutSessions[0].checkoutUrl;
        if (checkoutUrl) {
          window.location.href = checkoutUrl;
          return;
        } else {
          console.error('Checkout session created but URL is missing');
          setError("Payment processing error. Please contact support.");
          setPlacingOrder(false);
          return;
        }
      }

      // No Stripe checkout needed - this shouldn't happen for normal orders
      // Log a warning and show an error
      console.warn('Order created but no checkout session was created. This may indicate the business has not set up Stripe Connect.');
      
      // Get business names for better error message
      const businessNames = Array.from(new Set([
        ...orderGroups.map(g => g.business_name),
        ...serviceGroups.map(g => g.business_name)
      ]));
      
      setError(
        `Payment processing is not available for ${businessNames.length > 1 ? 'these businesses' : 'this business'}: ${businessNames.join(', ')}. ` +
        `The business${businessNames.length > 1 ? 'es need' : ' needs'} to complete Stripe Connect setup to accept payments. ` +
        `Please contact ${businessNames.length > 1 ? 'them' : 'the business'} directly or try again later.`
      );
      setPlacingOrder(false);
    } catch (err: any) {
      setError(err.message || "Failed to place order");
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="container mx-auto px-4 pt-28 md:pt-32 pb-10">
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  const handleCancelIncompleteOrders = async () => {
    setCancellingOrders(true);
    try {
      const res = await fetch(`${API_BASE_URL}/orders/cancel-incomplete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Clear pending orders tracking
        sessionStorage.removeItem('pendingOrderIds');
        hasPendingOrders.current = false;
        isNavigatingAway.current = true;
        
        toast({
          title: "Orders cancelled",
          description: data.message || "Your incomplete orders have been cancelled.",
        });
        
        // Navigate back to cart or home
        setLocation("/cart");
      } else {
        throw new Error(data.message || "Failed to cancel orders");
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to cancel incomplete orders",
        variant: "destructive",
      });
    } finally {
      setCancellingOrders(false);
      setShowCancelDialog(false);
    }
  };

  const handleContinueToPayment = () => {
    setShowCancelDialog(false);
    // User wants to continue - don't block navigation
    // They can use browser back again if needed
  };

  if (items.length === 0 && serviceItems.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="container mx-auto px-4 pt-28 md:pt-32 pb-10">
          <div className="text-center py-20">
            <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
            <Button onClick={() => setLocation("/")}>Continue Shopping</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="container mx-auto px-4 pt-28 md:pt-32 pb-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Checkout</h1>
          <p className="text-muted-foreground">Review your order and complete your purchase.</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Multi-business checkout explanation */}
        {(orderGroups.length + serviceGroups.length) > 1 && (
          <Alert className="mb-6 border-blue-500 bg-blue-50 dark:bg-blue-900/20">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertTitle className="text-blue-800 dark:text-blue-200">Multiple Businesses</AlertTitle>
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              Your cart contains items from {orderGroups.length + serviceGroups.length} different businesses. 
              You'll complete separate payments for each business. This ensures each 
              business receives their payment directly.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Contact details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Full name *</Label>
                    <Input
                      placeholder="Jane Doe"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      placeholder="jane@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Pickup instructions (optional)</Label>
                  <Input
                    placeholder="Any special instructions for pickup"
                    value={formData.pickupInstructions}
                    onChange={(e) => setFormData({ ...formData, pickupInstructions: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Add any special instructions for when you pick up your order
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Discount Code Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Discount Code
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {appliedDiscount ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900 dark:text-green-100">
                          Code: {appliedDiscount.code}
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          You saved £{appliedDiscount.amount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleRemoveDiscount}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter discount code"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleValidateDiscount();
                        }
                      }}
                    />
                    <Button
                      onClick={handleValidateDiscount}
                      disabled={validatingDiscount || !discountCode.trim()}
                    >
                      {validatingDiscount ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Apply"
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Date & time: booking for services, pickup for products */}
            {checkoutBusinesses.length > 0 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Select Date & Time
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Choose a booking time for services and a pickup time for products.
                  </p>
                </div>
                {checkoutBusinesses.map(
                  ({ businessId, businessName, hasProducts, hasServices, durationMinutes }) => {
                    const businessBooking = businessBookings[businessId] || { date: "", time: "" };
                    const label =
                      hasProducts && hasServices
                        ? "Products & services"
                        : hasServices
                          ? "Services"
                          : "Product pickup";
                    return (
                      <Card key={businessId} className="border-l-4 border-l-primary">
                        <CardHeader>
                          <CardTitle className="text-base">{businessName}</CardTitle>
                          <p className="text-sm text-muted-foreground">{label}</p>
                        </CardHeader>
                        <CardContent>
                          <DateTimePicker
                            businessId={businessId}
                            durationMinutes={durationMinutes}
                            onSelect={(date, time) => {
                              setBusinessBookings((prev) => ({
                                ...prev,
                                [businessId]: { date, time },
                              }));
                              if (checkoutBusinesses.length === 1) {
                                setBookingDate(date);
                                setBookingTime(time);
                              }
                            }}
                            selectedDate={businessBooking.date}
                            selectedTime={businessBooking.time}
                          />
                        </CardContent>
                      </Card>
                    );
                  }
                )}
              </div>
            )}

            {/* Points Redemption Section */}
            {userPoints && userPoints.balance > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Coins className="h-5 w-5" />
                    Redeem Points
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div>
                      <p className="font-medium">Available Points</p>
                      <p className="text-sm text-muted-foreground">
                        £{userPoints.balance.toFixed(2)} available
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-lg">
                      £{userPoints.balance.toFixed(2)}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <Label>Amount to redeem (£)</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max={Math.min(userPoints.balance, subtotal - discountAmount)}
                        value={pointsToRedeem}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          const max = Math.min(userPoints.balance, subtotal - discountAmount);
                          setPointsToRedeem(Math.min(value, max));
                        }}
                        placeholder="0.00"
                      />
                      <Button variant="outline" onClick={handleMaxPoints}>
                        Max
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Maximum: £{Math.min(userPoints.balance, subtotal - discountAmount).toFixed(2)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {orderGroups.map((group) => {
                  const businessBooking =
                    businessBookings[group.business_id] ||
                    (checkoutBusinesses.length === 1 && bookingDate && bookingTime
                      ? { date: bookingDate, time: bookingTime }
                      : null);
                  return (
                    <div key={group.business_id} className="border-b pb-4 last:border-0">
                      <div className="font-semibold mb-2">{group.business_name}</div>
                      {group.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm text-muted-foreground mb-1">
                          <span>
                            {item.name} × {item.quantity}
                          </span>
                          <span>£{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      {businessBooking?.date && businessBooking?.time && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          <div className="font-medium mb-1">Pickup:</div>
                          <div>
                            {new Date(businessBooking.date).toLocaleDateString("en-GB", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}{" "}
                            at {businessBooking.time}
                          </div>
                        </div>
                      )}
                      <div className="flex justify-between font-semibold mt-2">
                        <span>Subtotal</span>
                        <span>£{group.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="mt-3 pt-3 border-t text-sm">
                        <div className="font-medium mb-1">Pickup Location:</div>
                        <div className="text-muted-foreground">
                          Pick up at {group.business_name} store. Exact address will be provided in your order confirmation.
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {serviceGroups.map((group) => {
                  const businessBooking = businessBookings[group.business_id] || 
                    (isSingleBusinessServices && bookingDate && bookingTime ? { date: bookingDate, time: bookingTime } : null);
                  
                  return (
                    <div key={group.business_id} className="border-b pb-4 last:border-0">
                      <div className="font-semibold mb-2">Services - {group.business_name}</div>
                      {group.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm text-muted-foreground mb-1">
                          <span>
                            {item.name} × {item.quantity} ({item.duration_minutes} min)
                          </span>
                          <span>£{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      {businessBooking && businessBooking.date && businessBooking.time && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          <div className="font-medium mb-1">Booking:</div>
                          <div>
                            {new Date(businessBooking.date).toLocaleDateString("en-GB", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })} at {businessBooking.time}
                          </div>
                        </div>
                      )}
                      <div className="flex justify-between font-semibold mt-2">
                        <span>Subtotal</span>
                        <span>£{group.subtotal.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Order summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>
                  Items ({items.reduce((sum, item) => sum + item.quantity, 0) + serviceItems.reduce((sum, item) => sum + item.quantity, 0)})
                </span>
                <span>£{subtotal.toFixed(2)}</span>
              </div>
              {appliedDiscount && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount ({appliedDiscount.code})</span>
                  <span>-£{discountAmount.toFixed(2)}</span>
                </div>
              )}
              {pointsToRedeem > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Points redeemed</span>
                  <span>-£{pointsToRedeem.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Pickup</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                <span>Total</span>
                <span>£{total.toFixed(2)}</span>
              </div>
              {userPoints && userPoints.balance > 0 && (
                <div className="text-xs text-muted-foreground pt-2 border-t">
                  <p>You'll earn £{(total * 0.01).toFixed(2)} cashback (1%) on this order</p>
                </div>
              )}
              <Button
                className="w-full"
                onClick={handlePlaceOrder}
                disabled={
                  placingOrder ||
                  lockingSlot ||
                  !formData.fullName ||
                  !formData.email ||
                  (checkoutBusinesses.some(
                    (b) => !businessBookings[b.businessId]?.date || !businessBookings[b.businessId]?.time
                  ) &&
                    !(checkoutBusinesses.length === 1 && bookingDate && bookingTime))
                }
              >
                {placingOrder || lockingSlot ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {lockingSlot ? "Reserving slot..." : "Processing..."}
                  </>
                ) : (
                  "Place order"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cancel Incomplete Orders Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Incomplete Orders?</AlertDialogTitle>
            <AlertDialogDescription>
              You have pending orders that haven't been paid yet. If you leave now, these orders will remain incomplete.
              Would you like to cancel them and return to your cart?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleContinueToPayment}>
              Continue to Payment
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelIncompleteOrders}
              disabled={cancellingOrders}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancellingOrders ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Cancel Orders"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

