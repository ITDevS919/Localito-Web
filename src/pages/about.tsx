import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Link } from "wouter";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Store, Heart, Users, Zap, Target, Award } from "lucide-react";

export default function About() {
  const heroRef = useRef(null);
  const isHeroInView = useInView(heroRef, { once: true });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-32">
        {/* Hero Section */}
        <motion.section
          ref={heroRef}
          initial="hidden"
          animate={isHeroInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="py-20 px-6"
        >
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <motion.span
              variants={itemVariants}
              className="text-sm font-medium tracking-widest text-primary uppercase"
            >
              Our Story
            </motion.span>
            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-7xl font-extrabold tracking-tighter"
            >
              Fighting Big Tech,<br />Supporting Local.
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed"
            >
              Localito is Manchester's hyper-local, Independent-only click and collect marketplace. We're on a mission to help independent businesses thrive in a world dominated by big tech platforms.
            </motion.p>
          </div>
        </motion.section>

        {/* Mission Section */}
        <section className="py-24 px-6 bg-slate-50 dark:bg-slate-900/50">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                <span className="text-xs font-medium tracking-widest text-primary uppercase">Our Mission</span>
                <h2 className="text-4xl font-extrabold tracking-tighter">Built for Independent Businesses</h2>
                <div className="space-y-4 text-slate-600 dark:text-slate-400">
                  <p>
                    We believe local businesses are the beating heart of our communities.
                    The places where memories are made, conversations happen, and neighbourhoods feel alive.
                  </p>
                  <p>
                    But big tech platforms have taken too much.
                    They charge high commissions, pull customers away from our high streets, and leave independent shops fighting to survive with less footfall every year.
                  </p>
                  <p>
                    That's why we created Localito.
                  </p>
                  <p>
                    We built a marketplace that puts independent businesses first, with fair commission rates, instant payouts, and no hidden fees.
                  </p>
                  <p>
                    More importantly, we built it to increase footfall, not reduce it.
                    Every order placed on Localito drives real people back through your door.
                    Every bit of instant cashback earned by customers loops straight back into your community, encouraging them to return again and again.
                  </p>
                  <p>
                    We're not just an app.
                    We're a movement.
                    A refusal to let big tech quietly drain the life from our high streets.
                    A commitment to help local shops, service providers and creatives thrive again, by bringing more customers walking through their doors.
                  </p>
                  <p>
                    Because when independents win, communities win.
                    And Manchester and every town like it deserves to feel alive once more.
                  </p>
                  <p>
                    Join us.
                    Let's bring the footfall back.
                    Let's keep local beating strong.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 shadow-lg space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Store className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg">300+</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Retailers Committed</p>
                </div>

                <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 shadow-lg space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg">Q1 2026</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">MVP Launch</p>
                </div>

                <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 shadow-lg space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg">1%</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Minimum instant cashback on every order</p>
                </div>

                <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 shadow-lg space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg">Instant</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Payouts</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-xs font-medium tracking-widest text-primary uppercase">Our Values</span>
              <h2 className="text-4xl font-extrabold tracking-tighter mt-3">What We Stand For</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Community First</h3>
                <p className="text-slate-500 dark:text-slate-400">
                  We prioritize the needs of local businesses and customers over profit maximization.
                </p>
              </div>

              <div className="space-y-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Transparency</h3>
                <p className="text-slate-500 dark:text-slate-400">
                  No hidden fees, no surprise charges. Just honest, straightforward pricing.
                </p>
              </div>

              <div className="space-y-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                  <Store className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Independence</h3>
                <p className="text-slate-500 dark:text-slate-400">
                  We only work with independent, locally-owned businesses. No chains, no franchises.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6 bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter">
              Join the Movement
            </h2>
            <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
              Whether you're a business owner or a customer, you can be part of the change. Let's build a future where local businesses thrive.
            </p>
            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <Link href="/signup/business">
                <button className="px-8 py-4 bg-white text-primary font-bold rounded-full hover:shadow-xl transition-shadow">
                  I'm a Business
                </button>
              </Link>
              <Link href="/signup/customer">
                <button className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-full hover:bg-white/10 transition-colors">
                  I'm a Customer
                </button>
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}
