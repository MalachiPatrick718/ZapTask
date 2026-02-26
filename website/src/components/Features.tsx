const features = [
  {
    icon: "⚡",
    title: "Energy-Aware Scheduling",
    description:
      "Tell ZapTask when you peak and when you crash. It matches demanding tasks to your sharpest hours and routine work to your downtime.",
  },
  {
    icon: "🔗",
    title: "Unified Task View",
    description:
      "Pull tasks from Jira, Asana, Notion, Google Calendar, and Outlook into one place. No more tab-switching.",
  },
  {
    icon: "🍅",
    title: "Pomodoro Timer",
    description:
      "Built-in focus timer with customizable work and break intervals. Track your productive sessions per task.",
  },
  {
    icon: "📅",
    title: "Day Planner",
    description:
      "Visual timeline of your day with drag-and-drop scheduling. See meetings and tasks side by side.",
  },
  {
    icon: "📝",
    title: "Quick Notes",
    description:
      "Attach notes to any task. Capture context, meeting notes, or ideas right where you need them.",
  },
  {
    icon: "🖥️",
    title: "Desktop Widget",
    description:
      "Always-on-top minimal widget that lives on your desktop. Glance at your tasks without breaking flow.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Built around how you actually work
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Most productivity apps treat every hour the same. ZapTask knows
            you&apos;re not a machine &mdash; it adapts to your energy, unifies
            your tools, and keeps you in flow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-xl border border-border bg-white hover:shadow-lg hover:shadow-zap/5 transition-shadow"
            >
              <span className="text-2xl mb-4 block">{feature.icon}</span>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
