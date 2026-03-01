"use client";

import { FadeIn } from "@/components/ui/FadeIn";
import { SectionWrapper } from "@/components/ui/SectionWrapper";

const steps = [
  {
    number: "1",
    title: "Connect",
    description:
      "Link your Jira, Asana, Monday.com, Notion, Todoist, Google Calendar, Outlook, and more in seconds with secure OAuth.",
  },
  {
    number: "2",
    title: "Plan",
    description:
      "Set your energy profile and let ZapTask organize your tasks into the perfect daily schedule.",
  },
  {
    number: "3",
    title: "Focus",
    description:
      "Work through your day with Pomodoro timers, task notes, and a beautiful widget always at hand.",
  },
];

export function HowItWorks() {
  return (
    <SectionWrapper className="bg-surface">
      <FadeIn>
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            How it works
          </h2>
          <p className="text-lg text-gray-500">
            Three steps to a more productive day.
          </p>
        </div>
      </FadeIn>

      <div className="relative max-w-4xl mx-auto">
        {/* Horizontal connecting line (desktop) */}
        <div className="hidden md:block absolute top-6 left-[16.67%] right-[16.67%] h-0.5 bg-gradient-to-r from-zap via-zap-light to-zap rounded-full" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step, i) => (
            <FadeIn key={step.number} staggerIndex={i} staggerDelay={0.15}>
              <div className="text-center relative">
                <div className="relative z-10 w-12 h-12 rounded-full bg-zap text-white text-xl font-bold flex items-center justify-center mx-auto mb-6 shadow-lg shadow-zap/20">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
