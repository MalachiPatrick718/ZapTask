import { useEffect } from 'react';
import { useStore } from '../store';
import { useSubscription } from './useSubscription';

const UPSELL_INTERVAL_DAYS = 3;

/**
 * Periodically prompts free-tier users to upgrade to Pro.
 * Shows the PricingModal every 3 days via the global event.
 */
export function useProUpsell() {
  const lastUpsellAt = useStore((s) => s.lastUpsellAt);
  const setLastUpsellAt = useStore((s) => s.setLastUpsellAt);
  const onboardingComplete = useStore((s) => s.onboardingComplete);
  const { isPro, isTrialActive } = useSubscription();

  useEffect(() => {
    // Only show upsell to free users who have completed onboarding
    if (!onboardingComplete || isPro || isTrialActive) return;

    const now = new Date();

    if (lastUpsellAt) {
      const last = new Date(lastUpsellAt);
      const daysSince = (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < UPSELL_INTERVAL_DAYS) return;
    } else {
      // First time — wait at least 1 day before first upsell
      setLastUpsellAt(now.toISOString());
      return;
    }

    // Delay the upsell slightly so the app loads first
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('zaptask:showPricing'));
      setLastUpsellAt(new Date().toISOString());
    }, 3000);

    return () => clearTimeout(timer);
  }, [onboardingComplete, isPro, isTrialActive, lastUpsellAt, setLastUpsellAt]);
}
