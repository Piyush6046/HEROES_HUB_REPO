import Stripe from "stripe";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
  let event;

  try {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");

    if (!sig) {
      console.error("Missing Stripe signature");
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    console.log(`Processing webhook event: ${event.type}`);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const planId = session.metadata?.planId || "monthly";
        const charityId = session.metadata?.charityId;
        const contribution = parseInt(session.metadata?.contribution || "15");

        if (!userId) {
          console.error("No userId in session metadata");
          break;
        }

        console.log(`Checkout completed for user ${userId}, plan: ${planId}`);

        // Update user profile with active subscription
        const updateData = {
          subscription_status: "active",
          subscription_plan: planId,
          stripe_customer_id: session.customer,
          charity_id: charityId || null,
          contribution_percentage: contribution,
          updated_at: new Date().toISOString()
        };

        const { error } = await supabaseAdmin
          .from("profiles")
          .update(updateData)
          .eq("id", userId);

        if (error) {
          console.error("Error updating user subscription:", error);
        } else {
          console.log(`Successfully activated subscription for user ${userId}`);

          // Log subscription event
          await logSubscriptionEvent(userId, 'payment_succeeded', {
            planId,
            stripe_customer_id: session.customer,
            amount: session.amount_total
          });
        }

        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription);

        console.log(`Payment succeeded for subscription ${invoice.subscription}`);

        // Update subscription status
        const { error } = await supabaseAdmin
          .from("profiles")
          .update({
            subscription_status: "active",
            stripe_subscription_id: invoice.subscription,
            updated_at: new Date().toISOString()
          })
          .eq("stripe_customer_id", subscription.customer);

        if (error) {
          console.error("Error updating subscription from invoice:", error);
        } else {
          // Get user ID for logging
          const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("id")
            .eq("stripe_customer_id", subscription.customer)
            .single();

          if (profile) {
            await logSubscriptionEvent(profile.id, 'payment_succeeded', {
              subscription_id: invoice.subscription,
              amount: invoice.amount_paid
            });
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;

        console.log(`Payment failed for subscription ${invoice.subscription}`);

        // Update subscription status to past_due
        const { error } = await supabaseAdmin
          .from("profiles")
          .update({
            subscription_status: "past_due",
            updated_at: new Date().toISOString()
          })
          .eq("stripe_subscription_id", invoice.subscription);

        if (error) {
          console.error("Error updating failed payment:", error);
        } else {
          // Get user ID for logging
          const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("id")
            .eq("stripe_subscription_id", invoice.subscription)
            .single();

          if (profile) {
            await logSubscriptionEvent(profile.id, 'payment_failed', {
              subscription_id: invoice.subscription,
              amount: invoice.amount_due
            });
          }
        }
        break;
      }

      case "customer.subscription.created": {
        const subscription = event.data.object;
        console.log(`Subscription created: ${subscription.id}`);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        console.log(`Subscription updated: ${subscription.id}`);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;

        console.log(`Subscription cancelled: ${subscription.id}`);

        // Update subscription status to cancelled
        const { error } = await supabaseAdmin
          .from("profiles")
          .update({
            subscription_status: "cancelled",
            subscription_plan: null,
            stripe_subscription_id: null,
            updated_at: new Date().toISOString()
          })
          .eq("stripe_subscription_id", subscription.id);

        if (error) {
          console.error("Error updating cancelled subscription:", error);
        } else {
          // Get user ID for logging
          const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("id")
            .eq("stripe_subscription_id", subscription.id)
            .single();

          if (profile) {
            await logSubscriptionEvent(profile.id, 'cancelled', {
              subscription_id: subscription.id
            });
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true, processed: event.type });

  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function logSubscriptionEvent(userId, eventType, data) {
  try {
    await supabaseAdmin
      .from("subscription_events")
      .insert({
        user_id: userId,
        event_type: eventType,
        data: data,
        created_at: new Date().toISOString()
      });
  } catch (error) {
    console.error("Error logging subscription event:", error);
  }
}
