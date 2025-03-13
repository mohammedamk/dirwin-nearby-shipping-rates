import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const googleSettingsSchema = new Schema(
  {
    shop: {
      type: String,
      required: true,
      unique:true
    },
    noOfAddresses: {
      type: Number,
      default:1
    },
    range: {
      type: Number,
      default:1
    }, 
    type: {
      type: String,
      default:"bicycle_store"
    },
  },
  {
    timestamps: true,
  },
);

const GoogleSettings = models.google_settings || model("google_settings", googleSettingsSchema);

export default GoogleSettings;
