const express = require("express");
const verifyAdmin = require("../middleware/verifyAdminToken");
const router = express.Router();
const adminController = require("../controller/admin/adminController");
const addDoctor = require("../controller/admin/addDoctor");
const { verifyToken } = require("../middleware/verifyToken");

router.post("/add-doctor", verifyAdmin, addDoctor);

router.put(
  "/update-doctor/:doctorId",
  verifyToken,
  adminController.updateDoctorById
);
router.put(
  "/update-patient/:patientId",
  verifyToken,
  adminController.updatePatientById
);

router.get("/get-doctor/:doctorId", verifyToken, adminController.getDoctorById);
router.get(
  "/get-patient/:patientId",
  verifyToken,
  adminController.getPatientById
);

router.get(
  "/get-doctors/:page/:limit",
  verifyAdmin,
  adminController.getDoctors
);
router.get(
  "/get-patients/:page/:limit",
  verifyAdmin,
  adminController.getPatients
);
router.get(
  "/get-appointments/:page/:limit",
  verifyAdmin,
  adminController.getAppointment
);
router.get(
  "/get-medications/:page/:limit",
  verifyAdmin,
  adminController.getMedication
);

router.delete(
  "/delete-doctor/:doctorId",
  verifyAdmin,
  adminController.deleteDoctorById
);
router.delete(
  "/delete-patient/:patientId",
  verifyAdmin,
  adminController.deletePatientById
);

router.put(
  "/increase-banned/:patientId",
  adminController.increaseBannedPatient
);

router.put(
  "/change-patient/:patientId",
  verifyAdmin,
  adminController.updatePatientRole
);


module.exports = router;
