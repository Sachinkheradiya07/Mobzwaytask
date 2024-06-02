const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bodyParser = require("body-parser");
const Detail = require("./models/detail");
const engine = require("ejs-mate");
const wrapAsync = require("./utils/wrapasync");
const ExpressError = require("./utils/expressError");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
require("dotenv").config();

const app = express();
const port = 8080;

app.use(bodyParser.urlencoded({ extended: true }));

app.engine("ejs", engine);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

const dbUrl = process.env.ATLASDB_URL;

main()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((error) => {
    console.log(error);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600, // 24 hours
});

store.on("error", () => {
  console.log("error in mongo session", error);
});

// Session storage and cookies
const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 1 week
    maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  next();
});

// Show details
app.get("/details", async (req, res) => {
  const allDetails = await Detail.find({});
  res.render("details/home.ejs", { allDetails });
});

// New details add
app.get("/details/new", (req, res) => {
  res.render("details/new.ejs");
});

app.post(
  "/details",
  wrapAsync(async (req, res, next) => {
    const newDetail = new Detail(req.body.detail);
    await newDetail.save();
    req.flash("success", "New user data has been successfully added");
    res.redirect("/details");
  })
);

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

app.use((error, req, res, next) => {
  const { statuscode = 500, message = "Something went wrong!" } = error;
  res.status(statuscode).render("details/error.ejs", { message });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
