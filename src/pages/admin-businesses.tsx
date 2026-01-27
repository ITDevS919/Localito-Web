import { useEffect, useState } from "react";
import { AdminDashboardLayout } from "@/components/layout/AdminDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, CheckCircle2, Users, AlertCircle, MapPin, Phone, Mail, Settings, Calendar } from "lucide-react";
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

interface PendingBusiness {
  id: string;
  business_name: string;
  business_address?: string;
  postcode?: string;
  city?: string;
  phone?: string;
  email: string;
  username: string;
  created_at: string;
}

interface Business {
  id: string;
  business_name: string;
  business_address?: string;
  postcode?: string;
  city?: string;
  phone?: string;
  email: string;
  username: string;
  created_at: string;
  is_approved: boolean;
  commission_rate_override?: number | null;
  trial_starts_at?: string;
  trial_ends_at?: string | null;
  billing_status?: string;
  trial_status?: string;
}

export default function AdminBusinessesPage() {
  useRequireRole("admin", "/admin");
  const [pendingBusinesses, setPendingBusinesses] = useState<PendingBusiness[]>([]);
  const [allBusinesses, setAllBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAll, setLoadingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [approving, setApproving] = useState<string | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<PendingBusiness | null>(null);
  const [billingDialogOpen, setBillingDialogOpen] = useState(false);
  const [selectedBillingBusiness, setSelectedBillingBusiness] = useState<Business | null>(null);
  const [commissionOverride, setCommissionOverride] = useState<string>("");
  const [trialEndsAt, setTrialEndsAt] = useState<string>("");
  const [billingStatus, setBillingStatus] = useState<string>("");
  const [savingBilling, setSavingBilling] = useState(false);

  useEffect(() => {
    loadPendingBusinesses();
  }, []);

  const loadPendingBusinesses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/businesses/pending`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load businesses");
      }
      setPendingBusinesses(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadAllBusinesses = async () => {
    setLoadingAll(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/businesses?status=approved&limit=100`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load businesses");
      }
      setAllBusinesses(data.data.businesses || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingAll(false);
    }
  };

  const handleApproveClick = (business: PendingBusiness) => {
    setSelectedBusiness(business);
    setApproveDialogOpen(true);
  };

  const handleApproveConfirm = async () => {
    if (!selectedBusiness) return;

    setApproving(selectedBusiness.id);
    try {
      const res = await fetch(`${API_BASE_URL}/businesses/${selectedBusiness.id}/approve`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to approve business");
      }

      // Remove business from list
      setPendingBusinesses((prev) => prev.filter((b) => b.id !== selectedBusiness.id));
      setApproveDialogOpen(false);
      setSelectedBusiness(null);
      // Reload all businesses if we're on that tab
      if (allBusinesses.length > 0) {
        loadAllBusinesses();
      }
    } catch (err: any) {
      setError(err.message);
      setApproveDialogOpen(false);
      setSelectedBusiness(null);
    } finally {
      setApproving(null);
    }
  };

  const handleEditBilling = (business: Business) => {
    setSelectedBillingBusiness(business);
    setCommissionOverride(business.commission_rate_override?.toString() || "");
    setTrialEndsAt(business.trial_ends_at ? new Date(business.trial_ends_at).toISOString().split('T')[0] : "");
    setBillingStatus(business.billing_status || "trial");
    setBillingDialogOpen(true);
  };

  const handleSaveBilling = async () => {
    if (!selectedBillingBusiness) return;

    setSavingBilling(true);
    try {
      const payload: any = {};
      
      if (commissionOverride !== "") {
        const rate = parseFloat(commissionOverride);
        if (isNaN(rate) || rate < 0 || rate > 1) {
          setError("Commission rate must be between 0 and 1");
          setSavingBilling(false);
          return;
        }
        payload.commission_rate_override = rate;
      } else {
        payload.commission_rate_override = null;
      }

      if (trialEndsAt) {
        payload.trial_ends_at = new Date(trialEndsAt).toISOString();
      } else {
        payload.trial_ends_at = null;
      }

      if (billingStatus) {
        payload.billing_status = billingStatus;
      }

      const res = await fetch(`${API_BASE_URL}/admin/businesses/${selectedBillingBusiness.id}/billing`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update billing settings");
      }

      setBillingDialogOpen(false);
      setSelectedBillingBusiness(null);
      loadAllBusinesses();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSavingBilling(false);
    }
  };

  const getTrialStatusBadge = (business: Business) => {
    const status = business.trial_status || "active";
    if (status === "trial") {
      return <Badge className="bg-blue-600 hover:bg-blue-700">Trial</Badge>;
    } else if (status === "suspended") {
      return <Badge className="bg-red-600 hover:bg-red-700">Suspended</Badge>;
    } else {
      return <Badge className="bg-green-600 hover:bg-green-700">Active</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Business Management</h1>
            <p className="text-muted-foreground">Manage business approvals and billing settings</p>
          </div>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">Pending Approvals</TabsTrigger>
            <TabsTrigger value="all" onClick={loadAllBusinesses}>All Businesses</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">

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

        {!loading && !error && pendingBusinesses.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No pending businesses</h3>
                <p className="text-muted-foreground">All business applications have been reviewed.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && !error && pendingBusinesses.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pendingBusinesses.map((business) => (
              <Card key={business.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{business.business_name}</CardTitle>
                      <Badge className="mt-2 bg-yellow-600 hover:bg-yellow-700">Pending</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>{business.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{business.username}</span>
                      </div>
                      {business.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>{business.phone}</span>
                        </div>
                      )}
                      {(business.postcode || business.city) && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {[business.postcode, business.city].filter(Boolean).join(", ")}
                          </span>
                        </div>
                      )}
                      {business.business_address && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {business.business_address}
                        </div>
                      )}
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => handleApproveClick(business)}
                      disabled={approving === business.id}
                    >
                      {approving === business.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Approving...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Approve Business
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            {loadingAll && (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}

            {!loadingAll && !error && allBusinesses.length === 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No businesses found</h3>
                    <p className="text-muted-foreground">No approved businesses yet.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {!loadingAll && !error && allBusinesses.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {allBusinesses.map((business) => (
                  <Card key={business.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{business.business_name}</CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            {getTrialStatusBadge(business)}
                            {business.is_approved && (
                              <Badge className="bg-green-600 hover:bg-green-700">Approved</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            <span>{business.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>Joined: {formatDate(business.created_at)}</span>
                          </div>
                          {business.commission_rate_override !== null && business.commission_rate_override !== undefined && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <span>Commission: {(business.commission_rate_override * 100).toFixed(1)}%</span>
                            </div>
                          )}
                          {business.trial_ends_at && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <span>Trial ends: {formatDate(business.trial_ends_at)}</span>
                            </div>
                          )}
                          {(business.postcode || business.city) && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              <span>
                                {[business.postcode, business.city].filter(Boolean).join(", ")}
                              </span>
                            </div>
                          )}
                        </div>
                        <Button
                          className="w-full"
                          variant="outline"
                          onClick={() => handleEditBilling(business)}
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Edit Billing
                        </Button>
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
            <AlertDialogTitle>Approve Business?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve <strong>{selectedBusiness?.business_name}</strong>? This will allow them to start selling on the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!approving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApproveConfirm}
              disabled={!!approving}
              className="bg-primary"
            >
              {approving ? (
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

      {/* Edit Billing Dialog */}
      <Dialog open={billingDialogOpen} onOpenChange={setBillingDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Billing Settings</DialogTitle>
            <DialogDescription>
              Configure commission rate and trial period for {selectedBillingBusiness?.business_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="commission">Commission Rate Override</Label>
              <Input
                id="commission"
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={commissionOverride}
                onChange={(e) => setCommissionOverride(e.target.value)}
                placeholder="Leave empty to use platform default"
              />
              <p className="text-xs text-muted-foreground">
                Enter as decimal (e.g., 0.06 for 6%). Leave empty for platform default.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="trialEnds">Trial End Date</Label>
              <Input
                id="trialEnds"
                type="date"
                value={trialEndsAt}
                onChange={(e) => setTrialEndsAt(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Set when the trial period ends. Leave empty for no trial.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="billingStatus">Billing Status</Label>
              <Select value={billingStatus} onValueChange={setBillingStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setBillingDialogOpen(false);
                setSelectedBillingBusiness(null);
              }}
              disabled={savingBilling}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveBilling} disabled={savingBilling}>
              {savingBilling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminDashboardLayout>
  );
}

