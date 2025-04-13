const express = require("express");
const Joi = require("joi");
const User = require("../models/User");
const Show = require("../models/Show");
const auth = require("../middlewares/auth");

const router = express.Router();

const showSchema = Joi.object({
  title: Joi.string().required(),
  plot: Joi.string().required(),
  releaseDate: Joi.date().required(),
  genre: Joi.string().required(),
  seasons: Joi.number().required(),
  episodes: Joi.number().required(),
  youtubeId: Joi.array().items(Joi.string()).required(),
  rating: Joi.number().min(0).max(10).optional(),
});

// Get all shows
router.get("/", async (req, res) => {
  try {
    const shows = await Show.find();
    if (!shows) return res.status(404).send("No shows found");
    res.status(200).send(shows);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get show by ID
router.get("/:id", async (req, res) => {
  try {
    const show = await Show.findById(req.params.id);
    if (!show) return res.status(404).send("Show not found");
    res.status(200).send(show);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Add a show
// Only for admin users
router.post("/", auth, async (req, res) => {
  try {
    if (req.payload.isAdmin === false) {
      return res.status(404).send("User has no admin access");
    } else {
      const { error } = showSchema.validate(req.body);
      if (error) return res.status(400).send(error.details[0].message);

      const show = new Show(req.body);
      await show.save();
      res.status(201).send(show);
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

// Update a show by ID
router.put("/:id", auth, async (req, res) => {
  try {
    if (req.payload.isAdmin === false) {
      return res.status(404).send("User has no admin access");
    } else {
      const { error } = showSchema.validate(req.body);
      if (error) return res.status(400).send(error.details[0].message);

      const show = await Show.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      if (!show) return res.status(404).send("Show not found");
      res.status(200).send(show);
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

// Update a show rating by ID
router.patch("/:id/rating", auth, async (req, res) => {
  try {
    const { rating } = req.body;
    if (!rating) return res.status(400).send("Rating is required");

    const show = await Show.findByIdAndUpdate(
      req.params.id,
      { rating },
      { new: true }
    );
    if (!show) return res.status(404).send("Show not found");
    res.status(200).send(show);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete a show by ID
router.delete("/:id", auth, async (req, res) => {
  try {
    if (req.payload.isAdmin === false) {
      return res.status(404).send("User has no admin access");
    } else {
      const show = await Show.findByIdAndDelete(req.params.id);
      if (!show) return res.status(404).send("Show not found");
      res.status(200).send(show);
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

// Like a show
// Only for authenticated users

router.patch("/:id/like", auth, async (req, res) => {

});
