export async function handleFetchProductTags(ids) {
  console.log('ids: ', ids);
  let tags = [];
  const query = `
    query getProductTags($ids: [ID!]!) {
      nodes(ids: $ids) {
        ... on Product {
          id
          tags
        }
      }
    }`;
  if (ids) {
    const response = await fetch(
      "https://dirwin-assembly-app-store.myshopify.com/admin/api/2025-01/graphql.json",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.ACCESS_TOKEN, 
        },
        body: JSON.stringify({ query, variables: { ids: ids } }),
      },
    );

    const json = await response.json();
    console.log("Product Tags:", json.data.nodes);
    tags = json.data.nodes.flatMap((item)=>item.tags)
    console.log('tags: ', tags);
    return tags
  }else{
    tags = []
    console.log('else tags: ', tags);
    return tags
  }
}
