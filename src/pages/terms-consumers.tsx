import { Navbar } from "@/components/layout/Navbar";

export default function TermsConsumersPage() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/10 selection:text-primary">
      <Navbar />

      <main className="pt-28 md:pt-32 pb-12 md:pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <header className="mb-10">
            <h1 className="text-3xl md:text-4xl font-heading font-bold tracking-tight text-primary mb-3">
              Terms and Conditions – Consumers
            </h1>
            <p className="text-sm text-muted-foreground">
              This page is a web version of the official{" "}
              <span className="font-medium">
                “Terms and Conditions Consumers Localito Marketplace Ltd”
              </span>{" "}
              document. For any discrepancies, the signed document takes
              precedence.
            </p>
          </header>

          <div className="prose prose-sm md:prose-base max-w-none prose-headings:font-heading prose-headings:text-foreground prose-a:text-primary">
            <p className="text-xs text-muted-foreground mb-2">
              <span className="font-semibold">Last Updated:</span> November 4, 2025
            </p>

            <section className="space-y-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Welcome to Localito Marketplace (&quot;Localito&quot;, &quot;we&quot;, &quot;us&quot;,
                &quot;our&quot;), a platform that connects you with local independent
                businesses (&quot;Businesses&quot;) so you can browse products online, pay
                securely, and collect your order in-store. By accessing or using
                our website{" "}
                <a href="http://www.localito.com" target="_blank" rel="noreferrer">
                  www.localito.com
                </a>{" "}
                and any related apps or services (together, the &quot;Platform&quot;),
                you agree to these Terms and Conditions (&quot;Terms&quot;) as a consumer.
              </p>

              <p className="text-sm leading-relaxed text-muted-foreground">
                These Terms apply in addition to your statutory rights under UK
                consumer law. You must be at least 18 years old to use the
                Platform. If you do not agree with these Terms, you should not
                use the Platform.
              </p>

              <p className="text-sm leading-relaxed text-muted-foreground">
                Localito Marketplace Ltd is a company registered in England and
                Wales under company number 16959163, with its registered office
                at 3rd Floor, 82 King Street, Manchester M2 4WQ. You can contact
                us at{" "}
                <a href="mailto:hello@localito.com">hello@localito.com</a>.
              </p>
            </section>

            <section className="space-y-3 mt-8">
              <h2 className="text-xl font-heading font-semibold">2. Your Agreement</h2>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                <li>
                  These Terms govern your use of the Platform as a consumer,
                  including browsing listings, placing orders, and collecting
                  purchases in-store.
                </li>
                <li>
                  By creating an account, placing an order, or otherwise using
                  the Platform, you confirm that you are at least 18 years old
                  and capable of entering into a legally binding agreement.
                </li>
                <li>
                  We may update these Terms from time to time. We will post the
                  updated Terms on the Platform, and your continued use of the
                  Platform after any changes are made constitutes acceptance of
                  the updated Terms.
                </li>
              </ul>
            </section>

            <section className="space-y-3 mt-8">
              <h2 className="text-xl font-heading font-semibold">3. Our Role</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Localito operates as an intermediary marketplace. We provide the
                Platform that enables you to discover and purchase goods from
                Businesses. The contract for the sale of goods is{" "}
                <span className="font-semibold">between you and the Business</span>; we do not sell
                goods ourselves.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                We facilitate payments and provide certain customer support and
                communication tools, but we are not responsible for the Business&apos;s
                compliance with their legal obligations, including product
                quality, description, or fulfilment, except where required by
                law.
              </p>
            </section>

            <section className="space-y-3 mt-8">
              <h2 className="text-xl font-heading font-semibold">4. Ordering and Payment</h2>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                <li>
                  You can browse listings from multiple Businesses and add items
                  to your cart. When you place an order, you will be asked to
                  pay online through our payment provider. All prices are shown
                  in GBP and include VAT where applicable.
                </li>
                <li>
                  Prices for goods are set by the Businesses. Localito charges a
                  commission (typically between 5–8%) to the Business, which is
                  reflected in the overall pricing.
                </li>
                <li>
                  After placing an order, you will receive a confirmation email
                  with details of your purchase and collection information. The
                  Business is responsible for confirming stock availability and
                  preparing your order.
                </li>
              </ul>
            </section>

            <section className="space-y-3 mt-8">
              <h2 className="text-xl font-heading font-semibold">5. In-Store Pickup</h2>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                <li>
                  Orders are fulfilled via in-store pickup at the relevant
                  Business&apos;s premises. Details of the pickup location and any
                  available time windows will be provided in your confirmation
                  email.
                </li>
                <li>
                  You should bring your order confirmation (digital or printed)
                  and a valid form of ID, if requested, when collecting your
                  order.
                </li>
                <li>
                  As a general guideline, you should collect your order within{" "}
                  <span className="font-semibold">48 hours</span> of confirmation, unless otherwise
                  stated by the Business. Failure to collect within a reasonable
                  period may affect your entitlement to a refund, subject to
                  your statutory rights under the Consumer Contracts Regulations
                  2013 (&quot;CCR&quot;).
                </li>
              </ul>
            </section>

            <section className="space-y-3 mt-8">
              <h2 className="text-xl font-heading font-semibold">
                6. Cancellation Rights (14-Day Cooling-Off Period)
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Under the Consumer Contracts Regulations 2013, you may have a
                right to cancel your contract for most goods within a{" "}
                <span className="font-semibold">14-day cooling-off period</span> starting from the date
                you collect the goods in-store.
              </p>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                <li>
                  <span className="font-semibold">Right to cancel:</span> You can cancel for any
                  reason within 14 days of collection by notifying the Business
                  or Localito (for example, by email or using any cancellation
                  form provided).
                </li>
                <li>
                  <span className="font-semibold">Returns:</span> You must return goods to the Business
                  within 14 days of notifying cancellation. Goods should be
                  unused and in a condition that allows for &quot;reasonable
                  inspection&quot; (for example, trying on clothing). Excessive use (for
                  example, wearing items to events) may reduce the refund to
                  reflect any loss in value, up to 100% for items that are no
                  longer saleable.
                </li>
                <li>
                  <span className="font-semibold">Refunds:</span> If you cancel within the cooling-off
                  period and return goods as required, you are entitled to a
                  full refund of the purchase price and any standard delivery
                  charges (if applicable), within 14 days of the Business
                  receiving the returned goods. Return postage or transport
                  costs are normally your responsibility unless goods are faulty
                  or misdescribed.
                </li>
                <li>
                  <span className="font-semibold">Exemptions:</span> Certain goods are exempt from the
                  cooling-off rights, including personalised or bespoke items;
                  perishable goods; sealed items for health or hygiene reasons
                  that have been unsealed; and certain digital content once
                  download/streaming has begun (see CCR Reg 28).
                </li>
                <li>
                  <span className="font-semibold">Faulty or misdescribed goods:</span> Your rights under
                  the Consumer Rights Act 2015 still apply. You may be
                  entitled to a repair, replacement, or refund (typically within
                  30 days for a full refund where goods are faulty).
                </li>
              </ul>
              <p className="text-sm leading-relaxed text-muted-foreground">
                A model cancellation form may be provided by the Business or on
                the Platform, for example: &quot;I hereby give notice that I cancel my
                contract for the supply of [goods], ordered on [date] and
                received (collected) on [pickup date]. Name, Address, Signature,
                Date.&quot;
              </p>
            </section>

            <section className="space-y-3 mt-8">
              <h2 className="text-xl font-heading font-semibold">7. Your Responsibilities</h2>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                <li>Provide accurate and up-to-date information when ordering.</li>
                <li>
                  Comply with any additional terms or policies that a Business
                  may apply (for example, collection rules or returns
                  procedures), provided they do not conflict with your statutory
                  rights.
                </li>
                <li>
                  Use the Platform lawfully and not in any manner that is
                  fraudulent, abusive, or likely to harm Localito, Businesses, or
                  other users.
                </li>
              </ul>
            </section>

            <section className="space-y-3 mt-8">
              <h2 className="text-xl font-heading font-semibold">8. Liability</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                As the contract for goods is between you and the Business,
                Businesses are responsible for the quality, safety, and
                description of their products and for complying with consumer
                law. Localito is not liable for the Business&apos;s failure to meet
                those obligations, except where required by law.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                We provide the Platform on an &quot;as is&quot; and &quot;as available&quot; basis.
                We do not guarantee that the Platform will be uninterrupted or
                error-free. Nothing in these Terms excludes or limits any
                liability that cannot be excluded or limited under applicable
                law (for example, for death or personal injury caused by
                negligence, or for fraud).
              </p>
            </section>

            <section className="space-y-3 mt-8">
              <h2 className="text-xl font-heading font-semibold">9. Privacy</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Your use of the Platform is also governed by our Privacy Policy,
                which explains how we collect, use, and protect your personal
                data. Please review the Privacy Policy carefully. It is
                available on the Platform and forms part of these Terms.
              </p>
            </section>

            <section className="space-y-3 mt-8 mb-10">
              <h2 className="text-xl font-heading font-semibold">10. Governing Law and Contact</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                These Terms are governed by the laws of England and Wales. Any
                disputes arising in connection with these Terms or your use of
                the Platform will be subject to the exclusive jurisdiction of
                the courts of England and Wales, without affecting your
                statutory rights as a consumer.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                If you have any questions about these Terms, please contact us
                at{" "}
                <a href="mailto:hello@localito.com">hello@localito.com</a>.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

