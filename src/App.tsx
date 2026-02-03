import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Home from "@/pages/home";
import SearchPage from "@/pages/search";
import ProductDetailPage from "@/pages/product-detail";
import ServiceDetailPage from "@/pages/service-detail";
import CartPage from "@/pages/cart";
import CheckoutPage from "@/pages/checkout";
import OrdersPage from "@/pages/orders";
import OrderDetailPage from "@/pages/order-detail";
import BusinessDashboard from "@/pages/business-dashboard";
import BusinessOnboardingPage from "@/pages/business-onboarding";
import BusinessProductsPage from "@/pages/business-products";
import BusinessOrdersPage from "@/pages/business-orders";
import BusinessOrderDetailPage from "@/pages/business-order-detail";
import BusinessSettingsPage from "@/pages/business-settings";
import BusinessSquareSettingsPage from "@/pages/business-square-settings";
import BusinessShopifySettingsPage from "@/pages/business-shopify-settings";
import BusinessAvailabilityPage from "@/pages/business-availability";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminProductsPage from "@/pages/admin-products";
import AdminBusinessesPage from "@/pages/admin-businesses";
import AdminOrdersPage from "@/pages/admin-orders";
import AdminOrderDetailPage from "@/pages/admin-order-detail";
import AdminCategoriesPage from "@/pages/admin-categories";
import AdminReviewsPage from "@/pages/admin-reviews";
import AdminSettingsPage from "@/pages/admin-settings";
import LoginAdminPage from "@/pages/login-admin";
import LoginCustomerPage from "@/pages/login-customer";
import LoginBusinessPage from "@/pages/login-business";
import ForgotPasswordPage from "@/pages/forgot-password";
import ResetPasswordPage from "@/pages/reset-password";
import SignupCustomerPage from "@/pages/signup-customer";
import SignupBusinessPage from "@/pages/signup-business";
import NotFound from "@/pages/not-found";
import WishlistPage from "@/pages/wishlist";
import BusinessProfilePage from "@/pages/business-profile";
import BusinessPostsPage from "@/pages/business-posts";
import BusinessPayoutsPage from "@/pages/business-payouts";
import BusinessQRScannerPage from "@/pages/business-qr-scanner";
import AdminDiscountCodesPage from "@/pages/admin-discount-codes";
import AdminMessagesPage from "@/pages/admin-messages";
import AdminPayoutVerificationsPage from "@/pages/admin-payout-verifications";
import UserPointsPage from "@/pages/user-points";
import MessagesPage from "@/pages/messages";
import BusinessMessagesPage from "@/pages/business-messages";
import { SupportChat } from "@/components/chat/SupportChat";
import PrivacyPage from "@/pages/privacy";
import TermsPage from "@/pages/terms";
import CookiesPage from "@/pages/cookies";
import ForBusinessesPage from "@/pages/for-businesses";
import AboutPage from "@/pages/about";
import CommissionPage from "@/pages/commission";
import FAQPage from "@/pages/faq";
import ContactPage from "@/pages/contact";
import DeleteAccountPage from "@/pages/delete-account";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/search" component={SearchPage} />
      <Route path="/product/:id" component={ProductDetailPage} />
      <Route path="/service/:id" component={ServiceDetailPage} />

      {/* Customer auth */}
      <Route path="/login/customer" component={LoginCustomerPage} />
      <Route path="/signup/customer" component={SignupCustomerPage} />

      {/* Forgot & reset password */}
      <Route path="/forgot-password/business" component={ForgotPasswordPage} />
      <Route path="/forgot-password" component={ForgotPasswordPage} />
      <Route path="/reset-password" component={ResetPasswordPage} />

      {/* Business auth */}
      <Route path="/for-businesses" component={ForBusinessesPage} />
      <Route path="/login/business" component={LoginBusinessPage} />
      <Route path="/signup/business" component={SignupBusinessPage} />

      {/* Admin auth */}
      <Route path="/admin" component={LoginAdminPage} />

      {/* Customer */}
      <Route path="/cart" component={CartPage} />
      <Route path="/checkout" component={CheckoutPage} />
      <Route path="/orders" component={OrdersPage} />
      <Route path="/orders/:id" component={OrderDetailPage} />
      <Route path="/wishlist" component={WishlistPage} />
      <Route path="/points" component={UserPointsPage} />
      
      {/* Business Routes */}
      <Route path="/business/onboarding" component={BusinessOnboardingPage} />
      <Route path="/business/dashboard" component={BusinessDashboard} />
      <Route path="/business/products" component={BusinessProductsPage} />
      <Route path="/business/orders" component={BusinessOrdersPage} />
      <Route path="/business/orders/:id" component={BusinessOrderDetailPage} />
      <Route path="/business/settings" component={BusinessSettingsPage} />
      <Route path="/business/square-settings" component={BusinessSquareSettingsPage} />
      <Route path="/business/shopify-settings" component={BusinessShopifySettingsPage} />
      <Route path="/business/availability" component={BusinessAvailabilityPage} />
      <Route path="/business/posts" component={BusinessPostsPage} />
      <Route path="/business/payouts" component={BusinessPayoutsPage} />
      <Route path="/business/messages" component={BusinessMessagesPage} />
      <Route path="/business/qr-scanner" component={BusinessQRScannerPage} />
      
      {/* Public business profile - MUST be last to avoid matching other routes */}
      <Route path="/business/:businessId" component={BusinessProfilePage} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/products" component={AdminProductsPage} />
      <Route path="/admin/businesses" component={AdminBusinessesPage} />
      <Route path="/admin/orders/:id" component={AdminOrderDetailPage} />
      <Route path="/admin/orders" component={AdminOrdersPage} />
      <Route path="/admin/categories" component={AdminCategoriesPage} />
      <Route path="/admin/reviews" component={AdminReviewsPage} />
      <Route path="/admin/settings" component={AdminSettingsPage} />
      <Route path="/admin/messages" component={AdminMessagesPage} />
      <Route path="/admin/discount-codes" component={AdminDiscountCodesPage} />
      <Route path="/admin/payout-verifications" component={AdminPayoutVerificationsPage} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/products" component={AdminProductsPage} />
      <Route path="/admin/businesses" component={AdminBusinessesPage} />
      <Route path="/admin/messages" component={AdminMessagesPage} />
      <Route path="/admin/discount-codes" component={AdminDiscountCodesPage} />

      {/* Messages */}
      <Route path="/messages" component={MessagesPage} />

      {/* Legal */}
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/delete-account" component={DeleteAccountPage} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/cookies" component={CookiesPage} />
      
      {/* About, FAQ & Contact */}
      <Route path="/about" component={AboutPage} />
      <Route path="/commission" component={CommissionPage} />
      <Route path="/faq" component={FAQPage} />
      <Route path="/contact" component={ContactPage} />
      {/* Backwards-compatible routes pointing to unified terms */}
      <Route path="/terms/consumers" component={TermsPage} />
      <Route path="/terms/businesses" component={TermsPage} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
          <SupportChat />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
