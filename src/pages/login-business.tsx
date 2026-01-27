import { Link, useLocation } from "wouter";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { AuthForm } from "@/components/auth/AuthForm";
import { ASSETS } from "@/lib/product";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginBusinessPage() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (loading) return;
    if (user?.role === "business") {
      setLocation("/business/dashboard");
    } else if (user?.role === "admin") {
      setLocation("/admin/dashboard");
    }
  }, [user, loading, setLocation]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/">
            <img
              src={ASSETS.logo}
              alt="Localito Logo"
              className="h-14 w-auto object-contain cursor-pointer"
            />
          </Link>
        </div>

        <Card>
          <CardHeader />
          <CardContent>
            <AuthForm variant="login" role="business" />
          </CardContent>
          <CardFooter className="flex flex-col space-y-3">
            <div className="text-sm text-center text-muted-foreground">
              New business?{" "}
              <Link href="/signup/business" className="text-primary hover:underline font-medium">
                Create a business account
              </Link>
            </div>
            <div className="text-sm text-center text-muted-foreground">
              Shopping as a customer?{" "}
              <Link href="/login/customer" className="text-primary hover:underline font-medium">
                Customer login
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

