const mongoose = require("mongoose");

const medication_Schema = new mongoose.Schema({
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
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed'],
    default: "pending",
  },
  visits: [
    {
      cash: Number,
      date: Date,
      note: String,
      description: String,
    }
  ],
});

module.exports = medication = mongoose.model("medication", medication_Schema);