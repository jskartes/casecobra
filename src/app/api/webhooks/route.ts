import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { db } from "@/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = headers().get("stripe-signature");
    if (!signature) {
      return new NextResponse("Invalid signature.", { status: 400 });
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    if (event.type === "checkout.session.completed") {
      if (!event.data.object.customer_details?.email) {
        throw new Error("Missing user email.");
      }

      const session = event.data.object as Stripe.Checkout.Session;
      const { userId, orderId } =
        session.metadata ||
        { userId: null, orderId: null };
      if (!userId || !orderId) {
        throw new Error("Invalid request metadata.");
      }

      const billingAddress = session.customer_details!.address;
      const shippingAddress = session.shipping!.address;
      await db.order.update({
        where: {
          id: orderId
        },
        data: {
          isPaid: true,
          shippingAddress: {
            create: {
              name: session.customer_details!.name!,
              street: shippingAddress!.line1!,
              city: shippingAddress!.city!,
              state: shippingAddress!.state!,
              postalCode: shippingAddress!.postal_code!,
              country: shippingAddress!.country!
          }},
          billingAddress: {
            create: {
              name: session.customer_details!.name!,
              street: billingAddress!.line1!,
              city: billingAddress!.city!,
              state: billingAddress!.state!,
              postalCode: billingAddress!.postal_code!,
              country: billingAddress!.country!
      }}}});
    }
    
    return NextResponse.json({ result: event, ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Something went wrong.", ok: false },
      { status: 500 }
    );
  }
}
