"use client";

import { FadeIn } from "@/components/ui/FadeIn";
import { SectionWrapper } from "@/components/ui/SectionWrapper";

const features = [
  {
    icon: "\u26A1",
    title: "Energy-Aware Scheduling",
    description:
      "Tell ZapTask when you peak and when you crash. It matches demanding tasks to your sharpest hours and routine work to your downtime.",
    bullets: [
      "Set your personal energy profile",
      "Tasks auto-sorted by cognitive demand",
      "Adapts to your changing rhythms",
    ],
  },
  {
    icon: "\uD83D\uDD17",
    title: "Unified Task View",
    description:
      "Pull tasks from Jira, Asana, Monday.com, Notion, Todoist, Google Calendar, Outlook, and more into one place. No more tab-switching.",
    bullets: [
      "Secure OAuth for every platform",
      "Real-time sync updates",
      "Filter and search across all sources",
    ],
  },
  {
    icon: "\uD83C\uDF45",
    title: "Built-in Pomodoro Timer",
    description:
      "Built-in focus timer with customizable work and break intervals. Track your productive sessions per task.",
    bullets: [
      "Customizable focus & break durations",
      "Per-task session tracking",
      "Desktop notifications on completion",
    ],
  },
  {
    icon: "\uD83D\uDDA5\uFE0F",
    title: "Always-on Desktop Widget",
    description:
      "Always-on-top minimal widget that lives on your desktop. Glance at your tasks without breaking flow.",
    bullets: [
      "Stays on top of all windows",
      "Minimal footprint on screen",
      "Keyboard shortcuts for everything",
    ],
  },
];

const CheckIcon = () => (
  <svg
    className="w-4 h-4 text-zap flex-shrink-0"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2.5}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

export function Features() {
  return (
    <SectionWrapper id="features" wide>
      <FadeIn>
        <div className="text-center mb-20">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            Built around how you actually work
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Most productivity apps treat every hour the same. ZapTask knows
            you&apos;re not a machine.
          </p>
        </div>
      </FadeIn>

      <div className="space-y-24 md:space-y-32">
        {features.map((feature, i) => {
          const isReversed = i % 2 === 1;
          return (
            <div
              key={feature.title}
              className={`flex flex-col ${
                isReversed ? "md:flex-row-reverse" : "md:flex-row"
              } items-center gap-12 md:gap-16`}
            >
              {/* Text side */}
              <FadeIn
                direction={isReversed ? "right" : "left"}
                className="flex-1"
              >
                <span className="text-4xl mb-4 block">{feature.icon}</span>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-500 leading-relaxed mb-6">
                  {feature.description}
                </p>
                <ul className="space-y-2.5">
                  {feature.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="flex items-center gap-2.5 text-sm text-gray-600"
                    >
                      <CheckIcon />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </FadeIn>

              {/* Mockup side */}
              <FadeIn
                direction={isReversed ? "left" : "right"}
                className="flex-1 w-full"
              >
                <div className="rounded-2xl border border-border bg-gradient-to-br from-zap-bg via-white to-blue-50 p-12 aspect-[4/3] flex items-center justify-center shadow-lg shadow-black/5">
                  <div className="text-center">
                    <span className="text-6xl block mb-3">{feature.icon}</span>
                    <p className="text-sm text-gray-400 font-mono">
                      Feature preview
                    </p>
                  </div>
                </div>
              </FadeIn>
            </div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
