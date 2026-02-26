const integrations = [
  { name: "Jira", color: "#2684FF" },
  { name: "Asana", color: "#F06A6A" },
  { name: "Notion", color: "#000000" },
  { name: "Google Calendar", color: "#4285F4" },
  { name: "Outlook", color: "#0078D4" },
  { name: "Apple Calendar", color: "#FF3B30" },
];

export function Integrations() {
  return (
    <section className="py-16 px-6 border-y border-border bg-surface">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-8">
          Works with your favorite tools
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {integrations.map((tool) => (
            <div key={tool.name} className="flex items-center gap-2.5">
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: tool.color }}
              />
              <span className="text-sm font-medium text-gray-600">
                {tool.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
