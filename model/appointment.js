const mongoose = require("mongoose");

const appointment_Schema = new mongoose.Schema({
  doctor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "doctor",
    required: true,
  },
  patient_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "patient",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['pending','medicated'],
    default: "pending",
  },
  time: {
    type: String,
    required: true,
  },
  details: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

appointment_Schema.pre("save", async function(next){
  if (this.isNew) {
    const currentUTC = new Date(this.createdAt || Date.now()); 
    currentUTC.setHours(currentUTC.getHours() + 3);            
    this.createdAt = currentUTC;                               
  }
  next();
});

module.exports = appointment = mongoose.model(
  "appointment",
  appointment_Schema
);
