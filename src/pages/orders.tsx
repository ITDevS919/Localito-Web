import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Loader2, Coins, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
}

interface OrderServiceItem {
  id: string;
  service_id: string;
  service_name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  status: string;
  total: number;
  created_at: string;
  business_name: string; // Formerly retailer_name
  retailer_name?: string; // Legacy support
  pickup_location?: string;
  points_earned?: number;
  items?: OrderItem[];
  serviceItems?: OrderServiceItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryingPayment, setRetryingPayment] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/orders`, { credentials: "include" });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || "Failed to load orders");
        setOrders(data.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleRetryPayment = async (orderId: string) => {
    setRetryingPayment(orderId);
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}/retry-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok && data.success && data.data.checkoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = data.data.checkoutUrl;
      } else {
        throw new Error(data.message || "Failed to create payment session");
      }
    } catch (err: any) {
      toast({
        title: "Payment Error",
        description: err.message || "Failed to retry payment. Please try again.",
        variant: "destructive",
      });
      setRetryingPayment(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="container mx-auto px-4 pt-28 md:pt-32 pb-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">My Orders</h1>
          <p className="text-muted-foreground">Track your orders and status.</p>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}
        {error && <div className="text-destructive">{error}</div>}

        {!loading && !error && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="rounded-xl border border-border p-6 text-center text-muted-foreground">
                No orders yet.
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-xl border border-border p-4 flex justify-between items-center hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex-1">
                    <Link href={`/orders/${order.id}`}>
                      <div className="font-semibold hover:underline cursor-pointer">
                        {(() => {
                          // Get first product or service name
                          const firstItem = order.items && order.items.length > 0 
                            ? order.items[0].product_name 
                            : null;
                          const firstService = order.serviceItems && order.serviceItems.length > 0 
                            ? order.serviceItems[0].service_name 
                            : null;
                          
                          if (firstItem) {
                            const itemCount = (order.items?.length || 0) + (order.serviceItems?.length || 0);
                            return itemCount > 1 
                              ? `${firstItem} +${itemCount - 1} more`
                              : firstItem;
                          } else if (firstService) {
                            const itemCount = (order.items?.length || 0) + (order.serviceItems?.length || 0);
                            return itemCount > 1 
                              ? `${firstService} +${itemCount - 1} more`
                              : firstService;
                          } else {
                            return `Order #${order.id.slice(0, 8)}`;
                          }
                        })()}
                      </div>
                    </Link>
                    <div className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleString()} • {order.business_name || order.retailer_name}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={
                        order.status === "ready_for_pickup" || order.status === "picked_up" 
                          ? "default" 
                          : order.status === "cancelled" 
                          ? "destructive" 
                          : order.status === "awaiting_payment"
                          ? "secondary"
                          : "outline"
                      }
                      className="capitalize"
                    >
                      {order.status === "ready_for_pickup" 
                        ? "Ready for Pickup" 
                        : order.status === "picked_up"
                        ? "Picked Up"
                        : order.status === "awaiting_payment"
                        ? "Payment Pending"
                        : order.status}
                    </Badge>
                    <div className="font-semibold">£{Number(order.total || 0).toFixed(2)}</div>
                    {order.status === "awaiting_payment" ? (
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => handleRetryPayment(order.id)}
                        disabled={retryingPayment === order.id}
                      >
                        {retryingPayment === order.id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Retry Payment
                          </>
                        )}
                      </Button>
                    ) : (
                      <Link href={`/orders/${order.id}`}>
                        <Button variant="outline" size="sm">View Details</Button>
                      </Link>
                    )}
                  </div>
                  {order.pickup_location && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Pickup: {order.pickup_location}
                    </div>
                  )}
                  {order.points_earned && order.points_earned > 0 && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Coins className="h-3 w-3" />
                      Earned £{Number(order.points_earned).toFixed(2)} cashback
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

