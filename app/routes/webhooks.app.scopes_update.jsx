import SessionModel from "../database/shopify-sessions";
import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  try {
    const { payload, session, topic, shop } = await authenticate.webhook(request);

    console.log(`Received ${topic} webhook for ${shop}`);
    console.log("Session app scopes:", session);

    const currentScope = payload?.current ? payload.current.toString() : null;

    if (session && currentScope) {
      await SessionModel.findOneAndUpdate(
        { shop },
        { scope: currentScope },
        { new: true } 
      );
      console.log(`Updated session scope for shop: ${shop}`);
    }

    return new Response(null, { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response("Webhook processing failed", { status: 500 });
  }
};
