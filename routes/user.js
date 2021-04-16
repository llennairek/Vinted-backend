//packages import
const router = require("express").Router();
const encBase64 = require("crypto-js/enc-base64");
const sha256 = require("crypto-js/sha256");
const uid2 = require("uid2");
const cloudinary = require("cloudinary").v2;

//model import
const User = require("../models/User");

//route to signup
router.post("/signup", async (req, res) => {
  //store user info
  const { email, username, phone, password } = req.fields;

  try {
    //access to the db to save the user and handle errors
    const exist = await User.findOne({ email });
    if (!exist && username) {
      //build token and hash
      const token = uid2(64);
      const salt = uid2(16);
      const hash = sha256(salt + password).toString(encBase64);

      //build new user
      const newUser = new User({
        email,
        account: { username, phone },
        token,
        hash,
        salt,
      });

      //upload avatar if exist
      if (req.files.avatar) {
        const avatar = await cloudinary.uploader.upload(req.files.avatar.path, {
          folder: `/vinted/users/avatar/${newUser.id}`,
        });

        newUser.account.avatar = avatar;
      }

      await newUser.save();
      res.status(201).json({ id: newUser.id, token, account: newUser.account });
    } else if (exist) {
      res.status(400).json({ message: `the email ${email} already exists in the database` });
    } else if (!username) {
      res.status(400).json({ message: "You can not have an empty username" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//route to log in
router.post("/login", async (req, res) => {
  const { email, password } = req.fields;
  try {
    const user = await User.findOne({ email });
    if (user) {
      const newHash = sha256(user.salt + password).toString(encBase64);
      if (newHash === user.hash) {
        res.status(200).json({
          id: user.id,
          token: user.token,
          account: { username: user.account.username, phone: user.account.phone },
        });
      } else {
        res.status(400).json({ error: "Wrong email and/or wrong password, please try again" });
      }
    } else {
      res
        .status(400)
        .json({ message: `the mail ${email} is not known, please enter a valid email` });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
