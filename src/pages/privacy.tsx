import { Navbar } from "@/components/layout/Navbar";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/10 selection:text-primary">
      <Navbar />

      <main className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <header className="mb-10">
            <h1 className="text-3xl md:text-4xl font-heading font-bold tracking-tight text-primary mb-3">
              Privacy Policy
            </h1>
            <p className="text-sm text-muted-foreground">
              This page is a web version of the official{" "}
              <span className="font-medium">
                “Privacy Policy Localito Marketplace Ltd”
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
                Localito Marketplace Ltd. (&quot;we&quot;, &quot;us&quot;) respects your privacy.
                This Privacy Policy explains how we process personal data under
                the UK General Data Protection Regulation (&quot;UK GDPR&quot;) and the
                Data Protection Act 2018. We act as the data controller for the
                personal data described in this Policy.
              </p>

              <p className="text-sm leading-relaxed text-muted-foreground">
                <span className="font-semibold">Who We Are:</span> Localito Marketplace Ltd, 3rd Floor,
                82 King Street, Manchester M2 4WQ. For data protection queries,
                you can contact our Data Protection Officer (DPO) at{" "}
                <a href="mailto:admin@localito.com">admin@localito.com</a>.
              </p>
            </section>

            <section className="space-y-3 mt-8">
              <h2 className="text-xl font-heading font-semibold">2. Data We Collect</h2>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                <li>
                  <span className="font-semibold">Identity and Contact Data:</span> Name, email address,
                  phone number and postal address (for example, when you create
                  an account or complete checkout).
                </li>
                <li>
                  <span className="font-semibold">Transaction Data:</span> Order details (such as items
                  purchased, amounts, dates) and limited payment information.
                  Payments are processed by our payment provider (currently
                  Stripe or equivalent) and we do <span className="font-semibold">not</span> store full
                  card details.
                </li>
                <li>
                  <span className="font-semibold">Technical Data:</span> IP address, device information,
                  browser type, and usage data collected through cookies and
                  analytics tools.
                </li>
                <li>
                  <span className="font-semibold">Profile Data:</span> Your reviews, saved preferences,
                  and other information you choose to share with us in your
                  account.
                </li>
              </ul>
            </section>

            <section className="space-y-3 mt-8">
              <h2 className="text-xl font-heading font-semibold">3. How We Collect Your Data</h2>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                <li>
                  <span className="font-semibold">Directly from you:</span> For example, when you fill in
                  forms, create an account, place an order, or contact us.
                </li>
                <li>
                  <span className="font-semibold">Automatically:</span> Through cookies and similar
                  technologies when you use the Platform. For more detail, see
                  our Cookie Policy (link available on the site).
                </li>
                <li>
                  <span className="font-semibold">From third parties:</span> For example, from Businesses
                  in relation to order status or pickup confirmation.
                </li>
              </ul>
            </section>

            <section className="space-y-3 mt-8">
              <h2 className="text-xl font-heading font-semibold">4. How We Use Your Data (Legal Basis)</h2>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                <li>
                  <span className="font-semibold">To fulfil your orders (Contract – Art. 6(1)(b) UK GDPR):</span>{" "}
                  processing payments, providing order confirmations, and
                  coordinating in-store pickup with Businesses.
                </li>
                <li>
                  <span className="font-semibold">
                    To improve and operate our Platform (Legitimate Interests – Art. 6(1)(f) UK GDPR):
                  </span>{" "}
                  for analytics, troubleshooting, service improvement, fraud
                  prevention, and platform security.
                </li>
                <li>
                  <span className="font-semibold">For marketing (Consent – Art. 6(1)(a) UK GDPR):</span>{" "}
                  sending you marketing communications by email or similar
                  channels when you have opted in. You may opt out at any time
                  by using the unsubscribe link or contacting us.
                </li>
                <li>
                  <span className="font-semibold">
                    To comply with legal obligations (Art. 6(1)(c) UK GDPR):
                  </span>{" "}
                  for tax, accounting, regulatory reporting, and to manage
                  disputes or legal claims.
                </li>
              </ul>
            </section>

            <section className="space-y-3 mt-8">
              <h2 className="text-xl font-heading font-semibold">5. Sharing Your Data</h2>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                <li>
                  <span className="font-semibold">With Businesses:</span> We share necessary order details
                  (such as items, name and pickup information) so that Businesses
                  can prepare and hand over your order.
                </li>
                <li>
                  <span className="font-semibold">With processors:</span> Carefully selected service
                  providers who process data on our behalf, such as payment
                  providers (including Stripe) and analytics providers (such as
                  Google Analytics). These processors are bound by data
                  protection obligations and act only on our instructions.
                </li>
                <li>
                  <span className="font-semibold">With authorities:</span> Where required by law, for
                  example to comply with regulatory requests, court orders, or
                  to protect our rights or those of others.
                </li>
              </ul>
              <p className="text-sm leading-relaxed text-muted-foreground">
                We <span className="font-semibold">do not sell</span> your personal data.
              </p>
            </section>

            <section className="space-y-3 mt-8">
              <h2 className="text-xl font-heading font-semibold">6. Cookies and Tracking</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                We use essential cookies that are necessary for the Platform to
                function, as well as analytics cookies with your consent. You
                can manage or disable cookies through your browser settings and
                our on-site cookie controls (where provided), although doing so
                may affect certain features.
              </p>
            </section>

            <section className="space-y-3 mt-8">
              <h2 className="text-xl font-heading font-semibold">7. Data Retention</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                We retain personal data only for as long as necessary for the
                purposes described in this Policy or as required by law. In
                particular:
              </p>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                <li>
                  <span className="font-semibold">Transaction data:</span> Normally kept for{" "}
                  <span className="font-semibold">six (6) years</span> to comply with tax and accounting
                  requirements.
                </li>
                <li>
                  <span className="font-semibold">Marketing data:</span> Retained until you withdraw your
                  consent or opt out of receiving marketing communications.
                </li>
              </ul>
              <p className="text-sm leading-relaxed text-muted-foreground">
                We will also delete or anonymise data upon valid request, where
                this is not in conflict with our legal obligations or legitimate
                interests (for example, in relation to ongoing disputes).
              </p>
            </section>

            <section className="space-y-3 mt-8">
              <h2 className="text-xl font-heading font-semibold">8. Security</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                We use appropriate technical and organisational measures to
                protect your personal data, including encryption, access
                controls, and secure hosting. However, no system can be
                guaranteed to be 100% secure, and you acknowledge that the
                transmission of information over the internet always carries
                some risk.
              </p>
            </section>

            <section className="space-y-3 mt-8">
              <h2 className="text-xl font-heading font-semibold">9. International Transfers</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Some of our service providers may be located outside the UK or
                the European Economic Area (EEA), including in the US or EU. In
                such cases, we ensure that appropriate safeguards are in place,
                such as the UK-approved International Data Transfer Addendum or
                Standard Contractual Clauses. You can contact us for more
                information about these safeguards.
              </p>
            </section>

            <section className="space-y-3 mt-8">
              <h2 className="text-xl font-heading font-semibold">
                10. Your Rights under UK GDPR
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Under UK data protection law, you have a number of rights in
                relation to your personal data, including the right to:
              </p>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                <li>Access a copy of the personal data we hold about you.</li>
                <li>Request correction of inaccurate or incomplete data.</li>
                <li>Request erasure of your data in certain circumstances.</li>
                <li>
                  Request restriction of processing in certain circumstances.
                </li>
                <li>
                  Request portability of your data to another controller where
                  technically feasible.
                </li>
                <li>
                  Object to processing based on our legitimate interests,
                  including profiling.
                </li>
                <li>
                  Withdraw consent at any time where processing is based on
                  consent (for example, marketing).
                </li>
              </ul>
              <p className="text-sm leading-relaxed text-muted-foreground">
                You also have the right to lodge a complaint with the UK
                Information Commissioner&apos;s Office (ICO) at{" "}
                <a href="https://ico.org.uk" target="_blank" rel="noreferrer">
                  ico.org.uk
                </a>{" "}
                or by calling 0303 123 1113, if you believe your rights have
                been infringed.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                To exercise any of these rights, please contact us at{" "}
                <a href="mailto:admin@localito.com">admin@localito.com</a>. We
                will respond within one month, or notify you if an extension is
                required in complex cases.
              </p>
            </section>

            <section className="space-y-3 mt-8">
              <h2 className="text-xl font-heading font-semibold">
                11. Children&apos;s Privacy
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Our Platform is not intended for use by individuals under the
                age of 18. We do not knowingly collect personal data relating to
                children. If you believe that a child has provided us with
                personal data, please contact us so that we can take appropriate
                steps to delete such information.
              </p>
            </section>

            <section className="space-y-3 mt-8 mb-10">
              <h2 className="text-xl font-heading font-semibold">12. Changes to This Policy</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                We may update this Privacy Policy from time to time to reflect
                changes in our practices, legal requirements, or the operation
                of the Platform. We will post the updated Policy on this page
                and, where appropriate, notify you of any significant changes
                (for example by email or prominent notice on the Platform).
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                If you have any questions about this Policy or how we process
                your data, please contact us at{" "}
                <a href="mailto:admin@localito.com">admin@localito.com</a>.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

