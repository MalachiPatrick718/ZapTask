"use client";

import Link from "next/link";
import { FadeIn } from "@/components/ui/FadeIn";

export function DownloadCTA() {
  return (
    <section className="py-24 md:py-32 px-6 gradient-cta relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />

      <div className="relative max-w-3xl mx-auto text-center">
        <FadeIn>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Ready to take control of your day?
          </h2>
          <p className="text-lg text-white/80 mb-10 max-w-xl mx-auto">
            Download ZapTask for free and start working with your energy, not
            against it.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/download"
              className="px-8 py-3.5 rounded-full bg-white text-zap font-semibold text-base hover:bg-white/90 transition-colors shadow-lg"
            >
              Download for macOS
            </Link>
            <Link
              href="/download"
              className="px-8 py-3.5 rounded-full border-2 border-white/30 text-white font-medium text-base hover:bg-white/10 transition-colors"
            >
              Download for Windows
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
