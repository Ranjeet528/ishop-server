const colorRouter = require("express").Router();
const { create, read} = require("../controllers/color.Controller.js");
colorRouter.post("/create", create);
colorRouter.get("/", read);

module.exports = colorRouter;