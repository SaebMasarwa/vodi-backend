const { Schema, model } = require("mongoose");

const showSchema = new Schema({
  title: String,
  plot: String,
  releaseDate: Date,
  genre: String,
  seasons: Number,
  episodes: Number,
  youtubeId: [String],
  likes: [String],
  cast: [String],
  rating: { type: Number, min: 0, max: 10 },
  createdAt: { type: Date, default: Date.now() },
});

const Show = model("shows", showSchema);
module.exports = Show;
