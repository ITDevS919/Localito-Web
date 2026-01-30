import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Link } from "wouter";
import { Mail, MapPin } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-extrabold tracking-tighter mb-4">
              Get in Touch
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              We'd love to hear from you
            </p>
          </div>

          {/* Contact Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Email Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">Email Us</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                    Send us an email and we'll get back to you within 24 hours.
                  </p>
                  <a 
                    href="mailto:hello@localito.uk" 
                    className="text-primary font-semibold hover:underline"
                  >
                    hello@localito.uk
                  </a>
                </div>
              </div>
            </div>

            {/* Location Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">Location</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                    We're based in Manchester, supporting local businesses across the UK.
                  </p>
                  <p className="text-slate-700 dark:text-slate-300 font-medium">
                    Manchester, UK
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-8 text-center">
            <h3 className="text-xl font-bold mb-4">Looking for support?</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Check out our FAQ page for quick answers to common questions.
            </p>
            <Link href="/faq">
              <button className="px-6 py-3 bg-primary text-white font-semibold rounded-full hover:shadow-lg transition-shadow">
                Visit FAQ
              </button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
