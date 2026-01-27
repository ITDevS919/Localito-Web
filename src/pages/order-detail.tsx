import { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Package, MapPin, Calendar, CreditCard, Tag, Coins, QrCode, Clock, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  images: string[];
}

interface OrderServiceItem {
  id: string;
  service_id: string;
  service_name: string;
  quantity: number;
  price: number;
  images: string[];
  booking_date?: string;
  booking_time?: string;
  booking_duration_minutes?: number;
  booking_status?: string;
}

interface Order {
  id: string;
  total: number;
  status: string;
  created_at: string;
  updated_at: string;
  business_name: string; // Formerly retailer_name
  retailer_name?: string; // Legacy support
  customer_name: string;
  customer_email: string;
  items: OrderItem[];
  serviceItems?: OrderServiceItem[];
  pickup_location?: string;
  pickup_instructions?: string;
  ready_for_pickup_at?: string;
  picked_up_at?: string;
  discount_amount?: number;
  points_used?: number;
  points_earned?: number;
  stripe_payment_intent_id?: string;
  platform_commission?: number;
  business_amount?: number; // Formerly retailer_amount
  retailer_amount?: number; // Legacy support
  booking_date?: string;
  booking_time?: string;
  booking_duration_minutes?: number;
  booking_status?: string;
}

