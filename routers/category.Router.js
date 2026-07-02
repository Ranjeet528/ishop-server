const categoryRouter = require("express").Router();
const { create, read,update, updateStatus, deleteById,readById, getById} = require("../controllers/category.Controller.js");
// const { find } = require("../models/categoryModel");
const {protect,authorized} = require("../middleware/auth.js")
const fileUploader = require("express-fileupload")
categoryRouter.post("/create",protect,authorized("admin","superAdmin"),authorized, fileUploader({createParentPath :true}), create);
categoryRouter.get("/", read);
categoryRouter.get("/:id", readById);
// categoryRouter.get("id/:id", getById);
categoryRouter.patch("/status-update/:id",protect,authorized("admin","superAdmin"), updateStatus);
categoryRouter.delete("/delete/:id",protect,authorized("admin","superAdmin"), deleteById);
categoryRouter.put("/update/:id",protect,authorized("admin","superAdmin"),fileUploader({createParentPath :true}),update)


module.exports = categoryRouter;