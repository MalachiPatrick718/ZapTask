import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import crypto from 'crypto';
import { redis } from '@/lib/redis';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

function generateLicenseKey(): string {
  const hex = crypto.randomBytes(8).toString('hex').toUpperCase();
  return `ZT-${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}`;
}

/** Get current_period_end from a subscription's first item */
async function getSubscriptionPeriodEnd(subscriptionId: string): Promise<string> {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const item = subscription.items.data[0];
  if (item?.current_period_end) {
    return new Date(item.current_period_end * 1000).toISOString();
  }
  // Fallback: 1 month from now
  const exp = new Date();
  exp.setMonth(exp.getMonth() + 1);
  return exp.toISOString();
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');
  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.customer_details?.email ?? session.customer_email ?? 'unknown';
    const customerId = session.customer as string;
    const subscriptionId = session.subscription as string;

    // Get expiration from the subscription (handles both trial and immediate)
    let expiresAt: string;
    try {
      expiresAt = await getSubscriptionPeriodEnd(subscriptionId);
    } catch {
      // Fallback: compute manually from line items
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      const price = lineItems.data[0]?.price;
      const isYearly = price?.recurring?.interval === 'year';
      const exp = new Date();
      exp.setMonth(exp.getMonth() + (isYearly ? 12 : 1));
      expiresAt = exp.toISOString();
    }

    const key = generateLicenseKey();

    // Store license in Redis
    await redis.set(`license:${key}`, JSON.stringify({
      email,
      tier: 'pro',
      createdAt: new Date().toISOString(),
      expiresAt,
      stripeSessionId: session.id,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
    }));

    // Session-to-key mapping (24h TTL) for success page lookup
    await redis.set(`session:${session.id}`, key, { ex: 86400 });

    // Reverse index: customer → license key (for renewal/cancellation lookups)
    await redis.set(`customer:${customerId}`, key);
  }

  if (event.type === 'invoice.paid') {
    const invoice = event.data.object as Stripe.Invoice;

    // Skip the initial invoice (already handled by checkout.session.completed)
    if (invoice.billing_reason === 'subscription_create') {
      return NextResponse.json({ received: true });
    }

    const customerId = invoice.customer as string;

    const key = await redis.get<string>(`customer:${customerId}`);
    if (!key) return NextResponse.json({ received: true });

    // Get new period end from the subscription
    try {
      const subscriptionId = invoice.lines?.data?.[0]?.subscription;
      const subId = typeof subscriptionId === 'string' ? subscriptionId : subscriptionId?.id;
      if (subId) {
        const newExpiresAt = await getSubscriptionPeriodEnd(subId);
        const raw = await redis.get<string>(`license:${key}`);
        if (raw) {
          const record = typeof raw === 'string' ? JSON.parse(raw) : raw;
          record.expiresAt = newExpiresAt;
          await redis.set(`license:${key}`, JSON.stringify(record));
        }
      }
    } catch (err) {
      console.error('[Webhook] Failed to extend license:', err);
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;

    const key = await redis.get<string>(`customer:${customerId}`);
    if (!key) return NextResponse.json({ received: true });

    const raw = await redis.get<string>(`license:${key}`);
    if (raw) {
      const record = typeof raw === 'string' ? JSON.parse(raw) : raw;
      record.expiresAt = new Date().toISOString(); // Expire immediately
      await redis.set(`license:${key}`, JSON.stringify(record));
    }
  }

  return NextResponse.json({ received: true });
}
