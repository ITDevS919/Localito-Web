import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { AdminDashboardLayout } from "@/components/layout/AdminDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, ShoppingBag, AlertCircle } from "lucide-react";
import { useRequireRole } from "@/hooks/useRequireRole";
import { Link } from "wouter";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  images: string[];
  category: string;
}

interface Order {
  id: string;
  user_id: string;
  business_id: string; // Formerly retailer_id
  retailer_id?: string; // Legacy support
  status: string;
  booking_status?: string;
  total: number;
  created_at: string;
  updated_at: string;
  customer_name: string;
  customer_email: string;
  business_name: string; // Formerly retailer_name
  retailer_name?: string; // Legacy support
  items: OrderItem[];
  discount_amount?: number;
  points_redeemed?: number;
  points_earned?: number;
  platform_commission?: number;
  business_amount?: number; // Formerly retailer_amount
  retailer_amount?: number; // Legacy support
}

export default function AdminOrderDetailPage() {
  useRequireRole("admin", "/admin");
  const [, params] = useRoute("/admin/orders/:id");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params?.id) {
      fetchOrder(params.id);
    }
  }, [params?.id]);

  const fetchOrder = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/orders/${id}`, {
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

  const getStatusBadge = (order: Order) => {
    const isComplete = order.status === "complete" || order.booking_status === "completed";
    const status = isComplete ? "complete" : order.status;
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      awaiting_payment: { label: "Awaiting Payment", variant: "destructive" },
      pending: { label: "Pending", variant: "outline" },
      processing: { label: "Processing", variant: "default" },
      ready: { label: "Ready", variant: "default" },
      complete: { label: "Complete", variant: "secondary" },
      cancelled: { label: "Cancelled", variant: "destructive" },
    };
    const config = statusConfig[status] || { label: order.status, variant: "outline" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </AdminDashboardLayout>
    );
  }

  if (error || !order) {
    return (
      <AdminDashboardLayout>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error || "Order not found"}
            </div>
          </CardContent>
        </Card>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Order Details</h1>
            <p className="text-muted-foreground">Order #{order.id.substring(0, 8)}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Order Info */}
          <Card>
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <div className="mt-1">{getStatusBadge(order)}</div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Order Date</p>
                <p className="mt-1">{new Date(order.created_at).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                <p className="mt-1">{new Date(order.updated_at).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Customer & Business Info */}
          <Card>
            <CardHeader>
              <CardTitle>Customer & Business</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Customer</p>
                <p className="mt-1">{order.customer_name}</p>
                <p className="text-sm text-muted-foreground">{order.customer_email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Business</p>
                <p className="mt-1">{order.business_name || order.retailer_name}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 border-b pb-4 last:border-0">
                  {item.images && item.images.length > 0 && (
                    <img
                      src={item.images[0]}
                      alt={item.product_name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{item.product_name}</p>
                    <p className="text-sm text-muted-foreground">{item.category}</p>
                    <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-medium">£{(Number(item.price) * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>£{Number(order.total).toFixed(2)}</span>
              </div>
              {order.discount_amount && order.discount_amount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-£{Number(order.discount_amount).toFixed(2)}</span>
                </div>
              )}
              {order.points_redeemed && order.points_redeemed > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Points Redeemed</span>
                  <span>-£{Number(order.points_redeemed).toFixed(2)}</span>
                </div>
              )}
              {order.platform_commission && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Platform Commission</span>
                  <span>£{Number(order.platform_commission).toFixed(2)}</span>
                </div>
              )}
              {order.retailer_amount && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Business Amount</span>
                  <span>£{Number(order.business_amount || order.retailer_amount).toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>£{Number(order.total).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
}

