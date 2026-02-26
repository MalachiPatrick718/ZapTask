import Image from "next/image";
import Link from "next/link";

export function DownloadCTA() {
  return (
    <section className="py-24 px-6 bg-gradient-to-b from-white to-zap-bg">
      <div className="max-w-3xl mx-auto text-center">
        <Image
          src="/icon.png"
          alt="ZapTask"
          width={64}
          height={64}
          className="mx-auto mb-6 rounded-2xl"
        />
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Ready to take control of your day?
        </h2>
        <p className="text-lg text-gray-500 mb-10">
          Download ZapTask for free and start unifying your tasks today.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/download"
            className="px-8 py-3.5 rounded-full bg-zap text-white font-semibold text-base hover:bg-zap-dark transition-colors shadow-lg shadow-zap/20"
          >
            Download for macOS
          </Link>
          <Link
            href="/download"
            className="px-8 py-3.5 rounded-full border border-border text-gray-600 font-medium text-base hover:bg-white transition-colors"
          >
            Download for Windows
          </Link>
        </div>
      </div>
    </section>
  );
}
