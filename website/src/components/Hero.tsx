import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zap-bg text-zap text-sm font-medium mb-8">
          <span className="w-2 h-2 rounded-full bg-zap animate-pulse" />
          Now available for macOS &amp; Windows
        </div>

        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-tight mb-6">
          Work with your energy,
          <br />
          <span className="text-zap">not against it.</span>
        </h1>

        <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          ZapTask isn&apos;t another to-do list. It learns when you&apos;re at peak
          energy and matches the right tasks to the right moments &mdash; pulling
          from Jira, Asana, Monday.com, Notion, Google Calendar, Outlook,
          and more into one desktop widget that actually understands how you work.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="/download"
            className="px-8 py-3.5 rounded-full bg-zap text-white font-semibold text-base hover:bg-zap-dark transition-colors shadow-lg shadow-zap/20"
          >
            Download Free
          </Link>
          <Link
            href="/#features"
            className="px-8 py-3.5 rounded-full border border-border text-gray-600 font-medium text-base hover:bg-surface transition-colors"
          >
            See Features
          </Link>
        </div>

        {/* App screenshot placeholder */}
        <div className="max-w-3xl mx-auto rounded-2xl border border-border shadow-2xl shadow-black/5 overflow-hidden bg-surface">
          <div className="aspect-video flex items-center justify-center bg-gradient-to-b from-zap-bg to-white">
            <div className="text-center">
              <Image
                src="/icon.png"
                alt="ZapTask"
                width={80}
                height={80}
                className="mx-auto mb-4 rounded-2xl"
              />
              <p className="text-sm text-gray-400 font-mono">App preview coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
