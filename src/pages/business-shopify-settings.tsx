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

  useEffect(() => {
    loadShopifyStatus();
  }, []);

  // Handle OAuth redirect params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get("connected");
    const err = params.get("error");
    if (connected === "1") {
      toast({
        title: "Shopify connected",
        description: "Your Shopify store is now connected to Localito.",
      });
      window.history.replaceState({}, "", "/business/shopify-settings");
      loadShopifyStatus();
    }
    if (err) {
      const msg =
        err === "missing_params"
          ? "Missing shop or code. Try connecting again."
          : err === "invalid_state"
            ? "Session expired. Please try connecting again."
            : err === "oauth_failed"
              ? "Authorization failed. Check your store URL and try again."
              : "Something went wrong. Try again.";
      setError(msg);
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
            <AlertDescription>{error}</AlertDescription>
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
              <CardTitle>Connect Shopify store</CardTitle>
              <CardDescription>
                Enter your Shopify store domain. You’ll be sent to Shopify to authorize Localito.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="shop">Store domain</Label>
                <Input
                  id="shop"
                  type="text"
                  placeholder="mystore.myshopify.com"
                  value={shopInput}
                  onChange={(e) => setShopInput(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Your store’s myshopify.com domain (e.g. mystore.myshopify.com)
                </p>
              </div>
              <Button onClick={handleConnect} disabled={!shopInput.trim()} className="w-full">
                <Link2 className="mr-2 h-4 w-4" />
                Connect with Shopify
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>How it works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>OAuth:</strong> You’ll be redirected to Shopify to approve access. No need to
              copy API keys.
            </p>
            <p>
              <strong>Product sync:</strong> After connecting, you can link Localito products to
              Shopify products (and optionally sync stock) from the product edit screen.
            </p>
            <p>
              <strong>Same as Square:</strong> Like Square, you can choose which products sync from
              Shopify and which use manual stock.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
