import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function GET(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  const PRICES: Record<string, string | undefined> = {
    monthly: process.env.STRIPE_PRICE_ID_MONTHLY,
    yearly: process.env.STRIPE_PRICE_ID_YEARLY,
  };

  const plan = req.nextUrl.searchParams.get('plan');
  const trial = req.nextUrl.searchParams.get('trial');

  if (!plan || !PRICES[plan]) {
    return NextResponse.json({ error: 'Invalid plan. Use ?plan=monthly or ?plan=yearly' }, { status: 400 });
  }

  const priceId = PRICES[plan];
  if (!priceId) {
    return NextResponse.json({ error: 'Price not configured' }, { status: 500 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://zaptask.io';

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/pricing`,
  };

  if (trial === 'true') {
    sessionParams.subscription_data = { trial_period_days: 14 };
  }

  try {
    const session = await stripe.checkout.sessions.create(sessionParams);
    return NextResponse.redirect(session.url!, 303);
  } catch (err) {
    console.error('[Checkout] Session creation error:', err);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
