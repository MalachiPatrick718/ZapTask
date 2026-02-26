import { useMemo } from 'react';
import { useStore } from '../store';
import { FREE_LIMITS, PRO_LIMITS } from '../../shared/types';

export function useSubscription() {
  const subscription = useStore((s) => s.subscription);
  const setSubscription = useStore((s) => s.setSubscription);
  const tasks = useStore((s) => s.tasks);
  const tools = useStore((s) => s.tools);

  const computed = useMemo(() => {
    const now = new Date();
    const trialEnd = new Date(subscription.trialEndsAt);
    const isTrialExpired = subscription.tier === 'trial' && now >= trialEnd;
    const isTrialActive = subscription.tier === 'trial' && now < trialEnd;
    const isPro = subscription.tier === 'pro' && subscription.status === 'active';

    const daysRemaining = isTrialActive
      ? Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

    // Full access during trial or pro
    const hasFullAccess = isTrialActive || isPro;
    const limits = hasFullAccess ? PRO_LIMITS : FREE_LIMITS;

    const connectedCount = tools.filter((t) => t.connected).length;
    const taskCount = tasks.filter((t) => t.status !== 'done').length;

    return {
      isTrialActive,
      isTrialExpired,
      isPro,
      hasFullAccess,
      daysRemaining,
      limits,
      tier: isTrialExpired ? 'free' as const : subscription.tier,
      connectedCount,
      taskCount,
    };
  }, [subscription, tasks, tools]);

  // Auto-downgrade expired trial
  if (computed.isTrialExpired && subscription.tier === 'trial') {
    setSubscription({ tier: 'free', status: 'expired' });
  }

  const canAddTask = () => computed.taskCount < computed.limits.maxTasks;
  const canConnectIntegration = () => computed.connectedCount < computed.limits.maxIntegrations;
  const canUsePomodoro = () => computed.limits.pomodoroEnabled;
  const canUseDaySummary = () => computed.limits.daySummaryEnabled;

  return {
    ...computed,
    canAddTask,
    canConnectIntegration,
    canUsePomodoro,
    canUseDaySummary,
    subscription,
    setSubscription,
  };
}
