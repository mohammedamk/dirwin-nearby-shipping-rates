
const CARRIER_SERVICE_NAME = "Nearby Carrier Service";
const CALL_BACK_URL = "https://visits-display-vendor-murray.trycloudflare.com/api/shipping-rates";

export async function handleFetchCarrierServiceApi({ admin }) {
    console.log('Fetching carrier services...');
    let carrierServices = [];

    try {
        const response = await admin.graphql(
            `#graphql
            query CarrierServiceList {
              carrierServices(first: 10, query: "active:true") {
                edges {
                  node {
                    id
                    name
                    callbackUrl
                    active
                    supportsServiceDiscovery
                  }
                }
              }
            }`,
          );
          
          const data = await response.json();
          console.log('data: ', data.data.carrierServices);

        if (data?.data?.carrierServices) {
            carrierServices = data.data.carrierServices.edges || [];
            // console.log('carrierServices: ', data.data);
        }
        // console.log('carrier   Services: ', response.json());
    } catch (error) {
        console.error("Error fetching carrier services:", error);
    }

    return carrierServices;
}

export async function handleUpdateCarrierServiceApi({ admin, existingService }) {
    console.log(`Updating carrier service: ${existingService.node.id}`);
    try {
        const response = await admin.graphql(
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
            }
        );

        if (response?.data?.carrierServiceUpdate?.carrierService) {
            return response.data.carrierServiceUpdate.carrierService;
        } else {
            console.error("Error updating carrier service:", response?.data?.carrierServiceUpdate?.userErrors);
            return null;
        }
    } catch (error) {
        console.error("Error in updateCarrierServiceApi:", error);
        return null;
    }
}

export async function handleCreateCarrierServiceApi({ admin }) {
    console.log("Creating new carrier service...");
    try {
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
            }`,
            {
                variables: {
                    input: {
                        name: CARRIER_SERVICE_NAME,
                        callbackUrl: CALL_BACK_URL,
                        supportsServiceDiscovery: true,
                        active: true,
                    },
                },
            }
        );

        if (response?.data?.carrierServiceCreate?.carrierService) {
            return response.data.carrierServiceCreate.carrierService;
        } else {
            console.error("Error creating carrier service:", response?.data?.carrierServiceCreate?.userErrors);
            return null;
        }
    } catch (error) {
        console.error("Error in createCarrierServiceApi:", error);
        return null;
    }
}
