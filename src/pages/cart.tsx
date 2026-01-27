import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Loader2, Plus, Minus, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  name: string;
  price: number;
  images: string[];
  stock: number;
  business_name: string; // Formerly retailer_name
  retailer_name?: string; // Legacy support
}

interface CartServiceItem {
  id: string;
  service_id: string;
  quantity: number;
  name: string;
  price: number;
  images: string[];
  duration_minutes: number;
  business_name: string; // Formerly retailer_name
  retailer_name?: string; // Legacy support
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [serviceItems, setServiceItems] = useState<CartServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCart = async () => {
    try {
      const [productsRes, servicesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/cart`, { credentials: "include" }),
        fetch(`${API_BASE_URL}/cart/services`, { credentials: "include" }),
      ]);
      
      const productsData = await productsRes.json();
      if (!productsRes.ok || !productsData.success) throw new Error(productsData.message || "Failed to load cart");
      setItems(productsData.data);

      const servicesData = await servicesRes.json();
      if (servicesRes.ok && servicesData.success) {
        setServiceItems(servicesData.data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleRemoveService = async (serviceId: string) => {
    await fetch(`${API_BASE_URL}/cart/services/${serviceId}`, {
      method: "DELETE",
      credentials: "include",
    });
    loadCart();
  };

  const productSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const serviceSubtotal = serviceItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const subtotal = productSubtotal + serviceSubtotal;

  const handleRemove = async (productId: string) => {
    await fetch(`${API_BASE_URL}/cart/${productId}`, {
      method: "DELETE",
      credentials: "include",
    });
    loadCart();
  };

  const handleQuantityUpdate = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemove(productId);
      return;
    }

    const item = items.find((i) => i.product_id === productId);
    if (item && newQuantity > item.stock) {
      setError(`Only ${item.stock} items available in stock`);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/cart/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ quantity: newQuantity }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update quantity");
      }

      setError(null);
      loadCart();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Your Cart</h1>
          <p className="text-muted-foreground">Review your items before checkout.</p>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}
        {error && <div className="text-destructive">{error}</div>}

        {!loading && !error && (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              {items.length === 0 && serviceItems.length === 0 ? (
                <div className="rounded-xl border border-border p-6 text-center text-muted-foreground">
                  Cart is empty.
                </div>
              ) : (
                <>
                  {/* Products */}
                  {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 rounded-xl border border-border p-4 items-center"
                  >
                    <img
                      src={item.images?.[0] || "/opengraph.jpg"}
                      alt={item.name}
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-sm text-muted-foreground">{item.business_name || item.retailer_name}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm text-muted-foreground">Quantity:</span>
                        <div className="flex items-center gap-1 border rounded-md">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQuantityUpdate(item.product_id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            type="number"
                            min="1"
                            max={item.stock}
                            value={item.quantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 1;
                              if (val >= 1 && val <= item.stock) {
                                handleQuantityUpdate(item.product_id, val);
                              }
                            }}
                            className="w-16 h-8 text-center border-0 focus-visible:ring-0"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQuantityUpdate(item.product_id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          (Stock: {item.stock})
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">£{(item.price * item.quantity).toFixed(2)}</div>
                      <Button variant="ghost" size="sm" onClick={() => handleRemove(item.product_id)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                  ))}

                  {/* Services */}
                  {serviceItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 rounded-xl border border-border p-4 items-center"
                    >
                      <img
                        src={item.images?.[0] || "/opengraph.jpg"}
                        alt={item.name}
                        className="h-20 w-20 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="font-semibold">{item.name}</div>
                          <Badge variant="secondary" className="text-xs">
                            <Calendar className="h-3 w-3 mr-1" />
                            Service
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">{item.business_name || item.retailer_name}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Duration: {item.duration_minutes} minutes
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          Booking time will be selected at checkout
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">£{(item.price * item.quantity).toFixed(2)}</div>
                        <Button variant="ghost" size="sm" onClick={() => handleRemoveService(item.service_id)}>
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            <div className="rounded-xl border border-border p-6 space-y-4">
              <h2 className="text-xl font-semibold">Order Summary</h2>
              {items.length > 0 && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Products ({items.reduce((sum, item) => sum + item.quantity, 0)})</span>
                  <span>£{productSubtotal.toFixed(2)}</span>
                </div>
              )}
              {serviceItems.length > 0 && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Services ({serviceItems.reduce((sum, item) => sum + item.quantity, 0)})</span>
                  <span>£{serviceSubtotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-muted-foreground pt-2 border-t">
                <span>Subtotal</span>
                <span>£{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Delivery</span>
                <span>£0.00 (pickup)</span>
              </div>
              <div className="flex justify-between text-lg font-semibold pt-2">
                <span>Total</span>
                <span>£{subtotal.toFixed(2)}</span>
              </div>
              <Link href="/checkout">
                <Button className="w-full" disabled={items.length === 0}>
                  Proceed to Checkout
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

