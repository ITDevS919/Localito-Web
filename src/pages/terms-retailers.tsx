import { Navbar } from "@/components/layout/Navbar";

export default function TermsRetailersPage() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/10 selection:text-primary">
      <Navbar />

      <main className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <header className="mb-10">
            <h1 className="text-3xl md:text-4xl font-heading font-bold tracking-tight text-primary mb-3">
              Terms and Conditions – Retailers
            </h1>
            <p className="text-sm text-muted-foreground">
              This page is a web version of the official{" "}
              <span className="font-medium">
                “Terms and Conditions - Retailers Localito Marketplace Ltd”
              </span>{" "}
              document. For any discrepancies, the signed document takes
              precedence.
            </p>
          </header>

          <div className="prose prose-sm md:prose-base max-w-none prose-headings:font-heading prose-headings:text-foreground prose-a:text-primary">
            <p className="text-xs text-muted-foreground mb-2">
              <span className="font-semibold">Last Updated:</span> November 5, 2025
            </p>

            <section className="space-y-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                These Terms and Conditions (&quot;Terms&quot;) govern your use of the
                Localito Marketplace (&quot;Platform&quot;, &quot;Localito&quot;, &quot;we&quot;, &quot;us&quot;) as
                a retailer. By registering an account, listing products, or
                accepting orders via the Platform, you (&quot;Retailer&quot;, &quot;you&quot;)
                agree to be bound by these Terms. If you represent a business,
                you confirm that you are authorised to bind that business.
              </p>

              <p className="text-sm leading-relaxed text-muted-foreground">
                Localito Marketplace Ltd is a company registered in England and
                Wales under company number 16959163, with a registered office
                at 3rd Floor, 82 King Street, Manchester M2 4WQ. You can contact
                us at{" "}
                <a href="mailto:hello@localito.com">hello@localito.com</a>.
              </p>
            </section>

            <section className="space-y-3 mt-8">
              <h2 className="text-xl font-heading font-semibold">2. Your Agreement</h2>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                <li>
                  You must be a UK-based independent retailer, aged 18 or over,
                  or a duly authorised representative of a business, to use the
                  Platform as a Retailer.
                </li>
                <li>
                  These Terms form a binding contract between you and Localito
                  in relation to your use of the Platform as a Retailer. We may
                  update these Terms from time to time; continued use of the
                  Platform following any changes constitutes your acceptance of
                  the updated Terms.
                </li>
                <li>
                  You agree to comply with all applicable UK laws and
                  regulations, including (without limitation) the Consumer
                  Rights Act 2015, the Consumer Contracts Regulations 2013, and
                  UK GDPR and related data protection legislation.
                </li>
              </ul>
            </section>

            <section className="space-y-3 mt-8">
              <h2 className="text-xl font-heading font-semibold">3. Your Role</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                You are the seller of record for goods sold through the
                Platform. Sales contracts for goods are formed directly between
                you and the consumer. Localito provides the Platform and
                facilitates listings, payments, and communication, but does not
                sell goods to consumers.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                You are responsible for ensuring that all listings and products
                comply with applicable laws and do not include prohibited items
                (for example, weapons, tobacco, or other restricted goods). You
                warrant that descriptions are accurate, prices are correct, and
                your goods are safe and of satisfactory quality.
              </p>
            </section>

            <section className="space-y-3 mt-8">
              <h2 className="text-xl font-heading font-semibold">4. Registration and Listing</h2>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                <li>
                  You must register for a Retailer account through the Platform,
                  providing accurate and complete business information, such as
                  your trading name, address, contact details, and VAT number
                  (where applicable).
                </li>
                <li>
                  You can upload product listings, including descriptions,
                  images, pricing (inclusive of VAT where applicable), and
                  availability. By providing listings, you grant Localito a
                  non-exclusive, royalty-free licence to use, display, and
                  promote this content on the Platform and in related marketing
                  (for example, on social media).
                </li>
                <li>
                  You are responsible for maintaining accurate stock levels and
                  ensuring that your inventory information is kept up to date.
                  Where we integrate with your EPOS or inventory system, you
                  must ensure data is accurate to support real-time
                  availability.
                </li>
              </ul>
            </section>

            <section className="space-y-3 mt-8">
              <h2 className="text-xl font-heading font-semibold">5. Orders and Fulfilment</h2>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                <li>
                  Customers place orders and pay via the Platform in GBP,
                  including VAT where applicable. You will receive order
                  notifications via the dashboard and/or email.
                </li>
                <li>
                  You must prepare orders for in-store pickup within the agreed
                  time window, and provide collection details (for example, a
                  2–4pm pickup slot) through the Platform where requested.
                </li>
                <li>
                  You are responsible for ensuring that the goods provided match
                  the listing in terms of description, quality, and quantity. If
                  stock is unavailable or incorrect, you may be required to
                  issue a refund or alternative solution to the customer, in
                  line with consumer law.
                </li>
                <li>
                  You must honour the statutory 14-day cooling-off period under
                  the Consumer Contracts Regulations 2013 (CCR Regs 29–31),
                  except where an exemption applies, and handle returns and
                  refunds in compliance with the Consumer Rights Act 2015.
                </li>
                <li>
                  You may carry out a &quot;reasonable inspection&quot; of returned goods
                  and may deduct an appropriate amount from refunds to reflect
                  any reduction in value due to excessive use (up to 100% for
                  unsellable items), where lawful.
                </li>
              </ul>
            </section>

            <section className="space-y-3 mt-8">
              <h2 className="text-xl font-heading font-semibold">6. Pricing, Commission and Payments</h2>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                <li>
                  You set your own prices for goods (inclusive of VAT where
                  applicable). Price changes will apply to future orders only
                  and will not affect orders already placed.
                </li>
                <li>
                  Localito charges a commission, typically between{" "}
                  <span className="font-semibold">5–8%</span> of the sale value (excluding VAT), on each
                  completed order. This commission is deducted before payouts
                  are made to you.
                </li>
                <li>
                  Payments are processed by our payment partner (for example,
                  Nuvei or another regulated provider). Payment processing fees
                  are passed on to you indirectly through the overall
                  commercial model.
                </li>
                <li>
                  We may hold funds until order fulfilment is confirmed, in line
                  with our payout schedule. Details of payout timing and
                  thresholds are provided in your Retailer dashboard or separate
                  onboarding materials.
                </li>
              </ul>
            </section>

            <section className="space-y-3 mt-8">
              <h2 className="text-xl font-heading font-semibold">7. Refunds and Disputes</h2>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                <li>
                  You are responsible for processing refunds in accordance with
                  consumer law, including providing refunds within 14 days of
                  receiving returned goods, where a valid cancellation or fault
                  claim is made.
                </li>
                <li>
                  In the event of customer complaints or disputes, you should
                  work directly with the customer to resolve the issue in good
                  faith. Localito may, at its discretion, help mediate disputes
                  but is not responsible for your compliance with consumer law.
                </li>
                <li>
                  You are responsible for addressing chargebacks and fraudulent
                  transactions relating to your orders. You may be required to
                  provide evidence (such as proof of collection) to support any
                  chargeback disputes.
                </li>
                <li>
                  You agree to indemnify Localito for losses or claims arising
                  from your listings, products, or failure to fulfil orders,
                  except to the extent caused by our own negligence or breach of
                  contract.
                </li>
              </ul>
            </section>

            <section className="space-y-3 mt-8">
              <h2 className="text-xl font-heading font-semibold">8. Intellectual Property</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                You retain ownership of your brand, content, and product images
                that you upload to the Platform. By using the Platform, you
                grant Localito a non-exclusive, worldwide, royalty-free licence
                to host, display, and promote your listings on the Platform and
                in our marketing materials, solely for the purpose of operating
                and promoting the marketplace.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                We reserve the right to remove or disable access to any listing
                we reasonably believe infringes third-party intellectual
                property rights or breaches applicable law or these Terms.
                Repeated or serious infringements may lead to suspension or
                termination of your account.
              </p>
            </section>

            <section className="space-y-3 mt-8">
              <h2 className="text-xl font-heading font-semibold">9. Data Protection</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                We process personal data relating to you and your customers in
                accordance with our Privacy Policy, which forms part of these
                Terms. You should review the Privacy Policy to understand how
                we collect, use, and share data connected with the Platform.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                You acknowledge that you act as an independent data controller
                in respect of any customer personal data you receive (for
                example, for fulfilment and returns). You must comply with UK
                GDPR and other applicable data protection laws in your handling
                of that data, including keeping it secure and using it only for
                legitimate purposes connected with the order.
              </p>
            </section>

            <section className="space-y-3 mt-8">
              <h2 className="text-xl font-heading font-semibold">10. Liability</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                To the fullest extent permitted by law, our total liability to
                you in connection with these Terms and your use of the Platform
                as a Retailer is limited to the total commission fees you have
                paid to Localito in the previous twelve (12) months.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                We are not liable for customer claims made against you, or for
                losses arising from your breach of law, misrepresentation of
                products, or failure to fulfil orders. You agree to indemnify
                Localito for reasonable losses, damages, or costs arising from
                your breach of these Terms or applicable law, except where
                caused by our own negligence or wilful misconduct.
              </p>
            </section>

            <section className="space-y-3 mt-8">
              <h2 className="text-xl font-heading font-semibold">11. Termination</h2>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                <li>
                  Either party may terminate the Retailer relationship by giving
                  at least 30 days&apos; written notice.
                </li>
                <li>
                  We may suspend or terminate your access to the Platform
                  immediately where we reasonably believe you have committed a
                  serious breach of these Terms (for example, repeated
                  non-fulfilment, unlawful listings, or unsafe products).
                </li>
                <li>
                  Following termination, you must complete any outstanding
                  orders, honour valid returns and refunds, and pay any
                  outstanding commissions or other sums due to Localito.
                </li>
              </ul>
            </section>

            <section className="space-y-3 mt-8 mb-10">
              <h2 className="text-xl font-heading font-semibold">12. Governing Law and Contact</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                These Terms are governed by the laws of England and Wales. Any
                disputes arising in connection with these Terms or your use of
                the Platform as a Retailer will be subject to the exclusive
                jurisdiction of the courts of England and Wales.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                If you have any questions about these Terms or your Retailer
                account, please contact us at{" "}
                <a href="mailto:hello@localito.com">hello@localito.com</a>.
                These Terms may supplement any separate retailer agreement you
                enter into with us; in the event of conflict, that agreement may
                prevail to the extent specified therein.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

