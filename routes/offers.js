const router = require("express").Router();

const User = require("../models/User");
const Offer = require("../models/Offer");

router.get("/", async (req, res) => {
  const keys = Object.keys(req.query);
  const filterObject = {};
  const sortObject = {};
  let limit = 5;
  let skipNumber = 0;

  try {
    // if (keys.length === 0) {
    //   const offers = await Offer.find().select("product_name product_price").limit(limit);
    //   return res.status(200).json(offers);
    // }
    if (keys.includes("title")) {
      filterObject.product_name = new RegExp(req.query.title, "i");
    }
    if (keys.includes("priceMin") || keys.includes("priceMax")) {
      filterObject.product_price = {};
      if (keys.includes("priceMin")) {
        filterObject.product_price.$gte = req.query.priceMin;
      }
      if (keys.includes("priceMax")) {
        filterObject.product_price.$lte = req.query.priceMax;
      }
    }
    if (keys.includes("sort")) {
      sortObject.product_price = req.query.sort.split("-")[1];
    }
    if (keys.includes("page")) {
      skipNumber = limit * (Number(req.query.page) - 1);
    }

    const offers = await Offer.find(filterObject)
      .sort(sortObject)
      .skip(skipNumber)
      .limit(limit)
      .select("product_name product_price");

    const count = await Offer.countDocuments(filterObject);

    return res.status(200).json({ count: count, results: offers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
