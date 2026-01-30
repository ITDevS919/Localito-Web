import { Navbar } from "@/components/layout/Navbar";
import { Link } from "wouter";

/**
 * Delete Account page for Google Play Data safety compliance.
 * This URL is required in Play Console: "Add a link that users can use to request
 * that their account and associated data is deleted."
 * See: https://support.google.com/googleplay/android-developer/answer/10787469
 */
export default function DeleteAccountPage() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/10 selection:text-primary">
      <Navbar />

      <main className="pt-28 md:pt-32 pb-12 md:pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <header className="mb-10">
            <h1 className="text-3xl md:text-4xl font-heading font-bold tracking-tight text-primary mb-3">
              Delete your Localito account
            </h1>
            <p className="text-sm text-muted-foreground">
              Localito Marketplace Ltd (&quot;Localito&quot;) allows you to request
              deletion of your account and associated data. This page explains how
              to do that and what happens to your data.
            </p>
          </header>

          <div className="prose prose-sm md:prose-base max-w-none prose-headings:font-heading prose-headings:text-foreground prose-a:text-primary space-y-8">
            <section>
              <h2 className="text-xl font-heading font-semibold mb-3">
                How to request account deletion
              </h2>
              <p className="text-sm text-muted-foreground mb-2">
                You can request deletion of your Localito account in either of these ways:
              </p>
              <ol className="list-decimal pl-5 text-sm text-muted-foreground space-y-2">
                <li>
                  <strong>In the Localito app:</strong> Open the app → go to Profile (or
                  Settings for business accounts) → find &quot;Delete account&quot; or
                  &quot;Request account deletion&quot; and follow the steps. If the option
                  is not yet available in-app, use the option below.
                </li>
                <li>
                  <strong>By email:</strong> Send a request from the email address
                  linked to your account to{" "}
                  <a href="mailto:admin@localito.com">admin@localito.com</a> with the
                  subject &quot;Account deletion request&quot;. Include your full name and
                  registered email so we can identify your account. We will confirm
                  and process your request within a reasonable period (typically within
                  30 days).
                </li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-heading font-semibold mb-3">
                Data we delete when you delete your account
              </h2>
              <p className="text-sm text-muted-foreground mb-2">
                When your account is deleted, we remove or anonymise the following
                personal data associated with your account:
              </p>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                <li>Identity and contact data (name, email, phone, address)</li>
                <li>Profile and account settings</li>
                <li>Saved preferences (e.g. wishlist, preferences)</li>
                <li>Reviews and ratings you have submitted</li>
                <li>Messages and support history linked to your account</li>
                <li>Rewards/points balance and history linked to your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-heading font-semibold mb-3">
                Data we may keep (and for how long)
              </h2>
              <p className="text-sm text-muted-foreground mb-2">
                For legal, tax, fraud prevention or legitimate business purposes we may
                retain some data in anonymised or aggregated form, or as required by law:
              </p>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                <li>
                  <strong>Transaction/order records:</strong> We may keep anonymised or
                  summarised order/transaction data for accounting, tax or dispute
                  resolution for the period required by law (e.g. up to 7 years in the
                  UK). This will not identify you personally where possible.
                </li>
                <li>
                  <strong>Payment records:</strong> Our payment provider (e.g. Stripe)
                  may retain transaction data per their policy and legal requirements.
                </li>
                <li>
                  <strong>Logs and security:</strong> Anonymised or pseudonymised logs
                  may be retained for security and debugging for a limited period
                  (e.g. up to 12 months).
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-heading font-semibold mb-3">
                Business accounts
              </h2>
              <p className="text-sm text-muted-foreground">
                If you have a business/seller account on Localito, deletion may also
                involve disconnecting Stripe or other linked services. We will guide
                you through any extra steps when you submit your request. Data
                retention rules above apply similarly to business account data.
              </p>
            </section>

            <section>
              <p className="text-sm text-muted-foreground">
                For more detail on how we collect and use data, see our{" "}
                <Link href="/privacy" className="text-primary underline hover:no-underline">
                  Privacy Policy
                </Link>
                . For data protection enquiries contact our Data Protection Officer
                at{" "}
                <a href="mailto:admin@localito.com">admin@localito.com</a>. Localito
                Marketplace Ltd, 3rd Floor, 82 King Street, Manchester M2 4WQ.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
