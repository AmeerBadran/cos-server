const express = require("express");
const router = express.Router();
const verifyAdmin = require("../middleware/verifyAdminToken");
const {verifyToken} = require("../middleware/verifyToken");
const createDoctor = require("../controller/admin/addDoctor");
const add = require("../controller/eventController");
const { addContact } = require("../controller/ContactingController");

router.post("/admin", verifyAdmin, createDoctor);
router.post("/addContact", addContact);
router.post("/addVisit", add.addVisit);
router.post("/addAppointment", verifyToken, add.addAppointment);
router.post("/addMedication", verifyToken, add.addMedication);
router.post("/addMedTDelApp/:appointment_id", verifyAdmin, add.addMedThenDelApp);
module.exports = router;
