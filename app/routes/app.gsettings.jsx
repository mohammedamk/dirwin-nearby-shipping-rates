import { Form, useLoaderData, useSubmit } from "@remix-run/react";
import {
  BlockStack,
  Box,
  Button,
  ButtonGroup,
  Card,
  InlineGrid,
  Page,
  Text,
  TextField,
  Toast,
  Frame,
} from "@shopify/polaris";
import { useRef, useState, useCallback } from "react";
import { authenticate } from "../shopify.server";
import GoogleSettings from "../database/google-settings";
import { TitleBar } from "@shopify/app-bridge-react";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  const shop = session?.shop;

  let googleSettings = await GoogleSettings.findOne({});

  if (!googleSettings) {
    googleSettings = await GoogleSettings.create({
      shop: shop, 
      noOfAddresses: 1,
      range: 1,
    });
  }

  return { googleSettings };
}



export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();

  const noOfAddresses = Number(formData.get("noOfAddresses"));
  const range = Number(formData.get("range"));
  const type = String(formData.get("type"));

  await GoogleSettings.findOneAndUpdate(
    { shop: session.shop },
    { noOfAddresses, range, type },
    { new: true, upsert: true }
  );

  return { success: true };
}

export default function GSettings() {
  const settings = useLoaderData();
  const [formData, setFormData] = useState(settings?.googleSettings || { noOfAddresses: "1", range: "1", type: "bicycle_store" });
  const formRef = useRef(null);
  const submit = useSubmit();
  const [toastMessage, setToastMessage] = useState("");
  const [active, setActive] = useState(false);

  const toggleToast = useCallback(() => setActive((active) => !active), []);

  const showToast = (message) => {
    setToastMessage(message);
    setActive(true);
  };

  const handleReset = () => {
    setFormData({ noOfAddresses: "1", range: "1" ,type:"bicycle_store"});
    const resetFormData = new FormData();
    resetFormData.append("noOfAddresses", "1");
    resetFormData.append("range", "1");
    resetFormData.append("type", "bicycle_store");

    submit(resetFormData, { method: "post", replace: true });

    showToast("Settings reset successfully");
  };

  const handleSubmit = (event) => {
    if(formData.range <= 0 || formData.range === null ){
      showToast("Enter the Range");
    }
    else if(formData.noOfAddresses <= 0 || formData.noOfAddresses === null){
      showToast("Enter the Total No. of Address");
    }
    else if(formData.type.length <= 0 || formData.type === null){
      showToast("Enter the text to search nearby address");
    }
    else{
      event.preventDefault();
      submit(event.currentTarget, { replace: true });
      showToast("Settings updated successfully");
    }
  };

  return (
    <Frame>
      <Page divider>
        <TitleBar title="Google API Settings" />
        <BlockStack gap={{ xs: "800", sm: "400" }}>
          <InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
            <Box as="section" paddingInlineStart={{ xs: 400, sm: 0 }} paddingInlineEnd={{ xs: 400, sm: 0 }}>
              <BlockStack gap="400">
                <Text as="h3" variant="headingMd">Google API Settings</Text>
                <Text as="p" variant="bodyMd">
                  Set address limits and service range for Google API.
                </Text>
              </BlockStack>
            </Box>
            <Card roundedAbove="sm">
              <Form method="post" ref={formRef} onSubmit={handleSubmit}>
                <BlockStack gap="400">
                  <TextField
                    label="Total No. of Addresses to Show"
                    type="number"
                    name="noOfAddresses"
                    min={1}
                    max={10}
                    value={formData.noOfAddresses}
                    onChange={(value) => setFormData((prev) => ({ ...prev, noOfAddresses: value }))}
                    autoComplete="off"
                  />
                  <TextField
                    label="Nearby Places Range in Km"
                    type="number"
                    name="range"
                    min={1}
                    max={15}
                    value={formData.range}
                    onChange={(value) => setFormData((prev) => ({ ...prev, range: value }))}
                    autoComplete="off"
                  />
                  <TextField
                    label="Text to Search Nearby Places (eg. 'bicycle_store')"
                    type="String"
                    name="type"
                    value={formData.type}
                    onChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
                    autoComplete="off"
                  />
                  <div style={{ display: "flex", width: "100%", justifyContent: "center" }}>
                    <ButtonGroup>
                      <Button onClick={handleReset}>Reset</Button>
                      <Button submit={true} variant="primary">Save</Button>

                    </ButtonGroup>
                  </div>
                </BlockStack>
              </Form>
            </Card>
          </InlineGrid>
        </BlockStack>
      </Page>
      {active && <Toast content={toastMessage} onDismiss={toggleToast} />}
    </Frame>
  );
}
