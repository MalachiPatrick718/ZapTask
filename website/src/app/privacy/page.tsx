import type { Metadata } from "next";
import Link from "next/link";
import { FadeIn } from "@/components/ui/FadeIn";

export const metadata: Metadata = {
  title: "Privacy Policy — ZapTask",
  description:
    "Learn how ZapTask handles your data. Local-first architecture, encrypted credentials, and transparent practices.",
};

export default function PrivacyPage() {
  return (
    <div className="pt-24 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <FadeIn>
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Privacy Policy
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
                ZapTask (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) is a
                desktop productivity application. We are committed to protecting
                your privacy and being transparent about how your data is
                handled. This policy explains what information ZapTask collects,
                how it is stored, and your rights regarding that data.
              </p>
            </section>

            {/* 1 */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                1. Information We Collect
              </h2>
              <p className="mb-3">
                ZapTask is designed with a <strong>local-first architecture</strong>.
                The majority of your data never leaves your device. We collect
                only what is necessary to provide the service:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Account information:</strong> Your email address, used
                  for authentication and account recovery.
                </li>
                <li>
                  <strong>Integration tokens:</strong> OAuth access and refresh
                  tokens for connected services (Jira, Asana, Monday.com,
                  Notion, Todoist, Google Calendar, Outlook). These are stored locally on
                  your device using encrypted storage.
                </li>
                <li>
                  <strong>Task data:</strong> Tasks synced from your connected
                  platforms are stored in a local SQLite database on your device.
                </li>
                <li>
                  <strong>Preferences:</strong> Your energy profile, theme
                  settings, and app configuration are stored locally.
                </li>
              </ul>
            </section>

            {/* 2 */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                2. How Integration Data Is Handled
              </h2>
              <p className="mb-3">
                When you connect a third-party service, ZapTask initiates a
                standard OAuth 2.0 flow with PKCE (Proof Key for Code Exchange).
                This means:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  You authorize ZapTask directly with the service provider (e.g.,
                  Atlassian, Google, Microsoft).
                </li>
                <li>
                  Access tokens are encrypted using your operating system&apos;s
                  secure credential storage (macOS Keychain / Windows Credential
                  Manager via Electron safeStorage).
                </li>
                <li>
                  Tokens are refreshed automatically and are never transmitted to
                  ZapTask servers.
                </li>
                <li>
                  Task data fetched from integrations is stored only in your
                  local database and is never uploaded to our infrastructure.
                </li>
              </ul>
            </section>

            {/* 3 */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                3. Payment Processing
              </h2>
              <p>
                Payments for ZapTask Pro are processed by{" "}
                <strong>Stripe</strong>. Stripe collects and processes all
                payment information (credit card details, billing address)
                directly. ZapTask never receives, stores, or has access to
                your payment card details. Upon purchase, a license key is
                generated and stored securely. For more information, see{" "}
                <a
                  href="https://stripe.com/privacy"
                  className="text-zap hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Stripe&apos;s Privacy Policy
                </a>
                .
              </p>
            </section>

            {/* 4 */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                4. Data Storage &amp; Security
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Local storage:</strong> Task data, preferences, and
                  integration tokens are stored on your device in an encrypted
                  SQLite database and secure credential store.
                </li>
                <li>
                  <strong>Authentication:</strong> Account authentication is
                  handled via Supabase, with session tokens encrypted locally.
                </li>
                <li>
                  <strong>No cloud sync of task data:</strong> Your tasks and
                  productivity data remain on your machine. We do not have access
                  to your task content.
                </li>
              </ul>
            </section>

            {/* 5 */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                5. Data We Do Not Collect
              </h2>
              <p>ZapTask does not:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Sell, rent, or share your personal data with third parties</li>
                <li>Track your browsing activity or use advertising trackers</li>
                <li>Upload your task content or notes to any server</li>
                <li>Use your data for AI training or profiling</li>
              </ul>
            </section>

            {/* 6 */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                6. Your Rights
              </h2>
              <p className="mb-3">
                Depending on your location, you may have the following rights
                under GDPR, CCPA, or similar privacy legislation:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Access:</strong> Request a copy of the personal data we
                  hold about you (limited to your email and account metadata).
                </li>
                <li>
                  <strong>Deletion:</strong> Request deletion of your account.
                  Since task data is stored locally, uninstalling ZapTask removes
                  all local data.
                </li>
                <li>
                  <strong>Portability:</strong> Export your task data from the app
                  at any time via the Day Summary feature.
                </li>
                <li>
                  <strong>Revoke integrations:</strong> Disconnect any
                  integration at any time from Settings. This deletes the stored
                  tokens from your device.
                </li>
              </ul>
            </section>

            {/* 7 */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                7. Changes to This Policy
              </h2>
              <p>
                We may update this Privacy Policy from time to time. If we make
                significant changes, we will notify you through the app or via
                email. The &ldquo;Last updated&rdquo; date at the top of this
                page reflects the most recent revision.
              </p>
            </section>

            {/* 8 */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                8. Contact Us
              </h2>
              <p>
                If you have questions about this Privacy Policy or your data,
                contact us at{" "}
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
