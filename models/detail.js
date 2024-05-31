const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const detailsSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  mobileNo: {
    type: Number,
    required: true,
    match: /^[0-9]{10}$/,
  },
  emailId: {
    type: String,
    required: true,
    match: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
  },
  address: {
    street: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
  },
  loginId: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    match: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{6,}$/,
  },
  creationTime: {
    type: Date,
    default: Date.now,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

const Detail = mongoose.model("Detail", detailsSchema);
module.exports = Detail;
