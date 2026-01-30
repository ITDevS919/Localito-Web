import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Link } from "wouter";

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/10 selection:text-primary">
      <Navbar />

      <main className="pt-28 md:pt-32 pb-12 md:pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <header className="mb-10">
            <h1 className="text-3xl md:text-4xl font-heading font-bold tracking-tight text-primary mb-3">
              Cookie Policy
            </h1>
            <p className="text-sm text-muted-foreground">
              This policy explains how Localito Marketplace Ltd uses cookies and similar technologies on our Platform.
            </p>
          </header>

          <div className="prose prose-sm md:prose-base max-w-none prose-headings:font-heading prose-headings:text-foreground prose-a:text-primary">
            <p className="text-xs text-muted-foreground mb-4">
              <span className="font-semibold">Last Updated:</span> January 26, 2026
            </p>

            <section className="space-y-4">
              <h2 className="text-xl font-heading font-semibold">1. What Are Cookies?</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Cookies are small text files that are placed on your device (computer, smartphone, or tablet) when you visit a website. 
                They are widely used to make websites work more efficiently and provide information to website owners.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Cookies can be "persistent" (remaining on your device until deleted or expired) or "session" cookies 
                (deleted when you close your browser).
              </p>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-xl font-heading font-semibold">2. How We Use Cookies</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Localito uses cookies to improve your experience on our Platform, understand how you use our services, 
                and provide essential functionality. We use the following types of cookies:
              </p>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-xl font-heading font-semibold">3. Types of Cookies We Use</h2>
              
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-6 space-y-4">
                <div>
                  <h3 className="text-base font-semibold mb-2">3.1 Essential Cookies (Strictly Necessary)</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground mb-2">
                    These cookies are necessary for the Platform to function and cannot be switched off. They are usually only set 
                    in response to actions you take, such as logging in, setting privacy preferences, or filling in forms.
                  </p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    <span className="font-semibold">Examples:</span>
                  </p>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                    <li>Authentication cookies to keep you logged in</li>
                    <li>Session management cookies</li>
                    <li>Security cookies to prevent fraud</li>
                    <li>Load balancing cookies</li>
                  </ul>
                  <p className="text-sm leading-relaxed text-muted-foreground mt-2">
                    <span className="font-semibold">Legal Basis:</span> These cookies are necessary for the performance of our 
                    contract with you (providing the Platform services).
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <h3 className="text-base font-semibold mb-2">3.2 Analytics Cookies</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground mb-2">
                    These cookies help us understand how visitors interact with our Platform by collecting and reporting information 
                    anonymously. This helps us improve the Platform and user experience.
                  </p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    <span className="font-semibold">Third-Party Services We Use:</span>
                  </p>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                    <li>
                      <span className="font-semibold">Google Analytics:</span> We use Google Analytics to analyze Platform usage, 
                      including page views, session duration, and user behavior. Google Analytics uses cookies to collect data 
                      about your use of the Platform. You can learn more about how Google uses data at{" "}
                      <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">
                        https://policies.google.com/technologies/partner-sites
                      </a>.
                    </li>
                  </ul>
                  <p className="text-sm leading-relaxed text-muted-foreground mt-2">
                    <span className="font-semibold">Legal Basis:</span> Your consent, which you can withdraw at any time by 
                    adjusting your browser settings or using our cookie preferences (if available).
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <h3 className="text-base font-semibold mb-2">3.3 Functional Cookies</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground mb-2">
                    These cookies enable enhanced functionality and personalization, such as remembering your preferences 
                    (e.g., language, region, or display settings).
                  </p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    <span className="font-semibold">Examples:</span>
                  </p>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                    <li>Remembering your location preferences</li>
                    <li>Storing your theme preferences (light/dark mode)</li>
                    <li>Remembering items in your shopping basket</li>
                  </ul>
                  <p className="text-sm leading-relaxed text-muted-foreground mt-2">
                    <span className="font-semibold">Legal Basis:</span> Your consent or our legitimate interest in providing 
                    you with an improved user experience.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <h3 className="text-base font-semibold mb-2">3.4 Payment Processing Cookies</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground mb-2">
                    Our payment provider, Stripe, uses cookies to process payments securely and prevent fraud.
                  </p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    <span className="font-semibold">Third-Party Services:</span>
                  </p>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                    <li>
                      <span className="font-semibold">Stripe:</span> Stripe uses cookies to enable payment processing, 
                      prevent fraud, and comply with legal requirements. You can learn more about Stripe's use of cookies at{" "}
                      <a href="https://stripe.com/cookies-policy/legal" target="_blank" rel="noopener noreferrer">
                        https://stripe.com/cookies-policy/legal
                      </a>.
                    </li>
                  </ul>
                  <p className="text-sm leading-relaxed text-muted-foreground mt-2">
                    <span className="font-semibold">Legal Basis:</span> Necessary for the performance of our contract with you 
                    (processing payments) and compliance with legal obligations.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-xl font-heading font-semibold">4. Third-Party Cookies</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Some cookies on our Platform are set by third-party services we use to provide functionality or analyze usage. 
                These third parties have their own privacy policies and cookie policies:
              </p>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                <li>
                  <span className="font-semibold">Google Analytics:</span>{" "}
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <span className="font-semibold">Stripe:</span>{" "}
                  <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">
                    Privacy Policy
                  </a>
                </li>
              </ul>
              <p className="text-sm leading-relaxed text-muted-foreground mt-2">
                We do not control these third-party cookies. Please review the relevant third-party privacy policies 
                for more information.
              </p>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-xl font-heading font-semibold">5. How to Manage Cookies</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                You have the right to decide whether to accept or reject cookies (except for strictly necessary cookies, 
                which are required for the Platform to function).
              </p>
              
              <div className="space-y-3">
                <h3 className="text-base font-semibold">5.1 Browser Settings</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Most web browsers allow you to control cookies through their settings. You can set your browser to:
                </p>
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                  <li>Block all cookies</li>
                  <li>Accept only first-party cookies</li>
                  <li>Delete cookies when you close your browser</li>
                  <li>Notify you when a cookie is set</li>
                </ul>
                <p className="text-sm leading-relaxed text-muted-foreground mt-2">
                  To learn how to manage cookies in your browser, visit:
                </p>
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                  <li>
                    <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">
                      Google Chrome
                    </a>
                  </li>
                  <li>
                    <a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer">
                      Mozilla Firefox
                    </a>
                  </li>
                  <li>
                    <a href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">
                      Safari
                    </a>
                  </li>
                  <li>
                    <a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer">
                      Microsoft Edge
                    </a>
                  </li>
                </ul>
                <p className="text-sm leading-relaxed text-muted-foreground mt-2">
                  <span className="font-semibold">Please note:</span> If you block or delete cookies, some features of the 
                  Platform may not work properly, and you may not be able to access certain parts of the Platform.
                </p>
              </div>

              <div className="space-y-3 mt-4">
                <h3 className="text-base font-semibold">5.2 Opt-Out of Google Analytics</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  You can opt out of Google Analytics tracking by installing the{" "}
                  <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
                    Google Analytics Opt-out Browser Add-on
                  </a>.
                </p>
              </div>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-xl font-heading font-semibold">6. Do Not Track Signals</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Some browsers include a "Do Not Track" (DNT) feature that signals to websites that you do not want to be tracked. 
                Currently, there is no universal standard for how websites should respond to DNT signals. At present, our Platform 
                does not respond to DNT signals, but we respect your right to manage cookies through your browser settings.
              </p>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-xl font-heading font-semibold">7. Updates to This Cookie Policy</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                We may update this Cookie Policy from time to time to reflect changes in our practices, technology, legal requirements, 
                or other factors. We will post the updated policy on this page and update the "Last Updated" date at the top.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                We encourage you to review this Cookie Policy periodically to stay informed about how we use cookies.
              </p>
            </section>

            <section className="space-y-4 mt-8 mb-10">
              <h2 className="text-xl font-heading font-semibold">8. Contact Us</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                If you have any questions about this Cookie Policy or how we use cookies, please contact us:
              </p>
              <ul className="list-none text-sm text-muted-foreground space-y-1">
                <li>
                  <span className="font-semibold">Email:</span>{" "}
                  <a href="mailto:admin@localito.com">admin@localito.com</a>
                </li>
                <li>
                  <span className="font-semibold">Address:</span> Localito Marketplace Ltd, 3rd Floor, 82 King Street, 
                  Manchester M2 4WQ, United Kingdom
                </li>
              </ul>
              <p className="text-sm leading-relaxed text-muted-foreground mt-4">
                For more information about how we process your personal data, please see our{" "}
                <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
