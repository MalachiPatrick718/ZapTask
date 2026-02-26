"use client";

import { FadeIn } from "@/components/ui/FadeIn";

const integrations = [
  { name: "Jira", color: "#2684FF" },
  { name: "Asana", color: "#F06A6A" },
  { name: "Monday.com", color: "#FF3D57" },
  { name: "Notion", color: "#000000" },
  { name: "Google Calendar", color: "#4285F4" },
  { name: "Outlook", color: "#0078D4" },
  { name: "Apple Calendar", color: "#FF3B30" },
];

export function Integrations() {
  return (
    <section className="py-16 md:py-20 px-6 border-y border-border bg-surface">
      <div className="max-w-4xl mx-auto text-center">
        <FadeIn>
          <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-8">
            Works with your favorite tools
          </p>
        </FadeIn>
        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
          {integrations.map((tool, i) => (
            <FadeIn key={tool.name} staggerIndex={i} staggerDelay={0.05} direction="up" distance={15}>
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-white border border-border shadow-sm hover:shadow-md transition-shadow">
                <div
                  className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                  style={{ background: tool.color }}
                />
                <span className="text-sm font-medium text-gray-700">
                  {tool.name}
                </span>
              </div>
            </FadeIn>
          ))}
        </div>
        <FadeIn delay={0.5}>
          <p className="text-sm text-gray-400 mt-6 italic">
            ...and more to come
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
