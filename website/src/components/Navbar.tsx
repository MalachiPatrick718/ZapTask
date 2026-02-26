"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/icon.png" alt="ZapTask" width={32} height={32} className="rounded-lg" />
          <span className="text-lg font-bold tracking-tight text-foreground">
            ZapTask
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/#features" className="text-sm text-gray-600 hover:text-foreground transition-colors">
            Features
          </Link>
          <Link href="/pricing" className="text-sm text-gray-600 hover:text-foreground transition-colors">
            Pricing
          </Link>
          <Link
            href="/download"
            className="text-sm font-semibold px-5 py-2 rounded-full bg-zap text-white hover:bg-zap-dark transition-colors"
          >
            Download Free
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-gray-600"
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-white px-6 py-4 flex flex-col gap-4">
          <Link href="/#features" onClick={() => setMobileOpen(false)} className="text-sm text-gray-600">
            Features
          </Link>
          <Link href="/pricing" onClick={() => setMobileOpen(false)} className="text-sm text-gray-600">
            Pricing
          </Link>
          <Link
            href="/download"
            onClick={() => setMobileOpen(false)}
            className="text-sm font-semibold px-5 py-2 rounded-full bg-zap text-white text-center"
          >
            Download Free
          </Link>
        </div>
      )}
    </header>
  );
}
