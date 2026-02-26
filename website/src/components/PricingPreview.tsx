"use client";

import Link from "next/link";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionWrapper } from "@/components/ui/SectionWrapper";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started with the basics",
    features: [
      "Up to 10 active tasks",
      "1 integration",
      "Timeboxing",
      "Desktop widget",
    ],
    cta: "Download Free",
    href: "/download",
    accent: false,
  },
  {
    name: "Pro",
    price: "$7.99",
    period: "/month",
    description: "Unlimited power for professionals",
    features: [
      "Unlimited tasks",
      "Unlimited integrations",
      "Energy-aware scheduling",
      "Pomodoro timer",
      "Day summary export",
      "Priority support",
    ],
    cta: "Start 14-Day Free Trial",
    href: "/download",
    accent: true,
    badge: "Most Popular",
  },
];

export function PricingPreview() {
  return (
    <SectionWrapper id="pricing">
      <FadeIn>
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-gray-500">
            Start free. Upgrade when you need more.
          </p>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        {plans.map((plan, i) => (
          <FadeIn key={plan.name} staggerIndex={i} staggerDelay={0.15}>
            <div
              className={`relative p-8 rounded-2xl border-2 transition-transform duration-200 hover:scale-[1.02] ${
                plan.accent
                  ? "border-zap bg-gradient-to-b from-zap-bg to-white ring-2 ring-zap/10 shadow-lg shadow-zap/10"
                  : "border-border bg-white hover:shadow-lg"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-zap text-white text-xs font-semibold shadow-md shadow-zap/20">
                  {plan.badge}
                </div>
              )}
              <h3 className="text-xl font-bold text-foreground mb-1">
                {plan.name}
              </h3>
              <p className="text-sm text-gray-500 mb-4">{plan.description}</p>
              <div className="mb-6">
                <span
                  className={`text-4xl font-bold ${
                    plan.accent ? "text-zap" : "text-foreground"
                  }`}
                >
                  {plan.price}
                </span>
                <span className="text-sm text-gray-400 ml-1">
                  {plan.period}
                </span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2.5 text-sm text-gray-600"
                  >
                    <svg
                      className={`w-4 h-4 flex-shrink-0 ${
                        plan.accent ? "text-zap" : "text-green-500"
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`block text-center py-3 rounded-full font-semibold text-sm transition-colors ${
                  plan.accent
                    ? "bg-zap text-white hover:bg-zap-dark"
                    : "bg-foreground text-white hover:bg-gray-800"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          </FadeIn>
        ))}
      </div>
    </SectionWrapper>
  );
}
