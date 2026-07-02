const mongoose = require("mongoose");

const colorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 2,
      trim: true,
      unique: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 2,
    },

    color_code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    status: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const ColorModel = mongoose.model("Color", colorSchema);

module.exports = ColorModel;