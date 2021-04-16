const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  try {
    if (req.headers.authorization) {
      const token = req.headers.authorization.replace("Bearer ", "");
      const user = await User.findOne({ token });
      if (user) {
        req.user = user;
        next();
      } else {
        res.json("Unauthorized");
      }
    } else {
      res.json("Unauthorized");
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = isAuthenticated;
