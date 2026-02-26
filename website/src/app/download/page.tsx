import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FadeIn } from "@/components/ui/FadeIn";

export const metadata: Metadata = {
  title: "Download ZapTask",
  description:
    "Download ZapTask for macOS and Windows. Free to use, no account required.",
};

const GITHUB_REPO = "MalachiPatrick718/ZapTask";
const VERSION = "0.1.0";

const platforms = [
  {
    name: "macOS",
    icon: "\uD83C\uDF4E",
    version: "macOS 12 (Monterey) or later",
    arch: "Apple Silicon & Intel",
    fileName: `ZapTask-${VERSION}-arm64.dmg`,
    primary: true,
  },
  {
    name: "Windows",
    icon: "\uD83E\uDE9F",
    version: "Windows 10 or later",
    arch: "64-bit",
    fileName: `ZapTask-${VERSION} Setup.exe`,
    primary: false,
  },
];

function getDownloadUrl(fileName: string): string {
  return `https://github.com/${GITHUB_REPO}/releases/latest/download/${encodeURIComponent(fileName)}`;
}

export default function DownloadPage() {
  return (
    <div className="gradient-hero">
      <div className="pt-24 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <Image
                src="/icon.png"
                alt="ZapTask"
                width={80}
                height={80}
                className="mx-auto mb-6 rounded-2xl"
              />
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Download ZapTask
              </h1>
              <p className="text-lg text-gray-500 max-w-xl mx-auto">
                Free to download and use. Includes a 14-day Pro trial with
                unlimited tasks and all integrations.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {platforms.map((platform, i) => (
              <FadeIn key={platform.name} staggerIndex={i} staggerDelay={0.15}>
                <div
                  className={`p-8 rounded-2xl border-2 transition-all duration-200 hover:scale-[1.02] h-full ${
                    platform.primary
                      ? "border-zap bg-gradient-to-b from-zap-bg to-white shadow-lg shadow-zap/10"
                      : "border-border bg-white hover:shadow-lg"
                  }`}
                >
                  <div className="text-4xl mb-4">{platform.icon}</div>
                  <h2 className="text-xl font-bold text-foreground mb-1">
                    {platform.name}
                  </h2>
                  <p className="text-sm text-gray-500 mb-1">
                    {platform.version}
                  </p>
                  <p className="text-xs text-gray-400 mb-6">{platform.arch}</p>

                  <Link
                    href={getDownloadUrl(platform.fileName)}
                    className={`block w-full py-3 rounded-full font-semibold text-sm text-center transition-colors ${
                      platform.primary
                        ? "bg-zap text-white hover:bg-zap-dark"
                        : "bg-foreground text-white hover:bg-gray-800"
                    }`}
                  >
                    Download for {platform.name}
                  </Link>
                  <p className="text-xs text-gray-400 text-center mt-3">
                    v{VERSION} &middot; {platform.fileName}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* All releases link */}
          <FadeIn>
            <p className="text-center text-sm text-gray-500 mb-16">
              Looking for an older version or different architecture?{" "}
              <Link
                href={`https://github.com/${GITHUB_REPO}/releases`}
                className="text-zap hover:underline"
                target="_blank"
              >
                View all releases
              </Link>
            </p>
          </FadeIn>

          {/* What's included */}
          <FadeIn>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground mb-6">
                What&apos;s included
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl mb-2">{"\uD83C\uDD93"}</div>
                  <p className="text-sm font-medium text-foreground">
                    Free forever
                  </p>
                  <p className="text-xs text-gray-500">
                    Core features always free
                  </p>
                </div>
                <div>
                  <div className="text-2xl mb-2">{"\uD83C\uDF81"}</div>
                  <p className="text-sm font-medium text-foreground">
                    14-day Pro trial
                  </p>
                  <p className="text-xs text-gray-500">
                    All features unlocked
                  </p>
                </div>
                <div>
                  <div className="text-2xl mb-2">{"\uD83D\uDD12"}</div>
                  <p className="text-sm font-medium text-foreground">
                    Privacy first
                  </p>
                  <p className="text-xs text-gray-500">
                    Data stays on your machine
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
