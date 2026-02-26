import type { Metadata } from "next";
import { FadeIn } from "@/components/ui/FadeIn";

export const metadata: Metadata = {
  title: "Cookie Policy — ZapTask",
  description:
    "Cookie policy for the ZapTask website and desktop application.",
};

export default function CookiesPage() {
  return (
    <div className="pt-24 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <FadeIn>
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Cookie Policy
            </h1>
            <p className="text-sm text-gray-400">
              Last updated: February 26, 2026
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="space-y-10 text-gray-600 leading-relaxed">
            {/* Intro */}
            <section>
              <p>
                This Cookie Policy explains how ZapTask (&ldquo;we,&rdquo;
                &ldquo;our,&rdquo; or &ldquo;us&rdquo;) uses cookies and
                similar technologies on our website (zaptask.io) and within the
                ZapTask desktop application.
              </p>
            </section>

            {/* 1 */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                1. The Desktop Application
              </h2>
              <p>
                The ZapTask desktop app is built with Electron and does not use
                browser cookies. Your preferences, authentication tokens, and
                task data are stored locally on your device using encrypted
                storage (Electron safeStorage and SQLite). No cookies or tracking
                pixels are used within the application itself.
              </p>
            </section>

            {/* 2 */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                2. The ZapTask Website
              </h2>
              <p className="mb-3">
                Our website at zaptask.io is a static site and uses minimal
                cookies:
              </p>

              <h3 className="text-lg font-medium text-foreground mb-2 mt-6">
                Essential Cookies
              </h3>
              <p>
                These are strictly necessary for the website to function. They
                may include cookies set by our hosting provider (Netlify) for
                load balancing and security purposes. These cookies do not track
                your browsing activity and cannot be disabled.
              </p>

              <h3 className="text-lg font-medium text-foreground mb-2 mt-6">
                Analytics Cookies
              </h3>
              <p>
                We do not currently use any analytics or tracking cookies on
                zaptask.io. If we add analytics in the future, we will update
                this policy and provide you with the option to opt out.
              </p>
            </section>

            {/* 3 */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                3. Payment Processor Cookies
              </h2>
              <p>
                When you initiate a purchase through our payment processor,
                Paddle.com, their checkout overlay may set cookies on your device
                for fraud prevention, session management, and to process your
                transaction. These cookies are governed by{" "}
                <a
                  href="https://www.paddle.com/legal/cookies"
                  className="text-zap hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Paddle&apos;s Cookie Policy
                </a>
                .
              </p>
            </section>

            {/* 4 */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                4. Managing Cookies
              </h2>
              <p className="mb-3">
                You can control and manage cookies through your browser settings.
                Most browsers allow you to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>View what cookies are stored and delete them individually</li>
                <li>Block third-party cookies</li>
                <li>Block cookies from specific sites</li>
                <li>Block all cookies</li>
                <li>Delete all cookies when you close your browser</li>
              </ul>
              <p className="mt-3">
                Please note that blocking essential cookies may affect the
                functionality of the website and payment checkout process.
              </p>
            </section>

            {/* 5 */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                5. Changes to This Policy
              </h2>
              <p>
                We may update this Cookie Policy from time to time, particularly
                if we introduce analytics or other cookie-dependent features. The
                &ldquo;Last updated&rdquo; date at the top of this page reflects
                the most recent revision.
              </p>
            </section>

            {/* 6 */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                6. Contact Us
              </h2>
              <p>
                If you have questions about this Cookie Policy, contact us at{" "}
                <a
                  href="mailto:support@zaptask.io"
                  className="text-zap hover:underline"
                >
                  support@zaptask.io
                </a>
                .
              </p>
            </section>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
