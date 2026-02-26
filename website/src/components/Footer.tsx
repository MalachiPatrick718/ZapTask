import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2.5">
            <Image
              src="/icon.png"
              alt="ZapTask"
              width={24}
              height={24}
              className="rounded-md"
            />
            <span className="text-sm font-semibold text-foreground">
              ZapTask
            </span>
          </div>

          <div className="flex items-center gap-8">
            <Link
              href="/#features"
              className="text-sm text-gray-500 hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="text-sm text-gray-500 hover:text-foreground transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/download"
              className="text-sm text-gray-500 hover:text-foreground transition-colors"
            >
              Download
            </Link>
          </div>

          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} ZapTask. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
