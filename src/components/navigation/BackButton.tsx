import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface BackButtonProps {
  fallbackHref?: string;
  label?: string;
  variant?: "ghost" | "outline" | "default";
  className?: string;
}

export function BackButton({ 
  fallbackHref, 
  label = "Back",
  variant = "ghost",
  className
}: BackButtonProps) {
  const [, setLocation] = useLocation();
  const [canGoBack, setCanGoBack] = useState(false);
  
  useEffect(() => {
    // Check if there's browser history to go back to
    // We can't directly check history.length, so we'll use a different approach
    // If we have a referrer or fallback, we can navigate
    setCanGoBack(true); // Assume we can go back, browser will handle it
  }, []);
  
  const handleBack = () => {
    // Try browser back first
    if (window.history.length > 1) {
      window.history.back();
    } else if (fallbackHref) {
      setLocation(fallbackHref);
    }
  };
  
  return (
    <Button variant={variant} onClick={handleBack} className={className}>
      <ChevronLeft className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );
}
