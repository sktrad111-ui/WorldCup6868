import { NextResponse } from "next/server";
import paypal from "@paypal/checkout-server-sdk";

function environment() {
  return new paypal.core.SandboxEnvironment(
    process.env.PAYPAL_CLIENT_ID!,
    process.env.PAYPAL_SECRET!
  );
}

function client() {
  return new paypal.core.PayPalHttpClient(environment());
}

export async function POST(req: Request) {
  try {
    const { amount } = await req.json();

    const request = new paypal.orders.OrdersCreateRequest();

    request.prefer("return=representation");

    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: String(amount),
          },
        },
      ],
      application_context: {
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/paypal-success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/paypal-cancel`,
      },
    });

    const response = await client().execute(request);

    const approveLink = response.result.links?.find(
      (link: any) => link.rel === "approve"
    );

    if (!approveLink?.href) {
      return NextResponse.json(
        { error: "No PayPal approve link" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: approveLink.href,
    });
  } catch (error: any) {
    console.error("PayPal create order error:", error);

    return NextResponse.json(
      {
        error: "Create PayPal order failed",
        message: error.message || String(error),
      },
      { status: 500 }
    );
  }
}