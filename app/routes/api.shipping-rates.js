import { handleFetchProductTags } from "../components/productTagAPI";
import GoogleSettings from "../database/google-settings";

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

async function handleGetUserLocation({ pincode }) {
  try {
    const geoResponse = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${pincode}&key=${GOOGLE_API_KEY}`,
    );
    const geoData = await geoResponse.json();
    if (geoData.status === "OK" && geoData.results.length > 0) {
      return {
        status: geoData.status,
        lat: geoData.results[0].geometry.location.lat,
        long: geoData.results[0].geometry.location.lng,
      };
    }

    return { status: "Error", lat: null, long: null };
  } catch (error) {
    console.error(" ❌ Error fetching location:", error);
    return { status: "Error", lat: null, long: null };
  }
}

function haversineDistance(lat1, lon1, lat2, lon2) {
  const toRad = (angle) => (angle * Math.PI) / 180;
  const R = 6371; // Earth's radius in km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
}

async function handleGetNearbyAddress(lat, long) {
  let totalNoOfAddresses, range, addressList;
  let rates = [],
    type;
  try {
    const googleSettings = await GoogleSettings.findOne({});
    // Shipped to NYC Bicycle Shop for professional assembly at: 1178 Bay St, Staten Island, NY 10305, USA. 
    // Earliest pickup date: 2-3 days after bicycle(s) arrival. 
    // Pickup distance: approx. 11.9 mi away.
    console.log("⚙︎ googleSettings: ", googleSettings);
    if (googleSettings) {
      totalNoOfAddresses = googleSettings.noOfAddresses;
      range = googleSettings.range || 15;
      type = googleSettings.type || "";
      const placesResponse = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${long}&radius=${(range || 15) * 1000}&type=${type === "" || type === null ? "bicycle_store" : type}&key=${GOOGLE_API_KEY}`,
      );
      const placesData = await placesResponse.json();
      
      console.log("near by addresses: ", placesData.results);
      if (placesData.status === "OK") {
        if (placesData.results.length >= totalNoOfAddresses) {
          addressList = placesData.results.slice(0, totalNoOfAddresses);
        } else {
          addressList = placesData.results || [];
        }
        if (addressList.length > 0) {
          rates = addressList.map((item) => {
            const storeLat = item.geometry.location.lat;
            const storeLon = item.geometry.location.lng;
            const distanceInKm = haversineDistance(lat, long, storeLat, storeLon);
            const distanceInMiles = (distanceInKm * 0.621371).toFixed(2); 
          
            return {
              name: item.name,
              address: item.vicinity,
              rating: item.rating || "No rating",
              place_id: item.place_id,
              location: { lat: storeLat, lng: storeLon },
              milesAway: `${distanceInMiles} miles away`,
            };
          });
        }
        return {
          status: "OK",
          data: rates,
        };
      }
    }

    return { status: "Error", data: [] };
  } catch (error) {
    console.error("Error fetching nearby places:", error?.message);
    return { status: "Error", data: [] };
  }
}

// export const loader = async ({ request }) => {
//   const pincode = "10036";
//   let nearByPlaces = [];
//   let location,rates;
//   if(pincode){
//     location = await handleGetUserLocation({pincode})
//     console.log('location loader: ', location);
//     if(location.lat != null && location.long != null){
//       nearByPlaces = await handleGetNearbyAddress(location.lat,location.long,"dirwin-assembly-app-store.myshopify.com")
//       console.log('nearByPlaces loader: ', nearByPlaces);
//       if(nearByPlaces.data.length>0){
//         rates = nearByPlaces.data.map((item, index) => ({
//           service_name: item.name,
//           service_code: item.place_id,
//           total_price: "0",
//           description: item.address,
//           currency: "USD",
//         }));
//         console.log("rates: ", rates);
//       }
//     }
//   }
//   return json({ rates });
// };

export const action = async ({ request }) => {
  let location, rates;
  let nearByPlaces;
  const body = await request.json();
  const productIds = body.rate.items.map(
    (item) => `gid://shopify/Product/${item.product_id}`,
  );
  // console.log("productIds: ", productIds);
  // console.log("shipping details: ", body.rate);
  try {
    const pincode = body.rate.destination?.postal_code;
    console.log("🅿️  pincode: ", pincode);
    const tags = await handleFetchProductTags(productIds);
    console.log("shipping api tags: ", tags);
    if (tags) {
      const keywords = ["electric bikes", "e-bikes", "Electric Bike"];

      const containsKeyword = tags.some((tag) =>
        keywords.some((keyword) => tag.toLowerCase() === keyword.toLowerCase()),
      );
      if (containsKeyword) {
        if (pincode) {
          location = await handleGetUserLocation({ pincode });
          console.log("⚲ location: ", location);
          if (location.lat != null && location.long != null) {
            nearByPlaces = await handleGetNearbyAddress(
              location.lat,
              location.long,
            );
            if (nearByPlaces.data.length > 0) {
              rates = nearByPlaces.data.map((item, index) => ({
                service_name: item.name,
                service_code: item.place_id,
                total_price: "0",
                description: `Pick Up Assembled at ${item.name}, ${item.address}, ${item.milesAway}`,
                currency: body.rate.currency,
              }));
              console.log("💲 rates: ", rates);
            }
          }
        }
      }else{
        rates = null   
      }
    }else{
      rates = null   
    }

    return { rates: rates };
  } catch (error) {
    console.log("error?.message: ", error?.message);
    return { error: error?.message };
  }
};
