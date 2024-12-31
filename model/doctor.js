const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const doctorSchema = new mongoose.Schema({
  first_Name: {
    type: String,
    required: true,
    minlength: 3,
  },
  last_Name: {
    type: String,
    required: true,
    minlength: 3,
  },
  country: {
    type: String,
  },
  city: {
    type: String,
  },
  avatar: {
    type: String,
  },
  gender: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "doctor",
  },
  birthdate: {
    type: Date,
  },
  qualification: {
    type: String,
  },
  experience: {
    type: String,
  },
  specialization: {
    type: String,
  },
  description: {
    type: String,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  StartTime: {
    type: String,
    required: true,
    match: /^([01]\d|2[0-3]):([0-5]\d)$/,
  },
  EndTime: {
    type: String,
    required: true,
    match: /^([01]\d|2[0-3]):([0-5]\d)$/,
  },
  DaysWork: {
    type: Array,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

doctorSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model("doctor", doctorSchema);