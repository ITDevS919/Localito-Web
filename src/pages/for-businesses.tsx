import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Store, ShieldCheck, Leaf, ArrowRight, CheckCircle, Zap, Users, CreditCard, Percent } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function ForBusinesses() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-32 animate-in fade-in duration-700">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-background to-secondary/20">
          <div className="container mx-auto px-4">
            <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground shadow-2xl border border-primary/20">
              <div className="grid gap-8 px-8 py-12 md:grid-cols-5 md:px-16 md:py-20 items-center">
                <div className="space-y-4 md:col-span-3 animate-in slide-in-from-left duration-700">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 text-primary-foreground/90 text-sm font-medium">
                    <Store className="h-4 w-4" />
                    For Businesses
                  </div>
                  <h1 className="font-heading text-3xl font-bold md:text-4xl lg:text-5xl leading-tight">
                    Grow Your Local Business with Localito
                  </h1>
                  <p className="text-lg text-primary-foreground/90 leading-relaxed">
                    Join Manchester's premier marketplace for independent businesses. Reach thousands of local customers, increase your online presence, and boost sales—all with transparent pricing and dedicated support.
                  </p>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 rounded-full bg-primary-foreground/20 p-1.5">
                        <ShieldCheck className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">0% Listing Fees</p>
                        <p className="text-xs text-primary-foreground/70">No upfront costs</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="mt-1 rounded-full bg-primary-foreground/20 p-1.5">
                        <Store className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Quick Setup</p>
                        <p className="text-xs text-primary-foreground/70">Get started in minutes</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="mt-1 rounded-full bg-primary-foreground/20 p-1.5">
                        <Leaf className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Local Focus</p>
                        <p className="text-xs text-primary-foreground/70">Connect with your community</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="mt-1 rounded-full bg-primary-foreground/20 p-1.5">
                        <ArrowRight className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Easy Payments</p>
                        <p className="text-xs text-primary-foreground/70">Secure & reliable</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 pt-2">
                    <Button size="lg" variant="secondary" className="text-primary font-bold shadow-lg hover:shadow-xl transition-shadow" asChild>
                      <Link href="/signup/business">
                        Get Started Free
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
                <div className="relative hidden md:block h-full min-h-[250px] md:col-span-2 animate-in slide-in-from-right duration-700">
                  <div className="absolute inset-0 bg-white/10 rounded-2xl transform rotate-3 blur-sm"></div>
                  <div className="absolute inset-0 bg-white/5 rounded-2xl transform -rotate-2"></div>
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <img 
                      src="/store.png" 
                      alt="Local independent retail shop illustration" 
                      className="w-full h-auto max-h-full object-contain drop-shadow-2xl relative z-10"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Localito Section */}
        <section className="py-24 px-6 animate-in fade-in slide-in-from-bottom duration-700 delay-200">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-sm font-medium tracking-widest text-primary uppercase mb-3">Why Choose Us</p>
              <h2 className="text-4xl font-extrabold tracking-tighter mb-4">Built for Local Businesses</h2>
              <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                We understand the challenges of running an independent business. That's why we've built a platform that puts you first.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-8 rounded-3xl bg-slate-50 dark:bg-white/5 space-y-4 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Reach Local Customers</h3>
                <p className="text-slate-500 dark:text-slate-400">
                  Connect with thousands of customers in your neighbourhood who want to shop local.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-slate-50 dark:bg-white/5 space-y-4 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Instant Payouts</h3>
                <p className="text-slate-500 dark:text-slate-400">
                  Get paid instantly when customers collect their orders. No waiting, no hassle.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-slate-50 dark:bg-white/5 space-y-4 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Simple Dashboard</h3>
                <p className="text-slate-500 dark:text-slate-400">
                  Manage products, orders, and payouts from one easy-to-use dashboard.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Commission Structure */}
        <section className="py-24 px-6 bg-slate-50 dark:bg-white/5 animate-in fade-in slide-in-from-bottom duration-700 delay-250">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-sm font-medium tracking-widest text-primary uppercase mb-3">Transparent Pricing</p>
              <h2 className="text-4xl font-extrabold tracking-tighter mb-4">Our Commission Structure</h2>
              <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                One simple fee per sale. No listing fees, no monthly subscriptions, no hidden costs.
              </p>
            </div>

            <div className="rounded-3xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-8 md:p-12 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Percent className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <p className="text-4xl font-black text-primary">6–9%</p>
                    <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">per sale</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Only when you sell. Nothing upfront.</p>
                  </div>
                </div>
                <div className="md:text-right">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Big tech typically charges</p>
                  <p className="text-2xl font-bold text-slate-600 dark:text-slate-400">10–25%</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">We keep more in your pocket.</p>
                </div>
              </div>

              <ul className="space-y-3 border-t border-slate-200 dark:border-slate-700 pt-8">
                <li className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span><strong className="text-slate-900 dark:text-white">0% listing fees</strong> — List as many products as you like at no extra cost.</span>
                </li>
                <li className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span><strong className="text-slate-900 dark:text-white">No monthly fees</strong> — Pay only when you make a sale.</span>
                </li>
                <li className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span><strong className="text-slate-900 dark:text-white">Instant payouts</strong> — Get paid when the customer collects. No waiting.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 px-6 animate-in fade-in slide-in-from-bottom duration-700 delay-300">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-sm font-medium tracking-widest text-primary uppercase mb-3">Getting Started</p>
              <h2 className="text-4xl font-extrabold tracking-tighter mb-4">Three Simple Steps</h2>
            </div>

            <div className="space-y-8">
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Create Your Account</h3>
                  <p className="text-slate-500 dark:text-slate-400">
                    Sign up for free and tell us about your business. No credit card required.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Add Your Products</h3>
                  <p className="text-slate-500 dark:text-slate-400">
                    Upload your products with photos, descriptions, and prices. We'll help you get set up.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Start Selling</h3>
                  <p className="text-slate-500 dark:text-slate-400">
                    Once approved, your products go live and local customers can start buying from you.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center mt-12">
              <Button size="lg" className="font-bold" asChild>
                <Link href="/signup/business">
                  Get Started Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-extrabold tracking-tighter mb-4">Ready to Grow Your Business?</h2>
            <p className="text-xl text-slate-500 dark:text-slate-400 mb-8">
              Join the growing community of Manchester's finest independent businesses.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" className="font-bold" asChild>
                <Link href="/signup/business">
                  Create Free Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login/business">
                  Already have an account? Sign In
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}
