import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Download ZapTask",
  description: "Download ZapTask for macOS and Windows. Free to use, no account required.",
};

const platforms = [
  {
    name: "macOS",
    icon: "🍎",
    version: "macOS 12 (Monterey) or later",
    arch: "Apple Silicon & Intel",
    file: "ZapTask-0.1.0-mac.dmg",
    primary: true,
  },
  {
    name: "Windows",
    icon: "🪟",
    version: "Windows 10 or later",
    arch: "64-bit",
    file: "ZapTask-0.1.0-win-x64.exe",
    primary: false,
  },
];

export default function DownloadPage() {
  return (
    <div className="pt-24 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {platforms.map((platform) => (
            <div
              key={platform.name}
              className={`p-8 rounded-2xl border-2 ${
                platform.primary
                  ? "border-zap bg-gradient-to-b from-zap-bg to-white"
                  : "border-border bg-white"
              }`}
            >
              <div className="text-4xl mb-4">{platform.icon}</div>
              <h2 className="text-xl font-bold text-foreground mb-1">
                {platform.name}
              </h2>
              <p className="text-sm text-gray-500 mb-1">{platform.version}</p>
              <p className="text-xs text-gray-400 mb-6">{platform.arch}</p>

              <button
                className={`w-full py-3 rounded-full font-semibold text-sm transition-colors ${
                  platform.primary
                    ? "bg-zap text-white hover:bg-zap-dark"
                    : "bg-foreground text-white hover:bg-gray-800"
                }`}
              >
                Download for {platform.name}
              </button>
              <p className="text-xs text-gray-400 text-center mt-3">
                {platform.file}
              </p>
            </div>
          ))}
        </div>

        {/* What's included */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground mb-6">
            What&apos;s included
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl mb-2">🆓</div>
              <p className="text-sm font-medium text-foreground">Free forever</p>
              <p className="text-xs text-gray-500">
                Core features always free
              </p>
            </div>
            <div>
              <div className="text-2xl mb-2">🎁</div>
              <p className="text-sm font-medium text-foreground">
                14-day Pro trial
              </p>
              <p className="text-xs text-gray-500">
                All features unlocked
              </p>
            </div>
            <div>
              <div className="text-2xl mb-2">🔒</div>
              <p className="text-sm font-medium text-foreground">
                Privacy first
              </p>
              <p className="text-xs text-gray-500">
                Data stays on your machine
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
