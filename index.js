//packages import
const express = require("express");
const formidable = require("express-formidable");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");
require("dotenv").config();

//routes import
const userRoutes = require("./routes/user");
const offerRoutes = require("./routes/offer");
const allOffersRoutes = require("./routes/offers");
const paymentRoutes = require("./routes/payment");

//cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

//initialise express and add middlewares
const app = express();
app.use(cors());
app.use(formidable());
app.use("/user", userRoutes);
app.use("/offer", offerRoutes);
app.use("/offers", allOffersRoutes);
app.use("/payment", paymentRoutes);

//connection to the vinted database
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});
db = mongoose.connection;
db.on("error", (error) => console.log(error));
db.once("open", () => {
  console.log("Connected to the Vinted database");
});

//fallback route
app.all("*", (req, res) => {
  res.status(404).json({ message: "Page not found" });
});

//server launch
app.listen(process.env.PORT, () => {
  console.log("Server started");
});
