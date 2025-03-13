import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const carrierServiceSchema = new Schema(
  {
    storeId: {
      type: String,
      required: true,
      index: true,
    },
    carrierId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    callbackUrl: {
      type: String,
      default: null,
    },
    active: {
      type: Boolean,
      default: true,
    },
    supportsServiceDiscovery: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const CarrierService =
  models.carrier_services || model("carrier_services", carrierServiceSchema);

export default CarrierService;


