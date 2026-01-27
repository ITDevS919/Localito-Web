import { useEffect, useState } from "react";
import { AdminDashboardLayout } from "@/components/layout/AdminDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, AlertCircle, CreditCard, Building2, Mail, User } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface PayoutSettings {
  id: string;
  payoutMethod: string;
  accountDetails: Record<string, any>;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BusinessPayoutInfo {
  businessId: string; // Formerly retailerId
  retailerId?: string; // Legacy support
  businessName: string;
  email: string;
  username: string;
  payoutSettings: PayoutSettings | null;
}

export default function AdminPayoutVerificationsPage() {
  useRequireRole("admin", "/admin");
  const { toast } = useToast();
  const [businesses, setBusinesses] = useState<BusinessPayoutInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessPayoutInfo | null>(null);
  const [verifyAction, setVerifyAction] = useState<"verify" | "unverify">("verify");

  useEffect(() => {
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/payout-verifications`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load businesses");
      }
      setBusinesses(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyClick = (business: BusinessPayoutInfo, action: "verify" | "unverify") => {
    if (!business.payoutSettings) {
      toast({
        title: "No Payout Settings",
        description: "This business has not configured payout settings yet.",
        variant: "destructive",
      });
      return;
    }
    setSelectedBusiness(business);
    setVerifyAction(action);
    setVerifyDialogOpen(true);
  };

  const handleVerifyConfirm = async () => {
    if (!selectedBusiness || !selectedBusiness.payoutSettings) return;

    setVerifying(selectedBusiness.businessId || selectedBusiness.retailerId || "");
    try {
      const res = await fetch(`${API_BASE_URL}/business/payout-settings/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          businessId: selectedBusiness.businessId || selectedBusiness.retailerId,
          verified: verifyAction === "verify",
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update verification status");
      }

      toast({
        title: "Success",
        description: data.message || "Verification status updated successfully",
      });

      // Reload businesses to get updated status
      await loadBusinesses();
      setVerifyDialogOpen(false);
      setSelectedBusiness(null);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update verification status",
        variant: "destructive",
      });
      setVerifyDialogOpen(false);
      setSelectedBusiness(null);
    } finally {
      setVerifying(null);
    }
  };

  const getPayoutMethodLabel = (method: string) => {
    switch (method) {
      case "bank":
        return "Bank Transfer";
      case "paypal":
        return "PayPal";
      case "stripe":
        return "Stripe";
      default:
        return method;
    }
  };

  const maskAccountDetails = (details: Record<string, any>, method: string) => {
    if (method === "bank") {
      return {
        accountNumber: details.accountNumber
          ? `****${details.accountNumber.slice(-4)}`
          : "Not provided",
        sortCode: details.sortCode || "Not provided",
      };
    } else if (method === "paypal") {
      return {
        email: details.email || "Not provided",
      };
    } else if (method === "stripe") {
      return {
        note: "Handled via Stripe Connect",
      };
    }
    return details;
  };

  const verifiedBusinesses = businesses.filter((b) => b.payoutSettings?.isVerified);
  const unverifiedBusinesses = businesses.filter((b) => b.payoutSettings && !b.payoutSettings.isVerified);
  const noSettingsBusinesses = businesses.filter((b) => !b.payoutSettings);

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Payout Account Verifications</h1>
            <p className="text-muted-foreground">Review and verify business payout accounts</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified Accounts</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{verifiedBusinesses.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
              <AlertCircle className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{unverifiedBusinesses.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">No Settings</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">{noSettingsBusinesses.length}</div>
            </CardContent>
          </Card>
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

        {/* Unverified Businesses */}
        {!loading && !error && unverifiedBusinesses.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Pending Verification</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {unverifiedBusinesses.map((business) => (
                <Card key={business.businessId || business.retailerId}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{business.businessName}</CardTitle>
                        <Badge className="mt-2 bg-amber-600 hover:bg-amber-700">Pending Verification</Badge>
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
                          <User className="h-4 w-4" />
                          <span>{business.username}</span>
                        </div>
                        {business.payoutSettings && (
                          <>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <CreditCard className="h-4 w-4" />
                              <span>{getPayoutMethodLabel(business.payoutSettings.payoutMethod)}</span>
                            </div>
                            <div className="mt-2 p-2 bg-muted rounded-md text-xs">
                              <div className="font-medium mb-1">Account Details:</div>
                              {Object.entries(
                                maskAccountDetails(
                                  business.payoutSettings.accountDetails,
                                  business.payoutSettings.payoutMethod
                                )
                              ).map(([key, value]) => (
                                <div key={key} className="text-muted-foreground">
                                  <span className="font-medium capitalize">{key.replace(/([A-Z])/g, " $1").trim()}:</span>{" "}
                                  {String(value)}
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => handleVerifyClick(business, "verify")}
                        disabled={verifying === (business.businessId || business.retailerId)}
                      >
                        {verifying === (business.businessId || business.retailerId) ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Verify Account
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

        {/* Verified Businesses */}
        {!loading && !error && verifiedBusinesses.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Verified Accounts</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {verifiedBusinesses.map((business) => (
                <Card key={business.businessId || business.retailerId}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{business.businessName}</CardTitle>
                        <Badge className="mt-2 bg-green-600 hover:bg-green-700">Verified</Badge>
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
                          <User className="h-4 w-4" />
                          <span>{business.username}</span>
                        </div>
                        {business.payoutSettings && (
                          <>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <CreditCard className="h-4 w-4" />
                              <span>{getPayoutMethodLabel(business.payoutSettings.payoutMethod)}</span>
                            </div>
                            <div className="mt-2 p-2 bg-muted rounded-md text-xs">
                              <div className="font-medium mb-1">Account Details:</div>
                              {Object.entries(
                                maskAccountDetails(
                                  business.payoutSettings.accountDetails,
                                  business.payoutSettings.payoutMethod
                                )
                              ).map(([key, value]) => (
                                <div key={key} className="text-muted-foreground">
                                  <span className="font-medium capitalize">{key.replace(/([A-Z])/g, " $1").trim()}:</span>{" "}
                                  {String(value)}
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleVerifyClick(business, "unverify")}
                        disabled={verifying === (business.businessId || business.retailerId)}
                      >
                        {verifying === (business.businessId || business.retailerId) ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <XCircle className="mr-2 h-4 w-4" />
                            Unverify Account
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

        {/* No Settings Businesses */}
        {!loading && !error && noSettingsBusinesses.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">No Payout Settings</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {noSettingsBusinesses.map((business) => (
                <Card key={business.businessId || business.retailerId}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{business.businessName}</CardTitle>
                        <Badge className="mt-2 bg-gray-600 hover:bg-gray-700">No Settings</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>{business.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>{business.username}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        This business has not configured payout settings yet.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {!loading && !error && businesses.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No businesses found</h3>
                <p className="text-muted-foreground">No businesses are registered on the platform yet.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Verify/Unverify Confirmation Dialog */}
      <AlertDialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {verifyAction === "verify" ? "Verify Payout Account?" : "Unverify Payout Account?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {verifyAction === "verify" ? (
                <>
                  Are you sure you want to verify the payout account for <strong>{selectedBusiness?.businessName}</strong>?
                  This will allow them to request payouts.
                </>
              ) : (
                <>
                  Are you sure you want to unverify the payout account for <strong>{selectedBusiness?.businessName}</strong>?
                  They will no longer be able to request payouts until verified again.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!verifying}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleVerifyConfirm}
              disabled={!!verifying}
              className={verifyAction === "verify" ? "bg-green-600 hover:bg-green-700" : "bg-destructive"}
            >
              {verifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : verifyAction === "verify" ? (
                "Verify"
              ) : (
                "Unverify"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminDashboardLayout>
  );
}
