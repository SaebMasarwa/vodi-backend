const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const users = require("./routes/users");
const movies = require("./routes/movies");
const User = require("./models/User");
const bcrypt = require("bcryptjs");
const fs = require("node:fs");
const path = require("node:path");
const rateLimit = require("express-rate-limit");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

mongoose
  .connect(process.env.DB)
  .then(() => console.log("MongoDB connected"))
  .then(() => {
    mySeeder();
  })
  .catch((error) => console.log(error));

// Seed data to database for initail users setup if none exists
async function mySeeder() {
  const data = await User.find({}).exec();
  const salt = await bcrypt.genSalt(14);
  const hashedPassword = await bcrypt.hash("1234567890", salt);
  if (data.length !== 0) {
    // Data exists, no need to seed.
    return;
  }
  const users = [
    {
      _id: new mongoose.Types.ObjectId(),
      name: "Admin",
      email: "admin@gmail.com",
      password: hashedPassword,
      isAdmin: true,
      profileImage: "https://i.pravatar.cc/300?img=1",
    },
  ];
  await User.create(users);
}

// Middleware to log requests to console
app.use(morgan(":date[web] - :method - :url - :status - :response-time ms"));
// morgan token for error logging message
morgan.token("error", function (req, res) {
  return res.statusMessage;
});

// Set up rate limiter: maximum of 100 requests per 24 hours per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 24 hours
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
