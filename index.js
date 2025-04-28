const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const users = require("./routes/users");
const movies = require("./routes/movies");
const shows = require("./routes/shows");
const User = require("./models/User");
const fs = require("node:fs");
const path = require("node:path");
const rateLimit = require("express-rate-limit");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

mongoose
  .connect(process.env.DB)
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.log(error));

// Middleware to log requests to console
app.use(morgan(":date[web] - :method - :url - :status - :response-time ms"));
// morgan token for error logging message
morgan.token("error", function (req, res) {
  return res.statusMessage;
});

// Set up rate limiter: maximum of 100 requests per 24 hours per IP
const limiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 100, // Limit each IP to 100 requests per `window` (here, per 24 hours)
  message: "Too many requests from this IP, please try again after 24 hours",
});

// Apply the rate limiter to all requests
app.use(limiter);

// Logging errors to file if status code is 400 or higher
app.use(
  morgan(":date[web] - :status - :error", {
    skip: function (req, res) {
      return res.statusCode < 400;
    },
    stream: fs.createWriteStream(
      path.join(
        __dirname,
        "logs/" +
          new Date().getFullYear() +
          "-" +
          new Date().getMonth() +
          "-" +
          new Date().getDate() +
          ".log"
      ),
      {
        flags: "a+",
      }
    ),
  })
);
app.use(cors());
app.use(express.json());
app.use("/users", users);
app.use("/movies", movies);
// app.use("/shows", shows);

app.listen(port, () => console.log("Server started on port", port));
