var jwt = require("jsonwebtoken");
const UserModel = require("../models/user.model");

const protect = async (req, res, next) => {
    try {
        let token = null;

        if (req.cookies && req.cookies.jwt) {
            token = req.cookies.jwt;
        }
        if(!token){
             token = req.headers.authorization
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token is missing"
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.SECRET_KEY
        );



        const user = await UserModel.findById(decoded.id).select("-password");

        if(!user){
            return res.status(401).json({
                success: false,
                message: "user not found"
            })
        }
        req.user = user;

        next();

    } catch (error) {
         console.log(error); // IMPORTANT
        return res.status(401).json({
            success: false,
            message: "Invalid token"
        });
    }
};

function authorized(...roles){
    return (req, res, next)=>{
      if(!req.user){
        return res.status(403).json({
            success: false,
            message:"User not found"
        })
      }
      if(!roles.includes(req.user.role)){
        return res.status(401).json({
            success: false,
            message: "Not authorised"
        })

      }
      next()
    }

}
module.exports = {protect,authorized};