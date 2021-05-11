const router = require("express").Router();
const stripe = require("stripe")(process.env.STRIPE_API_SECRET);

const isAuthenticated = require("../middlewares/isAuthenticated");

router.post("/", async (req, res) => {
  //recept token and infos
  const { amount, currency, description, stripeToken } = req.fields;

  try {
    const response = await stripe.charges.create({
      amount,
      currency,
      description,
      source: stripeToken,
    });
    // console.log(response);
    // console.log(response.data);
    // console.log(response.status);

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
