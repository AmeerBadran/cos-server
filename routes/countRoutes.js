const express = require("express");
const route = express.Router();
const count = require("../controller/eventController");

route.get("/countDoctor", count.countDoctor);
route.get("/countPatient", count.countPatients);
route.get("/countAppointment", count.countAppointments);
route.get("/countAppForDoctor/:doctor_id", count.countAppForDoctors);
route.get("/countMedication/:doctor_id", count.countMedications);
route.get("/countMedForDoctor/:doctor_id", count.countMedForDoctors);
route.get("/countPendMedication/:doctor_id/:val/:page/:limit", count.countPendingMedications);

module.exports = route;
