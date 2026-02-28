"use client";

import { FadeIn } from "@/components/ui/FadeIn";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const shortcuts = [
  { keys: "\u2318/Ctrl + N", action: "Create a new task" },
  { keys: "\u2318/Ctrl + F", action: "Search your tasks" },
  { keys: "\u2318/Ctrl + E", action: "Expand or collapse the widget" },
  { keys: "\u2318/Ctrl + H", action: "Show or hide the widget" },
  { keys: "\u2318/Ctrl + ?", action: "Open the Quick Start Guide" },
  { keys: "Esc", action: "Close the current panel" },
];

const sections = [
  {
    id: "getting-started",
    icon: "\uD83D\uDE80",
    title: "Getting Started",
    items: [
      {
        title: "Download & Install",
        description:
          "Download ZapTask from the Download page. On macOS, drag it to Applications. On Windows, run the installer. ZapTask launches as a small widget pinned to the corner of your screen.",
      },
      {
        title: "Create Your Profile",
        description:
          "On first launch, you\u2019ll set up your name and energy profile \u2014 telling ZapTask when you\u2019re most focused throughout the day. This powers the smart suggestion engine.",
      },
      {
        title: "Choose Your Plan",
        description:
          "Start free with unlimited tasks, or unlock Pro features like energy-aware scheduling and unlimited integrations with a 14-day free trial.",
      },
    ],
  },
  {
    id: "navigation",
    icon: "\uD83D\uDDFA\uFE0F",
    title: "Navigating the Widget",
    items: [
      {
        title: "Bottom Tabs",
        description:
          "Three tabs at the bottom: Tasks (your full task list), Suggested (energy-matched recommendations), and Schedule (daily time blocks). Tap to switch between views.",
      },
      {
        title: "Title Bar",
        description:
          "The top bar has theme toggle, pin (always-on-top), expand/collapse, settings gear, and minimize. Drag the title bar to reposition the widget.",
      },
      {
        title: "Panels",
        description:
          "Panels slide in from the right for task details, new task creation, energy check-in, and the quick start guide. Press Esc to close any panel.",
      },
    ],
  },
  {
    id: "tasks",
    icon: "\u2611\uFE0F",
    title: "Task Management",
    items: [
      {
        title: "Creating Tasks",
        description:
          "Press \u2318N (or Ctrl+N) to create a new task, or tap the + button in the Tasks view. Set a title, due date, priority, focus level, time estimate, and category.",
      },
      {
        title: "Focus Levels",
        description:
          "Assign Deep (\uD83C\uDFAF), Medium (\u2699\uFE0F), or Low (\u2615) focus to each task. ZapTask uses this to match tasks to your energy \u2014 deep focus tasks are suggested when you\u2019re at peak energy.",
      },
      {
        title: "Status Flow",
        description:
          "Tasks flow through statuses: To Do \u2192 In Progress \u2192 Done. Click the status badge on any task card to quickly change it. In-progress tasks get a scoring boost in suggestions.",
      },
      {
        title: "Quick Actions",
        description:
          "Each task card has action buttons: add to today\u2019s schedule, start a Pomodoro timer, or open the detail panel. Swipe through them to stay in flow.",
      },
    ],
  },
  {
    id: "energy",
    icon: "\u26A1",
    title: "Energy & Focus System",
    items: [
      {
        title: "Energy Profile",
        description:
          "In Settings \u2192 Energy, define your daily energy blocks (e.g., \u201CMorning Focus: High 9am\u20131pm\u201D). ZapTask uses this to suggest the right tasks at the right time.",
      },
      {
        title: "Energy Check-in",
        description:
          "Override your profile anytime by clicking \u201CUpdate energy\u201D in the Suggested tab, or waiting for the periodic notification. This temporarily adjusts which tasks are recommended.",
      },
      {
        title: "Smart Suggestions",
        description:
          "The Suggested tab scores tasks based on energy match, due urgency, priority, and in-progress status. \u201CNeeds Attention\u201D shows urgent items, \u201CRight for Right Now\u201D shows energy-matched tasks.",
      },
    ],
  },
  {
    id: "schedule",
    icon: "\uD83D\uDCC5",
    title: "Schedule & Pomodoro",
    items: [
      {
        title: "Daily Schedule",
        description:
          "Add tasks to your daily schedule from any task card\u2019s menu. ZapTask automatically finds a time slot that matches the task\u2019s focus level to your energy profile.",
      },
      {
        title: "Pomodoro Timer",
        description:
          "Start a 25-minute focus session on any task. After each focus block, take a 5-minute break (or 15 minutes after every 4 sessions). The timer bar appears at the bottom of the widget.",
      },
    ],
  },
  {
    id: "expanded",
    icon: "\uD83D\uDDA5\uFE0F",
    title: "Expanded Mode",
    items: [
      {
        title: "How to Expand",
        description:
          "Press \u2318E (or Ctrl+E) or click the expand arrow (\u2197) in the title bar. The widget grows to 900\u00D7700 for a full desktop experience, perfect for planning sessions.",
      },
      {
        title: "How to Collapse",
        description:
          "Press \u2318E again or click the collapse arrow (\u2199). The widget shrinks back to its compact size and re-pins to its previous position.",
      },
      {
        title: "Settings in Any Mode",
        description:
          "The gear icon is always available in the title bar. Settings work in both widget and expanded modes \u2014 click the back arrow (\u2190) to return to your tasks.",
      },
    ],
  },
  {
    id: "integrations",
    icon: "\uD83D\uDD17",
    title: "Integrations",
    items: [
      {
        title: "Connecting Tools",
        description:
          "Go to Settings \u2192 Integrations to connect Jira, Notion, Google Calendar, Outlook, Asana, Monday.com, and Apple Calendar. Each uses secure OAuth \u2014 no passwords stored.",
      },
      {
        title: "Synced Tasks",
        description:
          "Tasks from connected tools appear alongside your local tasks. ZapTask preserves your local edits (focus levels, priorities) even when integration data updates.",
      },
    ],
  },
];

