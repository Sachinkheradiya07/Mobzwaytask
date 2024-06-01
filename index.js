const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bodyParser = require("body-parser");
const Detail = require("./models/detail");
const engine = require("ejs-mate");
const wrapAsync = require("./utils/wrapasync");
const ExpressError = require("./utils/expressError");
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
    console.log("connected to db ");
  })
  .catch((error) => {
    console.log(error);
  });
async function main() {
  await mongoose.connect(dbUrl);
}

// show details
app.get("/details", async (req, res) => {
  const allDetails = await Detail.find({});
  res.render("details/home.ejs", { allDetails });
});

// new details add
app.get("/details/new", (req, res) => {
  res.render("details/new.ejs");
});

app.post(
  "/details",
  wrapAsync(async (req, res, next) => {
    const newDetail = new Detail(req.body.detail);
    await newDetail.save();
    res.redirect("/details");
  })
);

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

app.use((error, req, res, next) => {
  let { statuscode = 500, message = "something went wrong!" } = error;
  res.status(statuscode).render("details/error.ejs", { message });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port} `);
});
