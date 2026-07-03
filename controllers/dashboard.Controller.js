const Order = require("../models/order.Model");
const Product = require("../models/product.Model");
const Category = require("../models/category.Model");
const Brand = require("../models/brand.Model");
const User = require("../models/user.model");

const getDashboardData = async (req, res) => {
  try {
    const today = new Date();

    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    const startOfWeek = new Date();
    startOfWeek.setDate(today.getDate() - 7);

    const startOfMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );

    const startOfYear = new Date(
      today.getFullYear(),
      0,
      1
    );

    // ================= BASIC COUNTS =================
    const [
      totalProducts,
      totalCategories,
      totalBrands,
      totalOrders,
      totalUsers,
      activeUsers,
      newUsersThisMonth,
    ] = await Promise.all([
      Product.countDocuments(),
      Category.countDocuments(),
      Brand.countDocuments(),
      Order.countDocuments(),
      User.countDocuments(),
      User.countDocuments({ status: true }),
      User.countDocuments({
        createdAt: { $gte: startOfMonth },
      }),
    ]);

    // ================= ORDER STATUS =================
    const [
      pendingOrders,
      confirmedOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      returnedOrders,
    ] = await Promise.all([
      Order.countDocuments({ orderStatus: "placed" }),
      Order.countDocuments({ orderStatus: "confirmed" }),
      Order.countDocuments({ orderStatus: "shipped" }),
      Order.countDocuments({ orderStatus: "delivered" }),
      Order.countDocuments({ orderStatus: "cancelled" }),
      Order.countDocuments({
        orderStatus: "return_requested",
      }),
    ]);

    // ================= REVENUE =================
    const revenue = await Order.aggregate([
      {
        $match: { paymentStatus: "paid" },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$totalAmount",
          },
        },
      },
    ]);

    const todayRevenue = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          createdAt: { $gte: startOfDay },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ]);

    const weeklyRevenue = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          createdAt: { $gte: startOfWeek },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ]);

    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          createdAt: { $gte: startOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ]);

    const yearlyRevenue = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          createdAt: { $gte: startOfYear },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ]);

    // ================= CHART DATA =================
    const monthlyRevenueChart = await Order.aggregate([
      {
        $match: { paymentStatus: "paid" },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          revenue: {
            $sum: "$totalAmount",
          },
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    const monthlyOrdersChart = await Order.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    const orderStatusChart = await Order.aggregate([
      {
        $group: {
          _id: "$orderStatus",
          count: { $sum: 1 },
        },
      },
    ]);

    const paymentMethodChart = await Order.aggregate([
      {
        $group: {
          _id: "$paymentMethod",
          count: { $sum: 1 },
        },
      },
    ]);

    // ================= TOP PRODUCTS =================
    const topProducts = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          totalSold: {
            $sum: "$items.qty",
          },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]);

    // ================= STOCK ALERT =================
    const lowStockProducts = await Product.find({
      stock: { $lte: 5, $gt: 0 },
    }).limit(5);

    const outOfStockProducts = await Product.find({
      stock: 0,
    }).limit(5);

    // ================= RECENT DATA =================
    const recentOrders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    const recentUsers = await User.find()
      .select("name email createdAt")
      .sort({ createdAt: -1 })
      .limit(5);

    // ================= TOP CUSTOMERS =================
    const topCustomers = await Order.aggregate([
      {
        $group: {
          _id: "$user",
          totalSpent: {
            $sum: "$totalAmount",
          },
          totalOrders: {
            $sum: 1,
          },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 5 },
    ]);

    // ================= EXTRA STATS =================
    const totalRevenue =
      revenue[0]?.totalRevenue || 0;

    const averageOrderValue =
      totalOrders > 0
        ? totalRevenue / totalOrders
        : 0;

    const conversionRate =
      totalUsers > 0
        ? ((totalOrders / totalUsers) * 100).toFixed(2)
        : 0;

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        totalCategories,
        totalBrands,
        totalOrders,
        totalUsers,
        activeUsers,
        newUsersThisMonth,

        pendingOrders,
        confirmedOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        returnedOrders,

        totalRevenue,
        todayRevenue: todayRevenue[0]?.total || 0,
        weeklyRevenue: weeklyRevenue[0]?.total || 0,
        monthlyRevenue: monthlyRevenue[0]?.total || 0,
        yearlyRevenue: yearlyRevenue[0]?.total || 0,

        averageOrderValue,
        conversionRate,

        monthlyRevenueChart,
        monthlyOrdersChart,
        orderStatusChart,
        paymentMethodChart,

        topProducts,
        lowStockProducts,
        outOfStockProducts,

        recentOrders,
        recentUsers,
        topCustomers,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Dashboard fetch failed",
    });
  }
};

module.exports = {
  getDashboardData,
};