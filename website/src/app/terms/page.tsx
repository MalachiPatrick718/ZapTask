import type { Metadata } from "next";
import { FadeIn } from "@/components/ui/FadeIn";

export const metadata: Metadata = {
  title: "Terms of Service — ZapTask",
  description:
    "Terms of Service for ZapTask desktop productivity application.",
};

export default function TermsPage() {
  return (
    <div className="pt-24 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <FadeIn>
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Terms of Service
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
                These Terms of Service (&ldquo;Terms&rdquo;) govern your use of
                ZapTask, a desktop productivity application provided by ZapTask
                (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;). By
                downloading, installing, or using ZapTask, you agree to these
                Terms. If you do not agree, do not use the application.
              </p>
            </section>

            {/* 1 */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                1. Service Description
              </h2>
              <p>
                ZapTask is a desktop widget application for macOS and Windows
                that unifies tasks from multiple productivity platforms (Jira,
                Asana, Monday.com, Notion, Google Calendar, Outlook) into a
                single energy-aware planner. The application runs locally on your
                device and stores your task data in a local database.
              </p>
            </section>

            {/* 2 */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                2. Account &amp; Eligibility
              </h2>
              <p className="mb-3">
                You may need to create an account to use certain features of
                ZapTask. You agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate and current information during registration</li>
                <li>Keep your account credentials secure and confidential</li>
                <li>
                  Notify us immediately if you suspect unauthorized access to
                  your account
                </li>
                <li>Be at least 13 years of age to create an account</li>
              </ul>
            </section>

            {/* 3 */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                3. Subscription Terms
              </h2>
              <p className="mb-3">ZapTask offers two tiers:</p>
              <ul className="list-disc pl-6 space-y-2 mb-3">
                <li>
                  <strong>Free:</strong> Core features including up to 10 active
                  tasks, 1 integration, energy-aware scheduling, and the desktop
                  widget. Free forever.
                </li>
                <li>
                  <strong>Pro ($7.99/month or $95.88/year):</strong> Unlimited
                  tasks, all integrations, Pomodoro timer, day summary export,
                  and priority support. Includes a 14-day free trial.
                </li>
              </ul>
              <p className="mb-3">
                Pro subscriptions are billed through Paddle.com, which acts as
                our Merchant of Record. Paddle&apos;s{" "}
                <a
                  href="https://www.paddle.com/legal/terms"
                  className="text-zap hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  terms of sale
                </a>{" "}
                apply to all purchases.
              </p>
              <p className="mb-3">
                <strong>Free trial:</strong> New Pro subscriptions include a
                14-day free trial. You will not be charged until the trial
                period ends. You may cancel at any time during the trial.
              </p>
              <p>
                <strong>Cancellation:</strong> You may cancel your Pro
                subscription at any time. Access to Pro features continues until
                the end of the current billing period. After cancellation, your
                account reverts to the Free tier.
              </p>
            </section>

            {/* 4 */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                4. Refund Policy
              </h2>
              <p className="mb-3">
                We want you to be happy with ZapTask. If you are not satisfied
                with your Pro subscription, you may request a full refund within
                14 days of any payment. Refunds are processed by our payment
                provider, Paddle.com.
              </p>
              <p className="mb-3">
                To request a refund, contact us at{" "}
                <a
                  href="mailto:support@zaptask.io"
                  className="text-zap hover:underline"
                >
                  support@zaptask.io
                </a>{" "}
                with your account email and the reason for your request. Refunds
                are typically processed within 5&ndash;10 business days.
              </p>
              <p>
                This refund policy applies equally to all customers regardless
                of location, plan, or payment method. No exceptions or
                additional conditions apply.
              </p>
            </section>

            {/* 5 */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                5. Acceptable Use
              </h2>
              <p className="mb-3">You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Reverse-engineer, decompile, or disassemble the application
                  except where permitted by law
                </li>
                <li>
                  Use the application to violate any applicable laws or
                  regulations
                </li>
                <li>
                  Attempt to gain unauthorized access to other users&apos;
                  accounts or our systems
                </li>
                <li>
                  Redistribute, sublicense, or resell ZapTask without written
                  permission
                </li>
              </ul>
            </section>

            {/* 6 */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                6. Third-Party Integrations
              </h2>
              <p>
                ZapTask connects to third-party services including Jira, Asana,
                Monday.com, Notion, Google Calendar, and Microsoft Outlook. Your
                use of these services is governed by their respective terms of
                service and privacy policies. ZapTask is not responsible for the
                availability, accuracy, or content of third-party services.
                Connecting an integration requires you to authorize ZapTask via
                the third party&apos;s OAuth flow — you may revoke this
                authorization at any time from your ZapTask settings or the
                third-party service&apos;s settings.
              </p>
            </section>

            {/* 7 */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                7. Intellectual Property
              </h2>
              <p>
                ZapTask and its original content, features, and functionality are
                owned by ZapTask and are protected by international copyright,
                trademark, and other intellectual property laws. Your task data
                and content remain yours — we claim no ownership of any data you
                create or import through the application.
              </p>
            </section>

            {/* 8 */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                8. Limitation of Liability
              </h2>
              <p>
                To the maximum extent permitted by applicable law, ZapTask shall
                not be liable for any indirect, incidental, special,
                consequential, or punitive damages, including but not limited to
                loss of data, loss of profits, or business interruption, arising
                from your use or inability to use the application. Our total
                liability for any claims related to the service shall not exceed
                the amount you paid us in the 12 months preceding the claim.
              </p>
            </section>

            {/* 9 */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                9. Disclaimer of Warranties
              </h2>
              <p>
                ZapTask is provided &ldquo;as is&rdquo; and &ldquo;as
                available&rdquo; without warranties of any kind, either express
                or implied. We do not guarantee that the application will be
                uninterrupted, error-free, or free of harmful components. You use
                ZapTask at your own risk.
              </p>
            </section>

            {/* 10 */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                10. Termination
              </h2>
              <p>
                We may suspend or terminate your access to ZapTask at any time,
                with or without cause, with or without notice. Upon termination,
                your right to use the application ceases immediately. Since your
                task data is stored locally, you retain access to your local data
                even after account termination.
              </p>
            </section>

            {/* 11 */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                11. Changes to These Terms
              </h2>
              <p>
                We reserve the right to modify these Terms at any time. If we
                make material changes, we will notify you through the application
                or via email. Your continued use of ZapTask after changes are
                posted constitutes acceptance of the revised Terms.
              </p>
            </section>

            {/* 12 */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                12. Contact Us
              </h2>
              <p>
                If you have questions about these Terms, contact us at{" "}
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
