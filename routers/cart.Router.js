const cartRouter = require("express").Router();

const {
  syncCart,
  addToCart,
  updateCartQty
} = require("../controllers/cart.Controller.js");

const { protect } = require("../middleware/auth.js");

cartRouter.post("/", protect, syncCart);
cartRouter.post("/add", protect, addToCart);
cartRouter.put("/update-qty", protect, updateCartQty);

module.exports = cartRouter;