const mongoose = require("mongoose");

// Create schema
const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePic: {
      type: String,
      default:
        "https://ideogram.ai/assets/progressive-image/balanced/response/E9WlcX4HTXuvNhCsyrqfpw",
    },
    isAdmin: { type: Boolean, default: false },
    cartData: { type: Object, default: {} },
  },
  { timestamps: true, minimize: false } 
);

// Create a model
const User = mongoose.model("User", userSchema);

module.exports = User;
