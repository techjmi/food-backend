const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message:'Not Authorised login again'});
    }
    //decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //now find the user by id by decode we will get the id
    // req.body.userId=decoded._id
    req.userId = decoded._id;
    const user = await User.findById(decoded._id);
    if (!user) {
      throw new Error();
    }
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message:'xyz' });
  }
};

module.exports = authMiddleware;
