const orderRouter = require("express").Router();

const {
  createOrder,
  verifyPayment,
  getAllOrders,
  updateOrderStatus,
  returnOrder,
  cancelOrder,
  getSingleOrder
} = require("../controllers/order.Controller");

const { protect, authorized } = require("../middleware/auth");

orderRouter.post("/place", protect, createOrder);
orderRouter.post("/verify", protect, verifyPayment);
orderRouter.get("/:id", protect, getSingleOrder);
orderRouter.put("/cancel/:id", protect, cancelOrder);
orderRouter.put("/return/:id", protect, returnOrder);

orderRouter.get( "/", protect,authorized("admin", "superAdmin"), getAllOrders);
orderRouter.put("/status/:orderId",protect,authorized("admin", "superAdmin"), updateOrderStatus);

module.exports = orderRouter;