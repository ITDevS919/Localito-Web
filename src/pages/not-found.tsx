import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex gap-2 justify-center">
            <Link href="/">
              <Button>Go Home</Button>
            </Link>
            <Link href="/search">
              <Button variant="outline">Browse Products</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
