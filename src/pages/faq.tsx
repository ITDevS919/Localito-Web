import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Link } from "wouter";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

function FAQAccordion({ question, answer }: FAQItem) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-200 dark:border-slate-700">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 flex items-center justify-between text-left"
      >
        <span className="font-semibold text-slate-900 dark:text-white">{question}</span>
        <ChevronDown className={`h-5 w-5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="pb-5 text-slate-600 dark:text-slate-400">
          {answer}
        </div>
      )}
    </div>
  );
}

const customerFAQs: FAQItem[] = [
  {
    question: "What is Localito?",
    answer: "Localito is a marketplace connecting you with independent local businesses. Buy online and pick up in-store within minutes, supporting your local community while enjoying the convenience of online shopping."
  },
  {
    question: "How does click & collect work?",
    answer: "Browse products from local shops, add them to your basket, and checkout. You'll receive a QR code which you show at the store to collect your order. Most orders are ready within 30 minutes."
  },
  {
    question: "Is there a delivery option?",
    answer: "Currently, Localito focuses on click & collect to support the hyper-local shopping experience and reduce carbon emissions. Some businesses may offer local delivery - check individual shop pages for details."
  },
  {
    question: "How do I earn cashback?",
    answer: "You earn points on every purchase made through Localito. These points can be redeemed for discounts on future orders. Check your account dashboard to see your points balance."
  },
  {
    question: "What if a product is out of stock?",
    answer: "Stock levels are updated regularly by our partner shops. If an item becomes unavailable after you order, the shop will contact you to arrange a refund or alternative."
  },
  {
    question: "How do refunds work?",
    answer: "Refund policies vary by shop. If you need a refund, contact the shop directly through the order details page. Localito facilitates the process but individual shop policies apply."
  },
];

const businessFAQs: FAQItem[] = [
  {
    question: "How do I join Localito as a business?",
    answer: "Click 'Register Your Business' and complete the signup form. We'll review your application and get in touch within 48 hours. We only partner with independent, local businesses."
  },
  {
    question: "What are the fees?",
    answer: "We charge a fair commission of 6-9% per sale - significantly lower than big tech platforms (10-25%). There are no monthly fees, listing fees, or hidden charges."
  },
  {
    question: "How do payouts work?",
    answer: "You receive instant payouts via Stripe Connect when customers collect their orders. Funds are transferred directly to your bank account, minus the commission."
  },
  {
    question: "How do I manage my products?",
    answer: "Use your business dashboard to add, edit, and manage products. You can upload photos, set prices, manage stock levels, and organise by category."
  },
  {
    question: "Do I need a POS system?",
    answer: "No, you can manage everything manually through the Localito dashboard. However, we're building integrations with Lightspeed, Square, and other POS systems for automatic stock sync."
  },
  {
    question: "How do customers collect orders?",
    answer: "Customers show a QR code at your shop. You scan it using the Localito app or dashboard to confirm collection. This triggers instant payment to your account."
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-extrabold tracking-tighter mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Everything you need to know about Localito
            </p>
          </div>

          {/* Customer FAQs */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-primary">For Customers</h2>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              {customerFAQs.map((faq, index) => (
                <FAQAccordion key={index} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </section>

          {/* Business FAQs */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-primary">For Businesses</h2>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              {businessFAQs.map((faq, index) => (
                <FAQAccordion key={index} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </section>

          {/* Contact CTA */}
          <section className="text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-8">
            <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              We're here to help. Get in touch with our team.
            </p>
            <a 
              href="mailto:hello@localito.uk" 
              className="inline-block px-6 py-3 bg-primary text-white font-semibold rounded-full hover:shadow-lg transition-shadow"
            >
              Contact Us
            </a>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
