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
      message: "User Logged in success",
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

//get the user info by token
const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
//show or get all user
const fetchUser = async (req, res) => {
  try {
    // Check if the user is an admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to see the user list",
      });
    }

    // Fetch all users
    const users = await User.find({});
    
    // Remove password field from each user document
    const usersWithoutPassword = users.map((user) => {
      const { password, ...rest } = user._doc;
      return rest;
    });

    // Calculate the date one month ago
    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );

    // Count users created in the last month
    const lastMonthUsers = await User.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });

    // Count total number of users
    const totalUsers = await User.countDocuments();

    // Send response with success status and data
    res.status(200).json({
      success: true,
      users: usersWithoutPassword,
      lastMonthUsers,
      totalUsers,
    });

  } catch (error) {
    // Handle errors
    console.error('Error fetching users:', error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
module.exports = { signUp, userLogin, getUserDetails, fetchUser };
