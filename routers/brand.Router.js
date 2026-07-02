const brandRouter = require("express").Router();
const fileUploader = require("express-fileupload");
const {create, read, update,remove} = require("../controllers/brand.Controller.js");
brandRouter.post("/create", fileUploader({createParentPath: true}),create);
brandRouter.get("/",read);

module.exports = brandRouter;


