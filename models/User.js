const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  name: String,
  email: String,
  password: String,
  isAdmin: { type: Boolean, default: false },
  profileImage: String,
  createdAt: { type: Date, default: Date.now() },
});

const User = model("users", userSchema);
module.exports = User;
