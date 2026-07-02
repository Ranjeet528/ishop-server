const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    mobile: {
      type: String,
      required: true,
    },

    pincode: {
      type: String,
      required: true,
    },

    state: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
    },

    country: {
      type: String,
      default: "India",
    },

    addressLine: {
      type: String,
      required: true
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

   mobile: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: ["user", "admin", "superAdmin"],
      default: "user",
    },

    addresses: [addressSchema],

    isVerified: {
      type: Boolean,
      default: false,
    },
    otp:{
        type: Number,

    },
    otpExpire:{
        type: Date,
    },
    status:{
        type: Boolean,
        default: true
    }
  },
  {
    timestamps: true,
  }
);

const UserModel =
  mongoose.models.user ||
  mongoose.model("user", userSchema);
    module.exports = UserModel;