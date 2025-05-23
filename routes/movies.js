const express = require("express");
const Joi = require("joi");
const User = require("../models/User");
const Movie = require("../models/Movie");
const auth = require("../middlewares/auth");

const router = express.Router();

const movieSchema = Joi.object({
  title: Joi.string().required(),
  plot: Joi.string().required(),
  poster: Joi.string().required(),
  releaseDate: Joi.date().required(),
  genre: Joi.string().required(),
  youtubeId: Joi.string().required(),
  rating: Joi.number().min(0).max(10).optional(),
});

// Get all movies sorted by createdAt in descending order
router.get("/", async (req, res) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 });
    if (!movies) return res.status(404).send("No movies found");
    res.status(200).send(movies);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get movie by ID
router.get("/:id", async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).send("No movie found");
    res.status(200).send(movie);
  } catch (error) {
    res.status(400).send(error);
  }
});
// Get movies in a specific genre
router.get("/genre/:id", async (req, res) => {
  try {
    const movie = await Movie.find({ genre: req.params.id });
    console.log(movie);

    if (!movie) return res.status(404).send("No movies found in this genre");
    res.status(200).send(movie);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Add a movie for admins and logged in users
router.post("/", auth, async (req, res) => {
  try {
    if (req.payload === undefined) {
      return res
        .status(404)
        .send("User doesn't have permsission to add a movie");
    } else {
      const { error } = movieSchema.validate(req.body);
      if (error) return res.status(400).send(error.details[0].message);

      const movie = new Movie(req.body);
      movie.userId = req.payload._id;
      await movie.save();
      res.status(201).send(movie);
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

// Update a movie by ID
// Only for admin users and the user who created the movie
router.put("/:id", auth, async (req, res) => {
  try {
    // Check if the user is an admin
    const movieRes = await Movie.findById(req.params.id);
    if (!movieRes) return res.status(404).send("Movie not found");
    if (req.payload.isAdmin === true || req.payload._id === movieRes.userId) {
      const user = await User.findById(req.payload._id);
      if (!user) return res.status(404).send("No such user");
      // Body validation
      const { error } = movieSchema.validate(req.body);
      if (error) return res.status(400).send(error.details[0].message);
      // check if user is an admin or he is the owner of the movie
      const movie = await Movie.findByIdAndUpdate(req.params.id, req.body);
      if (!movie) return res.status(404).send("No such movie");
      res.status(200).send(movie);
    } else {
      return res.status(400).send("Access denied");
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete a movie by ID
// Only for admin users and the user who created the movie
router.delete("/:id", auth, async (req, res) => {
  try {
    if (req.payload.isAdmin === true) {
      const movie = await Movie.findByIdAndDelete(req.params.id);
      if (!movie) return res.status(404).send("Movie not found");
      res.status(200).send(movie);
    } else {
      return res.status(404).send("User has no admin access");
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

// Like a movie
// Only for authenticated users
router.patch("/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.payload._id);
    if (!user) return res.status(404).send("User not found");

    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).send("Movie not found");

    if (!movie.likes.includes(req.payload._id)) {
      movie.likes.push(req.payload._id);
      await movie.save();
      res.status(200).send(movie);
    } else {
      // If the user already liked the movie, remove the like
      movie.likes.pop(req.payload._id);
      await movie.save();
      res.status(200).send(movie);
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
