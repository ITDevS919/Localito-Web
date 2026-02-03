import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, XCircle, Link2, Unlink, TestTube, AlertCircle } from "lucide-react";
import { useRequireRole } from "@/hooks/useRequireRole";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface ShopifyStatus {
  connected: boolean;
  syncEnabled: boolean;
  connectedAt: string | null;
  shop: string | null;
}

export default function BusinessShopifySettingsPage() {
  useRequireRole("business", "/login/business");
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<ShopifyStatus | null>(null);
  const [testing, setTesting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [shopInput, setShopInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [redirectUriHint, setRedirectUriHint] = useState<string | null>(null);

  useEffect(() => {
    loadShopifyStatus();
  }, []);

  // Handle OAuth redirect params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get("connected");
    const err = params.get("error");
    const errorDetail = params.get("error_detail");
    if (connected === "1") {
      toast({
        title: "Shopify connected",
        description: "Your Shopify store is now connected to Localito.",
      });
      window.history.replaceState({}, "", "/business/shopify-settings");
      loadShopifyStatus();
    }
    if (err) {
      const messages: Record<string, string> = {
        missing_params: "Missing shop or code. Try connecting again.",
        invalid_state: "Session expired. Please try connecting again.",
        oauth_failed: "Authorization failed. Check your store URL and try again.",
        business_only: "Only business accounts can connect a Shopify store.",
        missing_shop: "Please enter your Shopify store domain.",
        no_business: "Business profile not found. Complete your business profile first.",
        auth_failed: "Could not start Shopify connection. Try again.",
        redirect_uri_mismatch:
          "Your Shopify app redirect URL does not match. Add the exact redirect URL below in your Shopify app settings.",
        invalid_credentials:
          "Shopify API credentials are invalid. Check SHOPIFY_API_KEY and SHOPIFY_API_SECRET.",
        token_exchange_failed: errorDetail
          ? `Shopify returned an error: ${errorDetail}`
          : "Shopify could not complete authorization. Try again.",
      };
      const msg = messages[err] || "Something went wrong. Try again.";
      setError(msg);
      if (err === "redirect_uri_mismatch") {
        fetch(`${API_BASE_URL}/shopify/redirect-uri`)
          .then((r) => r.json())
          .then((d) => d.redirectUri && setRedirectUriHint(d.redirectUri))
          .catch(() => {});
      } else {
        setRedirectUriHint(null);
      }
      toast({ title: "Connection failed", description: msg, variant: "destructive" });
      window.history.replaceState({}, "", "/business/shopify-settings");
    }
  }, []);

  const loadShopifyStatus = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/business/shopify/status`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load Shopify status");
      }
      setStatus(data.data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load status";
      setError(message);
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    if (!status?.connected) {
      toast({
        title: "Not connected",
        description: "Connect your Shopify store first",
        variant: "destructive",
      });
      return;
    }
    setTesting(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/business/shopify/test`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Connection test failed");
      }
      if (data.data.valid) {
        toast({
          title: "Connection OK",
          description: "Your Shopify store is connected and working.",
        });
      } else {
        toast({
          title: "Connection failed",
          description: data.data.message || "Could not verify connection",
          variant: "destructive",
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Test failed";
      setError(message);
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setTesting(false);
    }
  };

  const handleConnect = () => {
    const shop = shopInput.trim().toLowerCase().replace(/^https?:\/\//, "").split("/")[0];
    if (!shop) {
      setError("Enter your Shopify store domain (e.g. mystore.myshopify.com)");
      return;
    }
    const normalized = shop.endsWith(".myshopify.com") ? shop : `${shop}.myshopify.com`;
    setError(null);
    window.location.href = `${API_BASE_URL}/shopify/auth?shop=${encodeURIComponent(normalized)}`;
  };

  const handleDisconnect = async () => {
    if (
      !confirm(
        "Disconnect your Shopify store? Product sync from Shopify will be disabled until you reconnect."
      )
    ) {
      return;
    }
    setDisconnecting(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/business/shopify/disconnect`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to disconnect");
      }
      toast({ title: "Disconnected", description: "Shopify store has been disconnected." });
      await loadShopifyStatus();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Disconnect failed";
      setError(message);
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setDisconnecting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Shopify integration</h1>
          <p className="text-muted-foreground">
            Connect your Shopify store to sync products with Localito
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <span>{error}</span>
              {redirectUriHint && (
                <div className="mt-3 rounded bg-black/10 p-3 font-mono text-xs break-all">
                  <p className="mb-1 font-semibold text-foreground">Add this URL in Shopify Partner Dashboard → App → URL configuration:</p>
                  {redirectUriHint}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Connection status</CardTitle>
            <CardDescription>Current Shopify store connection</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              {status?.connected ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-semibold">Connected</p>
                    <p className="text-sm text-muted-foreground">
                      {status.shop && `Store: ${status.shop}`}
                      {status.connectedAt && (
                        <>
                          <br />
                          Connected: {new Date(status.connectedAt).toLocaleDateString()}
                        </>
                      )}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-semibold">Not connected</p>
                    <p className="text-sm text-muted-foreground">
                      Connect your Shopify store to sync products
                    </p>
                  </div>
                </>
              )}
            </div>

            {status?.connected && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleTestConnection} disabled={testing} size="sm">
                  {testing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <TestTube className="mr-2 h-4 w-4" />
                      Test connection
                    </>
                  )}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                  size="sm"
                >
                  {disconnecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Disconnecting...
                    </>
                  ) : (
                    <>
                      <Unlink className="mr-2 h-4 w-4" />
                      Disconnect
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {!status?.connected && (
          <Card>
            <CardHeader>
              <CardTitle>Sign in with Shopify</CardTitle>
              <CardDescription>
                Connect your store to sync products. Shopify requires your <strong>store name</strong> (e.g. mystore) to start — even if you use a custom domain like mystore.com, use your myshopify.com name here.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
                  <div className="flex-1 space-y-1.5">
                    <Label htmlFor="shop" className="text-xs text-muted-foreground">Store name (required by Shopify)</Label>
                    <Input
                      id="shop"
                      type="text"
                      placeholder="e.g. mystore"
                      value={shopInput}
                      onChange={(e) => setShopInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && shopInput.trim() && handleConnect()}
                      className="h-11"
                    />
                  </div>
                  <Button
                    onClick={handleConnect}
                    disabled={!shopInput.trim()}
                    className="w-full sm:w-auto h-11 px-6 shrink-0"
                  >
                    <Link2 className="mr-2 h-4 w-4" />
                    Sign in with Shopify
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Have your own domain? Shopify OAuth only works with your <code className="bg-muted px-1 py-0.5 rounded">*.myshopify.com</code> admin domain.
                </p>
                <details className="text-xs text-muted-foreground border rounded-lg p-3 bg-muted/30">
                  <summary className="cursor-pointer font-medium text-foreground">Don't know your store name? How to find it</summary>
                  <ol className="mt-2 ml-4 space-y-1 list-decimal">
                    <li>Open your Shopify admin in your browser (where you manage products and orders).</li>
                    <li>Look at the address bar. You'll see one of these:
                      <ul className="mt-1 ml-4 list-disc">
                        <li><code className="bg-muted px-1 rounded">admin.shopify.com/store/<strong>your-store-name</strong></code> → enter <strong>your-store-name</strong></li>
                        <li><code className="bg-muted px-1 rounded">your-store-name.myshopify.com/admin</code> → enter <strong>your-store-name</strong> or <strong>your-store-name.myshopify.com</strong></li>
                      </ul>
                    </li>
                    <li>Use that store name in the field above, then click Sign in with Shopify.</li>
                  </ol>
                </details>
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </DashboardLayout>
  );
}