export default function OrderDetailPage() {
  const [match, params] = useRoute("/orders/:id");
  const orderId = params?.id;
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [loadingQR, setLoadingQR] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!orderId) return;
    loadOrder();
  }, [orderId]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      toast({
        title: "Payment successful",
        description: "Your order has been confirmed",
      });
      // Reload order to get updated payment status
      if (orderId) {
        loadOrder();
      }
      
      // Check if there are more payments to process (multi-business scenario)
      if (params.get("checkMorePayments") === "true") {
        checkForRemainingPayments();
      }
    }
  }, [orderId]);

  const checkForRemainingPayments = () => {
    try {
      const pendingSessionsStr = sessionStorage.getItem('pendingCheckoutSessions');
      if (!pendingSessionsStr) {
        // No more payments, clear any stored data
        sessionStorage.removeItem('pendingCheckoutSessions');
        sessionStorage.removeItem('completedOrderIds');
        return;
      }

      const pendingSessions = JSON.parse(pendingSessionsStr);
      if (pendingSessions && pendingSessions.length > 0) {
        // Get the next checkout session
        const nextSession = pendingSessions[0];
        
        // Update completed orders list
        const completedOrderIds = JSON.parse(sessionStorage.getItem('completedOrderIds') || '[]');
        completedOrderIds.push(orderId);
        sessionStorage.setItem('completedOrderIds', JSON.stringify(completedOrderIds));
        
        // Remove the current session from pending list
        const remainingSessions = pendingSessions.slice(1);
        if (remainingSessions.length > 0) {
          sessionStorage.setItem('pendingCheckoutSessions', JSON.stringify(remainingSessions));
        } else {
          sessionStorage.removeItem('pendingCheckoutSessions');
        }
        
        // Show notification and redirect to next payment
        setTimeout(() => {
          toast({
            title: "More payments required",
            description: `You have ${remainingSessions.length + 1} more payment${remainingSessions.length + 1 > 1 ? 's' : ''} to complete. Redirecting...`,
          });
          // Redirect to next checkout session
          window.location.href = nextSession.checkoutUrl;
        }, 2000); // Give user 2 seconds to see the success message
      } else {
        // All payments complete
        sessionStorage.removeItem('pendingCheckoutSessions');
        sessionStorage.removeItem('completedOrderIds');
        toast({
          title: "All payments complete",
          description: "All your orders have been paid successfully!",
        });
      }
    } catch (error) {
      console.error('Error checking for remaining payments:', error);
      sessionStorage.removeItem('pendingCheckoutSessions');
      sessionStorage.removeItem('completedOrderIds');
    }
  };

  const loadOrder = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load order");
      }
      setOrder(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const retryPayment = async () => {
    if (!orderId) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}/retry-payment`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to retry payment");
      }
      // Redirect to checkout
      if (data.data.checkoutUrl) {
        window.location.href = data.data.checkoutUrl;
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to retry payment",
        variant: "destructive",
      });
    }
  };

  // Calculate subtotal (total + discounts)
  const subtotal = order
    ? Number(order.total) + (Number(order.discount_amount) || 0) + (Number(order.points_used) || 0)
    : 0;

  // Fetch QR code
  const fetchQRCode = async () => {
    if (!orderId) return;
    setLoadingQR(true);
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}/qr-code`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setQrCodeData(data.data.qrCode);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to load QR code",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to load QR code",
        variant: "destructive",
      });
    } finally {
      setLoadingQR(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      awaiting_payment: { variant: "destructive", label: "Awaiting Payment" },
      pending: { variant: "outline", label: "Pending" },
      processing: { variant: "default", label: "Processing" },
      shipped: { variant: "default", label: "Shipped" },
      delivered: { variant: "default", label: "Delivered" },
      ready_for_pickup: { variant: "default", label: "Ready for Pickup" },
      picked_up: { variant: "default", label: "Picked Up" },
      cancelled: { variant: "destructive", label: "Cancelled" },
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="container mx-auto px-4 py-10">
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="container mx-auto px-4 py-10">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold mb-4">Order not found</h1>
            <p className="text-muted-foreground mb-4">{error || "The order you're looking for doesn't exist."}</p>
            <Link href="/orders">
              <Button>Back to Orders</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <div className="mb-6">
          <Link href="/orders">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Order Details</h1>
              <p className="text-muted-foreground">Order #{order.id.slice(0, 8)}</p>
            </div>
            {getStatusBadge(order.status)}
          </div>
          
          {/* Show payment required message for orders awaiting payment */}
          {order.status === 'awaiting_payment' && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>
                  Payment is required to confirm this order. Your order will be cancelled if payment is not completed within 15 minutes.
                </span>
                <Button 
                  onClick={retryPayment} 
                  className="ml-4"
                  variant="outline"
                >
                  Complete Payment
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Products */}
                  {order.items && order.items.length > 0 && (
                    <>
                      {order.items.map((item) => (
                        <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                          <img
                            src={item.images?.[0] || "/opengraph.jpg"}
                            alt={item.product_name}
                            className="h-20 w-20 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold">{item.product_name}</h3>
                            <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              £{Number(item.price).toFixed(2)} each
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              £{(Number(item.price) * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </>
                  )}

                  {/* Services */}
                  {order.serviceItems && order.serviceItems.length > 0 && (
                    <>
                      {order.serviceItems.map((item) => (
                        <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                          <img
                            src={item.images?.[0] || "/opengraph.jpg"}
                            alt={item.service_name}
                            className="h-20 w-20 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{item.service_name}</h3>
                              <Badge variant="secondary" className="text-xs">
                                Service
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              £{Number(item.price).toFixed(2)} each
                            </p>
                            {item.booking_date && item.booking_time && (
                              <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950 rounded-md">
                                <div className="flex items-center gap-2 text-sm">
                                  <Calendar className="h-4 w-4 text-blue-600" />
                                  <span className="font-medium text-blue-900 dark:text-blue-100">
                                    {new Date(item.booking_date).toLocaleDateString("en-GB", {
                                      weekday: "long",
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm mt-1">
                                  <Clock className="h-4 w-4 text-blue-600" />
                                  <span className="text-blue-700 dark:text-blue-300">
                                    {item.booking_time} ({item.booking_duration_minutes || 60} min)
                                  </span>
                                </div>
                                {item.booking_status && (
                                  <div className="mt-1">
                                    <Badge variant={item.booking_status === 'confirmed' ? 'default' : 'outline'}>
                                      {item.booking_status.charAt(0).toUpperCase() + item.booking_status.slice(1)}
                                    </Badge>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              £{(Number(item.price) * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Order Information */}
            <Card>
              <CardHeader>
                <CardTitle>Order Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-semibold">Business</p>
                    <p className="text-sm text-muted-foreground">{order.business_name || order.retailer_name}</p>
                  </div>
                </div>
                {order.pickup_location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-semibold">Pickup Location</p>
                      <p className="text-sm text-muted-foreground">{order.pickup_location}</p>
                    </div>
                  </div>
                )}
                {order.pickup_instructions && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-semibold">Pickup Instructions</p>
                      <p className="text-sm text-muted-foreground">{order.pickup_instructions}</p>
                    </div>
                  </div>
                )}
                {order.ready_for_pickup_at && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-semibold">Ready for Pickup</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.ready_for_pickup_at).toLocaleDateString("en-GB", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                )}
                {order.picked_up_at && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-semibold">Picked Up</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.picked_up_at).toLocaleDateString("en-GB", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                )}
                {order.booking_date && order.booking_time && (
                  <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-blue-900 dark:text-blue-100">Service Booking</p>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        {new Date(order.booking_date).toLocaleDateString("en-GB", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })} at {order.booking_time}
                      </p>
                      {order.booking_duration_minutes && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          Duration: {order.booking_duration_minutes} minutes
                        </p>
                      )}
                      {order.booking_status && (
                        <div className="mt-2">
                          <Badge variant={order.booking_status === 'confirmed' ? 'default' : 'outline'}>
                            Status: {order.booking_status.charAt(0).toUpperCase() + order.booking_status.slice(1)}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-semibold">Order Date</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("en-GB", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                {order.updated_at !== order.created_at && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-semibold">Last Updated</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.updated_at).toLocaleDateString("en-GB", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>£{subtotal.toFixed(2)}</span>
              </div>
              {order.discount_amount && order.discount_amount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    Discount
                  </span>
                  <span>-£{Number(order.discount_amount).toFixed(2)}</span>
                </div>
              )}
              {order.points_used && order.points_used > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span className="flex items-center gap-1">
                    <Coins className="h-3 w-3" />
                    Points Redeemed
                  </span>
                  <span>-£{Number(order.points_used).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pickup</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                <span>Total</span>
                <span>£{Number(order.total).toFixed(2)}</span>
              </div>
              {order.points_earned && order.points_earned > 0 && (
                <div className="pt-2 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Coins className="h-4 w-4 text-primary" />
                    <span>You earned £{Number(order.points_earned).toFixed(2)} cashback (1%)</span>
                  </div>
                </div>
              )}
              <div className="pt-4">
                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Payment Method</p>
                    <p className="text-xs text-muted-foreground">
                      {order.stripe_payment_intent_id
                        ? "Paid via Stripe"
                        : "Pay on pickup"}
                    </p>
                    {order.stripe_payment_intent_id && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Payment ID: {order.stripe_payment_intent_id.slice(0, 20)}...
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* QR Code Section */}
          {order && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  Order QR Code
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                {loadingQR ? (
                  <div className="flex flex-col items-center gap-2 py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className="text-sm text-muted-foreground">Generating QR code...</p>
                  </div>
                ) : qrCodeData ? (
                  <>
                    <img src={qrCodeData} alt="Order QR Code" className="w-64 h-64 border rounded-lg" />
                    <p className="text-sm text-muted-foreground text-center max-w-md">
                      Show this QR code to the business when picking up your order
                    </p>
                    <Button variant="outline" onClick={fetchQRCode} size="sm">
                      Regenerate QR Code
                    </Button>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-4 py-8">
                    <QrCode className="h-16 w-16 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground text-center">
                      Generate a QR code to show at pickup
                    </p>
                    <Button onClick={fetchQRCode}>
                      Generate QR Code
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

