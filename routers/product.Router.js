const productRouter = require("express").Router();
const fileUploader = require("express-fileupload");
const {create,read, readById, add_images, delete_image} = require("../controllers/product.controller.js");
productRouter.post("/create",fileUploader({createParentPath: true}),create);
productRouter.get("/",read);
productRouter.get("/:id",readById);
productRouter.put("/remove_image/:id",delete_image);
productRouter.post("/add_images/:id",fileUploader({createParentPath: true}),add_images);
module.exports = productRouter;