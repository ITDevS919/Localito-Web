import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/product/ProductCard";
import { CATEGORIES, ASSETS } from "@/lib/product";
import { ArrowRight, Loader2, Heart, Leaf, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useEffect, useState, useRef } from "react";
import type { Product } from "@/lib/product";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { motion, useInView } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Animated counter component
function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      const duration = 2000;
      const steps = 60;
      const increment = value / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// CTA Section Component
function CTASection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as const },
    },
  };

  return (
    <section ref={sectionRef} className="py-32 px-6 bg-[#F9F8F5] dark:bg-slate-900">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="max-w-4xl mx-auto text-center space-y-8"
      >
        <motion.h2
          variants={itemVariants}
          className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-white"
        >
          Ready to support local?
        </motion.h2>
        
        <motion.p
          variants={itemVariants}
          className="text-xl text-slate-600 dark:text-slate-400"
        >
          Start your journey now.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex flex-wrap gap-4 justify-center pt-8"
        >
          <Link href="/search">
            <button className="px-8 py-4 bg-primary text-white font-bold rounded-full uppercase tracking-wide hover:shadow-xl hover:scale-105 transition-all duration-300">
              Start Shopping
            </button>
          </Link>
          <Link href="/signup/business">
            <button className="px-8 py-4 bg-white text-slate-900 font-bold rounded-full uppercase tracking-wide border-2 border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300">
              Register Your Business
            </button>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

// Progress Section Component
function ProgressSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as const },
    },
  };

  // Sustainability projection data
  const sustainabilityData = [
    { period: 'Q1', co2Saved: 2.5, localSpend: 15 },
    { period: 'Q2', co2Saved: 8.5, localSpend: 45 },
    { period: 'Q3', co2Saved: 18, localSpend: 95 },
    { period: 'Q4', co2Saved: 32, localSpend: 160 },
    { period: 'Q1 27', co2Saved: 48, localSpend: 240 },
    { period: 'Q2 27', co2Saved: 65, localSpend: 320 },
  ];

  return (
    <section ref={sectionRef} className="py-24 px-6 bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
        >
          {/* Left side - Stats */}
          <div className="space-y-12">
            <motion.div variants={itemVariants}>
              <span className="text-xs font-medium tracking-widest text-primary uppercase">Sustainability Impact</span>
              <h2 className="text-5xl font-extrabold tracking-tighter mt-3">Measured Progress.</h2>
            </motion.div>

            <div className="space-y-8">
              <motion.div variants={itemVariants} className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-black text-primary">
                    <AnimatedNumber value={300} suffix="+" />
                  </span>
                  <span className="text-xl font-medium text-slate-600 dark:text-slate-400">Businesses</span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Independent businesses on the platform
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-black text-slate-900 dark:text-white">
                    <AnimatedNumber value={65} />
                  </span>
                  <span className="text-xl font-medium text-slate-600 dark:text-slate-400">tonnes</span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Projected CO₂ saved by Q2 2027
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-black text-slate-900 dark:text-white">£<AnimatedNumber value={320} />k</span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Projected local spend retained in community
                </p>
              </motion.div>
            </div>
          </div>

          {/* Right side - Sustainability Chart */}
          <motion.div
            variants={itemVariants}
            className="relative bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-700"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold tracking-widest text-primary uppercase">Sustainability Impact</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">2026 — 2027</span>
              </div>
              
              {/* Dual-axis sustainability chart */}
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={sustainabilityData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="co2Gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#64748b" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#64748b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.2} vertical={false} />
                    <XAxis 
                      dataKey="period" 
                      stroke="#94a3b8"
                      style={{ fontSize: '10px', fontWeight: 600 }}
                      tickLine={false}
                      axisLine={{ stroke: '#e2e8f0', strokeWidth: 1 }}
                    />
                    <YAxis 
                      yAxisId="left"
                      stroke="hsl(221.2, 83.2%, 53.3%)"
                      style={{ fontSize: '10px', fontWeight: 600 }}
                      tickLine={false}
                      axisLine={false}
                      label={{ value: 'CO₂ (tonnes)', angle: -90, position: 'insideLeft', style: { fontSize: '10px', fill: 'hsl(221.2, 83.2%, 53.3%)' } }}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      stroke="#64748b"
                      style={{ fontSize: '10px', fontWeight: 600 }}
                      tickLine={false}
                      axisLine={false}
                      label={{ value: 'Local £ (k)', angle: 90, position: 'insideRight', style: { fontSize: '10px', fill: '#64748b' } }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.98)',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        fontSize: '11px',
                        padding: '8px 12px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                      }}
                      labelStyle={{ color: '#1e293b', fontWeight: 700, marginBottom: '4px' }}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="co2Saved"
                      name="CO₂ Saved (tonnes)"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      dot={{ fill: 'hsl(221.2, 83.2%, 53.3%)', strokeWidth: 2, r: 5, stroke: '#fff' }}
                      activeDot={{ r: 7, strokeWidth: 2 }}
                      animationDuration={2000}
                      animationBegin={300}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="localSpend"
                      name="Local Spend (£k)"
                      stroke="#64748b"
                      strokeWidth={3}
                      dot={{ fill: '#64748b', strokeWidth: 2, r: 5, stroke: '#fff' }}
                      activeDot={{ r: 7, strokeWidth: 2 }}
                      animationDuration={2000}
                      animationBegin={500}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">CO₂ Reduction</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-500"></div>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Local Economy</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const { isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/products?isApproved=true`);
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.data)) {
          const products = data.data.slice(0, 6).map((p: any) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            business: p.business_name || "Business",
            image: p.images?.[0] || "/opengraph.jpg",
            category: p.category,
            rating: p.averageRating || 0,
            reviews: p.reviewCount || 0,
            pickupTime: "30 mins",
            businessPostcode: p.postcode,
            businessCity: p.city,
            retailerPostcode: p.postcode,
            retailerCity: p.city,
          }));
          setFeaturedProducts(products);
        }
      } catch (error) {
        console.error("Failed to fetch featured products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, [API_BASE_URL]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const popularSearches = ["Fresh Bread", "Craft Beer", "Ceramics", "Vinyl Records"];

  return (
    <div className="min-h-screen bg-background font-sans text-foreground antialiased">
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <header className="relative pt-32 pb-16 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-4xl">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tighter leading-[1.05] text-primary">
                Search by business, product or service
              </h1>
              <p className="text-lg text-slate-500 dark:text-slate-400 mb-10 max-w-xl">
                A curated marketplace for independent makers and local shops.
              </p>
            </div>

            {/* Search */}
            <div className="max-w-2xl mb-6">
              <form onSubmit={handleSearch} className="relative group">
                <div className="relative flex items-center rounded-2xl bg-white/90 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm border border-slate-200/60 dark:border-slate-700/50 px-5 py-1 focus-within:shadow-md focus-within:border-slate-300/70 dark:focus-within:border-slate-600 transition-all duration-200">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-14 pl-0 pr-12 bg-transparent border-0 focus:outline-none focus:ring-0 text-lg placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors"
                    placeholder="Search the city..."
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </form>

              <div className="flex flex-wrap items-center gap-6 mt-4">
                {[
                  { label: "Businesses", href: "/search" },
                  { label: "Services", href: "/search?tab=services" },
                  { label: "Products", href: "/search?tab=products" },
                ].map(({ label, href }) => (
                  <Link key={label} href={href}>
                    <span className="font-semibold text-slate-700 dark:text-slate-200 tracking-tight hover:text-primary transition-colors cursor-pointer">
                      {label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Features - inline */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 pt-12 border-t border-slate-200/60 dark:border-slate-700/40">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Heart className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Support Local</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                    Support Manchester's finest independent businesses and keep money in your community.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Leaf className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Sustainable Choice</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                    Reduce footprint by shopping hyper-locally.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Verified Sellers</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                    Every business is verified as independent and local.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Progress Section */}
        <ProgressSection />

        {/* Neighbourhood Picks Section - Only shown when products exist */}
        {!loading && featuredProducts.length > 0 && (
          <section className="py-32 px-6 overflow-hidden">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                <div>
                  <p className="text-sm font-medium tracking-widest text-primary uppercase mb-3">Neighbourhood Picks</p>
                  <h2 className="text-5xl font-extrabold tracking-tighter mb-4">Shop Local, Book Local.</h2>
                  <p className="text-xl text-slate-500 dark:text-slate-400">
                    Discover unique products from independent businesses in your community.
                  </p>
                </div>
                <Link href="/search" className="group flex items-center gap-2 font-semibold text-primary">
                  View all collections
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProducts.map((product) => (
                  <Link key={product.id} href={`/product/${product.id}`}>
                    <div className="relative group overflow-hidden rounded-3xl bg-slate-100 dark:bg-white/5 aspect-[4/5] cursor-pointer">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8 text-white">
                        <span className="text-sm font-medium opacity-80 mb-2">{product.business}</span>
                        <h4 className="text-2xl font-bold">{product.name}</h4>
                        <p className="text-lg font-semibold mt-2">£{product.price}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <CTASection />

        <Footer />
      </main>
    </div>
  );
}
