const User = require("../models/userModel")


//add to cart
const addToCart = async (req, res) => {
    try {
        // console.log(req.body);
        const userId = req.userId; // Get userId from middleware
        // console.log(userId)
        const { itemId } = req.body;
        // console.log(itemId)
        // Fetch user data
        const userData = await User.findById(userId); 
        // console.log(userData)
        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        // Update cart data
        const cartData = userData.cartData;
        if (!cartData[itemId]) {
            cartData[itemId] = 1;
        } else {
            cartData[itemId] += 1;
        }
        // Save updated cart data back to the user document
        await User.findByIdAndUpdate(userId,{cartData});
        res.json({ success: true, message: "Product added to cart" });
    } catch (error) {
        console.log('The error in adding to cart is', error.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

//remove from cart
const removetoCart= async(req, res)=>{
    try {
        const userId= req.userId //from middleware
        const { itemId } = req.body;// from body
        // console.log(itemId)
        const userData=await User.findById(userId)
        const cartData= userData.cartData
        if(cartData[itemId]>=0){
            cartData[itemId]-=1
        }
        await User.findByIdAndUpdate(userId, { cartData });
        res.json({ success: true, message: "Product removed from cart" });
    } catch (error) {
        console.log('The error in removing from cart is', error.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}
//get user cart data
const getCart= async(req,res)=>{
    try {
        const userId= req.userId
        // console.log(userId)
        const userData=await User.findById(userId)
        const cartData= userData.cartData
        res.json({success:true,cartData})
    } catch (error) {
        console.log('The error in removing from cart is', error.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}
module.exports={addToCart,removetoCart, getCart} 