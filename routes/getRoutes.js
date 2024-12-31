const express = require("express");
const route = express.Router();
const verifyAdmin = require("../middleware/verifyAdminToken");
const Get = require("../controller/eventController");

route.get("/doctors/:page/:limit", Get.getDoctors);
route.get(
  "/appointment/:page/:limit/:doctor_id",
  verifyAdmin,
  Get.getAppointment
);
route.get("/patientRecords/:page/:limit", verifyAdmin, Get.getPatients);
route.post("/search", Get.searchDoctor);
route.get("/contacts/:page/:limit", verifyAdmin, Get.getContacts);
route.get("/medications/:doctor_id/:page/:limit/:val", Get.getMedication);
route.get("/searchData", Get.CitiesAndSpecializations);
route.get("/patient/:patient_id/appointments", Get.getPatientAppointment);
route.get("/patient/:patient_id/medications", Get.getPatientMedications);

module.exports = route;
