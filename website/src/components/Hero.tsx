"use client";

import Image from "next/image";
import Link from "next/link";
import { FadeIn } from "@/components/ui/FadeIn";

export function Hero() {
  return (
    <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 px-6 gradient-hero overflow-hidden">
      {/* Decorative blobs */}
      <div className="blob-glow blob-zap w-[500px] h-[500px] -top-40 -right-40" />
      <div className="blob-glow blob-blue w-[400px] h-[400px] -bottom-20 -left-40" />

      <div className="relative max-w-5xl mx-auto text-center">
        <FadeIn delay={0}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zap-bg text-zap text-sm font-medium mb-8 border border-zap/10">
            <span className="w-2 h-2 rounded-full bg-zap animate-pulse" />
            Now available for macOS &amp; Windows
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-foreground leading-tight mb-6">
            Work with your energy,
            <br />
            <span className="text-zap">not against it.</span>
          </h1>
        </FadeIn>

        <FadeIn delay={0.2}>
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            ZapTask isn&apos;t another to-do list. It learns when you&apos;re at peak
            energy and matches the right tasks to the right moments &mdash; pulling
            from Jira, Asana, Monday.com, Notion, Google Calendar, Outlook,
            and more into one desktop widget that actually understands how you work.
          </p>
        </FadeIn>

        <FadeIn delay={0.3}>
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
        </FadeIn>

        <FadeIn delay={0.5} distance={40}>
          <div className="max-w-4xl mx-auto browser-frame">
            <div className="browser-frame-bar">
              <div className="browser-dot bg-red-400" />
              <div className="browser-dot bg-yellow-400" />
              <div className="browser-dot bg-green-400" />
              <div className="flex-1 mx-4 h-6 rounded bg-gray-200/60" />
            </div>
            <div className="aspect-video bg-gradient-to-br from-zap-bg via-white to-blue-50 flex items-center justify-center">
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
        </FadeIn>
      </div>
    </section>
  );
}
