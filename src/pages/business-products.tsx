import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Loader2, Package, CheckCircle2, XCircle, Edit, Trash2 } from "lucide-react";
import { useRequireRole } from "@/hooks/useRequireRole";
import { CreateProductModal } from "@/components/product/CreateProductModal";
import { CreateServiceModal } from "@/components/product/CreateServiceModal";
import type { Product } from "@/lib/product";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  durationMinutes: number;
  maxParticipants: number;
  locationType: string;
  requiresStaff: boolean;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function BusinessProductsPage() {
  useRequireRole("business", "/login/business");
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createServiceModalOpen, setCreateServiceModalOpen] = useState(false);
  const [editService, setEditService] = useState<Service | null>(null);
  const [editServiceModalOpen, setEditServiceModalOpen] = useState(false);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [deleteService, setDeleteService] = useState<Service | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteType, setDeleteType] = useState<'product' | 'service'>('product');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch products
        const productsRes = await fetch(`${API_BASE_URL}/business/products`, {
          credentials: "include",
        });
        const productsData = await productsRes.json();
        if (!productsRes.ok || !productsData.success) {
          throw new Error(productsData.message || "Failed to load products");
        }

        // Transform API data to match Product interface
        const transformedProducts: Product[] = productsData.data.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: parseFloat(p.price) || 0,
          business: "Your Store",
          image: (Array.isArray(p.images) && p.images[0]) || "/opengraph.jpg",
          category: p.category || "",
          rating: parseFloat(p.averageRating) || 0,
          reviews: parseInt(p.reviewCount) || 0,
          pickupTime: "30 mins",
          isNew: false,
          businessPostcode: undefined,
          businessCity: undefined,
          isApproved: p.isApproved,
          stock: parseInt(p.stock) || 0,
          description: p.description || "",
        }));

        setProducts(transformedProducts);

        // Fetch services
        const servicesRes = await fetch(`${API_BASE_URL}/business/services`, {
          credentials: "include",
        });
        const servicesData = await servicesRes.json();
        if (servicesRes.ok && servicesData.success) {
          // Transform API data to match Service interface (convert snake_case to camelCase)
          const transformedServices: Service[] = (servicesData.data || []).map((s: any) => ({
            id: s.id,
            name: s.name,
            description: s.description || "",
            price: parseFloat(s.price) || 0,
            category: s.category || "",
            images: Array.isArray(s.images) ? s.images : [],
            durationMinutes: parseInt(s.duration_minutes) || 60,
            maxParticipants: parseInt(s.max_participants) || 1,
            locationType: s.location_type || 'onsite',
            requiresStaff: s.requires_staff || false,
            isApproved: s.is_approved || false,
            createdAt: s.created_at,
            updatedAt: s.updated_at,
          }));
          setServices(transformedServices);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const approvedCount = products.filter((p) => p.isApproved).length + services.filter((s) => s.isApproved).length;
  const pendingCount = products.filter((p) => !p.isApproved).length + services.filter((s) => !s.isApproved).length;
  const totalItems = products.length + services.length;

  const handleEdit = (product: Product) => {
    setEditProduct(product);
    setEditModalOpen(true);
  };

  const handleEditService = (service: Service) => {
    setEditService(service);
    setEditServiceModalOpen(true);
  };

  const handleDeleteClick = (product: Product) => {
    setDeleteProduct(product);
    setDeleteService(null);
    setDeleteType('product');
    setDeleteDialogOpen(true);
  };

  const handleDeleteServiceClick = (service: Service) => {
    setDeleteService(service);
    setDeleteProduct(null);
    setDeleteType('service');
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteType === 'product' && !deleteProduct) return;
    if (deleteType === 'service' && !deleteService) return;

    setDeleting(true);
    try {
      if (deleteType === 'product') {
        const res = await fetch(`${API_BASE_URL}/products/${deleteProduct!.id}`, {
          method: "DELETE",
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to delete product");
        }

        // Remove product from list
        setProducts((prev) => prev.filter((p) => p.id !== deleteProduct!.id));
      } else {
        const res = await fetch(`${API_BASE_URL}/services/${deleteService!.id}`, {
          method: "DELETE",
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to delete service");
        }

        // Remove service from list
        setServices((prev) => prev.filter((s) => s.id !== deleteService!.id));
      }

      setDeleteDialogOpen(false);
      setDeleteProduct(null);
      setDeleteService(null);
    } catch (err: any) {
      setError(err.message || `Failed to delete ${deleteType}`);
      setDeleteDialogOpen(false);
      setDeleteProduct(null);
      setDeleteService(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleEditSuccess = () => {
    // Refresh products and services list
    const fetchData = async () => {
      try {
        // Fetch products
        const productsRes = await fetch(`${API_BASE_URL}/business/products`, {
          credentials: "include",
        });
        const productsData = await productsRes.json();
        if (productsRes.ok && productsData.success) {
          const transformedProducts: Product[] = productsData.data.map((p: any) => ({
            id: p.id,
            name: p.name,
            price: parseFloat(p.price) || 0,
            business: "Your Store",
            image: (Array.isArray(p.images) && p.images[0]) || "/opengraph.jpg",
            category: p.category || "",
            rating: parseFloat(p.averageRating) || 0,
            reviews: parseInt(p.reviewCount) || 0,
            pickupTime: "30 mins",
            isNew: false,
            retailerPostcode: undefined,
            retailerCity: undefined,
            isApproved: p.isApproved,
            stock: parseInt(p.stock) || 0,
            description: p.description || "",
          }));
          setProducts(transformedProducts);
        }

        // Fetch services
        const servicesRes = await fetch(`${API_BASE_URL}/business/services`, {
          credentials: "include",
        });
        const servicesData = await servicesRes.json();
        if (servicesRes.ok && servicesData.success) {
          // Transform API data to match Service interface (convert snake_case to camelCase)
          const transformedServices: Service[] = (servicesData.data || []).map((s: any) => ({
            id: s.id,
            name: s.name,
            description: s.description || "",
            price: parseFloat(s.price) || 0,
            category: s.category || "",
            images: Array.isArray(s.images) ? s.images : [],
            durationMinutes: parseInt(s.duration_minutes) || 60,
            maxParticipants: parseInt(s.max_participants) || 1,
            locationType: s.location_type || 'onsite',
            requiresStaff: s.requires_staff || false,
            isApproved: s.is_approved || false,
            createdAt: s.created_at,
            updatedAt: s.updated_at,
          }));
          setServices(transformedServices);
        }
      } catch (err) {
        // Silently fail - user can refresh manually if needed
      }
    };
    fetchData();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Your Products</h1>
            <p className="text-muted-foreground">Manage your product catalog</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setCreateServiceModalOpen(true)}>
              Create Service
            </Button>
            <Button onClick={() => setCreateModalOpen(true)}>
              Create Product
            </Button>
          </div>
        </div>

        {/* Header Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalItems}</div>
              <p className="text-xs text-muted-foreground">Products & Services</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
              <p className="text-xs text-muted-foreground">Visible to customers</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              <XCircle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
              <p className="text-xs text-muted-foreground">Awaiting admin review</p>
            </CardContent>
          </Card>
        </div>

        {/* Products List */}
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}

        {error && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-destructive">{error}</div>
            </CardContent>
          </Card>
        )}

        {!loading && !error && (
          <>
            {totalItems === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No items yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first product or service to start selling
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {products.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Products</h2>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {products.map((product) => (
                        <Card key={product.id} className="overflow-hidden">
                          <div className="relative">
                            <img
                              src={product.image}
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
                                <span className="text-2xl font-bold">£{product.price.toFixed(2)}</span>
                                <span className="text-sm text-muted-foreground">
                                  Stock: {product.stock || 0}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {product.description || "No description"}
                              </p>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{product.category}</Badge>
                              </div>
                              <div className="flex gap-2 pt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => handleEdit(product)}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => handleDeleteClick(product)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </Button>
                              </div>
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
                              src={(Array.isArray(service.images) && service.images[0]) || "/opengraph.jpg"}
                              alt={service.name}
                              className="w-full h-48 object-cover"
                            />
                            <Badge
                              className={`absolute top-2 right-2 ${
                                service.isApproved
                                  ? "bg-green-600 hover:bg-green-700"
                                  : "bg-yellow-600 hover:bg-yellow-700"
                              }`}
                            >
                              {service.isApproved ? "Approved" : "Pending"}
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
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{service.category}</Badge>
                                <Badge variant="outline" className="text-xs">
                                  {service.locationType === 'onsite' ? 'On-site' : 
                                   service.locationType === 'customer_address' ? 'At Customer' : 'Online'}
                                </Badge>
                              </div>
                              <div className="flex gap-2 pt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => handleEditService(service)}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => handleDeleteServiceClick(service)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Create Product Modal */}
      <CreateProductModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={handleEditSuccess}
      />

      {/* Edit Product Modal */}
      <CreateProductModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        product={editProduct}
        onSuccess={handleEditSuccess}
      />

      {/* Create Service Modal */}
      <CreateServiceModal
        open={createServiceModalOpen}
        onOpenChange={setCreateServiceModalOpen}
        onSuccess={handleEditSuccess}
      />

      {/* Edit Service Modal */}
      <CreateServiceModal
        open={editServiceModalOpen}
        onOpenChange={setEditServiceModalOpen}
        service={editService ? {
          id: editService.id,
          name: editService.name,
          description: editService.description,
          price: editService.price,
          category: editService.category,
          images: editService.images,
          duration_minutes: editService.durationMinutes,
          max_participants: editService.maxParticipants,
          requires_staff: editService.requiresStaff,
          location_type: (editService.locationType as 'onsite' | 'customer_address' | 'online') || 'onsite',
        } : null}
        onSuccess={handleEditSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the {deleteType === 'product' ? 'product' : 'service'}{" "}
              <strong>{deleteType === 'product' ? deleteProduct?.name : deleteService?.name}</strong> and remove it from your store.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}

