const steps = [
  {
    number: "1",
    title: "Connect",
    description:
      "Link your Jira, Asana, Monday.com, Notion, Google Calendar, Outlook, and more in seconds with secure OAuth.",
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
    <section className="py-24 px-6 bg-surface">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How it works
          </h2>
          <p className="text-lg text-gray-500">
            Three steps to a more productive day.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="w-12 h-12 rounded-full bg-zap text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">
                {step.number}
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
