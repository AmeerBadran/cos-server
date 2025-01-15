const express = require("express");
const router = express.Router();
const verifyAdmin = require("../middleware/verifyAdminToken");
const { verifyToken } = require("../middleware/verifyToken");
const update = require("../controller/eventController");

router.put("/doctor", verifyAdmin, update.updateDoctorById);
router.put("/patient", verifyToken, update.updatePatientById);
router.put("/medication", update.updateMedication);
router.put("/visits", update.updateVisit);

module.exports = router;
