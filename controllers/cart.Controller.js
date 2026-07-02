const cartModel = require("../models/cart.Model");
const { sendServerError } = require("../utils/resposne");

const syncCart = async (req, res)=>{
    try {
        const userId = req.user._id;
        const localCart = JSON.parse(req.body.localStorage) || [];
        if(localCart.length == 0){
            const userCart = await cartModel.findOne({userId}).populate({
                path: "items.productId",
                select: "name _id original_price final_price discountPercentage price thumbnail"
            });

            return res.status(200).json({
                message: " Fetched cart from server",
                success: true,
                cart: userCart ? userCart.items : [],
                imageBaseUrl: "http://localhost:5000/category/"
            })
        }

        let userCart = await cartModel.findOne({userId}).populate({
              path: "items.productId",
              select: "name _id original_price final_price discountPercentage price thumbnail"

        });

        if(!userCart){
            userCart = new cartModel({
                userId,
                items: []
            });
        }

        localCart.forEach((cartItem)=>{
            const {id, qty} = cartItem;
            const existingItem = userCart.items.find((item)=>{
                return item.productId._id == id 
            });
            if(existingItem){
                existingItem.qty += qty;
            }else(
                userCart.items.push({
                    productId: id,
                    qty
                })
            )
        });
        await userCart.save();
         res.status(200).json({
            message: "Cart synced successfully",
            success: true,
            cart: userCart,
            imageBaseUrl: "http://localhost:5000/category/"
         })
        
    } catch (error) {
        console.log(error)
        return sendServerError(res)
        
    }
}

const addToCart = async (req, res) => {
  try {
   
    const userId = req.user._id;
    const { id, qty } = req.body;

    console.log("USER:", userId);
    console.log("BODY:", req.body);
    console.log("PRODUCT ID:", id);
    console.log("QTY:", qty);

    let userCart = await cartModel.findOne({ userId });

    if (!userCart) {
      userCart = await cartModel.create({
        userId,
        items: []
      });
    }

    const existingItem = userCart.items.find(
      item => item.productId.toString() === id
    );

    if (existingItem) {
      existingItem.qty += qty;
    } else {
      userCart.items.push({
        productId: id,
        qty
      });
    }

    await userCart.save();

    return res.status(200).json({
      message: "Cart updated successfully",
      success: true,
      cart: userCart
    });

  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
};

const updateCartQty = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id, flag } = req.body;
      console.log("USER:", userId);
    console.log("ID:", id);
    console.log("FLAG:", flag);

    const userCart = await cartModel.findOne({ userId });
      console.log("CART:", userCart);

    if (!userCart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found"
      });
    }

    const cartItem = userCart.items.find(
      (item) => item.productId.toString() === id.toString()
    );
      console.log("FOUND ITEM:", cartItem);

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart"
      });
    }

    if (flag === "inc") {
      cartItem.qty += 1;
    }

    if (flag === "dec") {
      if (cartItem.qty > 1) {
        cartItem.qty -= 1;
      } else {
        userCart.items = userCart.items.filter(
          (item) => item.productId.toString() !== id.toString()
        );
      }
    }

    await userCart.save();

    return res.status(200).json({
      success: true,
      message: "Cart quantity updated",
      cart: userCart
    });

  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
};
module.exports ={syncCart,addToCart,updateCartQty}