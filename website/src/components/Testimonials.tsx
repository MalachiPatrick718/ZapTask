"use client";

import { FadeIn } from "@/components/ui/FadeIn";
import { SectionWrapper } from "@/components/ui/SectionWrapper";

const testimonials = [
  {
    quote:
      "ZapTask completely changed how I plan my day. I finally feel like I'm working with my body's natural rhythm instead of fighting it.",
    name: "Sarah Chen",
    role: "Product Manager",
    initials: "SC",
    color: "#FF6B35",
  },
  {
    quote:
      "Having all my Jira, Notion, and Google Calendar tasks in one widget is a game-changer. I've stopped losing track of things across tools.",
    name: "Marcus Johnson",
    role: "Software Engineer",
    initials: "MJ",
    color: "#3B82F6",
  },
  {
    quote:
      "The energy-aware scheduling feature alone is worth it. I tackle my hardest work during peak hours and the difference is night and day.",
    name: "Aiko Tanaka",
    role: "UX Designer",
    initials: "AT",
    color: "#8B5CF6",
  },
];

function Stars() {
  return (
    <div className="flex gap-1 mb-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className="w-5 h-5 text-yellow-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function Testimonials() {
  return (
    <SectionWrapper className="gradient-subtle">
      <FadeIn>
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            Loved by productive people
          </h2>
          <p className="text-lg text-gray-500">
            See what early users are saying about ZapTask.
          </p>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {testimonials.map((t, i) => (
          <FadeIn key={t.name} staggerIndex={i} staggerDelay={0.12}>
            <div className="p-8 rounded-2xl bg-white border border-border shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
              <Stars />
              <blockquote className="text-gray-600 leading-relaxed mb-6 text-sm flex-1">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ background: t.color }}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {t.name}
                  </p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </SectionWrapper>
  );
}
