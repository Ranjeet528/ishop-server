const orderModel = require("../models/order.Model")
const cartModel = require("../models/cart.Model");
const { sendServerError, sendBadRequest } = require("../utils/resposne");
const Razorpay = require('razorpay');
const crypto = require("crypto");


var instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});



const createOrder = async (req, res) => {
    try {

        const { paymentMethod, address } = req.body;
        const userId = req.user._id;
        const userCart = await cartModel.findOne({ userId }).populate({
            path: "items.productId",
            select: " _id  final_price"
        });

       if (!userCart || userCart.items.length === 0) {
      return sendBadRequest(res, "Cart is empty");
    }


        const productDetail = userCart.items.map((item) => {
            if (!item.productId) return null;
            const { _id, final_price } = item.productId

            return {
                productId: _id,
                qty: item.qty,
                price: final_price,
                total: (final_price * item.qty)

            }

        })
         .filter(Boolean);
        //  console.log(productDetail)
        const total_Amount = productDetail.reduce((sum, item) => sum + item.total, 0);




        const order = await orderModel.create({
            user: userId,
            items: productDetail,
            shippingAddress: address,
            paymentMethod: paymentMethod,
            totalAmount: total_Amount,
            paymentStatus: "pending"
        })

        if (paymentMethod === "cod") {  

            await cartModel.findOneAndUpdate(
    { userId },
    {
      items: [],
      final_total: 0,
      original_total: 0
    }
   );

            res.status(201).json({
                message: "order placed successfully",
                success: true,
                orderId: order._id
            })
        }
        else if (paymentMethod === "online") {
            var options = {
                amount: total_Amount * 100,  // Amount is in currency subunits. 
                currency: "INR",
                receipt: order._id
            };
            instance.orders.create(options, function (err, razorpayOrder) {
               if(err) return sendBadRequest(res, "Payment failed");
               order.razorpay_order_id = razorpayOrder.id;
               order.paymentMethod = "online"
               order.save();
               res.status(200).json({
                message:"Order create successfully",
                success: true,
                orderId: order._id,
                payment_order_id: razorpayOrder.id
               })

            });

        }
        else {
            sendServerError(res)
        }




    } catch (error) {
        console.log(error)

    }
}



const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
     
    } = req.body;


    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed"
      });
    }

    await orderModel.findOneAndUpdate({ razorpay_order_id }, {
      razorpay_payment_id,
      paymentStatus: "paid",
      orderStatus: "confirmed",
      paidAt: new Date()
    });
    await cartModel.findOneAndUpdate(
  { userId: req.user._id },
  {
    items: [],
    final_total: 0,
    original_total: 0
  }
);
   

    res.status(200).json({
      success: true,
      message: "Payment verified successfully"
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};



const getAllOrders = async (req, res) => {
  try {
    const orders = await orderModel
      .find()
      .populate("user", "name email mobile")
      .populate("items.productId", "name thumbnail final_price")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};



const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus } = req.body;

    const allowedStatus = [
      "placed",
      "confirmed",
      "shipped",
      "out_for_delivery",
      "delivered",
      "cancelled",
      "return_requested"
    ];

    if (!allowedStatus.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status"
      });
    }

    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId,
      { orderStatus },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order: updatedOrder
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const returnOrder = async (req, res) => {
  try {
    const order = await orderModel.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // sirf delivered order return ho sakta hai
    if (order.orderStatus !== "delivered") {
      return res.status(400).json({
        success: false,
        message: "Only delivered orders can be returned"
      });
    }

    order.orderStatus = "return_requested";
    await order.save();

    res.status(200).json({
      success: true,
      message: "Return request placed successfully"
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const order = await orderModel.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if (order.orderStatus === "delivered") {
      return res.status(400).json({
        success: false,
        message: "Delivered order can't be cancelled"
      });
    }

    order.orderStatus = "cancelled";
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully"
    });

  } catch (error) {
    return sendServerError(res)
  }
};

const getSingleOrder = async (req, res) => {
  try {
    const order = await orderModel
      .findById(req.params.id)
      .populate("user", "name email mobile")
      .populate("items.productId", "name thumbnail final_price");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.status(200).json({
      success: true,
      order
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


module.exports = { createOrder, verifyPayment,getAllOrders,updateOrderStatus,returnOrder,cancelOrder,getSingleOrder };
