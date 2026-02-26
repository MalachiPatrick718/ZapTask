import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing — ZapTask",
  description: "Simple pricing for ZapTask. Start free, upgrade to Pro when you need more.",
};

const features = [
  { name: "Local task management", free: true, pro: true },
  { name: "Energy-aware scheduling", free: true, pro: true },
  { name: "Day planner timeline", free: true, pro: true },
  { name: "Desktop widget", free: true, pro: true },
  { name: "Active tasks", free: "Up to 10", pro: "Unlimited" },
  { name: "Integrations", free: "1", pro: "All 6" },
  { name: "Pomodoro timer", free: false, pro: true },
  { name: "Day summary export", free: false, pro: true },
  { name: "Priority support", free: false, pro: true },
];

export default function PricingPage() {
  return (
    <div className="pt-24 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Choose your plan
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Start with a 14-day free trial of Pro. No credit card required.
            Downgrade to Free anytime.
          </p>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-16">
          {/* Free */}
          <div className="p-8 rounded-2xl border-2 border-border bg-white">
            <h2 className="text-xl font-bold text-foreground mb-1">Free</h2>
            <p className="text-sm text-gray-500 mb-4">
              For personal use and getting started
            </p>
            <div className="mb-6">
              <span className="text-5xl font-bold text-foreground">$0</span>
              <span className="text-sm text-gray-400 ml-2">/forever</span>
            </div>
            <Link
              href="/download"
              className="block text-center py-3 rounded-full font-semibold text-sm bg-foreground text-white hover:bg-gray-800 transition-colors"
            >
              Download Free
            </Link>
          </div>

          {/* Pro */}
          <div className="relative p-8 rounded-2xl border-2 border-zap bg-gradient-to-b from-zap-bg to-white">
            <div className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-zap text-white text-xs font-semibold">
              14-day free trial
            </div>
            <h2 className="text-xl font-bold text-foreground mb-1">Pro</h2>
            <p className="text-sm text-gray-500 mb-4">
              For power users who want it all
            </p>
            <div className="mb-2">
              <span className="text-5xl font-bold text-zap">$7.99</span>
              <span className="text-sm text-gray-400 ml-2">/month</span>
            </div>
            <p className="text-xs text-gray-400 mb-6">
              or $95.88/year (save 17%)
            </p>
            <Link
              href="/download"
              className="block text-center py-3 rounded-full font-semibold text-sm bg-zap text-white hover:bg-zap-dark transition-colors"
            >
              Start Free Trial
            </Link>
          </div>
        </div>

        {/* Feature comparison table */}
        <div className="max-w-3xl mx-auto">
          <h3 className="text-lg font-semibold text-foreground mb-6 text-center">
            Feature comparison
          </h3>
          <div className="border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-surface">
                  <th className="text-left text-sm font-medium text-gray-500 py-3 px-6">
                    Feature
                  </th>
                  <th className="text-center text-sm font-medium text-gray-500 py-3 px-6 w-28">
                    Free
                  </th>
                  <th className="text-center text-sm font-medium text-zap py-3 px-6 w-28">
                    Pro
                  </th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature, i) => (
                  <tr
                    key={feature.name}
                    className={i % 2 === 0 ? "bg-white" : "bg-surface/50"}
                  >
                    <td className="text-sm text-gray-600 py-3 px-6">
                      {feature.name}
                    </td>
                    <td className="text-center py-3 px-6">
                      {feature.free === true ? (
                        <Check />
                      ) : feature.free === false ? (
                        <X />
                      ) : (
                        <span className="text-sm text-gray-500">
                          {feature.free}
                        </span>
                      )}
                    </td>
                    <td className="text-center py-3 px-6">
                      {feature.pro === true ? (
                        <Check accent />
                      ) : (
                        <span className="text-sm font-medium text-zap">
                          {feature.pro}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function Check({ accent }: { accent?: boolean }) {
  return (
    <svg
      className={`w-5 h-5 mx-auto ${accent ? "text-zap" : "text-green-500"}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function X() {
  return (
    <svg
      className="w-5 h-5 mx-auto text-gray-300"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
