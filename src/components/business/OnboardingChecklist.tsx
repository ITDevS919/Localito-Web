import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle2, 
  Circle, 
  Store, 
  Package, 
  Wallet,
  X,
  Loader2,
  Info
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface OnboardingStatus {
  profileComplete: boolean;
  squareConnected: boolean;
  hasProducts: boolean;
  stripeSetup: boolean;
  onboardingCompletedAt: string | null;
  allComplete: boolean;
}

interface ChecklistItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  completed: boolean;
  optional?: boolean;
  href: string;
}

function ChecklistItem({ icon, title, description, completed, optional, href }: ChecklistItemProps) {
  return (
    <Link href={href}>
      <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer">
        <div className="mt-0.5">
          {completed ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {icon}
            <h4 className="font-medium text-sm">
              {title}
              {optional && <span className="text-xs text-muted-foreground ml-1">(optional)</span>}
            </h4>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
    </Link>
  );
}

export function OnboardingChecklist() {
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    loadOnboardingStatus();
  }, []);

  const loadOnboardingStatus = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/business/onboarding-status`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus(data.data);
      }
    } catch (err) {
      console.error("Failed to load onboarding status:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("localito_checklist_dismissed", "true");
  };

  // Don't show if already dismissed
  const isDismissed = dismissed || localStorage.getItem("localito_checklist_dismissed") === "true";
  
  // Don't show if loading or if onboarding is fully complete
  if (loading || !status || status.onboardingCompletedAt || isDismissed) {
    return null;
  }

  // Only show if there are incomplete tasks
  const hasIncompleteTasks = !status.profileComplete || !status.hasProducts || !status.stripeSetup;
  if (!hasIncompleteTasks) {
    return null;
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 h-8 w-8"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
        <CardTitle>Get Started</CardTitle>
        <CardDescription>
          Complete these steps to start accepting orders
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        <ChecklistItem
          icon={<Store className="h-4 w-4" />}
          title="Complete your profile"
          description="Add business name, address, and contact details"
          completed={status.profileComplete}
          href="/business/settings"
        />
        
        <ChecklistItem
          icon={<Package className="h-4 w-4" />}
          title="Add products"
          description="List items for customers to discover and purchase"
          completed={status.hasProducts}
          href="/business/products"
        />
        
        <ChecklistItem
          icon={<Wallet className="h-4 w-4" />}
          title="Set up payouts"
          description="Connect Stripe to receive payments"
          completed={status.stripeSetup}
          href="/business/payouts"
        />

        {!status.profileComplete && (
          <Alert className="mt-4">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Complete your profile first to get approved and start selling.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
