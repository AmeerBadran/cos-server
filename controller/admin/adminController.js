const Doctor = require("../../model/doctor");
const Patient = require("../../model/patient");
const Appointment = require("../../model/appointment");
const Medication = require("../../model/medication");

module.exports.getDoctors = async (req, res) => {
  try {
    const page = parseInt(req.params.page) || 1;
    const limit = parseInt(req.params.limit) || 6;
    const skip = (page - 1) * limit;
    const doctors = await Doctor.find().skip(skip).limit(limit);

    if (doctors && doctors.length > 0) {
      return res.status(200).json(doctors);
    } else {
      return res.status(200).json({ message: "No doctor found!" });
    }
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" + err.message });
  }
};

module.exports.getPatients = async (req, res) => {
  try {
    const page = parseInt(req.params.page) || 1;
    const limit = parseInt(req.params.limit) || 6;
    const skip = (page - 1) * limit;

    const patients = await Patient.find().skip(skip).limit(limit);

    if (patients.length > 0) {
      return res.status(200).json(patients);
    } else {
      return res.status(200).json({ message: "No patients found!" });
    }
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error: " + err.message });
  }
};

module.exports.getAppointment = async (req, res) => {
  try {
    const page = parseInt(req.params.page) || 1;
    const limit = parseInt(req.params.limit) || 6;
    const skip = (page - 1) * limit;
    const appointments = await Appointment.find().skip(skip).limit(limit);

    if (appointments && appointments.length > 0) {
      return res.status(200).json(appointments);
    } else {
      return res.status(200).json({ message: "No appointment found!" });
    }
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" + err.message });
  }
};

module.exports.getMedication = async (req, res) => {
  try {
    const page = parseInt(req.params.page) || 1;
    const limit = parseInt(req.params.limit) || 6;
    const skip = (page - 1) * limit;
    const medications = await Medication.find().skip(skip).limit(limit);

    if (medications && medications.length > 0) {
      return res.status(200).json(medications);
    } else {
      return res.status(200).json({ message: "No doctor found!" });
    }
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" + err.message });
  }
};

module.exports.deleteDoctorById = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const doctor = await Doctor.findByIdAndDelete(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.status(200).json({ message: "Doctor deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error: " + err.message });
  }
};

module.exports.deletePatientById = async (req, res) => {
  try {
    const { patientId } = req.params;
    const patient = await Patient.findByIdAndDelete(patientId);
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.status(200).json({ message: "Patient deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error: " + err.message });
  }
};

module.exports.updatePatientRole = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { role } = req.body;

    if (!["admin", "patient"].includes(role)) {
      return res.status(400).json({ message: "Invalid role value" });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    patient.role = role;
    await patient.save();

    res.status(200).json({
      message: `Patient role updated to ${role} successfully`,
      patient,
    });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error: " + err.message });
  }
};

module.exports.updateDoctorById = async (req, res) => {
  try {
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      req.params.doctorId,
      req.body,
      { new: true }
    );

    if (!updatedDoctor)
      return res.status(404).json({ message: "Doctor not found" });

    res
      .status(200)
      .json({ message: "Doctor updated successfully", updatedDoctor });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error: " + err.message });
  }
};

module.exports.updatePatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.patientId);
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    const allowedUpdates = [
      "first_Name",
      "last_Name",
      "insurance",
      "phone",
      "chronic_diseases",
    ];
    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        patient[key] = req.body[key];
      }
    });

    await patient.save();

    res.status(200).json({ message: "Patient updated successfully", patient });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error: " + err.message });
  }
};

module.exports.increaseBannedPatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.patientId);
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    if (patient.banned >= 3) {
      return res.status(200).json({
        message: "This patient is already have 3 ban!!",
        success: false,
      });
    }

    patient.banned += 1;
    await patient.save();

    res
      .status(200)
      .json({ message: "Banned count increased successfully", patient });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error: " + err.message });
  }
};

module.exports.getDoctorById = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const doctor = await Doctor.findById(doctorId);

    if (doctor) {
      return res.status(200).json(doctor);
    } else {
      return res.status(200).json({ message: "No doctor found!" });
    }
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" + err.message });
  }
};

module.exports.getPatientById = async (req, res) => {
  try {
    const { patientId } = req.params;
    const patient = await Patient.findById(patientId).select(
      "first_Name last_Name insurance phone chronic_diseases"
    );

    if (patient) {
      return res.status(200).json(patient);
    } else {
      return res.status(200).json({ message: "No patients found!" });
    }
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error: " + err.message });
  }
};
