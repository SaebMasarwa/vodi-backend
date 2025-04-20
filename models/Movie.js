const { Schema, model } = require("mongoose");
const { mongoose } = require("mongoose");

const movieSchema = new Schema({
  title: String,
  plot: String,
  poster: String,
  releaseDate: Date,
  genre: String,
  youtubeId: String,
  likes: [String],
  rating: Schema.Types.Double,
  userId: { type: String, default: new mongoose.Types.ObjectId() },
  createdAt: { type: Date, default: Date.now() },
});

const Movie = model("movies", movieSchema);
module.exports = Movie;
