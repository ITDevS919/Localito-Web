import { useEffect, useState } from "react";
import { AdminDashboardLayout } from "@/components/layout/AdminDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, Package, AlertCircle } from "lucide-react";
import { useRequireRole } from "@/hooks/useRequireRole";
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

interface PendingProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  images: string[];
  retailer_name?: string;
  created_at: string;
}

interface PendingService {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  images: string[];
  durationMinutes: number;
  maxParticipants: number;
  locationType: string;
  requiresStaff: boolean;
  retailer_name?: string;
  created_at: string;
}

export default function AdminProductsPage() {
  useRequireRole("admin", "/admin");
  const [products, setProducts] = useState<PendingProduct[]>([]);
  const [services, setServices] = useState<PendingService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approving, setApproving] = useState<string | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<PendingProduct | null>(null);
  const [selectedService, setSelectedService] = useState<PendingService | null>(null);
  const [isApprovingService, setIsApprovingService] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load pending products
      const productsRes = await fetch(`${API_BASE_URL}/products/pending`, {
        credentials: "include",
      });
      const productsData = await productsRes.json();
      if (!productsRes.ok || !productsData.success) {
        throw new Error(productsData.message || "Failed to load products");
      }
      setProducts(productsData.data || []);

      // Load pending services
      const servicesRes = await fetch(`${API_BASE_URL}/services/pending`, {
        credentials: "include",
      });
      const servicesData = await servicesRes.json();
      if (servicesRes.ok && servicesData.success) {
        setServices(servicesData.data || []);
      } else {
        // Log error but don't fail the whole page load
        console.error("Failed to load services:", servicesData.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveClick = (product: PendingProduct) => {
    setSelectedProduct(product);
    setSelectedService(null);
    setApproveDialogOpen(true);
  };

  const handleApproveServiceClick = (service: PendingService) => {
    setSelectedService(service);
    setSelectedProduct(null);
    setApproveDialogOpen(true);
  };

  const handleApproveConfirm = async () => {
    if (selectedProduct) {
      setApproving(selectedProduct.id);
      try {
        const res = await fetch(`${API_BASE_URL}/products/${selectedProduct.id}/approve`, {
          method: "POST",
          credentials: "include",
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to approve product");
        }

        // Remove product from list and refresh
        setProducts((prev) => prev.filter((p) => p.id !== selectedProduct.id));
        setApproveDialogOpen(false);
        setSelectedProduct(null);
        // Refresh data to ensure consistency
        loadData();
      } catch (err: any) {
        setError(err.message);
        setApproveDialogOpen(false);
        setSelectedProduct(null);
      } finally {
        setApproving(null);
      }
    } else if (selectedService) {
      setIsApprovingService(true);
      try {
        const res = await fetch(`${API_BASE_URL}/services/${selectedService.id}/approve`, {
          method: "POST",
          credentials: "include",
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to approve service");
        }

        // Remove service from list and refresh
        setServices((prev) => prev.filter((s) => s.id !== selectedService.id));
        setApproveDialogOpen(false);
        setSelectedService(null);
        // Refresh data to ensure consistency
        loadData();
      } catch (err: any) {
        setError(err.message);
        setApproveDialogOpen(false);
        setSelectedService(null);
      } finally {
        setIsApprovingService(false);
      }
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Item Approvals</h1>
            <p className="text-muted-foreground">Review and approve pending products and services</p>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}

        {error && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && !error && products.length === 0 && services.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No pending items</h3>
                <p className="text-muted-foreground">All products and services have been reviewed.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && !error && (products.length > 0 || services.length > 0) && (
          <>
            {products.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Products</h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {products.map((product) => (
                    <Card key={product.id} className="overflow-hidden">
                      <div className="relative">
                        <img
                          src={product.images?.[0] || "/opengraph.jpg"}
                          alt={product.name}
                          className="w-full h-48 object-cover"
                        />
                        <Badge className="absolute top-2 right-2 bg-yellow-600 hover:bg-yellow-700">
                          Pending
                        </Badge>
                      </div>
                      <CardHeader>
                        <CardTitle className="text-lg line-clamp-1">{product.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-2xl font-bold">£{Number(product.price || 0).toFixed(2)}</span>
                            <span className="text-sm text-muted-foreground">
                              Stock: {product.stock || 0}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {product.description || "No description"}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{product.category}</Badge>
                            {product.retailer_name && (
                              <Badge variant="outline" className="text-xs">
                                {product.retailer_name}
                              </Badge>
                            )}
                          </div>
                          <Button
                            className="w-full"
                            onClick={() => handleApproveClick(product)}
                            disabled={approving === product.id}
                          >
                            {approving === product.id ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Approving...
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Approve Product
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            {services.length > 0 && (
              <div className="space-y-4 mt-8">
                <h2 className="text-xl font-semibold">Services</h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {services.map((service) => (
                    <Card key={service.id} className="overflow-hidden">
                      <div className="relative">
                        <img
                          src={service.images?.[0] || "/opengraph.jpg"}
                          alt={service.name}
                          className="w-full h-48 object-cover"
                        />
                        <Badge className="absolute top-2 right-2 bg-yellow-600 hover:bg-yellow-700">
                          Pending
                        </Badge>
                      </div>
                      <CardHeader>
                        <CardTitle className="text-lg line-clamp-1">{service.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-2xl font-bold">£{Number(service.price || 0).toFixed(2)}</span>
                            <span className="text-sm text-muted-foreground">
                              {service.durationMinutes} min
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {service.description || "No description"}
                          </p>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline">{service.category}</Badge>
                            {service.retailer_name && (
                              <Badge variant="outline" className="text-xs">
                                {service.retailer_name}
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {service.locationType === 'onsite' ? 'On-site' : 
                               service.locationType === 'customer_address' ? 'At Customer' : 'Online'}
                            </Badge>
                          </div>
                          <Button
                            className="w-full"
                            onClick={() => handleApproveServiceClick(service)}
                            disabled={isApprovingService && selectedService?.id === service.id}
                          >
                            {isApprovingService && selectedService?.id === service.id ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Approving...
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Approve Service
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Approve Confirmation Dialog */}
      <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedProduct ? "Approve Product?" : "Approve Service?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve <strong>{selectedProduct?.name || selectedService?.name}</strong>? This will make it visible to all customers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!approving || isApprovingService}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApproveConfirm}
              disabled={!!approving || isApprovingService}
              className="bg-primary"
            >
              {(approving || isApprovingService) ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                "Approve"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminDashboardLayout>
  );
}

