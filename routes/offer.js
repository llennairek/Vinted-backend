const router = require("express").Router();
const cloudinary = require("cloudinary").v2;

const isAuthenticated = require("../middlewares/isAuthenticated");

const User = require("../models/User");
const Offer = require("../models/Offer");

router.post("/publish", isAuthenticated, async (req, res) => {
  try {
    //extraction des champs de l'annonce
    const product_name = req.fields.title;
    const product_description = req.fields.description;
    const product_price = req.fields.price;
    const product_details = [
      { MARQUE: req.fields.brand },
      { TAILLE: req.fields.size },
      { ETAT: req.fields.condition },
      { COULEUR: req.fields.color },
      { EMPLACEMENT: req.fields.city },
    ];
    //extraction de l'id de l'owner
    const owner = req.user.id;

    //construction de la nouvelle offre - à faire avant l'upload de fichier afin de récuperer l'id de l'annonce
    const newOffer = new Offer({
      product_name,
      product_description,
      product_price,
      product_details,
      owner,
    });

    let cloudImage = {};
    //upload de l'image dans le dossier ayant comme nom l'id de la nouvelle annonce
    if (req.files.picture) {
      cloudImage = await cloudinary.uploader.upload(req.files.picture.path, {
        folder: `/vinted/offers/${newOffer.id}`,
        public_id: `preview`,
      });

      //ajout de la clé de l'image pour notre annonce en bdd
      newOffer.product_image = cloudImage;
    }

    //ajout de l'annonce à la BDD
    await newOffer.save();

    //construction de l'objet retourné au front
    const returnObjectToFront = {
      _id: newOffer.id,
      product_name,
      product_description,
      product_price,
      product_details,
      owner: { account: req.user.account, _id: req.user.id },
      product_image: cloudImage,
    };

    //réponse au front
    res.status(201).json(returnObjectToFront);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/update/:id", isAuthenticated, async (req, res) => {
  const keys = Object.keys(req.fields);
  const token = req.headers.authorization.replace("Bearer ", "");
  const { id } = req.params;

  try {
    const offer = await Offer.findById(id); //on recherche l'offre à modifier
    const owner = await User.findById(offer.owner); //on recherche le propriétaire de l'annonce

    //on verifie si l'utilisateur qui veut modifier l'annonce est bien le propriétaire
    if (token === owner.token) {
      if (offer && !keys.includes("owner")) {
        keys.forEach(async (key) => {
          offer[key] = req.fields[key];
          // if (key === "product_details") {
          //   offer.markModified(key);
          // }
        });
        if (req.files.picture) {
          const result = await cloudinary.uploader.upload(req.files.picture.path, {
            public_id: `vinted/offers/${offer.id}/preview`,
          });
          offer.product_image = result;
        }
        await offer.save();
        res.status(200).json(offer);
      } else if (keys.includes("owner")) {
        res.status(400).json({ message: "You can not change the offer's owner" });
      } else {
        res.status(400).json({ message: "This offer does not exist" });
      }
    } else {
      res
        .status(400)
        .json({ message: "You are not the offer's owner, you can not modify this offer." });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/delete/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const token = req.headers.authorization.replace("Bearer ", "");

  try {
    const offer = await Offer.findById(id);
    const owner = await User.findById(offer.owner);

    if (token === owner.token) {
      await cloudinary.uploader.destroy(offer.product_image.public_id);
      await cloudinary.api.delete_folder(`/vinted/offers/${id}`);
      await offer.deleteOne();
      res.status(200).json({ message: `The offer with the id: ${id} has been deleted` });
    } else {
      res
        .status(400)
        .json({ message: "You are not the offer's owner, you can not delete this offer." });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate("owner", "account");
    res.status(200).json(offer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
