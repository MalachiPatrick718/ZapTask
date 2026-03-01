"use client";

import { FadeIn } from "@/components/ui/FadeIn";

const shortcuts = [
  { keys: "\u2318 N", action: "Create a new task" },
  { keys: "\u2318 F", action: "Search your tasks" },
  { keys: "\u2318 E", action: "Expand / collapse widget" },
  { keys: "\u2318 H", action: "Show / hide widget" },
  { keys: "\u2318 ?", action: "Quick Start Guide" },
  { keys: "Esc", action: "Close current panel" },
];

const sections = [
  {
    id: "getting-started",
    icon: "\uD83D\uDE80",
    title: "Getting Started",
    color: "from-orange-500/10 to-transparent",
    items: [
      {
        icon: "\uD83D\uDCE5",
        title: "Download & Install",
        description:
          "Grab ZapTask from the Download page. On macOS, drag it to Applications. It launches as a compact widget pinned to your screen corner.",
      },
      {
        icon: "\uD83D\uDC64",
        title: "Create Your Profile",
        description:
          "Set your name and energy profile on first launch \u2014 tell ZapTask when you\u2019re most focused. This powers the smart suggestion engine.",
      },
      {
        icon: "\u2B50",
        title: "Choose Your Plan",
        description:
          "Start free with unlimited tasks, or try Pro free for 14 days to unlock energy scheduling and unlimited integrations.",
      },
    ],
  },
  {
    id: "navigation",
    icon: "\uD83D\uDDFA\uFE0F",
    title: "Navigating the Widget",
    color: "from-blue-500/10 to-transparent",
    items: [
      {
        icon: "\uD83D\uDCF1",
        title: "Bottom Tabs",
        description:
          "Three tabs: Tasks (full list), Suggested (energy-matched picks), and Schedule (daily time blocks).",
      },
      {
        icon: "\u2630",
        title: "Title Bar",
        description:
          "Theme toggle, pin to top, expand/collapse, settings gear, and minimize. Drag the bar to reposition.",
      },
      {
        icon: "\u25A1",
        title: "Slide-in Panels",
        description:
          "Task details, new task form, energy check-in, and quick start guide all slide in from the right. Press Esc to close.",
      },
    ],
  },
  {
    id: "tasks",
    icon: "\u2611\uFE0F",
    title: "Task Management",
    color: "from-green-500/10 to-transparent",
    items: [
      {
        icon: "\u2795",
        title: "Creating Tasks",
        description:
          "Press \u2318N or tap + in the Tasks view. Set title, due date, priority, focus level, time estimate, and category.",
      },
      {
        icon: "\uD83C\uDFAF",
        title: "Focus Levels",
        description:
          "Assign Deep, Medium, or Low focus. Deep focus tasks are suggested when you\u2019re at peak energy, lighter tasks when you\u2019re winding down.",
      },
      {
        icon: "\uD83D\uDD04",
        title: "Status Flow",
        description:
          "To Do \u2192 In Progress \u2192 Done. Click any status badge to change it instantly. In-progress tasks get a boost in suggestions.",
      },
    ],
  },
  {
    id: "energy",
    icon: "\u26A1",
    title: "Energy & Focus",
    color: "from-yellow-500/10 to-transparent",
    items: [
      {
        icon: "\uD83D\uDCC8",
        title: "Energy Profile",
        description:
          "Define your daily energy blocks in Settings \u2192 Energy (e.g., \u201CMorning Focus: High 9am\u20131pm\u201D). ZapTask matches tasks to your rhythm.",
      },
      {
        icon: "\uD83D\uDD04",
        title: "Energy Check-in",
        description:
          "Override your profile anytime from the Suggested tab. Feeling tired after lunch? Set energy to Low and get matching task picks.",
      },
      {
        icon: "\uD83E\uDDE0",
        title: "Smart Suggestions",
        description:
          "Tasks are scored by energy match, urgency, priority, and status. \u201CNeeds Attention\u201D flags urgent items; \u201CRight for Right Now\u201D shows your best picks.",
      },
    ],
  },
  {
    id: "schedule",
    icon: "\uD83D\uDCC5",
    title: "Schedule & Pomodoro",
    color: "from-purple-500/10 to-transparent",
    items: [
      {
        icon: "\u23F0",
        title: "Daily Schedule",
        description:
          "Add tasks to your day from any task card. ZapTask auto-finds a slot matching the task\u2019s focus level to your energy profile.",
      },
      {
        icon: "\uD83C\uDF45",
        title: "Pomodoro Timer",
        description:
          "25-minute focus sessions with 5-minute breaks (15 min after every 4). Start from any task card \u2014 the timer bar appears at the bottom.",
      },
    ],
  },
  {
    id: "expanded",
    icon: "\uD83D\uDDA5\uFE0F",
    title: "Expanded Mode",
    color: "from-indigo-500/10 to-transparent",
    items: [
      {
        icon: "\u2197\uFE0F",
        title: "Expand & Collapse",
        description:
          "Press \u2318E or click the expand arrows in the title bar. The widget grows to a full desktop window \u2014 perfect for planning sessions. Press again to shrink back.",
      },
      {
        icon: "\u2699\uFE0F",
        title: "Settings Anywhere",
        description:
          "The gear icon works in both widget and expanded mode. Click the back arrow to return to your tasks.",
      },
    ],
  },
  {
    id: "integrations",
    icon: "\uD83D\uDD17",
    title: "Integrations",
    color: "from-teal-500/10 to-transparent",
    items: [
      {
        icon: "\uD83D\uDD10",
        title: "Connect Tools",
        description:
          "Link Jira, Notion, Google Calendar, Outlook, Asana, Monday.com, and Apple Calendar via secure OAuth from Settings \u2192 Integrations.",
      },
      {
        icon: "\uD83D\uDD04",
        title: "Smart Sync",
        description:
          "Synced tasks appear alongside local ones. Your local edits (focus levels, priorities) are preserved even when integration data updates.",
      },
    ],
  },
];

