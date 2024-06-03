const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bodyParser = require("body-parser");
const engine = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const flash = require("connect-flash");
const Detail = require("./models/detail");
const ExpressError = require("./utils/expressError");
const wrapAsync = require("./utils/wrapasync");
require("dotenv").config();

// Initialize Express app
const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.engine("ejs", engine);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// MongoDB Connection
const dbUrl = process.env.ATLASDB_URL;
mongoose
  .connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Session and Flash
const sessionOptions = {
  store: new MongoStore({ mongoUrl: dbUrl }),
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    httpOnly: true,
  },
};
app.use(session(sessionOptions));
app.use(flash());

// Middleware to pass flash messages to all views
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  next();
});

// Routes
app.get(
  "/details",
  wrapAsync(async (req, res) => {
    const allDetails = await Detail.find({});
    res.render("details/home.ejs", { allDetails });
  })
);

app.get("/details/new", (req, res) => {
  res.render("details/new.ejs");
});

app.post(
  "/details",
  wrapAsync(async (req, res) => {
    const newDetail = new Detail(req.body.detail);
    await newDetail.save();
    req.flash("success", "New user data has been successfully added");
    res.redirect("/details");
  })
);

// Error Handling
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

app.use((error, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong!" } = error;
  res.status(statusCode).render("details/error.ejs", { message });
});

// Start server
app.listen(8080, () => {
  console.log(`Server is running on port ${port}`);
});
