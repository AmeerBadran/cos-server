const mongoose = require("mongoose");
const { isEmail, isNumeric } = require("validator");
const bcrypt = require("bcrypt");
const patient_Schema = new mongoose.Schema({
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
  birthdate: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    enum: ["male", "female"],
    required: true,
  },
  insurance: {
    type: String,
    enum: ["No Insurance", "Almashreq", "Pal Health"],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [isEmail, "email is not valid, try again..."],
  },
  phone: {
    type: String,
    required: true,
    minlength: 10,
    validate: [isNumeric, "phone number must contain just numbers..."],
  },
  password: {
    type: String,
    minlength: 8,
    required: true,
  },
  chronic_diseases: {
    type: Array,
    default: "None",
  },
  role: {
    type: String,
    default: "patient",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

patient_Schema.pre("save", async function (next) {
  if (this.isModified("password")) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(this.password, salt);
      this.password = hashedPassword;
    } catch (error) {
      return next(error);
    }
  }

    if (this.isNew) {
      const currentUTC = new Date(this.createdAt || Date.now()); 
      currentUTC.setHours(currentUTC.getHours() + 3);            
      this.createdAt = currentUTC;                               
    }

    next();
});

module.exports = patient = mongoose.model("patient", patient_Schema);
