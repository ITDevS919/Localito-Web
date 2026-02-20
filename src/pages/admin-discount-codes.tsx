import { useEffect, useState } from "react";
import { AdminDashboardLayout } from "@/components/layout/AdminDashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { useRequireRole } from "@/hooks/useRequireRole";
import { Plus, Loader2, Tag, Trash2, Edit, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface BusinessOption {
  id: string;
  business_name: string;
}

interface DiscountCode {
  id: string;
  code: string;
  description?: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_purchase_amount: number;
  max_discount_amount?: number;
  usage_limit?: number;
  used_count: number;
  valid_from: string;
  valid_until?: string;
  is_active: boolean;
  participating_business_ids?: string[];
}

export default function AdminDiscountCodesPage() {
  useRequireRole("admin", "/admin");
  const { toast } = useToast();
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: "",
    minPurchaseAmount: "",
    maxDiscountAmount: "",
    usageLimit: "",
    validUntil: "",
    participatingBusinessIds: [] as string[],
    isActive: true,
  });
  const [businesses, setBusinesses] = useState<BusinessOption[]>([]);
  const [businessesLoading, setBusinessesLoading] = useState(false);
  const [participatingOpen, setParticipatingOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCodes();
  }, []);

  useEffect(() => {
    if ((isDialogOpen || editingId) && businesses.length === 0) {
      setBusinessesLoading(true);
      fetch(`${API_BASE_URL}/admin/businesses?limit=500&status=approved`, { credentials: "include" })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data?.businesses)) {
            setBusinesses(
              data.data.businesses.map((b: { id: string; business_name: string }) => ({
                id: b.id,
                business_name: b.business_name || "Unnamed",
              }))
            );
          }
        })
        .catch(() => {})
        .finally(() => setBusinessesLoading(false));
    }
  }, [isDialogOpen, editingId]);

  const fetchCodes = async () => {
    try {
      // Note: You'll need to add GET /admin/discount-codes endpoint
      const res = await fetch(`${API_BASE_URL}/admin/discount-codes`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCodes(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch discount codes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.participatingBusinessIds.length === 0) {
      toast({
        title: "Select businesses",
        description: "Please select at least one participating business for this discount code",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);

    const payload = {
      code: formData.code,
      description: formData.description || null,
      discountType: formData.discountType,
      discountValue: parseFloat(formData.discountValue),
      minPurchaseAmount: parseFloat(formData.minPurchaseAmount) || 0,
      maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : null,
      usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
      validUntil: formData.validUntil || null,
      participatingBusinessIds: formData.participatingBusinessIds,
      ...(editingId && { isActive: formData.isActive }),
    };

    try {
      if (editingId) {
        const res = await fetch(`${API_BASE_URL}/admin/discount-codes/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          toast({ title: "Discount code updated", description: "Changes have been saved." });
          setEditingId(null);
          setIsDialogOpen(false);
          resetForm();
          fetchCodes();
        } else {
          throw new Error(data.message || "Failed to update discount code");
        }
      } else {
        const res = await fetch(`${API_BASE_URL}/admin/discount-codes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          toast({
            title: "Discount code created",
            description: "The discount code has been created successfully",
          });
          setIsDialogOpen(false);
          resetForm();
          fetchCodes();
        } else {
          throw new Error(data.message || "Failed to create discount code");
        }
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to save discount code",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (code: DiscountCode) => {
    setFormData({
      code: code.code,
      description: code.description || "",
      discountType: code.discount_type,
      discountValue: String(code.discount_value),
      minPurchaseAmount: String(code.min_purchase_amount ?? 0),
      maxDiscountAmount: code.max_discount_amount != null ? String(code.max_discount_amount) : "",
      usageLimit: code.usage_limit != null ? String(code.usage_limit) : "",
      validUntil: code.valid_until
        ? new Date(code.valid_until).toISOString().slice(0, 16)
        : "",
      participatingBusinessIds: Array.isArray(code.participating_business_ids) ? code.participating_business_ids : [],
      isActive: code.is_active !== false,
    });
    setEditingId(code.id);
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/discount-codes/${deleteId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast({ title: "Discount code removed", description: "The discount code has been deleted." });
        setDeleteId(null);
        fetchCodes();
      } else {
        throw new Error(data.message || "Failed to delete discount code");
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Could not delete discount code",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      description: "",
      discountType: "percentage",
      discountValue: "",
      minPurchaseAmount: "",
      maxDiscountAmount: "",
      usageLimit: "",
      validUntil: "",
      participatingBusinessIds: [],
      isActive: true,
    });
  };

  const toggleParticipatingBusiness = (businessId: string) => {
    setFormData((prev) => ({
      ...prev,
      participatingBusinessIds: prev.participatingBusinessIds.includes(businessId)
        ? prev.participatingBusinessIds.filter((id) => id !== businessId)
        : [...prev.participatingBusinessIds, businessId],
    }));
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Discount Codes</h1>
            <p className="text-muted-foreground">Manage discount codes and promotions</p>
          </div>
          <Dialog
            open={isDialogOpen || !!editingId}
            onOpenChange={(open) => {
              if (!open) {
                setIsDialogOpen(false);
                setEditingId(null);
                resetForm();
              }
            }}
          >
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingId(null);
                  setIsDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Discount Code
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Discount Code" : "Create Discount Code"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="SAVE10"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="discountType">Discount Type *</Label>
                    <Select
                      value={formData.discountType}
                      onValueChange={(value: "percentage" | "fixed") =>
                        setFormData({ ...formData, discountType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discountValue">
                      {formData.discountType === "percentage" ? "Percentage (%) *" : "Amount (£) *"}
                    </Label>
                    <Input
                      id="discountValue"
                      type="number"
                      step={formData.discountType === "percentage" ? "1" : "0.01"}
                      min="0"
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                      placeholder={formData.discountType === "percentage" ? "10" : "5.00"}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minPurchaseAmount">Min Purchase (£)</Label>
                    <Input
                      id="minPurchaseAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.minPurchaseAmount}
                      onChange={(e) => setFormData({ ...formData, minPurchaseAmount: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxDiscountAmount">Max Discount (£)</Label>
                    <Input
                      id="maxDiscountAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.maxDiscountAmount}
                      onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="usageLimit">Usage Limit</Label>
                    <Input
                      id="usageLimit"
                      type="number"
                      min="1"
                      value={formData.usageLimit}
                      onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                      placeholder="Unlimited"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="validUntil">Valid Until</Label>
                    <Input
                      id="validUntil"
                      type="datetime-local"
                      value={formData.validUntil}
                      onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    />
                  </div>
                </div>

                {editingId && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, isActive: checked === true })
                      }
                    />
                    <Label htmlFor="isActive" className="font-normal cursor-pointer">
                      Active (inactive codes cannot be used)
                    </Label>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Participating Businesses *</Label>
                  <p className="text-sm text-muted-foreground">
                    Select which businesses can accept this discount code. At least one required.
                  </p>
                  <Popover open={participatingOpen} onOpenChange={setParticipatingOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-between font-normal"
                      >
                        <span>
                          {formData.participatingBusinessIds.length === 0
                            ? "Select businesses..."
                            : `${formData.participatingBusinessIds.length} business(es) selected`}
                        </span>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full min-w-[var(--radix-popover-trigger-width)] p-0" align="start">
                      {businessesLoading ? (
                        <div className="p-4 flex items-center justify-center">
                          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                      ) : (
                        <ScrollArea className="h-64">
                          <div className="p-2 space-y-1">
                            {businesses.map((b) => (
                              <label
                                key={b.id}
                                className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent cursor-pointer"
                              >
                                <Checkbox
                                  checked={formData.participatingBusinessIds.includes(b.id)}
                                  onCheckedChange={() => toggleParticipatingBusiness(b.id)}
                                />
                                <span className="text-sm truncate">{b.business_name}</span>
                              </label>
                            ))}
                            {businesses.length === 0 && !businessesLoading && (
                              <p className="text-sm text-muted-foreground p-2">No approved businesses found</p>
                            )}
                          </div>
                        </ScrollArea>
                      )}
                    </PopoverContent>
                  </Popover>
                  {formData.participatingBusinessIds.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {formData.participatingBusinessIds
                        .map((id) => businesses.find((b) => b.id === id)?.business_name || id)
                        .join(", ")}
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      setEditingId(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {editingId ? "Saving..." : "Creating..."}
                      </>
                    ) : editingId ? (
                      "Save Changes"
                    ) : (
                      "Create Code"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : codes.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No discount codes created yet
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {codes.map((code) => (
              <Card key={code.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Tag className="h-5 w-5 shrink-0" />
                        <span className="text-xl font-bold">{code.code}</span>
                        <Badge variant={code.is_active ? "default" : "secondary"}>
                          {code.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      {code.description && (
                        <p className="text-sm text-muted-foreground mb-2">{code.description}</p>
                      )}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Discount</p>
                          <p className="font-medium">
                            {code.discount_type === "percentage"
                              ? `${code.discount_value}%`
                              : `£${Number(code.discount_value).toFixed(2)}`}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Min Purchase</p>
                          <p className="font-medium">  £{Number(code.min_purchase_amount).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Usage</p>
                          <p className="font-medium">
                            {code.used_count} / {code.usage_limit || "∞"}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Valid Until</p>
                          <p className="font-medium">
                            {code.valid_until
                              ? new Date(code.valid_until).toLocaleDateString()
                              : "No expiry"}
                          </p>
                        </div>
                        {Array.isArray(code.participating_business_ids) && code.participating_business_ids.length > 0 && (
                          <div className="col-span-2 md:col-span-4">
                            <p className="text-muted-foreground">Participating businesses</p>
                            <p className="font-medium text-sm">
                              {code.participating_business_ids.length} business(es)
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(code)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(code.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete discount code?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove the discount code. This cannot be undone. You cannot
                delete a code that has already been used on any order.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  handleDelete();
                }}
                disabled={deleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminDashboardLayout>
  );
}
