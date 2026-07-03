const colorRouter = require("express").Router();
const { create, read} = require("../controllers/color.controller.js");
colorRouter.post("/create", create);
colorRouter.get("/", read);

module.exports = colorRouter;