require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const  cors = require("cors");
let cookieParser = require('cookie-parser')
const app = express();
app.use(express.json());    
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));
app.use(cookieParser());
app.use(express.static("./public"));
app.use("/product", express.static("public/product"));
app.use("/category", express.static("public/category"));
app.use("/brand", express.static("public/brand"));
app.use("/api/category",require("./routers/category.Router"));
app.use("/api/brand",require("./routers/brand.Router"));
app.use("/api/color",require("./routers/color.Router"));
app.use("/api/product",require("./routers/product.Router"));
app.use("/api/cart", require("./routers/cart.Router"));
app.use("/api/user",require("./routers/user.Router"));
app.use("/api/order",require("./routers/order.Router"));
app.use("/api/dashboard",require("./routers/dashboard.Router"));


mongoose.connect(process.env.MONGODB_URL).then(()=>{
    console.log("Database connected successfully");
    app.listen(process.env.PORT, ()=>{
        console.log(`Server is running on port ${process.env.PORT}`);
    });
}).catch((error)=>{
    console.log("Database connection failed",error.message);
})
