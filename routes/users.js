const express = require("express");
const Joi = require("joi");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middlewares/auth");

const router = express.Router();

const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required().email(),
  password: Joi.string().required().min(8),
  isAdmin: Joi.boolean(),
  profileImage: Joi.string().uri().allow(null, ""),
});

// Register
router.post("/", async (req, res) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send("User already exists");

    user = new User(req.body);
    const salt = await bcryptjs.genSalt(14);
    user.password = await bcryptjs.hash(user.password, salt);
    await user.save();

    res.status(201).send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Login schema for body validation
const loginSchema = Joi.object({
  email: Joi.string().required().email().min(2),
  password: Joi.string().required().min(8),
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send("Email or password are incorrect");

    const result = await bcryptjs.compare(req.body.password, user.password);
    if (!result) return res.status(400).send("Email or password are incorrect");

    const token = jwt.sign(
      { _id: user._id, isAdmin: user.isAdmin },
      process.env.JWTKEY
    );
    res.status(200).send(token);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Users list for someone with admin access
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.payload._id);
    if (!user) return res.status(404).send("No such user");

    if (user.isAdmin) {
      const allUsers = await User.find();
      res.status(200).send(allUsers);
    } else {
      return res.status(404).send("User has no admin access");
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

//  User by ID
router.get("/:id", auth, async (req, res) => {
  try {
    if (req.payload._id === req.params.id || req.payload.isAdmin === true) {
      const user = await User.findById(req.payload._id);
      if (!user) return res.status(404).send("No such user");
    }
    const userResult = await User.findById(
      { _id: req.params.id },
      { password: 0 }
    );
    res.status(200).send(userResult);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Update user by ID
router.put("/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.payload._id);
    if (!user) return res.status(404).send("No such user");
    const userResult = await User.findByIdAndUpdate(req.params.id, req.body);
    res.status(200).send(userResult);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Update user isAdmin status
router.patch("/:id", auth, async (req, res) => {
  try {
    if (req.payload.isAdmin === true) {
      const user = await User.findById(req.payload._id);
      if (!user) return res.status(404).send("No such user");
      if (user.isAdmin === true) {
        const userResult = await User.findByIdAndUpdate(req.params.id, {
          isAdmin: false,
        });
      } else {
        const userResult = await User.findByIdAndUpdate(req.params.id, {
          isAdmin: true,
        });
      }
    }
    const userResult = await User.findById(req.params.id);
    res.status(200).send(userResult);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete user by id
router.delete("/:id", auth, async (req, res) => {
  try {
    if (req.payload._id === req.params.id || req.payload.isAdmin === true) {
      const user = await User.findByIdAndDelete(
        { _id: req.params.id },
        { password: 0 }
      );
      if (!user) return res.status(404).send("No such user");
      res.status(200).send(user);
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
