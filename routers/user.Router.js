const userRouter = require("express").Router();
const { resendOtp, verifyEmail, register,login,getMe,logOut,addAddress } = require("../controllers/user.Controller.js");
const { protect } = require("../middleware/auth.js");
userRouter.post("/register",register);
userRouter.post("/verify-otp",verifyEmail);
userRouter.post("/resend-otp",resendOtp);
userRouter.post("/login",login);
userRouter.get("/get",protect, getMe);
userRouter.post("/logout", logOut);
userRouter.post("/addAddress",protect, addAddress);



module.exports = userRouter;