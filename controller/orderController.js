const Stripe = require("stripe");
const Order = require("../models/orderModel");
const User = require("../models/userModel");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
// const frontendurl = "http://localhost:3000";
const frontendurl = process.env.FRONTEND_URL || 'http://localhost:3000';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const placeOrder = async (req, res) => {
  const { amount, items, address } = req.body;
  const userId = req.userId;

  try {
    // 1. Create a new Order in the database
    const newOrder = new Order({
      amount,
      items,
      address,
      userId,
    });
    await newOrder.save(); // Save the new order in the database

    // 2. Update the User model to clear cart data
    await User.findByIdAndUpdate(userId, { cartData: {} });

    // 3. Prepare line items for Stripe checkout session
    const line_items = items.map((item) => ({
      price_data: {
        currency: "usd", // Assuming your Stripe account is set up for USD
        product_data: {
          name: item.name,
        },
        unit_amount: item.price * 100, // Amount in cents
      },
      quantity: item.quantity,
    }));

    // Add delivery charge as a line item
    line_items.push({
      price_data: {
        currency: "usd", // Assuming your Stripe account is set up for USD
        product_data: {
          name: "Delivery Charge",
        },
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
    //pdf
    const pdfPath = path.join(
      __dirname,
      `../receipts/receipt-${newOrder._id}.pdf`
    );
    // console.log(pdfPath);
    generateReceiptPDF(newOrder, pdfPath);
    // 5. Send response with session URL to frontend
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

//verify order
const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;
  try {
    if (success === "true") {
      await Order.findByIdAndUpdate(orderId, { payment: true });
      res.json({ success: true, message: "Payment done" });
    } else {
      await Order.findByIdAndUpdate(orderId);
      res.json({ success: false, message: "Payment failed" ,receipt_url: `/receipts/receipt-${orderId}.pdf`});
    }
  } catch (error) {
    console.log("The Error In verify Payment is", error.message);
    res.json({ success: false, message: error.message });
  }
};

//pdf generator function
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
//user order
const userOrder= async(req,res)=>{
  try {
    const order= await Order.find({userId:req.userId})
    res.json({success:true,data:order})
    
  } catch (error) {
    console.log('The error in getting the user order is',error)
    res.json({ success: false, message: error.message });
  }
}
//get list of all order by specifc user to show in admin panel
const Allorder= async(req,res)=>{
  try {
    const orders= await Order.find({})
    res.json({success:true, data:orders})
    
  } catch (error) {
    console.log('The error while getting the list of the order is',error.message)
    res.json({success:false, message:'Error in getting the order list'})
  }
}
//api to change the order status
const updateStatus=async(req,res)=>{
 
  const { orderId, status } = req.body;
// console.log(orderId, status)
    try {
        // Find the order by orderId and update its status
        const updatedOrder = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        res.json({ success: true, data: updatedOrder });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ success: false, message: 'Failed to update order status' });
    }
}
module.exports = { placeOrder, verifyOrder ,userOrder,Allorder, updateStatus};
