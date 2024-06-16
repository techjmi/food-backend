const bcryptjs = require("bcryptjs");
const validator = require("validator");
const User = require("../models/userModel");
const generateToken = require("../utils/generateToken");

// Register logic
const signUp = async (req, res) => {
  const { name, email, profilePic, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }
    // Validate email
    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter a valid email" });
    }
    // Validate password strength
    if (!validator.isStrongPassword(password)) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter a strong password" });
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);
    // Create user instance
    const newUser = new User({
      name,
      email,
      profilePic,
      password: hashedPassword,
    });
    // Save user to database
    const user = await newUser.save();

    // Generate token
    const token = generateToken(user._id);
    // Send response
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

//login logic
const userLogin = async (req, res) => {
    try {
      const { email, password } = req.body;
      // Find user by email
      const user = await User.findOne({ email });
      // Check if user exists
      if (!user) {
        return res
          .status(400)
          .json({ success: false, message: "Email or Password is not valid" });
      }
      // Compare hashed password
      const isMatch = await bcryptjs.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ success: false, message: "Email or Password is not valid" });
      }
      // Generate token
      const token = generateToken(user._id);
      // Respond with success message and token
      res.status(200).json({
        success: true,
        message: 'User Logged in success',
        token,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  };
  
//get the user info by token 
const getUserDetails= async(req, res)=>{
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
      } catch (error) {
        res.status(500).json({ message: 'Server Error' });
      }
}
module.exports = { signUp , userLogin, getUserDetails};
