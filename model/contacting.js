const mongoose = require("mongoose");

const contacting_Schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

contacting_Schema.pre("save", async function (next) {
  const contacting = this;
  const currentUTC = new Date(contacting.createdAt);
  currentUTC.setHours(currentUTC.getHours() + 3);
  contacting.createdAt = currentUTC;
  next();
});

module.exports = contacting = mongoose.model("contacting", contacting_Schema);
