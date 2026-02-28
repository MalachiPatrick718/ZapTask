import { useEffect } from 'react';
import { useStore } from '../store';

const OFFLINE_GRACE_DAYS = 7;

export function useLicenseValidation() {
  const subscription = useStore((s) => s.subscription);
  const setSubscription = useStore((s) => s.setSubscription);

  useEffect(() => {
    if (!subscription.licenseKey) return;
    if (subscription.tier !== 'pro') return;

    (async () => {
      try {
        const result = await window.zaptask.license.validate(subscription.licenseKey!);
        if (result.valid) {
          setSubscription({
            lastValidatedAt: new Date().toISOString(),
            currentPeriodEnd: result.expiresAt ?? subscription.currentPeriodEnd,
          });
        } else {
          setSubscription({
            tier: 'free',
            status: 'expired',
            licenseKey: null,
            currentPeriodEnd: null,
          });
        }
      } catch {
        // Network error — check offline grace period
        if (subscription.lastValidatedAt) {
          const lastCheck = new Date(subscription.lastValidatedAt);
          const daysSince = (Date.now() - lastCheck.getTime()) / (1000 * 60 * 60 * 24);
          if (daysSince > OFFLINE_GRACE_DAYS) {
            setSubscription({
              tier: 'free',
              status: 'expired',
              licenseKey: null,
              currentPeriodEnd: null,
            });
          }
          // else: within grace period, keep pro
        }
      }
    })();
  }, []); // Run once on mount
}