export default function GuidePage() {
  return (
    <div className="pt-24 pb-16">
      {/* Hero */}
      <FadeIn>
        <div className="text-center max-w-2xl mx-auto px-6 mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zap/10 text-zap text-sm font-medium mb-6">
            <span>\uD83D\uDCD6</span> User Guide
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 tracking-tight">
            How to Use ZapTask
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            Everything you need to get the most out of your
            energy-aware productivity widget.
          </p>
        </div>
      </FadeIn>

      {/* Jump links */}
      <FadeIn>
        <div className="flex flex-wrap justify-center gap-2 px-6 mb-16 max-w-3xl mx-auto">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="group flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border bg-white text-sm text-gray-600 hover:border-zap/50 hover:text-zap hover:shadow-sm transition-all"
            >
              <span className="group-hover:scale-110 transition-transform">{s.icon}</span>
              {s.title}
            </a>
          ))}
          <a
            href="#shortcuts"
            className="group flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border bg-white text-sm text-gray-600 hover:border-zap/50 hover:text-zap hover:shadow-sm transition-all"
          >
            <span className="group-hover:scale-110 transition-transform">{"\u2328\uFE0F"}</span>
            Shortcuts
          </a>
        </div>
      </FadeIn>

      {/* Content sections */}
      <div className="max-w-3xl mx-auto px-6 space-y-20">
        {sections.map((section, si) => (
          <FadeIn key={section.id}>
            <section id={section.id} className="scroll-mt-24">
              {/* Section header */}
              <div className={`rounded-2xl bg-gradient-to-br ${section.color} p-6 mb-6`}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{section.icon}</span>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                      Step {si + 1} of {sections.length}
                    </p>
                    <h2 className="text-2xl font-bold text-foreground">
                      {section.title}
                    </h2>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-3">
                {section.items.map((item, i) => (
                  <FadeIn key={item.title} staggerIndex={i} staggerDelay={0.08}>
                    <div className="group flex gap-4 p-5 rounded-xl border border-border bg-white hover:border-gray-300 hover:shadow-sm transition-all">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-lg group-hover:bg-zap/10 transition-colors">
                        {item.icon}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-[15px] font-semibold text-foreground mb-1">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </section>
          </FadeIn>
        ))}

        {/* Keyboard Shortcuts */}
        <FadeIn>
          <section id="shortcuts" className="scroll-mt-24">
            <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-6 mb-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{"\u2328\uFE0F"}</span>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                    Reference
                  </p>
                  <h2 className="text-2xl font-bold text-white">
                    Keyboard Shortcuts
                  </h2>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-white overflow-hidden divide-y divide-border">
              {shortcuts.map((s) => (
                <div
                  key={s.keys}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/50 transition-colors"
                >
                  <span className="text-sm text-gray-600">
                    {s.action}
                  </span>
                  <kbd className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-100 border border-gray-200 text-xs font-mono font-semibold text-foreground shadow-[0_1px_0_rgba(0,0,0,0.05)]">
                    {s.keys}
                  </kbd>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-400 mt-3 text-center">
              Replace \u2318 with Ctrl on Windows / Linux
            </p>
          </section>
        </FadeIn>

        {/* CTA */}
        <FadeIn>
          <div className="text-center rounded-2xl bg-gradient-to-br from-zap/10 via-transparent to-orange-100/30 border border-zap/20 p-10">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Ready to get started?
            </h2>
            <p className="text-gray-500 mb-6 text-sm">
              Download ZapTask and work with your energy, not against it.
            </p>
            <a
              href="/download"
              className="inline-block px-8 py-3 rounded-full bg-zap text-white font-semibold hover:bg-zap-dark transition-colors shadow-lg shadow-zap/20"
            >
              Download Free
            </a>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
