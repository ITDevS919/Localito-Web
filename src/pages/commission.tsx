import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Link } from "wouter";
import { Percent, TrendingDown, Info } from "lucide-react";

// Commission tiers (aligned with platform: 30-day rolling turnover)
const COMMISSION_TIERS = [
  { name: "Starter", minTurnover: 0, maxTurnover: 5000, rate: 9, description: "When you're getting started" },
  { name: "Growth", minTurnover: 5000, maxTurnover: 10000, rate: 8, description: "Building momentum" },
  { name: "Momentum", minTurnover: 10000, maxTurnover: 25000, rate: 7, description: "Growing sales" },
  { name: "Elite", minTurnover: 25000, maxTurnover: null, rate: 6, description: "Highest volume, lowest rate" },
];

function formatTurnover(value: number | null): string {
  if (value === null) return "£25k+";
  if (value >= 1000) return `£${value / 1000}k`;
  return `£${value}`;
}

export default function CommissionPage() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground antialiased">
      <Navbar />

      <main className="pt-28 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <header className="mb-16">
            <span className="text-sm font-medium tracking-widest text-primary uppercase">
              Transparency
            </span>
            <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight text-foreground mt-2 mb-4">
              Commission &amp; fees
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We keep our pricing simple and fair. Commission is based on your 30-day rolling turnover—the more you sell, the lower your rate. No listing fees, no hidden charges.
            </p>
          </header>

          {/* Key points */}
          <div className="flex flex-wrap gap-6 mb-12 p-6 rounded-2xl bg-muted/50 dark:bg-muted/20 border border-border/50">
            <div className="flex items-center gap-3">
              <Percent className="h-5 w-5 text-primary shrink-0" />
              <span className="text-sm font-medium">Commission only on completed orders</span>
            </div>
            <div className="flex items-center gap-3">
              <TrendingDown className="h-5 w-5 text-primary shrink-0" />
              <span className="text-sm font-medium">Rate drops as your turnover grows</span>
            </div>
            <div className="flex items-center gap-3">
              <Info className="h-5 w-5 text-primary shrink-0" />
              <span className="text-sm font-medium">Trial period may apply (0% during trial)</span>
            </div>
          </div>

          {/* Tiers */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-6">Commission tiers</h2>
            <p className="text-sm text-muted-foreground mb-8">
              Based on your business's 30-day rolling turnover. Excluding VAT.
            </p>

            <ul className="space-y-4">
              {COMMISSION_TIERS.map((tier, index) => (
                <li
                  key={tier.name}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-foreground">{tier.name}</span>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {tier.description}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {tier.maxTurnover === null
                        ? `Turnover over ${formatTurnover(tier.minTurnover)}`
                        : `Turnover ${formatTurnover(tier.minTurnover)} – ${formatTurnover(tier.maxTurnover)}`}
                    </p>
                  </div>
                  <div className="sm:text-right shrink-0">
                    <span className="text-2xl font-bold text-primary">{tier.rate}%</span>
                    <p className="text-xs text-muted-foreground mt-0.5">per order</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* CTA */}
          <section className="mt-16 pt-12 border-t border-border">
            <p className="text-muted-foreground mb-6">
              For full terms including payouts, refunds, and custom rates, see our{" "}
              <Link href="/terms" className="text-primary font-medium hover:underline">
                Terms &amp; Conditions
              </Link>
              . Questions?{" "}
              <Link href="/contact" className="text-primary font-medium hover:underline">
                Get in touch
              </Link>
              .
            </p>
            <Link
              href="/for-businesses"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Join as a business
            </Link>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
