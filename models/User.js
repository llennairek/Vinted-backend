const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    unique: true,
    type: String,
  },
  account: {
    username: {
      required: true,
      type: String,
    },
    phone: String,
    avatar: {
      type: Object,
      default: null,
    }, // nous verrons plus tard comment uploader une image
  },
  token: String,
  hash: String,
  salt: String,
});

const User = mongoose.model("User", userSchema);

module.exports = User;
