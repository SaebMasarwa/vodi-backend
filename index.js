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
const Movie = require("./models/Movie");

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
  const movieData = await Movie.find({}).exec();
  const salt = await bcrypt.genSalt(14);
  const hashedPassword = await bcrypt.hash("1234567890", salt);
  if (data.length !== 0 && movieData.length !== 0) {
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
  const movies = [
    {
      _id: new mongoose.Types.ObjectId(),
      title: "زكي شان",
      plot: "زكي شاب كثير المشاكل سواء مع أفراد أسرته أو في عمله، يعلم أن رب عمل والده يرغب في تعيين بودي جارد كي يحرس ابنه وابنته، ويقرر التقدم للوظيفة رغم عدم ملائمته جسديًا للوظيفة.",
      poster:
        "https://www.themoviedb.org/t/p/w600_and_h900_bestv2/txu2EXVtMA4G7Q4VZquMV1L0YYk.jpg",
      releaseDate: "2005-11-02T00:00:00.000Z",
      genre: "Comedy",
      youtubeId: "j_2kpu0VHbk",
      likes: [],
      rating: 7.6,
    },
    {
      _id: new mongoose.Types.ObjectId(),
      title: "مطب صناعي",
      plot: "(ميمي) شاب يقيم بالإسماعيلية، يقرر السفر للقاهرة ليجد فرصة عمل، ويتعرف على رجل أعمال وسكرتيرته (مي) وابنته الصغيرة (زينة) عندما أنقذها من الغرق ليتقرب من الأسرة، يسقط رجل الأعمال في غيبوبة عميقة، ويجد (ميمي) نفسه وصي على (زينة) فهل سينجح في حمايتها؟",
      poster:
        "https://www.themoviedb.org/t/p/w1280/ra7F9sEmXUX8lhcI9iqlzNd4NvJ.jpg",
      releaseDate: "2006-12-20T00:00:00.000Z",
      genre: "Comedy",
      youtubeId: "cH0-fkMD3Uc",
      likes: [],
      rating: 7.5,
    },
    {
      _id: new mongoose.Types.ObjectId(),
      title: "ظرف طارق",
      plot: "يعمل طارق في إحدى شركات التليفون المحمول، ليطلب منه أحد العملاء أن يبحث له عن عنوان وبيانات مشتركة في الشبكة، ويتردد طارق في قبول العرض، لكنه يقبل بعد أن يلقى توبيخًا من رئيسه بسبب انخفاض مبيعاته عن المطلوب عنه، ويحصل على بيانات الفتاة، لكنه يقع في حبها، مما يوقعه في عدد من المشاكل.",
      poster:
        "https://www.themoviedb.org/t/p/w1280/twE4XKly7N8KNpTm5nIKsYwPEyX.jpg",
      releaseDate: "2006-01-04T00:00:00.000Z",
      genre: "Comedy",
      youtubeId: "Vwn8qb5SgY8",
      likes: [],
      rating: 8.3,
    },
    {
      _id: new mongoose.Types.ObjectId(),
      title: "ميدو مشاكل",
      plot: "تدور أحداث الفيلم حول شاب يعمل في مجال تركيب الدش واسمه ميدو، وهو طالب في معهد التكنولوجيا والإليكترونيات السلكية واللاسلكية، ومن كثرة ما يحدث من مشاكل للجميع بسبب ميدو أصبح اسمه ميدو مشاكل.",
      poster:
        "https://www.themoviedb.org/t/p/w1280/eoWQ7rw8iV33V0onIhpIsdwOdZ2.jpg",
      releaseDate: "2003-05-02T00:00:00.000Z",
      genre: "Comedy",
      youtubeId: "N-ov26Xji_k",
      likes: [],
      rating: 5.8,
    },
    {
      _id: new mongoose.Types.ObjectId(),
      title: "همام في امستردام",
      plot: "(همام) شاب يعاني من الفقر والبطالة، كما يشعر بالحزن بسبب هجران خطبيته له، وارتباطها برجل أخر، يقرر الذهاب للإقامة مع خاله في (هولندا) وتجربة حظه هناك، ويتعرض هناك إلى الكثير من المتاعب حتى يصل لمرحلة فقدان أمواله وجواز سفره، لكنه لا يجعله كل هذا يثبط من همته، ويكافح ويعمل بجد حتى يستطيع أن يحقق أحلامه",
      poster:
        "https://www.themoviedb.org/t/p/w1280/4KDVxnXi6aUSQAzKUzhZqqBUB8F.jpg",
      releaseDate: "1999-08-17T00:00:00.000Z",
      genre: "Comedy",
      youtubeId: "_tb3_4oEPmA",
      likes: [],
      rating: 7.6,
    },
  ];
  await User.create(users);
  await Movie.create(movies);
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
// app.use(limiter);

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
