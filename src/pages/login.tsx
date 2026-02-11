import { useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

/**
 * Generic login route that redirects to customer login by default
 * Preserves redirect parameter from query string
 * 
 * This handles /login URLs and redirects to /login/customer
 * while preserving any redirect query parameters
 */
export default function LoginPage() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Get redirect parameter from current URL
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect");
    
    // Build redirect URL with preserved query params
    const redirectUrl = redirect 
      ? `/login/customer?redirect=${encodeURIComponent(redirect)}`
      : "/login/customer";
    
    // Redirect to customer login (most common use case)
    setLocation(redirectUrl);
  }, [setLocation]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}