export default function GuidePage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        {/* Hero */}
        <SectionWrapper className="bg-gradient-to-b from-zap/5 to-transparent">
          <FadeIn>
            <div className="text-center max-w-2xl mx-auto">
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                How to Use ZapTask
              </h1>
              <p className="text-lg text-gray-500 leading-relaxed">
                Everything you need to know to get the most out of your
                energy-aware productivity widget.
              </p>
            </div>
          </FadeIn>
        </SectionWrapper>

        {/* Table of contents */}
        <SectionWrapper className="!py-12">
          <FadeIn>
            <div className="flex flex-wrap justify-center gap-3">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="px-4 py-2 rounded-full border border-border text-sm text-gray-600 hover:border-zap hover:text-zap transition-colors"
                >
                  {s.icon} {s.title}
                </a>
              ))}
              <a
                href="#shortcuts"
                className="px-4 py-2 rounded-full border border-border text-sm text-gray-600 hover:border-zap hover:text-zap transition-colors"
              >
                &#x2328; Shortcuts
              </a>
            </div>
          </FadeIn>
        </SectionWrapper>

        {/* Content sections */}
        {sections.map((section, si) => (
          <SectionWrapper
            key={section.id}
            id={section.id}
            className={si % 2 === 0 ? "bg-surface" : ""}
          >
            <FadeIn>
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                  <span className="text-3xl">{section.icon}</span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                    {section.title}
                  </h2>
                </div>
                <div className="space-y-6">
                  {section.items.map((item, i) => (
                    <FadeIn key={item.title} staggerIndex={i} staggerDelay={0.1}>
                      <div className="bg-white rounded-xl border border-border p-6">
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </FadeIn>
                  ))}
                </div>
              </div>
            </FadeIn>
          </SectionWrapper>
        ))}

        {/* Keyboard Shortcuts */}
        <SectionWrapper id="shortcuts" className="bg-surface">
          <FadeIn>
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <span className="text-3xl">&#x2328;</span>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Keyboard Shortcuts
                </h2>
              </div>
              <div className="bg-white rounded-xl border border-border overflow-hidden">
                {shortcuts.map((s, i) => (
                  <FadeIn key={s.keys} staggerIndex={i} staggerDelay={0.05}>
                    <div
                      className={`flex items-center justify-between px-6 py-4 ${
                        i < shortcuts.length - 1
                          ? "border-b border-border"
                          : ""
                      }`}
                    >
                      <span className="text-sm text-gray-600">
                        {s.action}
                      </span>
                      <kbd className="px-3 py-1.5 rounded-md bg-gray-100 border border-gray-200 text-sm font-mono font-semibold text-foreground">
                        {s.keys}
                      </kbd>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          </FadeIn>
        </SectionWrapper>

        {/* CTA */}
        <SectionWrapper>
          <FadeIn>
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                Ready to get started?
              </h2>
              <p className="text-gray-500 mb-8">
                Download ZapTask and experience energy-aware productivity.
              </p>
              <a
                href="/download"
                className="inline-block px-8 py-3 rounded-full bg-zap text-white font-semibold hover:bg-zap-dark transition-colors"
              >
                Download Free
              </a>
            </div>
          </FadeIn>
        </SectionWrapper>
      </main>
      <Footer />
    </>
  );
}
