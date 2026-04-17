// backend/models/Address.js
import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    label: {
      type: String,
      enum: ['Home', 'Office', 'Other'],
      default: 'Home',
    },
    fullName: { type: String, required: true, trim: true },
    phone:    { type: String, required: true, trim: true },
    line1:    { type: String, required: true, trim: true }, // house/flat/street
    line2:    { type: String, trim: true },                 // area/landmark (optional)
    city:     { type: String, required: true, trim: true },
    state:    { type: String, required: true, trim: true },
    pincode:  { type: String, required: true, trim: true },
    isDefault:{ type: Boolean, default: false },
  },
  { timestamps: true }
);

const Address = mongoose.models.Address || mongoose.model("Address", addressSchema);

export default Address;