import { Link } from "wouter";
import { Search, Menu, User, LogOut, Coins, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ASSETS } from "@/lib/product";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [userPoints, setUserPoints] = useState<{ balance: number } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.role === "customer") {
      fetchUserPoints();
    }
  }, [isAuthenticated, user]);

  const fetchUserPoints = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/user/points`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUserPoints(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch user points:", err);
    }
  };

  const businessTarget = "/for-businesses";

  const handleLogout = async () => {
    await logout();
  };

  const getUserInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase();
  };

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl">
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-full px-6 py-3 flex items-center justify-between shadow-xl">
        {/* Logo & Nav Links */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center">
            <img src={ASSETS.logo} alt="Localito" className="h-8 w-auto object-contain" />
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/search?category=all" className="text-muted-foreground hover:text-primary transition-colors">
              Marketplace
            </Link>
            <Link href={businessTarget} className="text-muted-foreground hover:text-primary transition-colors">
              For Businesses
            </Link>
            <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
              Our Story
            </Link>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{getUserInitials(user.username)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.username}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href={
                      user.role === "admin"
                        ? "/admin/dashboard"
                        : user.role === "business"
                        ? "/business/dashboard"
                        : "/orders"
                    }
                    className="cursor-pointer"
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                {isAuthenticated && user?.role === "customer" && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/points" className="flex items-center gap-2">
                        <Coins className="h-4 w-4" />
                        My Points
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/messages" className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        Messages
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/login/customer" className="text-sm font-medium hover:text-primary transition-colors px-2">
                Sign In
              </Link>
              <Link href="/signup/customer">
                <Button size="sm" className="bg-primary text-white font-semibold px-5 py-2.5 rounded-full hover:shadow-lg hover:shadow-primary/30 transition-all">
                  Join Now
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu - hamburger opens sheet */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden rounded-full"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <SheetHeader>
                <SheetTitle className="text-left">Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-6 pt-6">
                <nav className="flex flex-col gap-2">
                  <Link
                    href="/search?category=all"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    <Search className="h-4 w-4" />
                    Marketplace
                  </Link>
                  <Link
                    href={businessTarget}
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    For Businesses
                  </Link>
                  <Link
                    href="/about"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    Our Story
                  </Link>
                </nav>
                <div className="border-t border-border pt-4">
                  {isAuthenticated && user ? (
                    <div className="flex flex-col gap-1">
                      <div className="px-3 py-2 text-xs font-medium text-muted-foreground">
                        {user.username}
                      </div>
                      <Link
                        href={
                          user.role === "admin"
                            ? "/admin/dashboard"
                            : user.role === "business"
                            ? "/business/dashboard"
                            : "/orders"
                        }
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        <User className="h-4 w-4" />
                        Dashboard
                      </Link>
                      {user.role === "customer" && (
                        <>
                          <Link
                            href="/points"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                          >
                            <Coins className="h-4 w-4" />
                            My Points
                          </Link>
                          <Link
                            href="/messages"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                          >
                            <MessageCircle className="h-4 w-4" />
                            Messages
                          </Link>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          handleLogout();
                        }}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        Log out
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Link
                        href="/login/customer"
                        onClick={() => setMobileMenuOpen(false)}
                        className="rounded-lg px-3 py-2.5 text-sm font-medium text-center border border-border hover:bg-muted transition-colors"
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/signup/customer"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Button size="sm" className="w-full bg-primary text-white font-semibold rounded-lg">
                          Join Now
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
