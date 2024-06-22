const Stripe = require("stripe");
const Order = require("../models/orderModel");
const User = require("../models/userModel");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const frontendurl = process.env.FRONTEND_URL || "http://localhost:3000";

// Place Order
const placeOrder = async (req, res) => {
  const { amount, items, address } = req.body;
  const userId = req.userId;

  try {
    // 1. Create a new Order in the database
    const newOrder = new Order({ amount, items, address, userId });
    await newOrder.save();

    // 2. Update the User model to clear cart data
    await User.findByIdAndUpdate(userId, { cartData: {} });

    // 3. Prepare line items for Stripe checkout session
    const line_items = items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: { name: item.name },
        unit_amount: item.price * 100, // Amount in cents
      },
      quantity: item.quantity,
    }));

    // Add delivery charge as a line item
    line_items.push({
      price_data: {
        currency: "usd",
        product_data: { name: "Delivery Charge" },
        unit_amount: 50 * 100, // Assuming delivery charge is USD 50
      },
      quantity: 1,
    });

    // 4. Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: line_items,
      mode: "payment",
      success_url: `${frontendurl}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${frontendurl}/verify?success=false&orderId=${newOrder._id}`,
    });

    // 5. Generate PDF receipt
    const pdfPath = path.join(
      __dirname,
      `../receipts/receipt-${newOrder._id}.pdf`
    );
    generateReceiptPDF(newOrder, pdfPath);

    // 6. Send response with session URL to frontend
    res.json({
      success: true,
      session_url: session.url,
      receipt_url: `/receipts/receipt-${newOrder._id}.pdf`,
    });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ success: false, error: "Failed to place order" });
  }
};

// Verify Order
const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;
  try {
    if (success === "true") {
      await Order.findByIdAndUpdate(orderId, { payment: true });
      res.json({ success: true, message: "Payment done" });
    } else {
      await Order.findByIdAndUpdate(orderId);
      res.json({
        success: false,
        message: "Payment failed",
        receipt_url: `/receipts/receipt-${orderId}.pdf`,
      });
    }
  } catch (error) {
    console.log("The Error In verify Payment is", error.message);
    res.json({ success: false, message: error.message });
  }
};

// Generate PDF Receipt
const generateReceiptPDF = (order, filePath) => {
  const doc = new PDFDocument();
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  doc.fontSize(20).text("Payment Receipt", { align: "center" });
  doc.moveDown();
  doc.fontSize(14).text(`Order ID: ${order._id}`);
  doc.text(`User ID: ${order.userId}`);
  doc.text(`Amount: $${(order.amount / 100).toFixed(2)}`);
  doc.text(`Address: ${order.address}`);
  doc.moveDown();

  doc.fontSize(14).text("Items:", { underline: true });
  order.items.forEach((item) => {
    doc.text(
      `- ${item.name}: $${(item.price / 100).toFixed(2)} x ${item.quantity}`
    );
  });

  doc.text(`Delivery Charge: $50.00`);
  doc.end();
};

// Get User Orders
const userOrder = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log("The error in getting the user order is", error);
    res.json({ success: false, message: error.message });
  }
};

// Get All Orders
const AllOrder = async (req, res) => {
  if (!req.user.isAdmin) {
    res.json({
      success: false,
      message: "You are not allowed to see the details only can see",
    });
  }
  try {
    const orders = await Order.find({});
    const totalOrders = await Order.countDocuments();
    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );
    const lastMonthOrders = await Order.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });

    res.json({
      success: true,
      data: orders,
      lastMonthOrders,
      totalOrders,
    });
  } catch (error) {
    console.log(
      "The error while getting the list of the order is",
      error.message
    );
    res.json({ success: false, message: "Error in getting the order list" });
  }
};

// Update Order Status
const updateStatus = async (req, res) => {
  const { orderId, status } = req.body;
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    if (!updatedOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    res.json({ success: true, data: updatedOrder });
  } catch (error) {
    console.error("Error updating order status:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update order status" });
  }
};
//get all users and top users
const GetTopOrder = async (req, res) => {
  if(!req.user.isAdmin){
    res.json({success:false, message:"You are not allowed to this only admin can do this"})
  }
  try {
    const topUsers = await Order.aggregate([
      { $group: { _id: "$userId", orderCount: { $sum: 1 } } }, // Group orders by userId and count them
      { $sort: { orderCount: -1 } }, // Sort in descending order based on orderCount
      { $limit: 5 }, // Limit to top 5 users
    ]);
    // Extract userIds from topUsers
    const userIds = topUsers.map((user) => user._id);

    // Fetch user details for the top users
    const usersData = await User.find({ _id: { $in: userIds } }).select(
      "name email profilePic"
    );
    // Combine order count with user details
    const result = topUsers.map((user) => {
      const userDetails = usersData.find(
        (u) => u._id.toString() === user._id.toString()
      );
      return {
        userId: user._id,
        orderCount: user.orderCount,
        name: userDetails.name,
        email: userDetails.email,
        profilePic: userDetails.profilePic,
      };
    });

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Error fetching top users by order count:", error.message);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch top users by order count",
      });
  }
};
module.exports = {
  placeOrder,
  verifyOrder,
  userOrder,
  AllOrder,
  updateStatus,
  GetTopOrder,
};
