
import { handleFetchCarrierServiceApi } from "../components/CarrierServicesAPIs";
import { handleFetchProductTags } from "../components/productTagAPI";
import CarrierService from "../database/carrier-service"
import { authenticate } from "../shopify.server";
const CARRIER_SERVICE_NAME = "Nearby Carrier Service";
let CALL_BACK_URL ="https://obesity-cricket-promo-idaho.trycloudflare.com/api/shipping-rates";

export const action = async ({ request }) => {
  const { shop, topic, session, admin,payload } = await authenticate.webhook(request);
  console.log('session: ', session.accessToken);
  // console.log('payload: ', payload.line_items);
  const productIds = payload.line_items.map((item)=> `gid://shopify/Product/${item.product_id}`)
  console.log('productIds: ', productIds);
  try {
    const storeId = session.shop;
    const tags = await handleFetchProductTags(productIds)
    console.log('tags: ', tags);
    console.log("Checkout webhook is working"
    );
    try {
      const carrierServices =  await handleFetchCarrierServiceApi({admin})|| [];
      
      // console.log('carrierServices: ', carrierServices);

      const existingService = carrierServices.find(
        (service) => service.node.name === CARRIER_SERVICE_NAME,
      );

      let carrierServiceResponse;

      if (existingService) {
        const upadteServiceResponse = await admin.graphql(
          `#graphql
            mutation CarrierServiceUpdate($input: DeliveryCarrierServiceUpdateInput!) {
              carrierServiceUpdate(input: $input) {
                carrierService {
                  id
                  name
                  callbackUrl
                  active
                }
                userErrors {
                  field
                  message
                }
              }
            }`,
          {
            variables: {
              input: {
                id: existingService.node.id,
                name: CARRIER_SERVICE_NAME,
                callbackUrl: CALL_BACK_URL,
                active: true,
              },
            },
          },
        );

        const updateResponse = await upadteServiceResponse.json();

        carrierServiceResponse = updateResponse.data?.carrierServiceUpdate || {};
        // console.log('upadte Service Response: ', carrierServiceResponse);
      } else {
        const response = await admin.graphql(
          `#graphql
             mutation CarrierServiceCreate($input: DeliveryCarrierServiceCreateInput!) {
              carrierServiceCreate(input: $input) {
                carrierService {
                  id
                  name
                  callbackUrl
                  active
                  supportsServiceDiscovery
                }
                userErrors {
                  field
                  message
                }
              }
            }
           `,
          {
            variables: {
              input: {
                name: CARRIER_SERVICE_NAME,
                callbackUrl: CALL_BACK_URL,
                supportsServiceDiscovery: true,
                active: true,
              },
            },
          },
        );

        const createResponse = await response.json();
        carrierServiceResponse =
          createResponse.data?.carrierServiceCreate || {};
        // console.log('carrierServiceResponse: ', carrierServiceResponse);
      }

      await CarrierService.findOneAndUpdate(
        { storeId, carrierId: carrierServiceResponse.carrierService?.id },
        { $set: { storeId, ...carrierServiceResponse.carrierService } },
        { upsert: true },
      );
      console.log("its working data");
    } catch (error) {
      console.error(
        `Error handling carrier service for store: ${storeId}`,
        error,
      );
    }
    console.log(`Received ${topic} webhook for ${shop}`);
  } catch (error) {
    console.error("Error in carrier service:", error);
  }

  return new Response();
};
