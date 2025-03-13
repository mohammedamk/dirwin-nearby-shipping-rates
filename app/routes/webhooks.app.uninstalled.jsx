import SessionModel from "../database/shopify-sessions";
import { authenticate } from "../shopify.server";


export const action = async ({ request }) => {
  const { shop, session, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  if (session) {
    
    const res= await SessionModel.deleteOne({ shop });
    console.log('res: ', res);
  
  }

  return new Response();
};
