const mongoose = require("mongoose");
const { Schema } = mongoose;

const productDetailSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },

    qty: {
      type: Number,
      required: true,
      min: 1
    },

    price: {
      type: Number,
      required: true,
      min: 0
    },

    total: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true
    },

    items: {
      type: [productDetailSchema],
      validate: [
        (value) => value.length > 0,
        "Order must contain at least one item"
      ]
    },

    shippingAddress: {
      fullName: {
        type: String,
        required: true,
        trim: true
      },

      mobile: {
        type: String,
        required: true,
        match: /^[6-9]\d{9}$/
      },

      pincode: {
        type: String,
        required: true,
        match: /^\d{6}$/
      },

      state: {
        type: String,
        required: true
      },

      city: {
        type: String,
        required: true
      },

      country: {
        type: String,
        default: "India"
      },

      addressLine: {
        type: String,
        required: true,
        trim: true
      }
    },

    paymentMethod: {
      type: String,
      enum: ["cod", "online"],
      required: true
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending"
    },

    orderStatus: {
      type: String,
      enum: [
        "placed",
        "confirmed",
        "shipped",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "return_requested",
        "return_approved",
        "returned"
      ],
      default: "placed"
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },

    razorpay_payment_id: {
      type: String,
      default: null
    },

    razorpay_order_id: {
      type: String,
      default: null
    },

    paidAt: {
      type: Date,
      default: null
    },

    deliveredAt: {
      type: Date,
      default: null
    },

    cancelledAt: {
      type: Date,
      default: null
    },

    returnedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("order", orderSchema);