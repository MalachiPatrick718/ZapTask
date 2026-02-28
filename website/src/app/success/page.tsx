'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { FadeIn } from '@/components/ui/FadeIn';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [licenseKey, setLicenseKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID found. Please check your email for your license key.');
      setLoading(false);
      return;
    }

    let attempts = 0;
    const maxAttempts = 10;

    const poll = async () => {
      try {
        const res = await fetch(`/api/license/lookup?session_id=${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          setLicenseKey(data.key);
          setLoading(false);
          return;
        }
        attempts++;
        if (attempts >= maxAttempts) {
          setError('Could not retrieve your license key. Please contact support.');
          setLoading(false);
          return;
        }
        setTimeout(poll, 2000);
      } catch {
        attempts++;
        if (attempts >= maxAttempts) {
          setError('Could not retrieve your license key. Please contact support.');
          setLoading(false);
          return;
        }
        setTimeout(poll, 2000);
      }
    };

    poll();
  }, [sessionId]);

  const handleCopy = async () => {
    if (!licenseKey) return;
    await navigator.clipboard.writeText(licenseKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pt-24 pb-20 px-6">
      <div className="max-w-2xl mx-auto">
        <FadeIn>
          <div className="text-center mb-12">
            <div className="text-5xl mb-6">&#x1F389;</div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Welcome to Pro!
            </h1>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Your payment was successful. Here&apos;s your license key.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="p-8 rounded-2xl border-2 border-zap bg-gradient-to-b from-zap-bg to-white shadow-lg shadow-zap/10">
            {loading && (
              <div className="text-center py-8">
                <div className="inline-block w-8 h-8 border-4 border-zap/30 border-t-zap rounded-full animate-spin mb-4" />
                <p className="text-sm text-gray-500">Generating your license key...</p>
              </div>
            )}

            {error && (
              <div className="text-center py-8">
                <p className="text-sm text-red-500 mb-4">{error}</p>
                <a
                  href="/contact"
                  className="text-sm text-zap hover:underline"
                >
                  Contact support
                </a>
              </div>
            )}

            {licenseKey && (
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500 mb-3">
                  Your license key
                </p>
                <div className="bg-gray-900 rounded-xl px-6 py-4 mb-4">
                  <code className="text-xl md:text-2xl font-mono text-white tracking-wider select-all">
                    {licenseKey}
                  </code>
                </div>
                <button
                  onClick={handleCopy}
                  className="px-6 py-3 rounded-full font-semibold text-sm bg-zap text-white hover:bg-zap-dark transition-colors mb-6"
                >
                  {copied ? 'Copied!' : 'Copy to clipboard'}
                </button>

                <div className="border-t border-gray-200 pt-6 mt-2">
                  <h3 className="text-sm font-semibold text-foreground mb-3">
                    How to activate
                  </h3>
                  <ol className="text-sm text-gray-500 space-y-3 text-left max-w-md mx-auto">
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-zap/10 text-zap text-xs font-bold flex items-center justify-center">1</span>
                      <span>Copy the license key above</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-zap/10 text-zap text-xs font-bold flex items-center justify-center">2</span>
                      <span>Open the <strong>ZapTask widget</strong> on your desktop</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-zap/10 text-zap text-xs font-bold flex items-center justify-center">3</span>
                      <span>Look for the <strong>&quot;I have a license key&quot;</strong> link at the bottom of the upgrade screen, or go to <strong>Settings</strong> tab and tap <strong>&quot;Upgrade to Pro&quot;</strong></span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-zap/10 text-zap text-xs font-bold flex items-center justify-center">4</span>
                      <span>Paste your license key into the input field and click <strong>&quot;Activate&quot;</strong></span>
                    </li>
                  </ol>
                  <p className="text-xs text-gray-400 text-center mt-4">
                    Keep this key safe &mdash; you&apos;ll need it if you reinstall ZapTask.
                  </p>
                </div>
              </div>
            )}
          </div>
        </FadeIn>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="pt-24 pb-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-block w-8 h-8 border-4 border-zap/30 border-t-zap rounded-full animate-spin" />
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
