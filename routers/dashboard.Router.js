const express = require("express");
const {
  getDashboardData,
} = require("../controllers/dashboard.Controller");

const dashboardRouter = express.Router();

dashboardRouter.get("/", getDashboardData);

module.exports = dashboardRouter;