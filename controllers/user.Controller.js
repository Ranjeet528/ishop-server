
const userModel = require("../models/user.model")
const { sendServerError, sendBadRequest, sendConflict, sendCreated, sendSuccess, sendNotFound } = require("../utils/resposne")
const Cryptr = require('cryptr');
const cryptr = new Cryptr(process.env.SECRET_KEY);
const sendOtpMail = require("../utils/sendOtpMail")
const generateToken = require("../utils/generateToken")

const register = async (req, res)=>{
    try {
        const {name,email, password}= req.body;
        if( !name || !email || !password){
            return sendNotFound(res, "Name, email and password are required")
        }
        const userExist = await userModel.findOne({email})
        if(userExist){
            return sendConflict(res, "User with this email alredy exist")
        }
        const encryptedPassword = cryptr.encrypt(password);
        const otp = Math.floor(100000 + Math.random() * 900000);
       const user =  await userModel.create({
        name,
        email, 
        password: encryptedPassword, 
        otp:otp,
        otpExpire: new Date(Date.now() + 3 * 60 * 1000)
    });
      const mailResponse = await sendOtpMail(email, otp);
      console.log(mailResponse)
        return sendCreated(res, "User registered successfully",{id: user._id, name: user.name, email: user.email});

        
    } catch (error) {
        
        return sendServerError(res,error)
    }
}

const login = async (req, res)=>{
    try {
        const {email, password}= req.body;
        if( !email || !password){
            return sendBadRequest(res, "email and password are required")
        }
        const userExist = await userModel.findOne({email})
        if(!userExist || userExist.isVerified === false){
            return sendNotFound(res, "User Not Found")
        }
        const decryptedPass = cryptr.decrypt(userExist.password);
        if(decryptedPass !==password){
            return sendBadRequest(res, "Wrong password")
        }
          const token = generateToken(userExist._id)
    res.cookie("jwt", token, {
  maxAge: 30 * 24 * 60 * 60 * 1000,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite:
    process.env.NODE_ENV === "production"
      ? "none"
      : "lax",
});
        return sendSuccess(res, "User login successfully",{id: userExist._id, name: userExist.name, email: userExist.email});

        
    } catch (error) {
        
        return sendServerError(res,error)
    }
}
const verifyEmail = async (req, res)=>{
    try {
        const {email, otp } = req.body;
        const user = await userModel.findOne({email});
        if(!user){
            return sendBadRequest(res, "User not found")
        }
        if(user.isVerified){
            return sendBadRequest(res, "Email is  already exist");
        }
        if(user.otp !==parseInt(otp)){
            return sendBadRequest(res, "Invalid Otp");
        }
        if(user.otpExpire < Date.now()){
            return sendBadRequest(res, "Otp has expired");
        }
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpire = undefined;
        await user.save();
        return sendSuccess(res, "Email Verified Successfully")


        
    } catch (error) {
        return sendServerError(res, error);
    }
}

const resendOtp = async (req, res)=>{
    try {
        const {email}= req.body;
        const user = await userModel.findOne({email});
        if(!user){
            return sendBadRequest(res,"User not found");
        }
        const otp = Math.floor(100000 + Math.random() * 900000);
        user.otp = otp;
        user.otpExpire = Date.now() + 3 * 60 * 1000;
        await user.save();
        const mailResponse = await sendOtpMail(email, otp);
        console.log(mailResponse)
        return sendSuccess(res, " Otp send successfully")
        
    } catch (error) {
        return sendServerError(res, error)
        
    }
}

const getMe = (req, res)=>{
    try {

        res.status(200).json({
            success: true,
            message:"User find",
            user:req.user
        })

    } catch (error) {
        return sendServerError(res, error)
        
    }
}

const logOut = (req, res)=>{
    try {
        res.clearCookie('jwt');
        return sendSuccess(res)
        
    } catch (error) {
        return sendServerError(res, error)
        
    }
}

const addAddress = async (req, res)=>{
    try {
    //    console.log("BODY:", req.body);
    //    console.log("USER:", req.user);
        const userId = req.user._id;
        const address = req.body;

        const user = await userModel.findById({_id:userId});
        user.addresses.push(address);
        
        await user.save();
        
        res.status(200).json({
            success: true,
            addresses: user.addresses
        })
        
    } catch (error) {
        console.log(error)
        res.status(500).json({error: error.message})
        
    }
}



module.exports ={register, verifyEmail, resendOtp,login,getMe,logOut,addAddress}