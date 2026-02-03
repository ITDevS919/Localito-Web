import { useEffect, useState } from "react";
import { AdminDashboardLayout } from "@/components/layout/AdminDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CheckCircle2, Package, AlertCircle, XCircle, Trash2 } from "lucide-react";
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
  business_name?: string; // Formerly retailer_name
  retailer_name?: string; // Legacy support
  created_at: string;
  isApproved?: boolean;
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
  business_name?: string; // Formerly retailer_name
  retailer_name?: string; // Legacy support
  created_at: string;
}

export default function AdminProductsPage() {
  useRequireRole("admin", "/admin");
  const [products, setProducts] = useState<PendingProduct[]>([]);
  const [allProducts, setAllProducts] = useState<PendingProduct[]>([]);
  const [services, setServices] = useState<PendingService[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAll, setLoadingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [approving, setApproving] = useState<string | null>(null);
  const [unapproving, setUnapproving] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [unapproveDialogOpen, setUnapproveDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
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

  const loadAllProducts = async () => {
    setLoadingAll(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/products/all?limit=100`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load products");
      }
      setAllProducts(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingAll(false);
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

  const handleUnapproveClick = (product: PendingProduct) => {
    setSelectedProduct(product);
    setUnapproveDialogOpen(true);
  };

  const handleUnapproveConfirm = async () => {
    if (!selectedProduct) return;

    setUnapproving(selectedProduct.id);
    try {
      const res = await fetch(`${API_BASE_URL}/products/${selectedProduct.id}/unapprove`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to unapprove product");
      }

      // Refresh the all products list
      setUnapproveDialogOpen(false);
      setSelectedProduct(null);
      loadAllProducts();
    } catch (err: any) {
      setError(err.message);
      setUnapproveDialogOpen(false);
      setSelectedProduct(null);
    } finally {
      setUnapproving(null);
    }
  };

  const handleDeleteClick = (product: PendingProduct) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return;

    setDeleting(selectedProduct.id);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/products/${selectedProduct.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete product");
      }

      // Refresh the all products list
      setDeleteDialogOpen(false);
      setSelectedProduct(null);
      loadAllProducts();
    } catch (err: any) {
      setError(err.message);
      setDeleteDialogOpen(false);
      setSelectedProduct(null);
    } finally {
      setDeleting(null);
    }
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
            <h1 className="text-3xl font-bold">Product Management</h1>
            <p className="text-muted-foreground">Review pending items and manage all products</p>
          </div>
        </div>

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

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">Pending Approval</TabsTrigger>
            <TabsTrigger value="all" onClick={loadAllProducts}>All Products</TabsTrigger>
          </TabsList>

          {/* Pending Tab */}
          <TabsContent value="pending" className="space-y-6">
            {loading && (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}

            {!loading && products.length === 0 && services.length === 0 && (
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

            {!loading && (products.length > 0 || services.length > 0) && (
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
                                {(product.business_name || product.retailer_name) && (
                                  <Badge variant="outline" className="text-xs">
                                    {product.business_name || product.retailer_name}
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
                  <div className="space-y-4">
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
                                {(service.business_name || service.retailer_name) && (
                                  <Badge variant="outline" className="text-xs">
                                    {service.business_name || service.retailer_name}
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
          </TabsContent>

          {/* All Products Tab */}
          <TabsContent value="all" className="space-y-6">
            {loadingAll && (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}

            {!loadingAll && allProducts.length === 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No products found</h3>
                    <p className="text-muted-foreground">No products in the system yet.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {!loadingAll && allProducts.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {allProducts.map((product) => (
                  <Card key={product.id} className="overflow-hidden">
                    <div className="relative">
                      <img
                        src={product.images?.[0] || "/opengraph.jpg"}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                      />
                      <Badge
                        className={`absolute top-2 right-2 ${
                          product.isApproved
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-yellow-600 hover:bg-yellow-700"
                        }`}
                      >
                        {product.isApproved ? "Approved" : "Pending"}
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
                          {(product.business_name || product.retailer_name) && (
                            <Badge variant="outline" className="text-xs">
                              {product.business_name || product.retailer_name}
                            </Badge>
                          )}
                        </div>
                        {product.isApproved && (
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() => handleUnapproveClick(product)}
                              disabled={unapproving === product.id || deleting === product.id}
                            >
                              {unapproving === product.id ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Hiding...
                                </>
                              ) : (
                                <>
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Hide
                                </>
                              )}
                            </Button>
                            <Button
                              variant="destructive"
                              className="w-full"
                              onClick={() => handleDeleteClick(product)}
                              disabled={deleting === product.id || unapproving === product.id}
                            >
                              {deleting === product.id ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Deleting...
                                </>
                              ) : (
                                <>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                        {!product.isApproved && (
                          <Button
                            variant="destructive"
                            className="w-full"
                            onClick={() => handleDeleteClick(product)}
                            disabled={deleting === product.id}
                          >
                            {deleting === product.id ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Product
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
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

      {/* Unapprove Confirmation Dialog */}
      <AlertDialog open={unapproveDialogOpen} onOpenChange={setUnapproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unapprove Product?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unapprove <strong>{selectedProduct?.name}</strong>? This will hide it from customers immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!unapproving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnapproveConfirm}
              disabled={!!unapproving}
              className="bg-destructive"
            >
              {unapproving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Unapproving...
                </>
              ) : (
                "Unapprove"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product Permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete <strong>{selectedProduct?.name}</strong>? This action cannot be undone. The product and all associated data will be removed from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={!!deleting}
              className="bg-destructive"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Permanently"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminDashboardLayout>
  );
}
