import type { Metadata } from "next";
import Link from "next/link";
import { FadeIn } from "@/components/ui/FadeIn";

export const metadata: Metadata = {
  title: "Contact Us — ZapTask",
  description:
    "Get in touch with the ZapTask team. We'd love to hear from you.",
};

const contactMethods = [
  {
    label: "General Support",
    description: "Questions, issues, or feedback about ZapTask.",
    href: "mailto:support@zaptask.io",
    linkText: "support@zaptask.io",
    icon: "\uD83D\uDCE7",
  },
  {
    label: "Billing & Subscriptions",
    description:
      "Refunds, payment issues, or subscription changes. Payments processed by Stripe.",
    href: "mailto:support@zaptask.io",
    linkText: "support@zaptask.io",
    icon: "\uD83D\uDCB3",
  },
  {
    label: "Bug Reports",
    description:
      "Found a bug? Let us know on GitHub so we can fix it quickly.",
    href: "https://github.com/MalachiPatrick718/ZapTask/issues",
    linkText: "Open an issue on GitHub",
    icon: "\uD83D\uDC1B",
  },
];

export default function ContactPage() {
  return (
    <div className="pt-24 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <FadeIn>
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Contact Us
            </h1>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Have a question, need help, or just want to say hi? We&apos;d love
              to hear from you.
            </p>
          </div>
        </FadeIn>

        <div className="space-y-6 mb-16">
          {contactMethods.map((method, i) => (
            <FadeIn key={method.label} staggerIndex={i} staggerDelay={0.1}>
              <div className="p-6 rounded-2xl border-2 border-border bg-white hover:shadow-lg transition-all duration-200">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{method.icon}</div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground mb-1">
                      {method.label}
                    </h2>
                    <p className="text-sm text-gray-500 mb-3">
                      {method.description}
                    </p>
                    <Link
                      href={method.href}
                      className="text-sm font-medium text-zap hover:underline"
                      target={method.href.startsWith("http") ? "_blank" : undefined}
                      rel={
                        method.href.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                    >
                      {method.linkText}
                    </Link>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn>
          <div className="text-center text-sm text-gray-500">
            <p>
              We typically respond within 24 hours on business days.
            </p>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
